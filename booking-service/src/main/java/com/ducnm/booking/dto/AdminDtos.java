package com.ducnm.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AdminDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminBookingResponse {
        private Integer id;
        private Integer idChuyenDi;
        private Integer idNguoiDung;
        private String trangThai;
        private BigDecimal tongGia;
        private Integer soLuong;
        private LocalDate ngayDat;
        private LocalDateTime createdAt;
        private String hoTen;
        private String email;
        private String tieuDeTour;
        private String maCheckIn;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromoRequest {
        private String ma;
        private String moTa;
        private String loai;
        private BigDecimal giaTri;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
        private Integer soLanDungToiDa;
        private Boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromoResponse {
        private Integer id;
        private String ma;
        private String moTa;
        private String loai;
        private BigDecimal giaTri;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
        private Integer soLanDungToiDa;
        private Integer soLanDaDung;
        private Boolean active;
    }
}
