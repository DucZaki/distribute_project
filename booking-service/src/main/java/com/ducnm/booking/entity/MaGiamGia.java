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
}
