package com.ducnm.integration.chat;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final String SYSTEM_PROMPT =
            "Bạn là trợ lý đặt tour của ZakiBooking. Trả lời ngắn gọn bằng tiếng Việt.";

    private final WebClient.Builder builder;

    @Value("${chat.groq-key:}")
    private String groqKey;

    @Value("${chat.groq-url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqUrl;

    @Value("${chat.groq-model:llama-3.1-8b-instant}")
    private String groqModel;

    @Value("${chat.openrouter-key:}")
    private String openRouterKey;

    @Value("${chat.openrouter-url:https://openrouter.ai/api/v1/chat/completions}")
    private String openRouterUrl;

    @Value("${chat.openrouter-model:google/gemini-2.0-flash-exp:free}")
    private String openRouterModel;

    @Value("${chat.gemini-key:}")
    private String geminiKey;

    @Value("${chat.gemini-model:gemini-2.0-flash}")
    private String geminiModel;

    @CircuitBreaker(name = "chat", fallbackMethod = "fallback")
    public Mono<String> reply(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return Mono.just("Vui lòng nhập câu hỏi của bạn.");
        }
        String msg = userMessage.trim();

        if (groqKey != null && !groqKey.isBlank()) {
            return callOpenAiCompatible(groqUrl, groqKey, groqModel, msg, null)
                    .switchIfEmpty(nextProviders(msg));
        }
        return nextProviders(msg);
    }

    private Mono<String> nextProviders(String msg) {
        if (openRouterKey != null && !openRouterKey.isBlank()) {
            return callOpenAiCompatible(openRouterUrl, openRouterKey, openRouterModel, msg, "ZakiBooking")
                    .switchIfEmpty(callGemini(msg));
        }
        return callGemini(msg);
    }

    private Mono<String> callGemini(String msg) {
        if (geminiKey == null || geminiKey.isBlank()) {
            return Mono.just("Hệ thống chat tạm thời chưa được cấu hình.");
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent?key=" + geminiKey.trim();
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(
                                Map.of("text", SYSTEM_PROMPT + "\n\nKhách: " + msg)))));
        return builder.build().post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(this::extractGeminiText)
                .onErrorResume(e -> {
                    log.warn("Gemini failed: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    private Mono<String> callOpenAiCompatible(
            String apiUrl, String apiKey, String model, String userText, String refererTitle) {
        WebClient.RequestBodySpec spec = builder.build().post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey.trim())
                .contentType(MediaType.APPLICATION_JSON);
        if (refererTitle != null) {
            spec = spec.header("HTTP-Referer", "http://localhost:8080")
                    .header("X-Title", refererTitle);
        }
        return spec.bodyValue(Map.of(
                        "model", model,
                        "messages", List.of(
                                Map.of("role", "system", "content", SYSTEM_PROMPT),
                                Map.of("role", "user", "content", userText)),
                        "temperature", 0.3,
                        "max_tokens", 1024))
                .retrieve()
                .bodyToMono(Map.class)
                .map(this::extractOpenAiText)
                .onErrorResume(e -> {
                    log.warn("Chat API {} failed: {}", apiUrl, e.getMessage());
                    return Mono.empty();
                });
    }

    @SuppressWarnings("unchecked")
    private String extractOpenAiText(Map response) {
        try {
            var choices = (List<Map>) response.get("choices");
            var message = (Map) choices.get(0).get("message");
            String content = (String) message.get("content");
            return content != null && !content.isBlank() ? content : null;
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String extractGeminiText(Map response) {
        try {
            var candidates = (List<Map>) response.get("candidates");
            var content = (Map) candidates.get(0).get("content");
            var parts = (List<Map>) content.get("parts");
            String text = (String) parts.get(0).get("text");
            return text != null && !text.isBlank() ? text : "Xin lỗi, hệ thống đang bận, vui lòng thử lại.";
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
