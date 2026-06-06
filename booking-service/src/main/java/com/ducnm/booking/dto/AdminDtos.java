package com.ducnm.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
        /** PERCENT | AMOUNT */
        private String loai;
        private BigDecimal giaTri;
        private BigDecimal giamToiDa;
        private BigDecimal donToiThieu;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
        private Integer soLanDungToiDa;
        private Integer gioiHanMoiUser;
        /** STANDARD | EARLY_BIRD | LAST_MINUTE */
        private String kieuChienDich;
        private Integer soNgayDatTruoc;
        private Integer soGioLastMinute;
        private Boolean active;
        /** Rỗng hoặc null = áp dụng mọi tour */
        private List<Integer> tourIds;
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
        private BigDecimal giamToiDa;
        private BigDecimal donToiThieu;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
        private Integer soLanDungToiDa;
        private Integer soLanDaDung;
        private Integer gioiHanMoiUser;
        private String kieuChienDich;
        private Integer soNgayDatTruoc;
        private Integer soGioLastMinute;
        private Boolean active;
        private List<Integer> tourIds;
    }
}
