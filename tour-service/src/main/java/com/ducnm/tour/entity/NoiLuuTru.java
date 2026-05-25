package com.ducnm.tour.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "noi_luu_tru")
public class NoiLuuTru {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten", nullable = false, length = 255)
    private String ten;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "hang_sao")
    private Integer hangSao;

    @Column(name = "loai", length = 50)
    private String loai;
}
