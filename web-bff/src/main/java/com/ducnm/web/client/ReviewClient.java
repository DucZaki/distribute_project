package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "review-service")
public interface ReviewClient {

    @GetMapping("/api/v1/reviews/tour/{tourId}")
    ApiResponse<PageResponse<Map<String, Object>>> byTour(
            @PathVariable Integer tourId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size);

    @GetMapping("/api/v1/reviews/tour/{tourId}/summary")
    ApiResponse<Map<String, Object>> summary(@PathVariable Integer tourId);

    @PostMapping("/api/v1/reviews")
    ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> req);

    @GetMapping("/api/v1/favorites")
    ApiResponse<List<Map<String, Object>>> favorites();

    @PostMapping("/api/v1/favorites/{tourId}")
    ApiResponse<Map<String, Object>> addFavorite(@PathVariable Integer tourId);

    @DeleteMapping("/api/v1/favorites/{tourId}")
    ApiResponse<Void> removeFavorite(@PathVariable Integer tourId);

    @PostMapping("/api/v1/contacts")
    ApiResponse<Map<String, Object>> contact(@RequestBody Map<String, Object> req);
}
