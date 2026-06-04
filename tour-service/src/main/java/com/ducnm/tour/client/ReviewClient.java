package com.ducnm.tour.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "review-service", contextId = "tourReviewClient")
public interface ReviewClient {

    @GetMapping("/api/v1/reviews/tour/{tourId}/summary")
    ApiResponse<Map<String, Object>> summary(@PathVariable("tourId") Integer tourId);
}
