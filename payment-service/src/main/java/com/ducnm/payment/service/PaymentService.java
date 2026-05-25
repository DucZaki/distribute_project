package com.ducnm.payment.service;

import com.ducnm.common.event.PaymentFailedEvent;
import com.ducnm.common.event.PaymentSucceededEvent;
import com.ducnm.common.event.Topics;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.payment.dto.PaymentDtos.*;
import com.ducnm.payment.entity.Payment;
import com.ducnm.payment.repository.PaymentRepository;
import com.ducnm.payment.vnpay.VnPayUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final VnPayUtil vnPayUtil;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public PaymentInitResponse initVnPay(Integer userId, CreatePaymentRequest req, String clientIp) {
        Payment existing = paymentRepo.findByBookingId(req.getBookingId()).orElse(null);
        if (existing != null && "SUCCESS".equals(existing.getStatus())) {
            throw BusinessException.conflict("Đơn này đã thanh toán");
        }

        String txnRef = "BT" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6);
        Payment payment = Payment.builder()
                .bookingId(req.getBookingId())
                .userId(userId)
                .amount(req.getAmount())
                .currency("VND")
                .provider("VNPAY")
                .txnRef(txnRef)
                .status("PENDING")
                .build();
        payment = paymentRepo.save(payment);

        String url = vnPayUtil.buildPaymentUrl(
                txnRef,
                req.getAmount().longValue(),
                req.getOrderInfo() == null ? "Thanh toan don " + req.getBookingId() : req.getOrderInfo(),
                clientIp);

        return PaymentInitResponse.builder()
                .paymentId(payment.getId())
                .txnRef(txnRef)
                .redirectUrl(url)
                .build();
    }

    /**
     * Handle VNPay IPN (Instant Payment Notification). VNPay calls this asynchronously
     * and expects { RspCode, Message } JSON in response.
     */
    @Transactional
    public Map<String, String> handleIpn(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String secureHash = params.get("vnp_SecureHash");
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepo.findByTxnRef(txnRef).orElse(null);
        if (payment == null) {
            return Map.of("RspCode", "01", "Message", "Order not found");
        }
        if (!vnPayUtil.verifySignature(params, secureHash)) {
            log.warn("Invalid VNPay signature for txnRef={}", txnRef);
            return Map.of("RspCode", "97", "Message", "Invalid signature");
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

        return Map.of("RspCode", "00", "Message", "Confirm Success");
    }
}
