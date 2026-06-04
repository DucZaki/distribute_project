package com.ducnm.tour.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lich_trinh")
public class LichTrinh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chuyen_di", nullable = false)
    @JsonBackReference
    private ChuyenDi chuyenDi;

    @Column(name = "ngay_thu", nullable = false)
    private Integer ngayThu;

    /** Tuyến / điểm đến trong ngày */
    @Column(name = "tieu_de", length = 255)
    private String tieuDe;

    @Column(name = "so_bua_an", length = 255)
    private String soBuaAn;

    @Column(name = "hoat_dong_chinh", length = 500)
    private String hoatDongChinh;

    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "nghi_dem", length = 255)
    private String nghiDem;

    /** Legacy import — ưu tiên noi_dung khi map ra API */
    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "hinh_anh", length = 500)
    private String hinhAnh;
}
