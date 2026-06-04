package com.ducnm.admin.controller;

import com.ducnm.admin.security.AdminGuard;
import com.ducnm.admin.service.AdminDashboardService;
import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.util.SecurityHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats(@RequestHeader(SecurityHeaders.USER_ROLES) String roles) {
        AdminGuard.requireAdmin(roles);
        return ApiResponse.ok(dashboardService.summaryStats());
    }
}
