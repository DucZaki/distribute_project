package com.ducnm.identity.repository;

import com.ducnm.identity.entity.NguoiDung;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    Optional<NguoiDung> findByEmail(String email);

    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    boolean existsByEmail(String email);

    boolean existsByTenDangNhap(String tenDangNhap);

    Page<NguoiDung> findByVaiTro(String vaiTro, Pageable pageable);
}
