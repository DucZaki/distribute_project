package com.ducnm.booking.service;

import com.ducnm.booking.client.IdentityClient;
import com.ducnm.booking.client.TourClient;
import com.ducnm.booking.dto.BookingDtos.*;
import com.ducnm.booking.entity.ChoXacNhan;
import com.ducnm.booking.entity.DatCho;
import com.ducnm.booking.entity.MaGiamGia;
import com.ducnm.booking.repository.DatChoRepository;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.event.BookingCreatedEvent;
import com.ducnm.common.event.Topics;
import com.ducnm.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final DatChoRepository bookingRepo;
    private final PromoService promoService;
    private final TourClient tourClient;
    private final IdentityClient identityClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Booking creation flow (choreography saga):
     * 1) Validate tour + price (Feign → tour-service)
     * 2) Reserve seats atomically (Feign → tour-service)
     * 3) Apply promo (optional)
     * 4) Persist DatCho with status=PENDING + maCheckIn (UUID)
     * 5) Publish BookingCreatedEvent → notification-service + payment-service
     * 6) If anything fails between 2..5, compensation: releaseSeats
     */
    @Transactional
    public BookingResponse create(Integer userId, CreateBookingRequest req) {
        TourClient.TourBrief tour = tourClient.getTour(req.getIdChuyenDi()).getData();
        if (tour == null) throw BusinessException.notFound("Tour", req.getIdChuyenDi());

        boolean reserved = Boolean.TRUE.equals(
                tourClient.reserveSeats(req.getIdNgayKhoiHanh(), req.getSoLuong()).getData());
        if (!reserved) {
            throw BusinessException.conflict("Không còn đủ chỗ trống");
        }

        try {
            BigDecimal subtotal = tour.gia().multiply(BigDecimal.valueOf(req.getSoLuong()));
            BigDecimal discount = BigDecimal.ZERO;
            MaGiamGia promo = null;
            if (req.getMaGiamGia() != null && !req.getMaGiamGia().isBlank()) {
                promo = promoService.findByCode(req.getMaGiamGia())
                        .orElseThrow(() -> BusinessException.badRequest("Mã giảm giá không hợp lệ"));
                discount = PromoService.calcDiscount(promo, subtotal);
                promoService.consume(promo.getId());
            }
            BigDecimal total = subtotal.subtract(discount).max(BigDecimal.ZERO);

            DatCho booking = DatCho.builder()
                    .idNguoiDung(userId)
                    .idChuyenDi(req.getIdChuyenDi())
                    .idNgayKhoiHanh(req.getIdNgayKhoiHanh())
                    .idDiemDon(req.getIdDiemDon())
                    .idMaGiamGia(promo == null ? null : promo.getId())
                    .soLuong(req.getSoLuong())
                    .hoTen(req.getHoTen())
                    .email(req.getEmail())
                    .soDienThoai(req.getSoDienThoai())
                    .diaChi(req.getDiaChi())
                    .ghiChu(req.getGhiChu())
                    .tongGia(total)
                    .tienGiamGia(discount)
                    .trangThai("PENDING")
                    .maCheckIn(UUID.randomUUID().toString().replace("-", ""))
                    .build();

            if (req.getParticipants() != null && !req.getParticipants().isEmpty()) {
                List<ChoXacNhan> chos = new ArrayList<>();
                for (var p : req.getParticipants()) {
                    chos.add(ChoXacNhan.builder()
                            .datCho(booking)
                            .hoTen(p.getHoTen())
                            .gioiTinh(p.getGioiTinh())
                            .ngaySinh(p.getNgaySinh())
                            .soCmnd(p.getSoCmnd())
                            .build());
                }
                booking.setChoXacNhans(chos);
            }

            booking = bookingRepo.save(booking);
            log.info("Created booking id={} userId={} tourId={} seats={}",
                    booking.getId(), userId, req.getIdChuyenDi(), req.getSoLuong());

            kafkaTemplate.send(Topics.BOOKING_CREATED, String.valueOf(booking.getId()),
                    BookingCreatedEvent.builder()
                            .bookingId(booking.getId())
                            .userId(userId)
                            .userEmail(req.getEmail())
                            .userName(req.getHoTen())
                            .tourId(tour.id())
                            .tourTitle(tour.tieuDe())
                            .scheduleId(req.getIdNgayKhoiHanh())
                            .soLuong(req.getSoLuong())
                            .tongGia(total)
                            .maCheckIn(booking.getMaCheckIn())
                            .build());

            return toResponse(booking);
        } catch (RuntimeException ex) {
            log.error("Booking creation failed, releasing seats. scheduleId={} seats={}",
                    req.getIdNgayKhoiHanh(), req.getSoLuong(), ex);
            try {
                tourClient.releaseSeats(req.getIdNgayKhoiHanh(), req.getSoLuong());
            } catch (Exception releaseEx) {
                log.error("Compensation releaseSeats also failed - manual action required", releaseEx);
            }
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(Integer userId, Integer bookingId) {
        DatCho booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> BusinessException.notFound("Booking", bookingId));
        if (!booking.getIdNguoiDung().equals(userId)) {
            throw BusinessException.forbidden("Không có quyền truy cập đơn này");
        }
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> listMine(Integer userId, int page, int size) {
        Page<DatCho> p = bookingRepo.findByIdNguoiDung(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.<BookingResponse>builder()
                .content(p.getContent().stream().map(this::toResponse).toList())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public void markConfirmed(Integer bookingId, Integer paymentId) {
        DatCho b = bookingRepo.findById(bookingId)
                .orElseThrow(() -> BusinessException.notFound("Booking", bookingId));
        b.setTrangThai("CONFIRMED");
        b.setPaymentId(paymentId);
        log.info("Booking confirmed id={} paymentId={}", bookingId, paymentId);
    }

    @Transactional
    public void cancel(Integer bookingId, String reason) {
        DatCho b = bookingRepo.findById(bookingId)
                .orElseThrow(() -> BusinessException.notFound("Booking", bookingId));
        if ("CANCELLED".equals(b.getTrangThai())) return;
        b.setTrangThai("CANCELLED");
        tourClient.releaseSeats(b.getIdNgayKhoiHanh(), b.getSoLuong());
        log.info("Booking cancelled id={} reason={}", bookingId, reason);
    }

    private BookingResponse toResponse(DatCho b) {
        return BookingResponse.builder()
                .id(b.getId())
                .idChuyenDi(b.getIdChuyenDi())
                .idNgayKhoiHanh(b.getIdNgayKhoiHanh())
                .soLuong(b.getSoLuong())
                .createdAt(b.getCreatedAt())
                .trangThai(b.getTrangThai())
                .hoTen(b.getHoTen())
                .email(b.getEmail())
                .soDienThoai(b.getSoDienThoai())
                .tongGia(b.getTongGia())
                .tienGiamGia(b.getTienGiamGia())
                .maCheckIn(b.getMaCheckIn())
                .checkedInAt(b.getCheckedInAt())
                .build();
    }
}
