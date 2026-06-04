package com.ducnm.booking.controller;

import com.ducnm.booking.service.AdminAnalyticsService;
import com.ducnm.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/admin")
@RequiredArgsConstructor
public class InternalAdminMetricsController {

    private final AdminAnalyticsService analyticsService;

    @GetMapping("/metrics")
    public ApiResponse<Map<String, Object>> metrics() {
        return ApiResponse.ok(analyticsService.metrics());
    }

    @GetMapping("/tour-bookings/{tourId}")
    public ApiResponse<List<Map<String, Object>>> tourBookings(@PathVariable Integer tourId) {
        return ApiResponse.ok(analyticsService.tourBookings(tourId));
    }

    @GetMapping("/revenue")
    public ApiResponse<Map<String, Object>> revenue(@RequestParam(defaultValue = "2026") int year) {
        return ApiResponse.ok(analyticsService.revenueDetail(year));
    }
}
