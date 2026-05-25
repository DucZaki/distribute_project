package com.ducnm.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "dat_cho", indexes = {
        @Index(name = "idx_nguoi_dung", columnList = "id_nguoi_dung"),
        @Index(name = "idx_chuyen_di", columnList = "id_chuyen_di"),
        @Index(name = "idx_ma_checkin", columnList = "ma_check_in", unique = true),
        @Index(name = "idx_trang_thai", columnList = "trang_thai")
})
public class DatCho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "id_nguoi_dung", nullable = false)
    private Integer idNguoiDung;

    @Column(name = "id_chuyen_di", nullable = false)
    private Integer idChuyenDi;

    @Column(name = "id_ngay_khoi_hanh")
    private Integer idNgayKhoiHanh;

    @Column(name = "id_diem_don")
    private Integer idDiemDon;

    @Column(name = "id_ma_giam_gia")
    private Integer idMaGiamGia;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "ngay_dat")
    private LocalDate ngayDat;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "trang_thai", length = 30, nullable = false)
    @Builder.Default
    private String trangThai = "PENDING";

    @Column(name = "ho_ten", length = 255)
    private String hoTen;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "tong_gia", precision = 12, scale = 2)
    private BigDecimal tongGia;

    @Column(name = "tien_giam_gia", precision = 12, scale = 2)
    private BigDecimal tienGiamGia;

    @Column(name = "ma_check_in", length = 64, unique = true)
    private String maCheckIn;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "payment_id")
    private Integer paymentId;

    @OneToMany(mappedBy = "datCho", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChoXacNhan> choXacNhans;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (ngayDat == null) ngayDat = LocalDate.now();
    }
}
