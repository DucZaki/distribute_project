package com.ducnm.booking.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "cho_xac_nhan")
public class ChoXacNhan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dat_cho", nullable = false)
    @JsonBackReference
    private DatCho datCho;

    @Column(name = "ho_ten", length = 255)
    private String hoTen;

    @Column(name = "gioi_tinh", length = 10)
    private String gioiTinh;

    @Column(name = "ngay_sinh")
    private java.time.LocalDate ngaySinh;

    @Column(name = "so_cmnd", length = 20)
    private String soCmnd;
}
