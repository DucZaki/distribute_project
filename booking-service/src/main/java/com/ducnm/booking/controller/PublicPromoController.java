package com.ducnm.booking.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.booking.dto.BookingDtos.PublicPromoSummary;
import com.ducnm.booking.service.PromoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings/promo")
@RequiredArgsConstructor
@Tag(name = "Promotions")
public class PublicPromoController {

    private final PromoService promoService;

    @GetMapping("/active")
    @Operation(summary = "Danh sách mã giảm giá đang hiệu lực (public)")
    public ApiResponse<List<PublicPromoSummary>> active() {
        return ApiResponse.ok(promoService.listActivePublic());
    }
}
