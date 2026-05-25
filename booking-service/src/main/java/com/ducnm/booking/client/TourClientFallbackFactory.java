package com.ducnm.booking.client;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TourClientFallbackFactory implements FallbackFactory<TourClient> {

    @Override
    public TourClient create(Throwable cause) {
        log.error("TourClient circuit open: {}", cause.getMessage());
        return new TourClient() {
            @Override
            public ApiResponse<TourBrief> getTour(Integer id) {
                throw BusinessException.badRequest("Tour service unavailable, please retry");
            }

            @Override
            public ApiResponse<Boolean> reserveSeats(Integer scheduleId, int seats) {
                throw BusinessException.badRequest("Tour service unavailable, cannot reserve seats");
            }

            @Override
            public ApiResponse<Boolean> releaseSeats(Integer scheduleId, int seats) {
                log.warn("Skipping release seats due to circuit open scheduleId={} seats={}", scheduleId, seats);
                return ApiResponse.ok(false);
            }
        };
    }
}
