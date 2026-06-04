package com.ducnm.integration.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.integration.amadeus.AmadeusClient;
import com.ducnm.integration.chat.ChatService;
import com.ducnm.integration.news.NewsClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class IntegrationController {

    private final NewsClient newsClient;
    private final AmadeusClient amadeusClient;
    private final ChatService chatService;

    @GetMapping("/news")
    public Mono<ApiResponse<Map<String, Object>>> news(
            @RequestParam(defaultValue = "vn") String country,
            @RequestParam(defaultValue = "general") String category) {
        return newsClient.topHeadlines(country, category).map(ApiResponse::ok);
    }

    /** Tin du lịch — dùng NewsAPI /everything (trang /tin-tuc). */
    @GetMapping("/news/latest")
    public Mono<ApiResponse<Map<String, Object>>> newsLatest(
            @RequestParam(required = false) String q) {
        return newsClient.searchLatest(q).map(ApiResponse::ok);
    }

    @GetMapping("/flights/search")
    public Mono<ApiResponse<Map>> flights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date,
            @RequestParam(defaultValue = "1") int adults) {
        return amadeusClient.searchFlights(origin, destination, date, adults).map(ApiResponse::ok);
    }

    /** Vé máy bay rẻ nhất — dùng khi đặt tour / flight-quote (blocking, tránh async timeout MVC). */
    @GetMapping("/flights/cheapest")
    public ApiResponse<Map<String, Object>> cheapestFlight(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date) {
        var offer = amadeusClient.getCheapestFlight(origin, destination, date)
                .block(Duration.ofSeconds(35));
        if (offer == null) {
            return ApiResponse.ok(Map.of("available", false, "fallback", true));
        }
        return ApiResponse.ok(offer.toMap());
    }

    @PostMapping("/chat")
    public Mono<ApiResponse<Map<String, String>>> chat(@RequestBody Map<String, String> body) {
        String msg = body.getOrDefault("message", "");
        return chatService.reply(msg).map(reply -> ApiResponse.ok(Map.of("reply", reply)));
    }
}
