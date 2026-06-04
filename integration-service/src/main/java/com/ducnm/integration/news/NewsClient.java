package com.ducnm.integration.news;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsClient {

    private final WebClient.Builder builder;

    @Value("${news.api-key:}")
    private String apiKey;

    @Value("${news.base-url:https://newsapi.org/v2}")
    private String baseUrl;

    @Cacheable(value = "news", key = "#country + ':' + #category")
    @CircuitBreaker(name = "news", fallbackMethod = "fallbackHeadlines")
    public Mono<Map<String, Object>> topHeadlines(String country, String category) {
        if (apiKey == null || apiKey.isBlank()) {
            return Mono.just(unconfigured());
        }
        String cat = category == null || category.isBlank() ? "general" : category;
        return builder.build().get()
                .uri(baseUrl + "/top-headlines?country={c}&category={cat}&pageSize=20&apiKey={k}",
                        country, cat, apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .map(m -> (Map<String, Object>) m)
                .onErrorResume(e -> fallbackHeadlines(country, category, e));
    }

    @Cacheable(value = "news-latest", key = "#q")
    @CircuitBreaker(name = "news", fallbackMethod = "fallbackLatest")
    public Mono<Map<String, Object>> searchLatest(String q) {
        if (apiKey == null || apiKey.isBlank()) {
            return Mono.just(unconfigured());
        }
        String query = q == null || q.isBlank()
                ? "du lịch OR tourism OR travel Vietnam"
                : q;
        return builder.build().get()
                .uri(baseUrl + "/everything?q={q}&language=vi&sortBy=publishedAt&pageSize=20&apiKey={k}",
                        query, apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .map(m -> (Map<String, Object>) m)
                .onErrorResume(e -> fallbackLatest(query, e));
    }

    private static Map<String, Object> unconfigured() {
        return Map.of(
                "status", "error",
                "message", "Chưa cấu hình NEWS_API_KEY trong file .env",
                "articles", java.util.List.of());
    }

    @SuppressWarnings("unused")
    private Mono<Map<String, Object>> fallbackHeadlines(String country, String category, Throwable e) {
        log.warn("NewsAPI headlines fallback: {}", e.getMessage());
        return searchLatest("du lịch Vietnam");
    }

    @SuppressWarnings("unused")
    private Mono<Map<String, Object>> fallbackLatest(String q, Throwable e) {
        log.warn("NewsAPI latest fallback: {}", e.getMessage());
        return Mono.just(Map.of("status", "fallback", "articles", java.util.List.of()));
    }
}
