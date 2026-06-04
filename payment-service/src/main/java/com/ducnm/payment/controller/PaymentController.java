package com.ducnm.payment.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.util.SecurityHeaders;
import com.ducnm.payment.dto.PaymentDtos.*;
import com.ducnm.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;

    @PostMapping("/vnpay/init")
    public ApiResponse<PaymentInitResponse> init(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @Valid @RequestBody CreatePaymentRequest req,
            HttpServletRequest http) {
        return ApiResponse.ok(service.initVnPay(userId, req, clientIp(http)));
    }

    /** Thanh toán lại đơn PENDING (giống monolith GET /booking/repay/{id}). */
    @PostMapping("/vnpay/repay/{bookingId}")
    public ApiResponse<PaymentInitResponse> repay(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @PathVariable Integer bookingId,
            HttpServletRequest http) {
        return ApiResponse.ok(service.repayVnPay(userId, bookingId, clientIp(http)));
    }

    private static String clientIp(HttpServletRequest http) {
        String ip = http.getHeader("X-Forwarded-For");
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : http.getRemoteAddr();
    }
}
