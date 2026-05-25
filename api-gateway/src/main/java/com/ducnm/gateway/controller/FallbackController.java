package com.ducnm.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/tour")
    public ResponseEntity<Map<String, Object>> tourFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "success", false,
                        "service", "tour-service",
                        "message", "Tour service is temporarily unavailable. Please try again later.",
                        "timestamp", Instant.now()));
    }

    @GetMapping("/booking")
    public ResponseEntity<Map<String, Object>> bookingFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "success", false,
                        "service", "booking-service",
                        "message", "Booking service is temporarily unavailable.",
                        "timestamp", Instant.now()));
    }
}
