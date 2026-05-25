package com.ducnm.review.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.review.entity.YeuThich;
import com.ducnm.review.repository.YeuThichRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final YeuThichRepository repo;

    @GetMapping
    public ApiResponse<List<YeuThich>> list(@RequestHeader(SecurityHeaders.USER_ID) Integer userId) {
        return ApiResponse.ok(repo.findByIdNguoiDung(userId));
    }

    @PostMapping("/{tourId}")
    public ApiResponse<YeuThich> toggleAdd(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @PathVariable Integer tourId) {
        return ApiResponse.ok(repo.findByIdNguoiDungAndIdChuyenDi(userId, tourId)
                .orElseGet(() -> repo.save(YeuThich.builder()
                        .idNguoiDung(userId).idChuyenDi(tourId).build())));
    }

    @Transactional
    @DeleteMapping("/{tourId}")
    public ApiResponse<Void> remove(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @PathVariable Integer tourId) {
        repo.deleteByIdNguoiDungAndIdChuyenDi(userId, tourId);
        return ApiResponse.ok(null);
    }
}
