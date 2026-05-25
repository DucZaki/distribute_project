package com.ducnm.booking.repository;

import com.ducnm.booking.entity.MaGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaGiamGiaRepository extends JpaRepository<MaGiamGia, Integer> {
    Optional<MaGiamGia> findByMaIgnoreCase(String ma);

    @Modifying
    @Query("""
            update MaGiamGia m
               set m.soLanDaDung = m.soLanDaDung + 1
             where m.id = :id
               and m.active = true
               and (m.soLanDungToiDa is null or m.soLanDaDung < m.soLanDungToiDa)
            """)
    int incrementUsage(Integer id);
}
