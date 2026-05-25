package com.ducnm.web.view;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Getter
@Setter
public class ChuyenDiView {
    private Integer id;
    private String tieuDe;
    private String moTa;
    private BigDecimal gia;
    private LocalDate ngayKhoiHanh;
    private LocalDate ngayKetThuc;
    private String hinhAnh;
    private String highlight;
    private Boolean noiBat;
    private DiemDenView idDiemDen;
    private DiemDonView idDiemDon;
    private PhuongTienView idPhuongTien;
    private NoiLuuTruView idNoiLuuTru;
    private Set<DiemDonView> diemDons = new LinkedHashSet<>();
    private List<LichTrinhView> lichTrinhs;
    private List<NgayKhoiHanhView> ngayKhoiHanhs;
    private double averageRating;
    private int ratingCount;
    private int bookingCount;

    public double getAverageRating() {
        return averageRating;
    }

    public int getRatingCount() {
        return ratingCount;
    }

    public int getBookingCount() {
        return bookingCount;
    }

    @Getter @Setter
    public static class DiemDenView {
        private Integer id;
        private String ten;
        private String thanhPho;
        private String quocGia;
        private String hinhAnh;
        private String vungMien;
        private String chauLuc;
    }

    @Getter @Setter
    public static class DiemDonView {
        private Integer id;
        private String ten;
        private String diaChi;
        private String thanhPho;
    }

    @Getter @Setter
    public static class PhuongTienView {
        private Integer id;
        private String ten;
        private String loai;
        private String hang;
    }

    @Getter @Setter
    public static class NoiLuuTruView {
        private Integer id;
        private String ten;
    }

    @Getter @Setter
    public static class LichTrinhView {
        private Integer id;
        private Integer ngayThu;
        private String tieuDe;
        private String moTa;
        private String hinhAnh;
        private String soBuaAn;
        private String noiDung;
        private String nghiDem;
        private String hoatDongChinh;

        public java.util.List<String> getNoiDungLines() {
            String text = noiDung != null && !noiDung.isBlank() ? noiDung : moTa;
            if (text == null || text.isBlank()) {
                return java.util.List.of();
            }
            return java.util.Arrays.stream(text.split("\\r?\\n"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        public String getResolvedHoatDongChinh() {
            if (hoatDongChinh != null && !hoatDongChinh.isBlank()) {
                return hoatDongChinh.trim();
            }
            java.util.List<String> lines = getNoiDungLines();
            return lines.isEmpty() ? null : lines.get(0);
        }
    }

    @Getter @Setter
    public static class NgayKhoiHanhView {
        private Integer id;
        private LocalDate ngayKhoiHanh;
        private LocalDate ngay;
        private LocalDate ngayKetThuc;
        private Integer soChoToiDa;
        private Integer soChoDaDat;
        private Integer availableSeats;
        private BigDecimal giaOverride;
        private Double giaVeDi;
        private Double tongGiaVe;

        public LocalDate getNgay() {
            return ngayKhoiHanh != null ? ngayKhoiHanh : ngay;
        }

        public double getTongGiaVe() {
            if (tongGiaVe != null) return tongGiaVe;
            if (giaOverride != null) return giaOverride.doubleValue();
            if (giaVeDi != null) return giaVeDi;
            return 0;
        }
    }
}
