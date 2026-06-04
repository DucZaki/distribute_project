package com.ducnm.admin.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "review-service")
public interface ReviewAdminClient {

    @GetMapping("/api/v1/internal/admin/metrics")
    ApiResponse<MapHolder> metrics();

    record MapHolder(long totalContacts, long pendingContacts, long totalReviews) {}
}
