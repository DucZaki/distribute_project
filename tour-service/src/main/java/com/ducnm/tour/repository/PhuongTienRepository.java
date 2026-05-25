package com.ducnm.tour.repository;

import com.ducnm.tour.entity.PhuongTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhuongTienRepository extends JpaRepository<PhuongTien, Integer> {
}
