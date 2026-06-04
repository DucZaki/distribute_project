package com.ducnm.payment.service;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.event.PaymentFailedEvent;
import com.ducnm.common.event.PaymentSucceededEvent;
import com.ducnm.common.event.Topics;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.payment.client.BookingPaymentClient;
import com.ducnm.payment.client.BookingPayView;
import com.ducnm.payment.dto.PaymentDtos.*;
import com.ducnm.payment.entity.Payment;
import com.ducnm.payment.repository.PaymentRepository;
import com.ducnm.payment.vnpay.VnPayUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final long MIN_AMOUNT_VND = 5_000L;

    private final PaymentRepository paymentRepo;
    private final VnPayUtil vnPayUtil;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final BookingPaymentClient bookingClient;

    @Transactional
    public PaymentInitResponse initVnPay(Integer userId, CreatePaymentRequest req, String clientIp) {
        return startVnPay(userId, req.getBookingId(), req.getOrderInfo(), clientIp);
    }

    @Transactional
    public PaymentInitResponse repayVnPay(Integer userId, Integer bookingId, String clientIp) {
        return startVnPay(userId, bookingId, "Thanh toan lai don hang " + bookingId, clientIp);
    }

    private PaymentInitResponse startVnPay(Integer userId, Integer bookingId, String orderInfo, String clientIp) {
        BookingPayView booking = loadBooking(userId, bookingId);
        if (!"PENDING".equalsIgnoreCase(booking.getTrangThai())) {
            throw BusinessException.badRequest("Đơn không ở trạng thái chờ thanh toán");
        }
        if (booking.getCreatedAt() != null && booking.getCreatedAt().plusMinutes(15).isBefore(LocalDateTime.now())) {
            throw BusinessException.badRequest("Đơn hàng đã hết hạn thanh toán (15 phút)");
        }
        if (booking.getTongGia() == null) {
            throw BusinessException.badRequest("Đơn chưa có tổng tiền hợp lệ");
        }

        long amountVnd = booking.getTongGia().setScale(0, RoundingMode.HALF_UP).longValue();
        if (amountVnd < MIN_AMOUNT_VND) {
            throw BusinessException.badRequest("Số tiền tối thiểu thanh toán VNPay là 5.000₫");
        }

        Payment payment = paymentRepo.findByBookingId(bookingId).orElse(null);
        if (payment != null && "SUCCESS".equals(payment.getStatus())) {
            throw BusinessException.conflict("Đơn này đã thanh toán");
        }

        // Unique mỗi lần bấm — tránh sandbox báo "quá thời gian chờ" khi reuse TxnRef
        String txnRef = bookingId + "_" + System.currentTimeMillis();
        String info = "Donhang" + bookingId;

        if (payment == null) {
            payment = Payment.builder()
                    .bookingId(bookingId)
                    .userId(userId)
                    .amount(booking.getTongGia())
                    .currency("VND")
                    .provider("VNPAY")
                    .txnRef(txnRef)
                    .status("PENDING")
                    .build();
        } else {
            payment.setTxnRef(txnRef);
            payment.setAmount(booking.getTongGia());
            payment.setStatus("PENDING");
            payment.setResponseCode(null);
            payment.setBankCode(null);
            payment.setProviderTxnId(null);
            payment.setPaidAt(null);
        }
        payment = paymentRepo.save(payment);

        String url = vnPayUtil.buildPaymentUrl(txnRef, amountVnd, info, clientIp);
        return PaymentInitResponse.builder()
                .paymentId(payment.getId())
                .txnRef(txnRef)
                .redirectUrl(url)
                .build();
    }

    @Transactional
    public Map<String, String> handleIpn(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String secureHash = params.get("vnp_SecureHash");
        String responseCode = params.get("vnp_ResponseCode");
        String amountStr = params.get("vnp_Amount");

        if (txnRef == null || txnRef.isBlank()) {
            return Map.of("RspCode", "01", "Message", "Order not found");
        }

        Payment payment = paymentRepo.findByTxnRef(txnRef).orElse(null);
        if (payment == null) {
            return Map.of("RspCode", "01", "Message", "Order not found");
        }
        if (!vnPayUtil.verifySignature(params, secureHash)) {
            log.warn("Invalid VNPay signature for txnRef={}", txnRef);
            return Map.of("RspCode", "97", "Message", "Invalid signature");
        }

        if (amountStr != null) {
            long paidCents = Long.parseLong(amountStr);
            long expectedCents = payment.getAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValue();
            if (paidCents != expectedCents) {
                log.warn("VNPay amount mismatch txnRef={} paid={} expected={}", txnRef, paidCents, expectedCents);
                return Map.of("RspCode", "04", "Message", "Invalid amount");
            }
        }

        if (!"PENDING".equals(payment.getStatus())) {
            return Map.of("RspCode", "02", "Message", "Order already confirmed");
        }

        payment.setResponseCode(responseCode);
        payment.setBankCode(params.get("vnp_BankCode"));
        payment.setProviderTxnId(params.get("vnp_TransactionNo"));
        payment.setRawResponse(params.toString());

        if ("00".equals(responseCode)) {
            payment.setStatus("SUCCESS");
            payment.setPaidAt(LocalDateTime.now());
            kafkaTemplate.send(Topics.PAYMENT_SUCCEEDED, String.valueOf(payment.getBookingId()),
                    PaymentSucceededEvent.builder()
                            .paymentId(payment.getId())
                            .bookingId(payment.getBookingId())
                            .amount(payment.getAmount())
                            .transactionId(payment.getProviderTxnId())
                            .build());
            log.info("Payment SUCCESS bookingId={} paymentId={}", payment.getBookingId(), payment.getId());
        } else {
            payment.setStatus("FAILED");
            kafkaTemplate.send(Topics.PAYMENT_FAILED, String.valueOf(payment.getBookingId()),
                    PaymentFailedEvent.builder()
                            .paymentId(payment.getId())
                            .bookingId(payment.getBookingId())
                            .reason("VNPay code: " + responseCode)
                            .build());
            log.info("Payment FAILED bookingId={} code={}", payment.getBookingId(), responseCode);
        }

        paymentRepo.save(payment);
        return Map.of("RspCode", "00", "Message", "Confirm Success");
    }

    private BookingPayView loadBooking(Integer userId, Integer bookingId) {
        ApiResponse<BookingPayView> res = bookingClient.getBooking(userId, bookingId);
        if (res == null || res.getData() == null) {
            throw BusinessException.notFound("Booking", bookingId);
        }
        return res.getData();
    }
}
