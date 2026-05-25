package com.ducnm.identity.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.identity.dto.AuthDtos.*;
import com.ducnm.identity.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new account")
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ApiResponse.ok(authService.register(req), "Đăng ký thành công");
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email + password")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ApiResponse.ok(authService.refresh(req));
    }
}
