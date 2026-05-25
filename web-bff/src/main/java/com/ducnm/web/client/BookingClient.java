package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@FeignClient(name = "booking-service")
public interface BookingClient {

    @PostMapping("/api/v1/bookings")
    ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> req);

    @GetMapping("/api/v1/bookings")
    ApiResponse<PageResponse<Map<String, Object>>> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size);

    @GetMapping("/api/v1/bookings/{id}")
    ApiResponse<Map<String, Object>> getById(@PathVariable Integer id);

    @PostMapping("/api/v1/bookings/promo/apply")
    ApiResponse<Map<String, Object>> applyPromo(@RequestBody Map<String, Object> req);

    @PostMapping("/api/v1/check-in/{token}")
    ApiResponse<Map<String, Object>> confirmCheckIn(@PathVariable String token);
}
