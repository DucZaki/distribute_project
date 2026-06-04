package com.ducnm.admin.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "tour-service")
public interface TourAdminClient {

    @GetMapping("/api/v1/internal/admin/metrics")
    ApiResponse<MapHolder> metrics();

    @GetMapping("/api/v1/tours/{id}")
    ApiResponse<Map<String, Object>> getTour(@PathVariable Integer id);

    record MapHolder(long totalTours) {}
}
