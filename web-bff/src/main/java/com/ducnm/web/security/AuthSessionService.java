package com.ducnm.web.security;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.web.client.IdentityClient;
import com.ducnm.web.client.IdentityClient.LoginRequest;
import com.ducnm.web.client.IdentityClient.RegisterRequest;
import com.ducnm.web.client.IdentityClient.TokenResponse;
import com.ducnm.web.client.IdentityClient.UserSummary;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthSessionService {

    private final IdentityClient identityClient;

    public void login(String email, String password, HttpSession session) {
        ApiResponse<TokenResponse> resp = identityClient.login(new LoginRequest(email, password));
        if (resp == null || resp.getData() == null) {
            throw new IllegalArgumentException("Đăng nhập thất bại");
        }
        store(session, resp.getData());
    }

    public void registerOnly(RegisterRequest req) {
        ApiResponse<TokenResponse> resp = identityClient.register(req);
        if (resp == null || resp.getData() == null) {
            throw new IllegalArgumentException("Đăng ký thất bại");
        }
    }

    public AuthSession current(HttpSession session) {
        if (session == null) return null;
        return (AuthSession) session.getAttribute(AuthSession.KEY);
    }

    public void logout(HttpSession session) {
        if (session != null) {
            session.removeAttribute(AuthSession.KEY);
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    private void store(HttpSession session, TokenResponse token) {
        UserSummary user = token.user();
        AuthSession auth = AuthSession.builder()
                .accessToken(token.accessToken())
                .refreshToken(token.refreshToken())
                .userId(user.id())
                .email(user.email())
                .hoTen(user.hoTen())
                .tenDangNhap(user.email())
                .vaiTro(user.vaiTro())
                .anhDaiDien(user.anhDaiDien())
                .build();
        session.setAttribute(AuthSession.KEY, auth);

        String role = user.vaiTro() != null && user.vaiTro().startsWith("ROLE_")
                ? user.vaiTro() : "ROLE_" + (user.vaiTro() != null ? user.vaiTro() : "USER");
        var authentication = new UsernamePasswordAuthenticationToken(
                user.email(), null, List.of(new SimpleGrantedAuthority(role)));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
