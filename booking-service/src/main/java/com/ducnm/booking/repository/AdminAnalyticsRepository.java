package com.ducnm.booking.repository;

import com.ducnm.booking.entity.DatCho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminAnalyticsRepository extends JpaRepository<DatCho, Integer> {

    @Query("SELECT COUNT(d) FROM DatCho d")
    long countTotal();

    @Query("SELECT COUNT(d) FROM DatCho d WHERE d.trangThai = 'PAID'")
    long countPaid();

    @Query("SELECT COUNT(d) FROM DatCho d WHERE d.trangThai = 'FAILED'")
    long countFailed();

    @Query("SELECT COALESCE(SUM(d.tongGia), 0) FROM DatCho d WHERE d.trangThai = 'PAID'")
    double sumRevenue();

    @Query("SELECT d.trangThai, COUNT(d) FROM DatCho d GROUP BY d.trangThai")
    List<Object[]> statusDistribution();

    @Query("SELECT d.idChuyenDi, COUNT(d), COALESCE(SUM(d.tongGia), 0) FROM DatCho d WHERE d.trangThai = 'PAID' " +
            "GROUP BY d.idChuyenDi ORDER BY COUNT(d) DESC")
    List<Object[]> topTours();

    @Query("SELECT MONTH(d.ngayDat), COALESCE(SUM(d.tongGia), 0) FROM DatCho d " +
            "WHERE d.trangThai = 'PAID' AND YEAR(d.ngayDat) = :year GROUP BY MONTH(d.ngayDat)")
    List<Object[]> monthlyRevenue(@Param("year") int year);

    @Query("SELECT WEEK(d.ngayDat), COALESCE(SUM(d.tongGia), 0) FROM DatCho d " +
            "WHERE d.trangThai = 'PAID' AND YEAR(d.ngayDat) = :year GROUP BY WEEK(d.ngayDat)")
    List<Object[]> weeklyRevenue(@Param("year") int year);

    @Query("SELECT YEAR(d.ngayDat), COALESCE(SUM(d.tongGia), 0) FROM DatCho d " +
            "WHERE d.trangThai = 'PAID' GROUP BY YEAR(d.ngayDat) ORDER BY YEAR(d.ngayDat)")
    List<Object[]> yearlyRevenue();

    @Query("SELECT COALESCE(d.hoTen, ''), COALESCE(d.email, ''), COUNT(d), COALESCE(SUM(d.tongGia), 0) " +
            "FROM DatCho d WHERE d.trangThai = 'PAID' " +
            "GROUP BY d.idNguoiDung, d.hoTen, d.email ORDER BY SUM(d.tongGia) DESC")
    List<Object[]> userSpending();

    @Query("SELECT d.id, d.idChuyenDi, d.idNguoiDung, d.hoTen, d.email, d.soLuong, d.tongGia, d.trangThai, d.createdAt " +
            "FROM DatCho d ORDER BY d.createdAt DESC")
    List<Object[]> recentBookings();

    @Query("SELECT d.id, d.idNguoiDung, d.hoTen, d.email, d.soLuong, d.tongGia, d.createdAt " +
            "FROM DatCho d WHERE d.idChuyenDi = :tourId AND d.trangThai = 'PAID' ORDER BY d.createdAt DESC")
    List<Object[]> bookingsByTour(@Param("tourId") Integer tourId);
}
