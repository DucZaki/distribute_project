package com.ducnm.booking.service;

import com.ducnm.booking.repository.AdminAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.*;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final AdminAnalyticsRepository repo;

    @Transactional(readOnly = true)
    public Map<String, Object> metrics() {
        long total = repo.countTotal();
        long paid = repo.countPaid();
        long failed = repo.countFailed();
        long pending = repo.countPending();

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (Object[] row : repo.statusDistribution()) {
            statusCounts.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }

        List<Map<String, Object>> topTours = new ArrayList<>();
        for (Object[] row : repo.topTours()) {
            if (topTours.size() >= 10) break;
            topTours.add(Map.of(
                    "tourId", row[0],
                    "bookings", ((Number) row[1]).longValue(),
                    "revenue", ((Number) row[2]).doubleValue()));
        }

        List<Map<String, Object>> userSpending = new ArrayList<>();
        for (Object[] row : repo.userSpending()) {
            if (userSpending.size() >= 20) break;
            userSpending.add(Map.of(
                    "userId", row[0],
                    "name", row[1],
                    "email", row[2],
                    "purchases", ((Number) row[3]).longValue(),
                    "spending", ((Number) row[4]).doubleValue()));
        }

        List<Map<String, Object>> recent = new ArrayList<>();
        for (Object[] row : repo.recentBookings()) {
            if (recent.size() >= 20) break;
            recent.add(bookingRow(row));
        }

        int year = Year.now().getValue();
        double[] monthly = new double[12];
        for (Object[] row : repo.monthlyRevenue(year)) {
            int month = ((Number) row[0]).intValue();
            if (month >= 1 && month <= 12) {
                monthly[month - 1] = ((Number) row[1]).doubleValue();
            }
        }

        double revenueThisMonth = repo.revenueCurrentMonth();
        double revenueLastMonth = repo.revenuePreviousMonth();
        Double revenueGrowthPercent = null;
        if (revenueLastMonth > 0) {
            revenueGrowthPercent = Math.round(100.0 * (revenueThisMonth - revenueLastMonth) / revenueLastMonth * 10) / 10.0;
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalBookings", total);
        m.put("successBookings", paid);
        m.put("failedBookings", failed);
        m.put("pendingBookings", pending);
        m.put("totalRevenue", repo.sumRevenue());
        m.put("revenueThisMonth", revenueThisMonth);
        m.put("revenueLastMonth", revenueLastMonth);
        if (revenueGrowthPercent != null) {
            m.put("revenueGrowthPercent", revenueGrowthPercent);
        }
        m.put("topTours", topTours);
        m.put("userSpending", userSpending);
        m.put("recentBookings", recent);
        m.put("statusCounts", statusCounts);
        m.put("monthlyRevenue", Arrays.stream(monthly).boxed().toList());
        return m;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> revenueDetail(int year) {
        Map<Integer, Double> monthlyMap = new LinkedHashMap<>();
        IntStream.rangeClosed(1, 12).forEach(m -> monthlyMap.put(m, 0.0));
        for (Object[] row : repo.monthlyRevenue(year)) {
            monthlyMap.put(((Number) row[0]).intValue(), ((Number) row[1]).doubleValue());
        }
        List<Map<String, Object>> monthlyRows = new ArrayList<>();
        List<String> monthlyLabels = new ArrayList<>();
        List<Double> monthlyData = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            monthlyLabels.add("Tháng " + m);
            monthlyData.add(monthlyMap.get(m));
            monthlyRows.add(Map.of("period", m, "amount", monthlyMap.get(m)));
        }

        Map<Integer, Double> weeklyMap = new LinkedHashMap<>();
        IntStream.rangeClosed(1, 52).forEach(w -> weeklyMap.put(w, 0.0));
        for (Object[] row : repo.weeklyRevenue(year)) {
            weeklyMap.put(((Number) row[0]).intValue(), ((Number) row[1]).doubleValue());
        }
        List<Map<String, Object>> weeklyRows = new ArrayList<>();
        List<String> weeklyLabels = new ArrayList<>();
        List<Double> weeklyData = new ArrayList<>();
        for (int w = 1; w <= 52; w++) {
            weeklyLabels.add("Tuần " + w);
            weeklyData.add(weeklyMap.get(w));
            weeklyRows.add(Map.of("period", w, "amount", weeklyMap.get(w)));
        }

        List<Object[]> yearlyRaw = repo.yearlyRevenue();
        int currentYear = LocalDate.now().getYear();
        int minYear = currentYear - 4;
        if (!yearlyRaw.isEmpty()) {
            int dbMin = yearlyRaw.stream().mapToInt(r -> ((Number) r[0]).intValue()).min().orElse(minYear);
            minYear = Math.min(minYear, dbMin);
        }
        Map<Integer, Double> yearlyMap = new LinkedHashMap<>();
        for (int y = minYear; y <= currentYear; y++) yearlyMap.put(y, 0.0);
        for (Object[] row : yearlyRaw) {
            yearlyMap.put(((Number) row[0]).intValue(), ((Number) row[1]).doubleValue());
        }
        List<Map<String, Object>> yearlyRows = new ArrayList<>();
        List<String> yearlyLabels = new ArrayList<>();
        List<Double> yearlyData = new ArrayList<>();
        for (int y = minYear; y <= currentYear; y++) {
            yearlyLabels.add("Năm " + y);
            yearlyData.add(yearlyMap.get(y));
            yearlyRows.add(Map.of("period", y, "amount", yearlyMap.get(y)));
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalRevenue", repo.sumRevenue());
        out.put("year", year);
        out.put("monthlyLabels", monthlyLabels);
        out.put("monthlyData", monthlyData);
        out.put("monthlyRows", monthlyRows);
        out.put("weeklyLabels", weeklyLabels);
        out.put("weeklyData", weeklyData);
        out.put("weeklyRows", weeklyRows);
        out.put("yearlyLabels", yearlyLabels);
        out.put("yearlyData", yearlyData);
        out.put("yearlyRows", yearlyRows);
        return out;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> tourBookings(Integer tourId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] row : repo.bookingsByTour(tourId)) {
            out.add(Map.of(
                    "bookingId", row[0],
                    "userId", row[1],
                    "userName", row[2] != null ? row[2] : "",
                    "email", row[3] != null ? row[3] : "",
                    "quantity", row[4],
                    "total", row[5],
                    "createdAt", row[6] != null ? row[6].toString() : ""));
        }
        return out;
    }

    private static Map<String, Object> bookingRow(Object[] row) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("bookingId", row[0]);
        m.put("tourId", row[1]);
        m.put("userId", row[2]);
        m.put("userName", row[3]);
        m.put("email", row[4]);
        m.put("quantity", row[5]);
        m.put("total", row[6]);
        m.put("status", row[7]);
        m.put("createdAt", row[8] != null ? row[8].toString() : "");
        return m;
    }
}
