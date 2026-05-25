package com.ducnm.tour.repository;

import com.ducnm.tour.entity.NgayKhoiHanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NgayKhoiHanhRepository extends JpaRepository<NgayKhoiHanh, Integer> {

    List<NgayKhoiHanh> findByChuyenDi_IdAndTrangThai(Integer chuyenDiId, String trangThai);

    Optional<NgayKhoiHanh> findByIdAndTrangThai(Integer id, String trangThai);

    /**
     * Atomic seat reservation. Returns 1 if reservation succeeded, 0 if no seats / inactive.
     * Used via Feign by booking-service to prevent overbooking.
     */
    @Modifying
    @Query("""
            update NgayKhoiHanh n
               set n.soChoDaDat = n.soChoDaDat + :so
             where n.id = :id
               and n.trangThai = 'ACTIVE'
               and (n.soChoToiDa - n.soChoDaDat) >= :so
            """)
    int reserveSeats(@Param("id") Integer id, @Param("so") Integer so);

    @Modifying
    @Query("""
            update NgayKhoiHanh n
               set n.soChoDaDat = n.soChoDaDat - :so
             where n.id = :id
               and n.soChoDaDat >= :so
            """)
    int releaseSeats(@Param("id") Integer id, @Param("so") Integer so);
}
