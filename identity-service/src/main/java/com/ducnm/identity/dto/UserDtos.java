package com.ducnm.identity.dto;

import lombok.*;

import java.time.Instant;

public class UserDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Integer id;
        private String tenDangNhap;
        private String email;
        private String hoTen;
        private String number;
        private String vaiTro;
        private String provider;
        private String anhDaiDien;
        private Boolean enabled;
        private Instant ngayTao;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String hoTen;
        private String number;
        private String anhDaiDien;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUpdateRoleRequest {
        private String tenDangNhap;
        private String email;
        private String password;
        private String vaiTro;
        private Boolean enabled;
        private String hoTen;
        private String number;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminCreateUserRequest {
        private String tenDangNhap;
        private String email;
        private String password;
        private String hoTen;
        private String number;
        private String vaiTro;
        private Boolean enabled;
    }
}
