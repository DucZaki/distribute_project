package com.ducnm.booking.service;

import com.ducnm.booking.client.TourClient;
import com.ducnm.booking.dto.AdminDtos.AdminBookingResponse;
import com.ducnm.booking.entity.DatCho;
import com.ducnm.booking.repository.AdminAnalyticsRepository;
import com.ducnm.booking.repository.DatChoRepository;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.*;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminUserBookingService {

    private final DatChoRepository bookingRepo;
    private final AdminAnalyticsRepository analyticsRepo;
    private final AdminBookingService adminBookingService;
    private final TourClient tourClient;

    @Transactional(readOnly = true)
    public Map<String, Object> stats(Integer userId) {
        long totalBookings = bookingRepo.findByIdNguoiDung(userId, PageRequest.of(0, 1)).getTotalElements();
        double totalSpending = analyticsRepo.sumSpendingByUser(userId);
        long paidBookings = analyticsRepo.countPaidByUser(userId);

        Map<String, Object> lastBooking = null;
        var recent = bookingRepo.findByIdNguoiDung(userId, PageRequest.of(0, 1));
        if (!recent.isEmpty()) {
            DatCho b = recent.getContent().get(0);
            lastBooking = mapBookingSummary(b);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalBookings", totalBookings);
        out.put("paidBookings", paidBookings);
        out.put("totalSpending", totalSpending);
        out.put("lastBooking", lastBooking);
        return out;
    }

    @Transactional(readOnly = true)
    public Map<Integer, Map<String, Object>> statsForUsers(List<Integer> userIds) {
        if (userIds == null || userIds.isEmpty()) return Map.of();
        Map<Integer, Map<String, Object>> out = new LinkedHashMap<>();
        for (Object[] row : analyticsRepo.statsByUserIds(userIds)) {
            Integer uid = ((Number) row[0]).intValue();
            out.put(uid, Map.of(
                    "paidBookings", ((Number) row[1]).longValue(),
                    "totalSpending", ((Number) row[2]).doubleValue()));
        }
        for (Integer id : userIds) {
            out.putIfAbsent(id, Map.of("paidBookings", 0L, "totalSpending", 0.0));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminBookingResponse> listByUser(Integer userId, int page, int size) {
        Page<DatCho> p = bookingRepo.findByIdNguoiDung(userId, PageRequest.of(page, size));
        return PageResponse.<AdminBookingResponse>builder()
                .content(p.getContent().stream().map(adminBookingService::mapPublic).toList())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> monthlySpending(Integer userId, int year) {
        Map<Integer, Double> monthlyMap = new LinkedHashMap<>();
        IntStream.rangeClosed(1, 12).forEach(m -> monthlyMap.put(m, 0.0));
        for (Object[] row : analyticsRepo.monthlySpendingByUser(userId, year)) {
            monthlyMap.put(((Number) row[0]).intValue(), ((Number) row[1]).doubleValue());
        }
        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            labels.add("Tháng " + m);
            data.add(monthlyMap.get(m));
        }
        return Map.of("labels", labels, "data", data, "year", year, "userId", userId);
    }

    private Map<String, Object> mapBookingSummary(DatCho b) {
        String tourTitle = resolveTourTitle(b.getIdChuyenDi());
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("bookingId", b.getId());
        m.put("tourId", b.getIdChuyenDi());
        m.put("tourTitle", tourTitle);
        m.put("tongGia", b.getTongGia());
        m.put("ngayDat", b.getNgayDat() != null ? b.getNgayDat().toString() : "");
        m.put("trangThai", b.getTrangThai());
        return m;
    }

    private String resolveTourTitle(Integer tourId) {
        if (tourId == null) return "—";
        try {
            var tour = tourClient.getTour(tourId).getData();
            if (tour != null && tour.tieuDe() != null) return tour.tieuDe();
        } catch (Exception ignored) {
            // tour-service unavailable
        }
        return "Tour #" + tourId;
    }
}
