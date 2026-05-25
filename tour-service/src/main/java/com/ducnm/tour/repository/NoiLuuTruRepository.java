package com.ducnm.tour.repository;

import com.ducnm.tour.entity.NoiLuuTru;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoiLuuTruRepository extends JpaRepository<NoiLuuTru, Integer> {
}
