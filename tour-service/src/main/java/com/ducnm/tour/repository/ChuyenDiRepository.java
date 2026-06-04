package com.ducnm.tour.repository;

import com.ducnm.tour.entity.ChuyenDi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChuyenDiRepository
        extends JpaRepository<ChuyenDi, Integer>, JpaSpecificationExecutor<ChuyenDi> {

    org.springframework.data.domain.Page<ChuyenDi> findByNgayKetThucGreaterThanEqualOrNgayKetThucIsNull(
            LocalDate date, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<ChuyenDi> findByNgayKetThucLessThan(
            LocalDate date, org.springframework.data.domain.Pageable pageable);

    List<ChuyenDi> findTop6ByNoiBatTrueOrderByIdDesc();

    Page<ChuyenDi> findByDiemDen_Id(Integer diemDenId, Pageable pageable);

    @Query("select c from ChuyenDi c where c.tieuDe like %:keyword% or c.moTa like %:keyword%")
    Page<ChuyenDi> searchByKeyword(String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"lichTrinhs", "diemDen", "phuongTien", "diemDonDefault"})
    @Query("select c from ChuyenDi c where c.id = :id")
    Optional<ChuyenDi> findDetailedById(Integer id);

    @Query("""
            SELECT DISTINCT cd FROM ChuyenDi cd
            JOIN FETCH cd.diemDons dd
            LEFT JOIN FETCH cd.diemDen
            WHERE dd.id IN :diemDonIds
            AND (
                cd.ngayKetThuc IS NULL
                OR cd.ngayKetThuc >= :today
                OR EXISTS (
                    SELECT 1 FROM NgayKhoiHanh nkh
                    WHERE nkh.chuyenDi = cd AND nkh.ngayKhoiHanh >= :today
                )
            )
            ORDER BY cd.noiBat DESC, cd.gia ASC
            """)
    List<ChuyenDi> findByDiemDonIdsAndBookable(List<Integer> diemDonIds, LocalDate today);
}
