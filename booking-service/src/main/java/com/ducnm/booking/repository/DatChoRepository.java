package com.ducnm.booking.repository;

import com.ducnm.booking.entity.DatCho;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DatChoRepository extends JpaRepository<DatCho, Integer> {
    Page<DatCho> findByIdNguoiDung(Integer idNguoiDung, Pageable pageable);

    Page<DatCho> findByTrangThai(String trangThai, Pageable pageable);

    // Spring Data JPA parses "findByMaCheckIn" as findByMaCheck + IN keyword.
    // Use explicit JPQL to disambiguate.
    @Query("select d from DatCho d where d.maCheckIn = :ma")
    Optional<DatCho> findByCheckInToken(@Param("ma") String ma);

    long countByIdChuyenDi(Integer idChuyenDi);

    @Query("""
            SELECT COALESCE(SUM(d.soLuong), 0) FROM DatCho d
            WHERE d.idChuyenDi = :tourId AND d.trangThai <> 'CANCELLED'
            """)
    long sumSoLuongByIdChuyenDi(@Param("tourId") Integer tourId);

    @Query("""
            select count(d) from DatCho d
             where d.idNguoiDung = :userId
               and d.idMaGiamGia = :promoId
               and d.trangThai <> 'CANCELLED'
            """)
    long countPromoUsageByUser(@Param("userId") Integer userId, @Param("promoId") Integer promoId);
}
