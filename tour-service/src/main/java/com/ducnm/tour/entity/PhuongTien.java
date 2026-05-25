package com.ducnm.tour.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "phuong_tien")
public class PhuongTien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten", nullable = false, length = 100)
    private String ten;

    @Column(name = "loai", length = 50)
    private String loai;

    @Column(name = "icon", length = 100)
    private String icon;
}
