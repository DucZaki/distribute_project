package com.ducnm.tour.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "integration-service")
public interface IntegrationClient {

    @GetMapping("/api/v1/flights/cheapest")
    ApiResponse<Map<String, Object>> cheapestFlight(
            @RequestParam("origin") String origin,
            @RequestParam("destination") String destination,
            @RequestParam("date") String date);
}
