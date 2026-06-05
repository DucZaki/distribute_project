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
    /** Đặt chỗ còn hiệu lực — dùng bảng dashboard (gồm chờ thanh toán) */
    String ACTIVE_BOOKING_FILTER = "d.trangThai IN ('PAID', 'CONFIRMED', 'PENDING')";
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
            "GROUP BY d.idChuyenDi HAVING COALESCE(SUM(d.tongGia), 0) > 0 ORDER BY SUM(d.tongGia) DESC")
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

    @Query("SELECT d.idNguoiDung, COALESCE(MAX(d.hoTen), ''), COALESCE(MAX(d.email), ''), COUNT(d), COALESCE(SUM(d.tongGia), 0) " +
            "FROM DatCho d WHERE " + PAID_FILTER + " " +
            "GROUP BY d.idNguoiDung HAVING COALESCE(SUM(d.tongGia), 0) > 0 ORDER BY SUM(d.tongGia) DESC")
    List<Object[]> userSpending();

    @Query("SELECT d.id, d.idChuyenDi, d.idNguoiDung, d.hoTen, d.email, d.soLuong, d.tongGia, d.trangThai, d.createdAt " +
            "FROM DatCho d ORDER BY d.createdAt DESC")
    List<Object[]> recentBookings();

    @Query("SELECT d.id, d.idNguoiDung, d.hoTen, d.email, d.soLuong, d.tongGia, d.createdAt " +
            "FROM DatCho d WHERE d.idChuyenDi = :tourId AND " + PAID_FILTER + " ORDER BY d.createdAt DESC")
    List<Object[]> bookingsByTour(@Param("tourId") Integer tourId);

    @Query("SELECT COUNT(d) FROM DatCho d WHERE d.idNguoiDung = :userId AND " + PAID_FILTER)
    long countPaidByUser(@Param("userId") Integer userId);

    @Query("SELECT COALESCE(SUM(d.tongGia), 0) FROM DatCho d WHERE d.idNguoiDung = :userId AND " + PAID_FILTER)
    double sumSpendingByUser(@Param("userId") Integer userId);

    @Query("SELECT d.idNguoiDung, COUNT(d), COALESCE(SUM(d.tongGia), 0) FROM DatCho d " +
            "WHERE " + PAID_FILTER + " AND d.idNguoiDung IN :userIds GROUP BY d.idNguoiDung")
    List<Object[]> statsByUserIds(@Param("userIds") List<Integer> userIds);

    @Query(value = """
            SELECT MONTH(COALESCE(d.ngay_dat, DATE(d.created_at))) AS m,
                   COALESCE(SUM(d.tong_gia), 0) AS revenue
            FROM dat_cho d
            WHERE d.id_nguoi_dung = :userId
              AND d.trang_thai IN ('PAID', 'CONFIRMED')
              AND YEAR(COALESCE(d.ngay_dat, DATE(d.created_at))) = :year
            GROUP BY MONTH(COALESCE(d.ngay_dat, DATE(d.created_at)))
            """, nativeQuery = true)
    List<Object[]> monthlySpendingByUser(@Param("userId") Integer userId, @Param("year") int year);
}
