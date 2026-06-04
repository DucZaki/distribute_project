package com.ducnm.tour.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "booking-service", contextId = "tourBookingStatsClient")
public interface BookingStatsClient {

    @GetMapping("/api/v1/internal/bookings/stats/tour/{tourId}")
    ApiResponse<Long> participantsByTour(@PathVariable("tourId") Integer tourId);
}
