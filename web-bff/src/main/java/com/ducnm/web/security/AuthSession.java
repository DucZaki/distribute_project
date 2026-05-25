package com.ducnm.web.security;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
public class AuthSession implements Serializable {
    public static final String KEY = "AUTH_SESSION";

    private String accessToken;
    private String refreshToken;
    private Integer userId;
    private String email;
    private String hoTen;
    private String tenDangNhap;
    private String vaiTro;
    private String anhDaiDien;

    public boolean isAdmin() {
        return vaiTro != null && vaiTro.toUpperCase().contains("ADMIN");
    }
}
