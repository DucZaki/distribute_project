package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "tour-service", contextId = "destinationClient")
public interface DestinationClient {

    @GetMapping("/api/v1/destinations/featured")
    ApiResponse<List<Map<String, Object>>> featured();
}
