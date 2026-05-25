package com.ducnm.review.repository;

import com.ducnm.review.entity.YeuThich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface YeuThichRepository extends JpaRepository<YeuThich, Integer> {
    List<YeuThich> findByIdNguoiDung(Integer idNguoiDung);
    Optional<YeuThich> findByIdNguoiDungAndIdChuyenDi(Integer userId, Integer tourId);
    void deleteByIdNguoiDungAndIdChuyenDi(Integer userId, Integer tourId);
    boolean existsByIdNguoiDungAndIdChuyenDi(Integer userId, Integer tourId);
}
