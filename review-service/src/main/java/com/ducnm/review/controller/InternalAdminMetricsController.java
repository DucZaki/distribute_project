package com.ducnm.review.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.review.repository.ContactRepository;
import com.ducnm.review.repository.DanhGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/admin")
@RequiredArgsConstructor
public class InternalAdminMetricsController {

    private final ContactRepository contactRepo;
    private final DanhGiaRepository reviewRepo;

    @GetMapping("/metrics")
    public ApiResponse<Metrics> metrics() {
        return ApiResponse.ok(new Metrics(
                contactRepo.count(),
                contactRepo.countByTrangThai("NEW"),
                reviewRepo.count()));
    }

    public record Metrics(long totalContacts, long pendingContacts, long totalReviews) {}
}
