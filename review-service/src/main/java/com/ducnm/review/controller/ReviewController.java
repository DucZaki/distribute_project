package com.ducnm.review.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.review.entity.DanhGia;
import com.ducnm.review.repository.DanhGiaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final DanhGiaRepository repo;

    @GetMapping("/tour/{tourId}")
    public ApiResponse<PageResponse<DanhGia>> list(@PathVariable Integer tourId,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        Page<DanhGia> p = repo.findByIdChuyenDi(tourId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ApiResponse.ok(PageResponse.<DanhGia>builder()
                .content(p.getContent())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build());
    }

    @GetMapping("/tour/{tourId}/summary")
    public ApiResponse<Map<String, Object>> summary(@PathVariable Integer tourId) {
        return ApiResponse.ok(Map.of(
                "averageRating", repo.averageRating(tourId),
                "totalReviews", repo.countByIdChuyenDi(tourId)));
    }

    @PostMapping
    public ApiResponse<DanhGia> create(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @Valid @RequestBody CreateReviewRequest req) {
        DanhGia review = DanhGia.builder()
                .idChuyenDi(req.idChuyenDi)
                .idNguoiDung(userId)
                .diem(req.diem)
                .noiDung(req.noiDung)
                .build();
        return ApiResponse.ok(repo.save(review), "Cảm ơn đánh giá của bạn");
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CreateReviewRequest {
        @NotNull
        private Integer idChuyenDi;
        @NotNull
        @Min(1)
        @Max(5)
        private Integer diem;
        @NotBlank
        private String noiDung;
    }
}
