package com.ducnm.integration.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.integration.amadeus.AmadeusClient;
import com.ducnm.integration.chat.ChatService;
import com.ducnm.integration.news.NewsClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

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

    @GetMapping("/flights/search")
    public Mono<ApiResponse<Map>> flights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date,
            @RequestParam(defaultValue = "1") int adults) {
        return amadeusClient.searchFlights(origin, destination, date, adults).map(ApiResponse::ok);
    }

    @PostMapping("/chat")
    public Mono<ApiResponse<Map<String, String>>> chat(@RequestBody Map<String, String> body) {
        String msg = body.getOrDefault("message", "");
        return chatService.reply(msg).map(reply -> ApiResponse.ok(Map.of("reply", reply)));
    }
}
