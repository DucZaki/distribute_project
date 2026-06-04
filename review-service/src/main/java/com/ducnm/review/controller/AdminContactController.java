package com.ducnm.review.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.review.entity.Contact;
import com.ducnm.review.service.AdminContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/contacts")
@RequiredArgsConstructor
public class AdminContactController {

    private final AdminContactService service;

    @GetMapping
    public ApiResponse<PageResponse<Contact>> list(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin(roles);
        return ApiResponse.ok(service.list(trangThai, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<Contact> get(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id) {
        requireAdmin(roles);
        return ApiResponse.ok(service.get(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Contact> status(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id,
            @RequestParam String trangThai) {
        requireAdmin(roles);
        return ApiResponse.ok(service.updateStatus(id, trangThai));
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
