package com.ducnm.admin.client;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "booking-service")
public interface BookingAdminClient {

    @GetMapping("/api/v1/internal/admin/metrics")
    ApiResponse<Map<String, Object>> metrics();

    @GetMapping("/api/v1/internal/admin/tour-bookings/{tourId}")
    ApiResponse<List<Map<String, Object>>> tourBookings(@PathVariable Integer tourId);

    @GetMapping("/api/v1/internal/admin/revenue")
    ApiResponse<Map<String, Object>> revenue(@RequestParam("year") int year);

    @GetMapping("/api/v1/admin/bookings")
    ApiResponse<PageResponse<Map<String, Object>>> listBookings(
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size);
}
