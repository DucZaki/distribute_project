package com.ducnm.tour.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "ngay_khoi_hanh")
public class NgayKhoiHanh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chuyen_di", nullable = false)
    @JsonBackReference
    private ChuyenDi chuyenDi;

    @Column(name = "ngay_khoi_hanh", nullable = false)
    private LocalDate ngayKhoiHanh;

    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;

    @Column(name = "so_cho_toi_da", nullable = false)
    private Integer soChoToiDa;

    @Column(name = "so_cho_da_dat", nullable = false)
    @Builder.Default
    private Integer soChoDaDat = 0;

    @Column(name = "gia_override", precision = 12, scale = 2)
    private BigDecimal giaOverride;

    @Column(name = "trang_thai", length = 30)
    @Builder.Default
    private String trangThai = "ACTIVE";

    public int availableSeats() {
        return Math.max(0, soChoToiDa - (soChoDaDat == null ? 0 : soChoDaDat));
    }
}
