package com.ducnm.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

public class AuthDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        /** Email hoặc tên đăng nhập */
        @NotBlank
        @Size(max = 255)
        private String email;
        @NotBlank
        @Size(min = 6, max = 100)
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank
        @Email
        private String email;
        @NotBlank
        @Size(min = 6, max = 100)
        private String password;
        @NotBlank
        @Size(min = 3, max = 100)
        private String tenDangNhap;
        @NotBlank
        private String hoTen;
        private String number;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private UserSummary user;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Integer id;
        private String email;
        private String hoTen;
        private String vaiTro;
        private String anhDaiDien;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }
}
