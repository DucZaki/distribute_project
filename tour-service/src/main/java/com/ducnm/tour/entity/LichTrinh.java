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

    @Column(name = "tieu_de", length = 255)
    private String tieuDe;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "hinh_anh", length = 500)
    private String hinhAnh;
}
