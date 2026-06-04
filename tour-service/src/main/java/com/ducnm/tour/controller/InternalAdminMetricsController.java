package com.ducnm.tour.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.tour.repository.ChuyenDiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/admin")
@RequiredArgsConstructor
public class InternalAdminMetricsController {

    private final ChuyenDiRepository repo;

    @GetMapping("/metrics")
    public ApiResponse<Metrics> metrics() {
        return ApiResponse.ok(new Metrics(repo.count()));
    }

    public record Metrics(long totalTours) {}
}
