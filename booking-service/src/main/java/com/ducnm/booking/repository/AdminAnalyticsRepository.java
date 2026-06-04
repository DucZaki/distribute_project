package com.ducnm.booking.repository;

import com.ducnm.booking.entity.DatCho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminAnalyticsRepository extends JpaRepository<DatCho, Integer> {

    String PAID_FILTER = "d.trangThai IN ('PAID', 'CONFIRMED')";
    String FAILED_FILTER = "d.trangThai IN ('FAILED', 'CANCELLED')";

    @Query("SELECT COUNT(d) FROM DatCho d")
    long countTotal();

    @Query("SELECT COUNT(d) FROM DatCho d WHERE " + PAID_FILTER)
    long countPaid();

    @Query("SELECT COUNT(d) FROM DatCho d WHERE " + FAILED_FILTER)
    long countFailed();

    @Query("SELECT COUNT(d) FROM DatCho d WHERE d.trangThai = 'PENDING'")
    long countPending();

    @Query("SELECT COALESCE(SUM(d.tongGia), 0) FROM DatCho d WHERE " + PAID_FILTER)
    double sumRevenue();

    @Query("SELECT d.trangThai, COUNT(d) FROM DatCho d GROUP BY d.trangThai")
    List<Object[]> statusDistribution();

    @Query("SELECT d.idChuyenDi, COUNT(d), COALESCE(SUM(d.tongGia), 0) FROM DatCho d WHERE " + PAID_FILTER + " " +
            "GROUP BY d.idChuyenDi ORDER BY COUNT(d) DESC")
    List<Object[]> topTours();

    @Query(value = """
            SELECT MONTH(COALESCE(d.ngay_dat, DATE(d.created_at))) AS m,
                   COALESCE(SUM(d.tong_gia), 0) AS revenue
            FROM dat_cho d
            WHERE d.trang_thai IN ('PAID', 'CONFIRMED')
              AND YEAR(COALESCE(d.ngay_dat, DATE(d.created_at))) = :year
            GROUP BY MONTH(COALESCE(d.ngay_dat, DATE(d.created_at)))
            """, nativeQuery = true)
    List<Object[]> monthlyRevenue(@Param("year") int year);

    @Query(value = """
            SELECT WEEK(COALESCE(d.ngay_dat, DATE(d.created_at))) AS w,
                   COALESCE(SUM(d.tong_gia), 0) AS revenue
            FROM dat_cho d
            WHERE d.trang_thai IN ('PAID', 'CONFIRMED')
              AND YEAR(COALESCE(d.ngay_dat, DATE(d.created_at))) = :year
            GROUP BY WEEK(COALESCE(d.ngay_dat, DATE(d.created_at)))
            """, nativeQuery = true)
    List<Object[]> weeklyRevenue(@Param("year") int year);

    @Query(value = """
            SELECT YEAR(COALESCE(d.ngay_dat, DATE(d.created_at))) AS y,
                   COALESCE(SUM(d.tong_gia), 0) AS revenue
            FROM dat_cho d
            WHERE d.trang_thai IN ('PAID', 'CONFIRMED')
            GROUP BY YEAR(COALESCE(d.ngay_dat, DATE(d.created_at)))
            ORDER BY y
            """, nativeQuery = true)
    List<Object[]> yearlyRevenue();

    @Query(value = """
            SELECT COALESCE(SUM(d.tong_gia), 0) FROM dat_cho d
            WHERE d.trang_thai IN ('PAID', 'CONFIRMED')
              AND YEAR(COALESCE(d.ngay_dat, DATE(d.created_at))) = YEAR(CURRENT_DATE)
              AND MONTH(COALESCE(d.ngay_dat, DATE(d.created_at))) = MONTH(CURRENT_DATE)
            """, nativeQuery = true)
    double revenueCurrentMonth();

    @Query(value = """
            SELECT COALESCE(SUM(d.tong_gia), 0) FROM dat_cho d
            WHERE d.trang_thai IN ('PAID', 'CONFIRMED')
              AND YEAR(COALESCE(d.ngay_dat, DATE(d.created_at))) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
              AND MONTH(COALESCE(d.ngay_dat, DATE(d.created_at))) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
            """, nativeQuery = true)
    double revenuePreviousMonth();

    @Query("SELECT d.idNguoiDung, COALESCE(d.hoTen, ''), COALESCE(d.email, ''), COUNT(d), COALESCE(SUM(d.tongGia), 0) " +
            "FROM DatCho d WHERE " + PAID_FILTER + " " +
            "GROUP BY d.idNguoiDung, d.hoTen, d.email ORDER BY SUM(d.tongGia) DESC")
    List<Object[]> userSpending();

    @Query("SELECT d.id, d.idChuyenDi, d.idNguoiDung, d.hoTen, d.email, d.soLuong, d.tongGia, d.trangThai, d.createdAt " +
            "FROM DatCho d ORDER BY d.createdAt DESC")
    List<Object[]> recentBookings();

    @Query("SELECT d.id, d.idNguoiDung, d.hoTen, d.email, d.soLuong, d.tongGia, d.createdAt " +
            "FROM DatCho d WHERE d.idChuyenDi = :tourId AND " + PAID_FILTER + " ORDER BY d.createdAt DESC")
    List<Object[]> bookingsByTour(@Param("tourId") Integer tourId);
}
