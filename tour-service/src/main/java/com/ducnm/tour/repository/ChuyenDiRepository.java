package com.ducnm.tour.repository;

import com.ducnm.tour.entity.ChuyenDi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChuyenDiRepository
        extends JpaRepository<ChuyenDi, Integer>, JpaSpecificationExecutor<ChuyenDi> {

    List<ChuyenDi> findTop6ByNoiBatTrueOrderByIdDesc();

    Page<ChuyenDi> findByDiemDen_Id(Integer diemDenId, Pageable pageable);

    @Query("select c from ChuyenDi c where c.tieuDe like %:keyword% or c.moTa like %:keyword%")
    Page<ChuyenDi> searchByKeyword(String keyword, Pageable pageable);
}
