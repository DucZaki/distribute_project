package com.ducnm.identity.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.identity.dto.UserDtos.*;
import com.ducnm.identity.service.UserService;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.common.exception.BusinessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id) {
        requireAdmin(roles);
        return ApiResponse.ok(userService.getById(id));
    }

    @PostMapping
    public ApiResponse<UserResponse> create(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @Valid @RequestBody AdminCreateUserRequest req) {
        requireAdmin(roles);
        return ApiResponse.ok(userService.adminCreate(req), "Tạo user thành công");
    }

    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> list(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin(roles);
        return ApiResponse.ok(userService.listAll(page, size));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> update(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateRoleRequest req) {
        requireAdmin(roles);
        return ApiResponse.ok(userService.adminUpdate(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @RequestHeader(SecurityHeaders.USER_ROLES) String roles,
            @PathVariable Integer id) {
        requireAdmin(roles);
        userService.delete(id);
        return ApiResponse.ok(null, "Đã xoá");
    }

    private void requireAdmin(String roles) {
        if (roles == null || !roles.contains("ADMIN")) {
            throw BusinessException.forbidden("Chỉ admin mới có quyền");
        }
    }
}
