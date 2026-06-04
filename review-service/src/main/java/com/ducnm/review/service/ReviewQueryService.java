package com.ducnm.review.service;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.review.client.IdentityClient;
import com.ducnm.review.dto.ReviewDtos.ReviewResponse;
import com.ducnm.review.entity.DanhGia;
import com.ducnm.review.repository.DanhGiaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewQueryService {

    private final DanhGiaRepository repo;
    private final IdentityClient identityClient;

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listByTour(Integer tourId, Pageable pageable) {
        Page<DanhGia> page = repo.findByIdChuyenDi(tourId, pageable);
        List<ReviewResponse> content = enrich(page.getContent());
        return PageResponse.<ReviewResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private List<ReviewResponse> enrich(List<DanhGia> reviews) {
        if (reviews.isEmpty()) {
            return List.of();
        }
        Map<Integer, String> names = resolveDisplayNames(reviews);
        return reviews.stream()
                .map(r -> ReviewResponse.builder()
                        .id(r.getId())
                        .idChuyenDi(r.getIdChuyenDi())
                        .idNguoiDung(r.getIdNguoiDung())
                        .hoTen(names.get(r.getIdNguoiDung()))
                        .diem(r.getDiem())
                        .noiDung(r.getNoiDung())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
    }

    private Map<Integer, String> resolveDisplayNames(List<DanhGia> reviews) {
        Set<Integer> userIds = reviews.stream()
                .map(DanhGia::getIdNguoiDung)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Integer, String> result = new HashMap<>();
        for (Integer userId : userIds) {
            try {
                ApiResponse<IdentityClient.UserBrief> res = identityClient.getUser(userId);
                if (res != null && res.getData() != null) {
                    IdentityClient.UserBrief u = res.getData();
                    String name = firstNonBlank(u.hoTen(), u.tenDangNhap(), u.email());
                    if (name != null) {
                        result.put(userId, name.trim());
                    }
                }
            } catch (Exception ex) {
                log.warn("Cannot resolve reviewer name userId={}: {}", userId, ex.getMessage());
            }
        }
        return result;
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }
}
