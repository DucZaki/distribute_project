package com.ducnm.booking.controller;

import com.ducnm.booking.dto.BookingDtos.*;
import com.ducnm.booking.service.BookingService;
import com.ducnm.booking.service.PromoService;
import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.util.SecurityHeaders;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings")
public class BookingController {

    private final BookingService bookingService;
    private final PromoService promoService;

    @PostMapping
    @Operation(summary = "Create booking (idempotency via dedupe-id header recommended)")
    public ApiResponse<BookingResponse> create(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @Valid @RequestBody CreateBookingRequest req) {
        return ApiResponse.ok(bookingService.create(userId, req), "Đặt chỗ thành công, vui lòng thanh toán");
    }

    @GetMapping
    public ApiResponse<PageResponse<BookingResponse>> mine(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(bookingService.listMine(userId, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> getById(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @PathVariable Integer id) {
        return ApiResponse.ok(bookingService.getById(userId, id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancel(
            @RequestHeader(SecurityHeaders.USER_ID) Integer userId,
            @PathVariable Integer id,
            @RequestParam(defaultValue = "User cancelled") String reason) {
        bookingService.cancel(id, reason);
        return ApiResponse.ok(null, "Đã huỷ");
    }

    @PostMapping("/promo/apply")
    public ApiResponse<PromoApplyResult> applyPromo(@Valid @RequestBody ApplyPromoRequest req) {
        return ApiResponse.ok(promoService.apply(req));
    }
}
