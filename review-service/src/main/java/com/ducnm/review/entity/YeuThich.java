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
@Table(name = "yeu_thich",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_tour", columnNames = {"id_nguoi_dung", "id_chuyen_di"}))
public class YeuThich {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "id_nguoi_dung", nullable = false)
    private Integer idNguoiDung;

    @Column(name = "id_chuyen_di", nullable = false)
    private Integer idChuyenDi;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
