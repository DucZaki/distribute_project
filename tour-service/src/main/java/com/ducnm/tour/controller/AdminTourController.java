package com.ducnm.tour.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.tour.dto.TourDtos.*;
import com.ducnm.tour.service.ScheduleService;
import com.ducnm.tour.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tours")
@RequiredArgsConstructor
public class AdminTourController {

    private final TourService tourService;
    private final ScheduleService scheduleService;

    @PostMapping
    public ApiResponse<TourResponse> create(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @Valid @RequestBody CreateTourRequest req) {
        requireAdmin(roles);
        return ApiResponse.ok(tourService.create(req), "Tạo tour thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id) {
        requireAdmin(roles);
        tourService.delete(id);
        return ApiResponse.ok(null, "Đã xoá");
    }

    @GetMapping("/{id}/schedules")
    public ApiResponse<List<NgayKhoiHanhDto>> schedules(@PathVariable Integer id) {
        return ApiResponse.ok(scheduleService.listActive(id));
    }

    @PostMapping("/{id}/schedules")
    public ApiResponse<NgayKhoiHanhDto> createSchedule(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id,
            @Valid @RequestBody NgayKhoiHanhDto req) {
        requireAdmin(roles);
        return ApiResponse.ok(scheduleService.create(id, req));
    }

    /**
     * Internal endpoint - called by booking-service via Feign for atomic seat reservation.
     */
    @PostMapping("/internal/schedules/{scheduleId}/reserve")
    public ApiResponse<Boolean> reserve(
            @PathVariable Integer scheduleId,
            @RequestParam int seats) {
        return ApiResponse.ok(scheduleService.reserveSeats(scheduleId, seats));
    }

    @PostMapping("/internal/schedules/{scheduleId}/release")
    public ApiResponse<Boolean> release(
            @PathVariable Integer scheduleId,
            @RequestParam int seats) {
        return ApiResponse.ok(scheduleService.releaseSeats(scheduleId, seats));
    }

    private void requireAdmin(String roles) {
        if (roles == null || !roles.contains("ADMIN")) {
            throw BusinessException.forbidden("Chỉ admin");
        }
    }
}
