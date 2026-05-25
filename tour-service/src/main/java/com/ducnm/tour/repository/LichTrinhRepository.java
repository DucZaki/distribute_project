package com.ducnm.tour.repository;

import com.ducnm.tour.entity.LichTrinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichTrinhRepository extends JpaRepository<LichTrinh, Integer> {
    List<LichTrinh> findByChuyenDi_IdOrderByNgayThuAsc(Integer chuyenDiId);
}
