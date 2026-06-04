package com.ducnm.admin.service;

import com.ducnm.admin.client.BookingAdminClient;
import com.ducnm.admin.client.IdentityAdminClient;
import com.ducnm.admin.client.ReviewAdminClient;
import com.ducnm.admin.client.TourAdminClient;
import com.ducnm.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.*;

@SuppressWarnings("unchecked")
@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final BookingAdminClient bookingClient;
    private final IdentityAdminClient identityClient;
    private final TourAdminClient tourClient;
    private final ReviewAdminClient reviewClient;

    private Map<String, Object> bookingMetrics() {
        return Optional.ofNullable(unwrap(bookingClient.metrics())).orElse(Map.of());
    }

    public Map<String, Object> kpis() {
        Map<String, Object> b = bookingMetrics();
        long users = Optional.ofNullable(unwrap(identityClient.metrics())).map(IdentityAdminClient.MapHolder::totalUsers).orElse(0L);
        long tours = Optional.ofNullable(unwrap(tourClient.metrics())).map(TourAdminClient.MapHolder::totalTours).orElse(0L);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalBookings", num(b.get("totalBookings")));
        m.put("successBookings", num(b.get("successBookings")));
        m.put("failedBookings", num(b.get("failedBookings")));
        m.put("pendingBookings", num(b.get("pendingBookings")));
        m.put("totalRevenue", dbl(b.get("totalRevenue")));
        m.put("totalUsers", users);
        m.put("totalTours", tours);
        long total = num(b.get("totalBookings"));
        if (total > 0) {
            m.put("successRate", Math.round(100.0 * num(b.get("successBookings")) / total));
        }
        return m;
    }

    public Map<String, Object> defaults() {
        int y = Year.now().getValue();
        List<Integer> years = new ArrayList<>();
        for (int i = y; i >= y - 4; i--) years.add(i);
        return Map.of("currentYear", y, "years", years);
    }

    public Map<String, Object> monthlyRevenue(int year) {
        return Optional.ofNullable(unwrap(bookingClient.revenue(year))).orElse(Map.of());
    }

    public Map<String, Object> revenueDetail(int year) {
        return monthlyRevenue(year);
    }

    public Map<String, Object> bookingStatus() {
        Object raw = bookingMetrics().get("statusCounts");
        if (!(raw instanceof Map<?, ?> counts)) {
            return Map.of("labels", List.of(), "data", List.of());
        }
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();
        counts.forEach((k, v) -> {
            labels.add(String.valueOf(k));
            data.add(v instanceof Number n ? n.longValue() : 0L);
        });
        return Map.of("labels", labels, "data", data);
    }

    public List<Map<String, Object>> topTours() {
        Object raw = bookingMetrics().get("topTours");
        if (!(raw instanceof List<?> list)) return List.of();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> row)) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            row.forEach((k, v) -> m.put(String.valueOf(k), v));
            Object tourId = m.get("tourId");
            if (tourId != null) {
                try {
                    var tour = unwrap(tourClient.getTour(((Number) tourId).intValue()));
                    if (tour != null && tour.get("tieuDe") != null) {
                        m.put("tourTitle", tour.get("tieuDe"));
                    }
                } catch (Exception ignored) {
                    m.put("tourTitle", "Tour #" + tourId);
                }
            }
            out.add(m);
        }
        return out;
    }

    public List<Map<String, Object>> userSpending() {
        Object raw = bookingMetrics().get("userSpending");
        return raw instanceof List<?> list ? (List<Map<String, Object>>) list : List.of();
    }

    public List<Map<String, Object>> recentBookings(int limit) {
        Object raw = bookingMetrics().get("recentBookings");
        if (!(raw instanceof List<?> all)) return List.of();
        List<Map<String, Object>> slice = all.size() <= limit
                ? (List<Map<String, Object>>) all
                : ((List<Map<String, Object>>) all).subList(0, limit);
        for (Map<String, Object> row : slice) {
            Object tourId = row.get("tourId");
            if (tourId == null || row.get("tourTitle") != null) continue;
            try {
                var tour = unwrap(tourClient.getTour(((Number) tourId).intValue()));
                if (tour != null && tour.get("tieuDe") != null) {
                    row.put("tourTitle", tour.get("tieuDe"));
                }
            } catch (Exception ignored) {
                row.put("tourTitle", "Tour #" + tourId);
            }
        }
        return slice;
    }

    public List<Map<String, Object>> tourBookings(Integer tourId) {
        return Optional.ofNullable(unwrap(bookingClient.tourBookings(tourId))).orElse(List.of());
    }

    public Map<String, Object> summaryStats() {
        var r = unwrap(reviewClient.metrics());
        Map<String, Object> m = new LinkedHashMap<>();
        if (r != null) {
            m.put("totalContacts", r.totalContacts());
            m.put("pendingContacts", r.pendingContacts());
            m.put("totalReviews", r.totalReviews());
        }
        return m;
    }

    private static long num(Object v) {
        return v instanceof Number n ? n.longValue() : 0L;
    }

    private static double dbl(Object v) {
        return v instanceof Number n ? n.doubleValue() : 0.0;
    }

    private static <T> T unwrap(ApiResponse<T> res) {
        return res != null ? res.getData() : null;
    }
}
