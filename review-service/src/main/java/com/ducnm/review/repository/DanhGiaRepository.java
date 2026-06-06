package com.ducnm.review.repository;

import com.ducnm.review.entity.DanhGia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    Page<DanhGia> findByIdChuyenDi(Integer idChuyenDi, Pageable pageable);

    Page<DanhGia> findByIdChuyenDiAndDiem(Integer idChuyenDi, Integer diem, Pageable pageable);

    List<DanhGia> findByIdChuyenDi(Integer idChuyenDi);

    @Query("select coalesce(avg(d.diem),0) from DanhGia d where d.idChuyenDi = :tourId")
    Double averageRating(Integer tourId);

    long countByIdChuyenDi(Integer idChuyenDi);

    @Query("""
            SELECT d.idChuyenDi, AVG(d.diem), COUNT(d),
                   SUM(CASE WHEN d.diem >= 4 THEN 1 ELSE 0 END)
            FROM DanhGia d
            GROUP BY d.idChuyenDi
            """)
    List<Object[]> aggregateByTour();
}
