package com.ducnm.booking.controller;

import com.ducnm.booking.dto.AdminDtos.AdminBookingResponse;
import com.ducnm.booking.service.AdminBookingService;
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
