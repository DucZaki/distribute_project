package com.ducnm.web.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "integration-service")
public interface IntegrationClient {

    @GetMapping("/api/v1/news")
    List<Map<String, Object>> news(@RequestParam(required = false) String q);

    @GetMapping("/api/v1/flights/search")
    Map<String, Object> searchFlights(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam String date);

    @PostMapping("/api/v1/chat")
    Map<String, Object> chat(@RequestBody Map<String, Object> body);
}
