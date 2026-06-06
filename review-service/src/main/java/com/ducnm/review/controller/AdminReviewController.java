package com.ducnm.review.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.review.dto.ReviewDtos.ReviewResponse;
import com.ducnm.review.dto.ReviewDtos.TourReviewSummary;
import com.ducnm.review.service.AdminReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService service;

    @GetMapping("/tours")
    public ApiResponse<List<TourReviewSummary>> toursWithReviews(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(required = false) String sort) {
        requireAdmin(roles);
        return ApiResponse.ok(service.toursWithReviews(sort));
    }

    @GetMapping
    public ApiResponse<PageResponse<ReviewResponse>> list(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(required = false) Integer tourId,
            @RequestParam(required = false) Integer diem,
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        requireAdmin(roles);
        return ApiResponse.ok(service.list(tourId, diem, hoTen, sort, page, size));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id) {
        requireAdmin(roles);
        service.delete(id);
        return ApiResponse.ok(null, "Đã xoá");
    }

    private void requireAdmin(String roles) {
        if (roles == null || !roles.contains("ADMIN")) {
            throw BusinessException.forbidden("Chỉ admin");
        }
    }
}
