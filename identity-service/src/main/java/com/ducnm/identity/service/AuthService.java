package com.ducnm.identity.service;

import com.ducnm.common.exception.BusinessException;
import com.ducnm.common.security.JwtService;
import com.ducnm.identity.dto.AuthDtos.*;
import com.ducnm.identity.entity.NguoiDung;
import com.ducnm.identity.mapper.UserMapper;
import com.ducnm.identity.repository.NguoiDungRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final NguoiDungRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public TokenResponse register(RegisterRequest req) {
        if (repo.existsByEmail(req.getEmail())) {
            throw BusinessException.conflict("Email đã tồn tại");
        }
        if (repo.existsByTenDangNhap(req.getTenDangNhap())) {
            throw BusinessException.conflict("Tên đăng nhập đã tồn tại");
        }

        NguoiDung user = NguoiDung.builder()
                .email(req.getEmail())
                .tenDangNhap(req.getTenDangNhap())
                .matKhau(passwordEncoder.encode(req.getPassword()))
                .hoTen(req.getHoTen())
                .number(req.getNumber())
                .vaiTro("USER")
                .provider("LOCAL")
                .enabled(true)
                .build();
        user = repo.save(user);
        log.info("Registered user id={} email={}", user.getId(), user.getEmail());

        return issueTokens(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        String login = req.getEmail() == null ? "" : req.getEmail().trim();
        NguoiDung user = repo.findByEmailOrTenDangNhap(login)
                .orElseThrow(() -> BusinessException.unauthorized("Tên đăng nhập hoặc mật khẩu không chính xác"));

        if (!"LOCAL".equalsIgnoreCase(user.getProvider())) {
            throw BusinessException.badRequest("Tài khoản này sử dụng đăng nhập " + user.getProvider());
        }
        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw BusinessException.forbidden("Tài khoản đã bị vô hiệu hoá");
        }
        if (user.getMatKhau() == null || !passwordEncoder.matches(req.getPassword(), user.getMatKhau())) {
            throw BusinessException.unauthorized("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        return issueTokens(user);
    }

    public TokenResponse refresh(RefreshRequest req) {
        try {
            Claims claims = jwtService.parse(req.getRefreshToken());
            String email = claims.getSubject();
            NguoiDung user = repo.findByEmail(email)
                    .orElseThrow(() -> BusinessException.unauthorized("Người dùng không tồn tại"));
            return issueTokens(user);
        } catch (Exception e) {
            throw BusinessException.unauthorized("Refresh token không hợp lệ");
        }
    }

    @Transactional(readOnly = true)
    public TokenResponse tokensForUsername(String tenDangNhap) {
        NguoiDung user = repo.findByTenDangNhap(tenDangNhap)
                .orElseThrow(() -> BusinessException.unauthorized("Người dùng OAuth không tồn tại"));
        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw BusinessException.forbidden("Tài khoản đã bị vô hiệu hoá");
        }
        return issueTokens(user);
    }

    private TokenResponse issueTokens(NguoiDung user) {
        Map<String, Object> claims = Map.of(
                "uid", user.getId(),
                "roles", List.of(user.getVaiTro()),
                "ten", user.getHoTen() == null ? "" : user.getHoTen());

        String accessToken = jwtService.generateAccessToken(user.getEmail(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600)
                .user(userMapper.toSummary(user))
                .build();
    }
}
