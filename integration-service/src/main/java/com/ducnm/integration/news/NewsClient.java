package com.ducnm.integration.news;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsClient {

    private static final String DEFAULT_QUERY = "travel OR tourism OR destination";
    private static final int PAGE_SIZE = 12;

    private final WebClient.Builder builder;

    @Value("${news.api-key:}")
    private String apiKey;

    @Value("${news.base-url:https://newsapi.org/v2}")
    private String baseUrl;

    @Cacheable(value = "news", key = "#country + ':' + #category")
    @CircuitBreaker(name = "news", fallbackMethod = "fallbackHeadlines")
    public Mono<Map<String, Object>> topHeadlines(String country, String category) {
        if (apiKey == null || apiKey.isBlank()) {
            return Mono.just(NewsFallbackArticles.response());
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

    @Cacheable(value = "news-latest-v2", key = "#q != null && !#q.isBlank() ? #q : 'default'")
    @CircuitBreaker(name = "news", fallbackMethod = "fallbackLatest")
    public Mono<Map<String, Object>> searchLatest(String q) {
        if (apiKey == null || apiKey.isBlank()) {
            return Mono.just(NewsFallbackArticles.response());
        }
        String query = q == null || q.isBlank() ? DEFAULT_QUERY : q;
        return builder.build().get()
                .uri(baseUrl + "/everything?q={q}&language=en&sortBy=publishedAt&pageSize={n}&apiKey={k}",
                        query, PAGE_SIZE, apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .map(m -> normalizeLatest((Map<String, Object>) m))
                .onErrorResume(e -> fallbackLatest(query, e));
    }

    /** Giới hạn 12 bài như monolith; nếu API trả ít hơn thì bổ sung tin mẫu. */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> normalizeLatest(Map<String, Object> raw) {
        Object articlesObj = raw.get("articles");
        List<Map<String, Object>> fromApi = new ArrayList<>();
        if (articlesObj instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) {
                    fromApi.add((Map<String, Object>) m);
                }
            }
        }
        List<Map<String, Object>> articles;
        if (fromApi.size() >= PAGE_SIZE) {
            articles = new ArrayList<>(fromApi.subList(0, PAGE_SIZE));
        } else {
            articles = new ArrayList<>(fromApi);
            for (Map<String, Object> fb : NewsFallbackArticles.articles()) {
                if (articles.size() >= PAGE_SIZE) break;
                articles.add(fb);
            }
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("status", raw.getOrDefault("status", "ok"));
        out.put("totalResults", articles.size());
        out.put("articles", articles);
        return out;
    }

    @SuppressWarnings("unused")
    private Mono<Map<String, Object>> fallbackHeadlines(String country, String category, Throwable e) {
        log.warn("NewsAPI headlines fallback: {}", e.getMessage());
        return searchLatest(DEFAULT_QUERY);
    }

    @SuppressWarnings("unused")
    private Mono<Map<String, Object>> fallbackLatest(String q, Throwable e) {
        log.warn("NewsAPI latest fallback: {}", e.getMessage());
        return Mono.just(NewsFallbackArticles.response());
    }
}
