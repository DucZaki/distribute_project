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
    @CircuitBreaker(name = "news", fallbackMethod = "fallback")
    public Mono<Map<String, Object>> topHeadlines(String country, String category) {
        return builder.build().get()
                .uri(baseUrl + "/top-headlines?country={c}&category={cat}&apiKey={k}",
                        country, category, apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .map(m -> (Map<String, Object>) m);
    }

    @SuppressWarnings("unused")
    private Mono<Map<String, Object>> fallback(String country, String category, Throwable e) {
        log.warn("NewsAPI fallback: {}", e.getMessage());
        return Mono.just(Map.of("status", "fallback", "articles", java.util.List.of()));
    }
}
