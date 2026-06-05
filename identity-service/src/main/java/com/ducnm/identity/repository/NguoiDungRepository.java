package com.ducnm.identity.repository;

import com.ducnm.identity.entity.NguoiDung;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    @Query("SELECT u FROM NguoiDung u WHERE u.email = :login OR u.tenDangNhap = :login")
    Optional<NguoiDung> findByEmailOrTenDangNhap(@Param("login") String login);

    Optional<NguoiDung> findByEmail(String email);

    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    boolean existsByEmail(String email);

    boolean existsByTenDangNhap(String tenDangNhap);

    Page<NguoiDung> findByVaiTro(String vaiTro, Pageable pageable);

    @Query("""
            SELECT u FROM NguoiDung u
            WHERE :q IS NULL OR :q = '' OR
                  LOWER(u.hoTen) LIKE LOWER(CONCAT('%', :q, '%')) OR
                  LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) OR
                  LOWER(u.tenDangNhap) LIKE LOWER(CONCAT('%', :q, '%')) OR
                  CAST(u.id AS string) LIKE CONCAT('%', :q, '%')
            """)
    Page<NguoiDung> search(@Param("q") String q, Pageable pageable);
}
