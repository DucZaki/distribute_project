package com.ducnm.tour.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "diem_don")
public class DiemDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten", nullable = false, length = 255)
    private String ten;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "thanh_pho", length = 100)
    private String thanhPho;

    @Column(name = "kinh_do")
    private Double kinhDo;

    @Column(name = "vi_do")
    private Double viDo;
}
