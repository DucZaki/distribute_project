package com.ducnm.review.repository;

import com.ducnm.review.entity.DanhGia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    Page<DanhGia> findByIdChuyenDi(Integer idChuyenDi, Pageable pageable);

    @Query("select coalesce(avg(d.diem),0) from DanhGia d where d.idChuyenDi = :tourId")
    Double averageRating(Integer tourId);

    long countByIdChuyenDi(Integer idChuyenDi);
}
