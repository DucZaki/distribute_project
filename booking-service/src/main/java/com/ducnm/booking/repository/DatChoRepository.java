package com.ducnm.booking.repository;

import com.ducnm.booking.entity.DatCho;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DatChoRepository extends JpaRepository<DatCho, Integer> {
    Page<DatCho> findByIdNguoiDung(Integer idNguoiDung, Pageable pageable);

    Page<DatCho> findByTrangThai(String trangThai, Pageable pageable);

    Optional<DatCho> findByMaCheckIn(String maCheckIn);

    long countByIdChuyenDi(Integer idChuyenDi);
}
