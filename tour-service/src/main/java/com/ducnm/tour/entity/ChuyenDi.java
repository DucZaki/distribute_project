package com.ducnm.tour.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "chuyen_di", indexes = {
        @Index(name = "idx_diem_den", columnList = "id_diem_den"),
        @Index(name = "idx_ngay_khoi_hanh", columnList = "ngay_khoi_hanh"),
        @Index(name = "idx_noi_bat", columnList = "noi_bat")
})
public class ChuyenDi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tieu_de", nullable = false, length = 500)
    private String tieuDe;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "gia", precision = 12, scale = 2, nullable = false)
    private BigDecimal gia;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "ngay_khoi_hanh")
    private LocalDate ngayKhoiHanh;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_diem_den")
    private DiemDen diemDen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_phuong_tien")
    private PhuongTien phuongTien;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_noi_luu_tru")
    private NoiLuuTru noiLuuTru;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_diem_don")
    private DiemDon diemDonDefault;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "chuyen_di_diem_don",
            joinColumns = @JoinColumn(name = "chuyen_di_id"),
            inverseJoinColumns = @JoinColumn(name = "diem_don_id"))
    @Builder.Default
    private Set<DiemDon> diemDons = new HashSet<>();

    @Column(name = "noi_bat")
    @Builder.Default
    private Boolean noiBat = false;

    @Column(name = "hinh_anh", length = 500)
    private String hinhAnh;

    @Column(name = "highlight", columnDefinition = "TEXT")
    private String highlight;

    @OneToMany(mappedBy = "chuyenDi", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<NgayKhoiHanh> ngayKhoiHanhs;

    @OneToMany(mappedBy = "chuyenDi", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LichTrinh> lichTrinhs;
}
