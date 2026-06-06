package com.ducnm.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBookingRequest {
        @NotNull
        private Integer idChuyenDi;
        @NotNull
        private Integer idNgayKhoiHanh;
        private Integer idDiemDon;
        @NotNull
        @Min(1)
        private Integer soLuong;
        @NotBlank
        private String hoTen;
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String soDienThoai;
        private String diaChi;
        private String ghiChu;
        private String maGiamGia;
        /** Ngày khởi hành — phục vụ kiểm tra mã Early Bird / Last-minute */
        private LocalDate ngayKhoiHanh;
        @Valid
        private List<ParticipantDto> participants;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantDto {
        @NotBlank
        private String hoTen;
        private String gioiTinh;
        private LocalDate ngaySinh;
        private String soCmnd;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private Integer id;
        private Integer idChuyenDi;
        private Integer idNgayKhoiHanh;
        private Integer soLuong;
        private LocalDateTime createdAt;
        private String trangThai;
        private String hoTen;
        private String email;
        private String soDienThoai;
        private BigDecimal tongGia;
        private BigDecimal tienGiamGia;
        private String maCheckIn;
        private LocalDateTime checkedInAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyPromoRequest {
        @NotBlank
        private String ma;
        @NotNull
        private BigDecimal subtotal;
        private Integer idChuyenDi;
        private Integer idNgayKhoiHanh;
        /** Ngày khởi hành (yyyy-MM-dd) — dùng cho Early Bird / Last-minute */
        private LocalDate ngayKhoiHanh;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromoApplyResult {
        private boolean valid;
        private String message;
        private BigDecimal discount;
        private BigDecimal finalAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckInResult {
        private Integer bookingId;
        private String hoTen;
        private String tourTitle;
        private Integer soLuong;
        private LocalDateTime checkedAt;
        private boolean firstTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicPromoSummary {
        private Integer id;
        private String ma;
        private String moTa;
        private String loai;
        private BigDecimal giaTri;
        private BigDecimal giamToiDa;
        private BigDecimal donToiThieu;
        private String kieuChienDich;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
    }
}
