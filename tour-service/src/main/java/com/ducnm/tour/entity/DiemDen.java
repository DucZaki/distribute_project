package com.ducnm.tour.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "diem_den")
public class DiemDen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten", nullable = false, length = 255)
    private String ten;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "hinh_anh", length = 500)
    private String hinhAnh;

    @Column(name = "vung_mien", length = 50)
    private String vungMien;

    @Column(name = "noi_bat")
    @Builder.Default
    private Boolean noiBat = false;
}
