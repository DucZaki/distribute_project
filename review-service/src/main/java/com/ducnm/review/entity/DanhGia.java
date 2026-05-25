package com.ducnm.review.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "danh_gia", indexes = @Index(name = "idx_chuyen_di", columnList = "id_chuyen_di"))
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "id_chuyen_di", nullable = false)
    private Integer idChuyenDi;

    @Column(name = "id_nguoi_dung", nullable = false)
    private Integer idNguoiDung;

    @Column(name = "diem", nullable = false)
    private Integer diem;

    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
