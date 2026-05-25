package com.ducnm.booking.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.Map;

@FeignClient(name = "tour-service", fallbackFactory = TourClientFallbackFactory.class)
public interface TourClient {

    @GetMapping("/api/v1/tours/{id}")
    ApiResponse<TourBrief> getTour(@PathVariable("id") Integer id);

    @PostMapping("/api/v1/admin/tours/internal/schedules/{scheduleId}/reserve")
    ApiResponse<Boolean> reserveSeats(@PathVariable("scheduleId") Integer scheduleId,
                                      @RequestParam("seats") int seats);

    @PostMapping("/api/v1/admin/tours/internal/schedules/{scheduleId}/release")
    ApiResponse<Boolean> releaseSeats(@PathVariable("scheduleId") Integer scheduleId,
                                      @RequestParam("seats") int seats);

    record TourBrief(Integer id, String tieuDe, BigDecimal gia, String hinhAnh, Map<String, Object> diemDen) {}
}
