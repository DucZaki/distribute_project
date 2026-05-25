package com.ducnm.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "nguoi_dung", indexes = {
        @Index(name = "idx_email", columnList = "email", unique = true),
        @Index(name = "idx_username", columnList = "ten_dang_nhap", unique = true)
})
public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "ten_dang_nhap", length = 100)
    private String tenDangNhap;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "mat_khau", length = 255)
    private String matKhau;

    @Column(name = "vai_tro", length = 30)
    private String vaiTro;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @Column(name = "ho_ten", length = 255)
    private String hoTen;

    @Column(name = "number", length = 20)
    private String number;

    @Column(name = "provider", length = 30)
    private String provider;

    @Column(name = "anh_dai_dien", length = 500)
    private String anhDaiDien;

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @PrePersist
    void onCreate() {
        if (ngayTao == null) ngayTao = Instant.now();
        if (vaiTro == null) vaiTro = "USER";
        if (provider == null) provider = "LOCAL";
    }
}
