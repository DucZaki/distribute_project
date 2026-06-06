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
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;
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

    private Mono<String> token() {
        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            return Mono.error(new IllegalStateException("Amadeus chưa được cấu hình"));
        }
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

    @CircuitBreaker(name = "amadeus", fallbackMethod = "cheapestFallback")
    public Mono<AmadeusFlightOffer> getCheapestFlight(String origin, String destination, String date) {
        return token().flatMap(tk -> builder.build().get()
                        .uri(baseUrl + "/v2/shopping/flight-offers?originLocationCode={o}&destinationLocationCode={d}"
                                + "&departureDate={dt}&adults=1&currencyCode=VND&max=1",
                                origin, destination, date)
                        .header("Authorization", "Bearer " + tk)
                        .retrieve()
                        .bodyToMono(Map.class))
                .map(this::parseCheapest)
                .onErrorResume(e -> {
                    log.warn("Amadeus cheapest {}-{} {}: {}", origin, destination, date, e.getMessage());
                    return Mono.just(unavailable(true, errorCode(e), errorMessage(e)));
                });
    }

    @SuppressWarnings("unchecked")
    private AmadeusFlightOffer parseCheapest(Map response) {
        if (response == null) {
            return unavailable(true, "NO_RESPONSE", "Không nhận được phản hồi từ Amadeus.");
        }
        Object dataObj = response.get("data");
        if (!(dataObj instanceof List<?> data) || data.isEmpty()) {
            return unavailable(Boolean.TRUE.equals(response.get("fallback")), "NO_FLIGHT", "Không có chuyến bay phù hợp từ Amadeus.");
        }
        Map<String, Object> offer = (Map<String, Object>) data.get(0);
        double price = 0;
        Object priceObj = offer.get("price");
        if (priceObj instanceof Map<?, ?> priceMap) {
            Object total = priceMap.get("grandTotal");
            if (total != null) {
                price = Double.parseDouble(String.valueOf(total));
            }
        }
        String airline = "";
        String flightNumber = "";
        String departureTime = "";
        String arrivalTime = "";
        Object itineraries = offer.get("itineraries");
        if (itineraries instanceof List<?> itinList && !itinList.isEmpty()) {
            Map<String, Object> itin = (Map<String, Object>) itinList.get(0);
            Object segments = itin.get("segments");
            if (segments instanceof List<?> segList && !segList.isEmpty()) {
                Map<String, Object> seg = (Map<String, Object>) segList.get(0);
                airline = String.valueOf(seg.getOrDefault("carrierCode", ""));
                flightNumber = airline + seg.getOrDefault("number", "");
                Object dep = seg.get("departure");
                if (dep instanceof Map<?, ?> depRaw) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> depMap = (Map<String, Object>) depRaw;
                    departureTime = String.valueOf(depMap.getOrDefault("at", ""));
                }
                Object arr = seg.get("arrival");
                if (arr instanceof Map<?, ?> arrRaw) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> arrMap = (Map<String, Object>) arrRaw;
                    arrivalTime = String.valueOf(arrMap.getOrDefault("at", ""));
                }
            }
        }
        return AmadeusFlightOffer.builder()
                .available(price > 0)
                .price(price)
                .airline(airline)
                .flightNumber(flightNumber)
                .departureTime(departureTime)
                .arrivalTime(arrivalTime)
                .currency("VND")
                .fallback(false)
                .build();
    }

    private static AmadeusFlightOffer unavailable(boolean fallback, String errorCode, String message) {
        return AmadeusFlightOffer.builder()
                .available(false)
                .price(0)
                .fallback(fallback)
                .errorCode(errorCode)
                .message(message)
                .build();
    }

    private static String errorCode(Throwable e) {
        if (e instanceof WebClientResponseException wcre) {
            return "AMADEUS_HTTP_" + wcre.getStatusCode().value();
        }
        if (e instanceof IllegalStateException) {
            return "AMADEUS_NOT_CONFIGURED";
        }
        return "AMADEUS_UNAVAILABLE";
    }

    private static String errorMessage(Throwable e) {
        if (e instanceof WebClientResponseException wcre) {
            int status = wcre.getStatusCode().value();
            if (status == 429) {
                return "Amadeus đang giới hạn số lần gọi API. Vui lòng thử lại sau hoặc dùng credential khác.";
            }
            if (status == 401 || status == 403) {
                return "Không xác thực được với Amadeus. Kiểm tra AMADEUS_CLIENT_ID/SECRET.";
            }
            return "Amadeus trả lỗi HTTP " + status + ".";
        }
        if (e instanceof IllegalStateException) {
            return "Amadeus chưa được cấu hình. Thiếu AMADEUS_CLIENT_ID/SECRET.";
        }
        return "Dịch vụ Amadeus tạm thời không khả dụng.";
    }

    @SuppressWarnings("unused")
    private Mono<Map> searchFallback(String origin, String destination, String date, int adults, Throwable e) {
        log.warn("Amadeus fallback: {}", e.getMessage());
        return Mono.just(Map.of("data", List.of(), "fallback", true));
    }

    @SuppressWarnings("unused")
    private Mono<AmadeusFlightOffer> cheapestFallback(String origin, String destination, String date, Throwable e) {
        log.warn("Amadeus cheapest fallback: {}", e.getMessage());
        return Mono.just(unavailable(true, errorCode(e), errorMessage(e)));
    }
}
