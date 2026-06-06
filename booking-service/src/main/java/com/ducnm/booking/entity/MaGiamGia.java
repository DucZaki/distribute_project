package com.ducnm.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ma_giam_gia", indexes = @Index(name = "idx_code", columnList = "ma", unique = true))
public class MaGiamGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", nullable = false, length = 50)
    private String ma;

    @Column(name = "mo_ta", length = 500)
    private String moTa;

    /** PERCENT (0..100) or AMOUNT (VND) */
    @Column(name = "loai", length = 20, nullable = false)
    @Builder.Default
    private String loai = "PERCENT";

    @Column(name = "gia_tri", precision = 12, scale = 2, nullable = false)
    private BigDecimal giaTri;

    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;

    @Column(name = "so_lan_dung_toi_da")
    private Integer soLanDungToiDa;

    @Column(name = "so_lan_da_dung", nullable = false)
    @Builder.Default
    private Integer soLanDaDung = 0;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Trần giảm (VND) khi loai = PERCENT */
    @Column(name = "giam_toi_da", precision = 12, scale = 2)
    private BigDecimal giamToiDa;

    /** Đơn hàng tối thiểu để áp dụng */
    @Column(name = "don_toi_thieu", precision = 12, scale = 2)
    private BigDecimal donToiThieu;

    /** Số lần tối đa mỗi user; null = không giới hạn */
    @Column(name = "gioi_han_moi_user")
    private Integer gioiHanMoiUser;

    /** STANDARD | EARLY_BIRD | LAST_MINUTE */
    @Column(name = "kieu_chien_dich", length = 30, nullable = false)
    @Builder.Default
    private String kieuChienDich = "STANDARD";

    /** Early Bird: phải đặt trước ít nhất X ngày so với ngày khởi hành */
    @Column(name = "so_ngay_dat_truoc")
    private Integer soNgayDatTruoc;

    /** Last-minute: khởi hành trong vòng X giờ tới */
    @Column(name = "so_gio_last_minute")
    private Integer soGioLastMinute;
}
