package com.ducnm.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ma_giam_gia_tour")
@IdClass(MaGiamGiaTour.Pk.class)
public class MaGiamGiaTour {

    @Id
    @Column(name = "id_ma_giam_gia")
    private Integer idMaGiamGia;

    @Id
    @Column(name = "id_chuyen_di")
    private Integer idChuyenDi;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pk implements Serializable {
        private Integer idMaGiamGia;
        private Integer idChuyenDi;
    }
}
