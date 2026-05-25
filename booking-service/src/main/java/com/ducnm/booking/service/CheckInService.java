package com.ducnm.booking.service;

import com.ducnm.booking.client.TourClient;
import com.ducnm.booking.dto.BookingDtos.CheckInResult;
import com.ducnm.booking.entity.DatCho;
import com.ducnm.booking.repository.DatChoRepository;
import com.ducnm.common.exception.BusinessException;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckInService {

    private final DatChoRepository bookingRepo;
    private final TourClient tourClient;

    @Value("${app.check-in-base-url:https://bookingtour.example.com/check-in}")
    private String baseUrl;

    @Transactional
    public CheckInResult checkIn(String maCheckIn) {
        DatCho booking = bookingRepo.findByCheckInToken(maCheckIn)
                .orElseThrow(() -> BusinessException.notFound("Booking", maCheckIn));

        if (!"CONFIRMED".equals(booking.getTrangThai())) {
            throw BusinessException.badRequest("Đơn chưa được xác nhận, không thể check-in");
        }

        boolean firstTime = booking.getCheckedInAt() == null;
        if (firstTime) {
            booking.setCheckedInAt(LocalDateTime.now());
        }

        String tourTitle = "";
        try {
            var t = tourClient.getTour(booking.getIdChuyenDi()).getData();
            if (t != null) tourTitle = t.tieuDe();
        } catch (Exception e) {
            log.warn("Cannot fetch tour title for check-in: {}", e.getMessage());
        }

        return CheckInResult.builder()
                .bookingId(booking.getId())
                .hoTen(booking.getHoTen())
                .tourTitle(tourTitle)
                .soLuong(booking.getSoLuong())
                .checkedAt(booking.getCheckedInAt())
                .firstTime(firstTime)
                .build();
    }

    public byte[] generateQrPng(String maCheckIn, int sizePx) {
        try {
            BitMatrix matrix = new QRCodeWriter().encode(
                    baseUrl + "/" + maCheckIn, BarcodeFormat.QR_CODE, sizePx, sizePx);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot generate QR", e);
        }
    }
}
