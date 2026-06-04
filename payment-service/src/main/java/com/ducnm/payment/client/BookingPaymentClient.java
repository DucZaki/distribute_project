package com.ducnm.payment.client;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.util.SecurityHeaders;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@FeignClient(name = "booking-service")
public interface BookingPaymentClient {

    @GetMapping("/api/v1/bookings/{id}")
    ApiResponse<BookingPayView> getBooking(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @PathVariable("id") Integer id);
}
