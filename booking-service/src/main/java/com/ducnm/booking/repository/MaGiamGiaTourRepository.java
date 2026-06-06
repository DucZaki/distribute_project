package com.ducnm.booking.repository;

import com.ducnm.booking.entity.MaGiamGiaTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaGiamGiaTourRepository extends JpaRepository<MaGiamGiaTour, MaGiamGiaTour.Pk> {
    List<MaGiamGiaTour> findByIdMaGiamGia(Integer idMaGiamGia);

    void deleteByIdMaGiamGia(Integer idMaGiamGia);

    boolean existsByIdMaGiamGiaAndIdChuyenDi(Integer idMaGiamGia, Integer idChuyenDi);

    long countByIdMaGiamGia(Integer idMaGiamGia);
}
