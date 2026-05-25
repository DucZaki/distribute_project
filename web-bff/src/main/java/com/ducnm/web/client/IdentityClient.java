package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "identity-service")
public interface IdentityClient {

    @PostMapping("/api/v1/auth/login")
    ApiResponse<TokenResponse> login(@RequestBody LoginRequest req);

    @PostMapping("/api/v1/auth/register")
    ApiResponse<TokenResponse> register(@RequestBody RegisterRequest req);

    @GetMapping("/api/v1/users/me")
    ApiResponse<UserResponse> me();

    @PutMapping("/api/v1/users/me")
    ApiResponse<UserResponse> updateMe(@RequestBody UpdateProfileRequest req);

    @PostMapping("/api/v1/users/me/password")
    ApiResponse<Void> changePassword(@RequestBody ChangePasswordRequest req);

    record LoginRequest(String email, String password) {}

    record RegisterRequest(String email, String password, String tenDangNhap, String hoTen, String number) {}

    record TokenResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, UserSummary user) {}

    record UserSummary(Integer id, String email, String hoTen, String vaiTro, String anhDaiDien) {}

    record UserResponse(Integer id, String email, String tenDangNhap, String hoTen, String number, String vaiTro, String anhDaiDien) {}

    record UpdateProfileRequest(String hoTen, String number, String anhDaiDien) {}

    record ChangePasswordRequest(String currentPassword, String newPassword) {}
}
