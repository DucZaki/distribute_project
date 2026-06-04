package com.ducnm.tour.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class TourDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourResponse {
        private Integer id;
        private String tieuDe;
        private String moTa;
        private BigDecimal gia;
        private LocalDate ngayKhoiHanh;
        private LocalDate ngayKetThuc;
        private String hinhAnh;
        private String highlight;
        private Boolean noiBat;
        private DiemDenSummary diemDen;
        private SimpleRef phuongTien;
        private SimpleRef noiLuuTru;
        private List<NgayKhoiHanhDto> ngayKhoiHanhs;
        private List<LichTrinhDto> lichTrinhs;
        private Set<DiemDonDto> diemDons;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourSummary {
        private Integer id;
        private String tieuDe;
        private BigDecimal gia;
        private String hinhAnh;
        private LocalDate ngayKhoiHanh;
        private Boolean noiBat;
        private DiemDenSummary diemDen;
        private PhuongTienSummary phuongTien;
        private DiemDonDto diemDon;
        private Double averageRating;
        private Long ratingCount;
        private Long bookingCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhuongTienSummary {
        private Integer id;
        private String ten;
        private String loai;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTourRequest {
        @NotBlank
        private String tieuDe;
        private String moTa;
        @NotNull
        @DecimalMin("0.0")
        private BigDecimal gia;
        private LocalDate ngayKhoiHanh;
        private LocalDate ngayKetThuc;
        @NotNull
        private Integer idDiemDen;
        private Integer idPhuongTien;
        private Integer idNoiLuuTru;
        private Integer idDiemDonDefault;
        private Set<Integer> diemDonIds;
        private Boolean noiBat;
        private String hinhAnh;
        private String highlight;
        @Valid
        private List<LichTrinhDto> lichTrinhs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiemDenSummary {
        private Integer id;
        private String ten;
        private String hinhAnh;
        private String vungMien;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimpleRef {
        private Integer id;
        private String ten;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiemDonDto {
        private Integer id;
        private String ten;
        private String diaChi;
        private String thanhPho;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LichTrinhDto {
        private Integer id;
        @NotNull
        private Integer ngayThu;
        @NotBlank
        private String tieuDe;
        private String soBuaAn;
        private String hoatDongChinh;
        private String moTa;
        private String nghiDem;
        private String hinhAnh;
        private List<String> noiDungLines;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NgayKhoiHanhDto {
        private Integer id;
        @NotNull
        private LocalDate ngayKhoiHanh;
        private LocalDate ngayKetThuc;
        @NotNull
        @Min(1)
        private Integer soChoToiDa;
        private Integer soChoDaDat;
        private BigDecimal giaOverride;
        private String trangThai;
        private Integer availableSeats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchRequest {
        private String keyword;
        private Integer idDiemDen;
        private BigDecimal giaTu;
        private BigDecimal giaDen;
        private LocalDate ngayTu;
        private LocalDate ngayDen;
        private Integer idPhuongTien;
    }
}
