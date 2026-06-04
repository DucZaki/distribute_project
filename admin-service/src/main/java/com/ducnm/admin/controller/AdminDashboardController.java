package com.ducnm.admin.controller;

import com.ducnm.admin.security.AdminGuard;
import com.ducnm.admin.service.AdminDashboardService;
import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.util.SecurityHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/kpis")
    public ApiResponse<Map<String, Object>> kpis(@RequestHeader(SecurityHeaders.USER_ROLES) String roles) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.kpis());
    }

    @GetMapping("/defaults")
    public ApiResponse<Map<String, Object>> defaults(@RequestHeader(SecurityHeaders.USER_ROLES) String roles) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.defaults());
    }

    @GetMapping("/revenue/monthly")
    public ApiResponse<Map<String, Object>> monthlyRevenue(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(defaultValue = "2026") int year) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.monthlyRevenue(year));
    }

    @GetMapping("/revenue/detail")
    public ApiResponse<Map<String, Object>> revenueDetail(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(defaultValue = "2026") int year) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.revenueDetail(year));
    }

    @GetMapping("/bookings/status")
    public ApiResponse<Map<String, Object>> status(@RequestHeader(SecurityHeaders.USER_ROLES) String roles) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.bookingStatus());
    }

    @GetMapping("/top-tours")
    public ApiResponse<List<Map<String, Object>>> topTours(@RequestHeader(SecurityHeaders.USER_ROLES) String roles) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.topTours());
    }

    @GetMapping("/user-spending")
    public ApiResponse<List<Map<String, Object>>> userSpending(@RequestHeader(SecurityHeaders.USER_ROLES) String roles) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.userSpending());
    }

    @GetMapping("/recent-bookings")
    public ApiResponse<List<Map<String, Object>>> recent(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(defaultValue = "10") int limit) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.recentBookings(limit));
    }

    @GetMapping("/tour-bookings/{tourId}")
    public ApiResponse<List<Map<String, Object>>> tourBookings(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer tourId) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.tourBookings(tourId));
    }
}
