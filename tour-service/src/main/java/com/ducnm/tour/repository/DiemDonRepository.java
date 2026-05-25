package com.ducnm.tour.repository;

import com.ducnm.tour.entity.DiemDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiemDonRepository extends JpaRepository<DiemDon, Integer> {
    List<DiemDon> findByThanhPho(String thanhPho);
}
