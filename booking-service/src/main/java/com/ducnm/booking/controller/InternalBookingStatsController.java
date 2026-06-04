package com.ducnm.booking.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.booking.repository.DatChoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/bookings")
@RequiredArgsConstructor
public class InternalBookingStatsController {

    private final DatChoRepository datChoRepository;

    /** Tổng số khách (so_luong) đã đặt tour, không tính đơn CANCELLED. */
    @GetMapping("/stats/tour/{tourId}")
    public ApiResponse<Long> participantsByTour(@PathVariable Integer tourId) {
        return ApiResponse.ok(datChoRepository.sumSoLuongByIdChuyenDi(tourId));
    }
}
