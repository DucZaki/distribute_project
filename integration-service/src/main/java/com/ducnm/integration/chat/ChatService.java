package com.ducnm.integration.chat;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final WebClient.Builder builder;

    @Value("${chat.openai-key:}")
    private String apiKey;

    @Value("${chat.model:gpt-4o-mini}")
    private String model;

    @Value("${chat.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @CircuitBreaker(name = "chat", fallbackMethod = "fallback")
    public Mono<String> reply(String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            return Mono.just("Hệ thống chat tạm thời chưa được cấu hình.");
        }
        return builder.build().post()
                .uri(baseUrl + "/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(Map.of(
                        "model", model,
                        "messages", List.of(
                                Map.of("role", "system", "content",
                                        "Bạn là trợ lý đặt tour của BookingTour. Trả lời ngắn gọn bằng tiếng Việt."),
                                Map.of("role", "user", "content", userMessage))))
                .retrieve()
                .bodyToMono(Map.class)
                .map(this::extractText);
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map response) {
        try {
            var choices = (List<Map>) response.get("choices");
            var message = (Map) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "Xin lỗi, hệ thống đang bận, vui lòng thử lại.";
        }
    }

    @SuppressWarnings("unused")
    private Mono<String> fallback(String msg, Throwable e) {
        log.warn("Chat fallback: {}", e.getMessage());
        return Mono.just("Hệ thống chat tạm thời quá tải, vui lòng thử lại sau.");
    }
}
