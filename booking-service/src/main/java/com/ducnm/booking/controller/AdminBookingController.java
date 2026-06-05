package com.ducnm.booking.controller;

import com.ducnm.booking.dto.AdminDtos.AdminBookingResponse;
import com.ducnm.booking.service.AdminBookingService;
import com.ducnm.booking.service.AdminUserBookingService;
import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.common.util.SecurityHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final AdminBookingService service;
    private final AdminUserBookingService userBookingService;

    @GetMapping("/user-stats")
    public ApiResponse<java.util.Map<Integer, java.util.Map<String, Object>>> userStats(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam("ids") java.util.List<Integer> ids) {
        requireAdmin(roles);
        return ApiResponse.ok(userBookingService.statsForUsers(ids));
    }

    @GetMapping("/by-user/{userId}")
    public ApiResponse<PageResponse<AdminBookingResponse>> listByUser(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        requireAdmin(roles);
        return ApiResponse.ok(userBookingService.listByUser(userId, page, size));
    }

    @GetMapping("/by-user/{userId}/stats")
    public ApiResponse<java.util.Map<String, Object>> statsByUser(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer userId) {
        requireAdmin(roles);
        return ApiResponse.ok(userBookingService.stats(userId));
    }

    @GetMapping("/by-user/{userId}/spending")
    public ApiResponse<java.util.Map<String, Object>> spendingByUser(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "2026") int year) {
        requireAdmin(roles);
        return ApiResponse.ok(userBookingService.monthlySpending(userId, year));
    }

    @GetMapping
    public ApiResponse<PageResponse<AdminBookingResponse>> list(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin(roles);
        return ApiResponse.ok(service.list(trangThai, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminBookingResponse> get(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id) {
        requireAdmin(roles);
        return ApiResponse.ok(service.get(id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancel(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id,
            @RequestParam(required = false) String reason) {
        requireAdmin(roles);
        service.cancel(id, reason);
        return ApiResponse.ok(null, "Đã hủy");
    }

    private void requireAdmin(String roles) {
        if (roles == null || !roles.contains("ADMIN")) {
            throw BusinessException.forbidden("Chỉ admin");
        }
    }
}
