package com.ducnm.booking.controller;

import com.ducnm.booking.dto.AdminDtos.PromoRequest;
import com.ducnm.booking.dto.AdminDtos.PromoResponse;
import com.ducnm.booking.service.AdminPromoService;
import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.common.util.SecurityHeaders;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/promos")
@RequiredArgsConstructor
public class AdminPromoController {

    private final AdminPromoService service;

    @GetMapping
    public ApiResponse<PageResponse<PromoResponse>> list(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin(roles);
        return ApiResponse.ok(service.list(page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<PromoResponse> getById(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id) {
        requireAdmin(roles);
        return ApiResponse.ok(service.getById(id));
    }

    @PostMapping
    public ApiResponse<PromoResponse> create(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @Valid @RequestBody PromoRequest req) {
        requireAdmin(roles);
        return ApiResponse.ok(service.create(req), "Tạo mã thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<PromoResponse> update(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id,
            @RequestBody PromoRequest req) {
        requireAdmin(roles);
        return ApiResponse.ok(service.update(id, req));
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
