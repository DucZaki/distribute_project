package com.ducnm.integration.amadeus;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmadeusClient {

    private final WebClient.Builder builder;

    @Value("${amadeus.client-id:}")
    private String clientId;

    @Value("${amadeus.client-secret:}")
    private String clientSecret;

    @Value("${amadeus.base-url:https://test.api.amadeus.com}")
    private String baseUrl;

    @Getter
    private String cachedToken;
    private Instant tokenExpiresAt = Instant.EPOCH;

    private synchronized Mono<String> token() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiresAt.minusSeconds(60))) {
            return Mono.just(cachedToken);
        }
        return builder.build().post()
                .uri(baseUrl + "/v1/security/oauth2/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                        .with("client_id", clientId)
                        .with("client_secret", clientSecret))
                .retrieve()
                .bodyToMono(Map.class)
                .map(m -> {
                    cachedToken = (String) m.get("access_token");
                    long expiresIn = ((Number) m.getOrDefault("expires_in", 1800)).longValue();
                    tokenExpiresAt = Instant.now().plusSeconds(expiresIn);
                    return cachedToken;
                });
    }

    @Cacheable(value = "flights", key = "#origin + ':' + #destination + ':' + #date + ':' + #adults")
    @CircuitBreaker(name = "amadeus", fallbackMethod = "searchFallback")
    public Mono<Map> searchFlights(String origin, String destination, String date, int adults) {
        return token().flatMap(tk -> builder.build().get()
                .uri(baseUrl + "/v2/shopping/flight-offers?originLocationCode={o}&destinationLocationCode={d}"
                        + "&departureDate={dt}&adults={a}&max=10",
                        origin, destination, date, adults)
                .header("Authorization", "Bearer " + tk)
                .retrieve()
                .bodyToMono(Map.class));
    }

    @SuppressWarnings("unused")
    private Mono<Map> searchFallback(String origin, String destination, String date, int adults, Throwable e) {
        log.warn("Amadeus fallback: {}", e.getMessage());
        return Mono.just(Map.of("data", java.util.List.of(), "fallback", true));
    }
}
