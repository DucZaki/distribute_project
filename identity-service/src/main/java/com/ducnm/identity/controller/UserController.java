package com.ducnm.identity.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.identity.dto.UserDtos.*;
import com.ducnm.identity.service.UserService;
import com.ducnm.common.util.SecurityHeaders;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Current user profile (from gateway-injected header)")
    public ApiResponse<UserResponse> me(@RequestHeader(SecurityHeaders.USER_ID) Integer userId) {
        return ApiResponse.ok(userService.getById(userId));
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateMe(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.ok(userService.updateProfile(userId, req), "Cập nhật thành công");
    }

    @PostMapping("/me/password")
    public ApiResponse<Void> changePassword(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(userId, req);
        return ApiResponse.ok(null, "Đổi mật khẩu thành công");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Inter-service lookup by id")
    public ApiResponse<UserResponse> getById(@PathVariable Integer id) {
        return ApiResponse.ok(userService.getById(id));
    }
}
