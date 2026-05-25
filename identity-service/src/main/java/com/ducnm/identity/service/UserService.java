package com.ducnm.identity.service;

import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.identity.dto.UserDtos.*;
import com.ducnm.identity.entity.NguoiDung;
import com.ducnm.identity.mapper.UserMapper;
import com.ducnm.identity.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final NguoiDungRepository repo;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getById(Integer id) {
        return repo.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> BusinessException.notFound("User", id));
    }

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return repo.findByEmail(email)
                .map(mapper::toResponse)
                .orElseThrow(() -> BusinessException.notFound("User", email));
    }

    @Transactional
    public UserResponse updateProfile(Integer id, UpdateProfileRequest req) {
        NguoiDung user = repo.findById(id)
                .orElseThrow(() -> BusinessException.notFound("User", id));
        if (req.getHoTen() != null) user.setHoTen(req.getHoTen());
        if (req.getNumber() != null) user.setNumber(req.getNumber());
        if (req.getAnhDaiDien() != null) user.setAnhDaiDien(req.getAnhDaiDien());
        return mapper.toResponse(user);
    }

    @Transactional
    public void changePassword(Integer id, ChangePasswordRequest req) {
        NguoiDung user = repo.findById(id)
                .orElseThrow(() -> BusinessException.notFound("User", id));
        if (!"LOCAL".equalsIgnoreCase(user.getProvider())) {
            throw BusinessException.badRequest("Không thể đổi mật khẩu cho tài khoản " + user.getProvider());
        }
        if (!passwordEncoder.matches(req.getOldPassword(), user.getMatKhau())) {
            throw BusinessException.badRequest("Mật khẩu cũ không đúng");
        }
        user.setMatKhau(passwordEncoder.encode(req.getNewPassword()));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> listAll(int page, int size) {
        Page<NguoiDung> p = repo.findAll(PageRequest.of(page, size));
        List<UserResponse> content = p.getContent().stream().map(mapper::toResponse).toList();
        return PageResponse.<UserResponse>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public UserResponse adminUpdate(Integer id, AdminUpdateRoleRequest req) {
        NguoiDung user = repo.findById(id)
                .orElseThrow(() -> BusinessException.notFound("User", id));
        if (req.getVaiTro() != null) user.setVaiTro(req.getVaiTro());
        if (req.getEnabled() != null) user.setEnabled(req.getEnabled());
        return mapper.toResponse(user);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repo.existsById(id)) {
            throw BusinessException.notFound("User", id);
        }
        repo.deleteById(id);
    }
}
