package com.ducnm.booking.controller;

import com.ducnm.booking.dto.BookingDtos.CheckInResult;
import com.ducnm.booking.service.CheckInService;
import com.ducnm.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/check-in")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService service;

    @PostMapping("/{token}")
    public ApiResponse<CheckInResult> checkIn(@PathVariable String token) {
        return ApiResponse.ok(service.checkIn(token));
    }

    @GetMapping(value = "/{token}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qr(@PathVariable String token,
                                     @RequestParam(defaultValue = "300") int size) {
        return ResponseEntity.ok().body(service.generateQrPng(token, size));
    }
}
