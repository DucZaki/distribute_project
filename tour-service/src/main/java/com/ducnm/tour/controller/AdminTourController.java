package com.ducnm.tour.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.tour.dto.TourDtos.*;
import com.ducnm.tour.service.ScheduleService;
import com.ducnm.tour.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/tours")
@RequiredArgsConstructor
public class AdminTourController {

    private final TourService tourService;
    private final ScheduleService scheduleService;
    private final com.ducnm.tour.service.TourImageStorage imageStorage;

    @GetMapping
    public ApiResponse<PageResponse<TourSummary>> list(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(defaultValue = "active") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        requireAdmin(roles);
        return ApiResponse.ok(tourService.listAdmin(status, page, size));
    }

    @GetMapping("/form-options")
    public ApiResponse<TourFormOptions> formOptions(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles) {
        requireAdmin(roles);
        return ApiResponse.ok(tourService.formOptions());
    }

    @GetMapping("/{id}")
    public ApiResponse<TourResponse> get(@PathVariable Integer id) {
        return ApiResponse.ok(tourService.getById(id));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadImage(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam("file") MultipartFile file) {
        requireAdmin(roles);
        return ApiResponse.ok(Map.of("path", imageStorage.store(file)), "Đã tải ảnh lên");
    }

    @PostMapping
    public ApiResponse<TourResponse> create(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @Valid @RequestBody CreateTourRequest req) {
        requireAdmin(roles);
        return ApiResponse.ok(tourService.create(req), "Tạo tour thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<TourResponse> update(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id,
            @Valid @RequestBody CreateTourRequest req) {
        requireAdmin(roles);
        return ApiResponse.ok(tourService.update(id, req));
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
        return ApiResponse.ok(scheduleService.listAll(id));
    }

    @PostMapping("/{id}/schedules")
    public ApiResponse<NgayKhoiHanhDto> createSchedule(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id,
            @Valid @RequestBody NgayKhoiHanhDto req) {
        requireAdmin(roles);
        return ApiResponse.ok(scheduleService.create(id, req));
    }

    @PutMapping("/{tourId}/schedules/{scheduleId}")
    public ApiResponse<NgayKhoiHanhDto> updateSchedule(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer scheduleId,
            @Valid @RequestBody NgayKhoiHanhDto req) {
        requireAdmin(roles);
        return ApiResponse.ok(scheduleService.update(scheduleId, req));
    }

    @PutMapping("/{tourId}/schedules/{scheduleId}/toggle")
    public ApiResponse<NgayKhoiHanhDto> toggleSchedule(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer scheduleId) {
        requireAdmin(roles);
        return ApiResponse.ok(scheduleService.toggle(scheduleId));
    }

    @DeleteMapping("/{tourId}/schedules/{scheduleId}")
    public ApiResponse<Void> deleteSchedule(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer scheduleId) {
        requireAdmin(roles);
        scheduleService.delete(scheduleId);
        return ApiResponse.ok(null, "Đã xoá");
    }

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
