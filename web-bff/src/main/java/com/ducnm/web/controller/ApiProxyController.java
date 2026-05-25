package com.ducnm.web.controller;

import com.ducnm.web.client.BookingClient;
import com.ducnm.web.client.IntegrationClient;
import com.ducnm.web.client.TourClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ApiProxyController {

    private final IntegrationClient integrationClient;
    private final BookingClient bookingClient;
    private final TourClient tourClient;

    @PostMapping("/api/chat")
    public Map<String, Object> chat(@RequestBody Map<String, Object> body) {
        return integrationClient.chat(body);
    }

    @PostMapping("/api/promo/validate")
    public Map<String, Object> validatePromo(@RequestBody Map<String, Object> body) {
        return bookingClient.applyPromo(body).getData();
    }

    @GetMapping("/api/tour/{id}/details")
    public Map<String, Object> tourDetails(@PathVariable Integer id) {
        return tourClient.getTour(id).getData();
    }

    @GetMapping("/api/tour/nearby")
    public Map<String, Object> nearby(@RequestParam(required = false) String city,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "6") int limit) {
        var result = tourClient.search(city, null, null, null, null, null, null, page, limit, null).getData();
        return Map.of("content", result.getContent(), "totalElements", result.getTotalElements());
    }

    @GetMapping("/api/flights/price")
    public double flightPrice(@RequestParam String from,
                              @RequestParam String to,
                              @RequestParam String date) {
        try {
            Map<String, Object> r = integrationClient.searchFlights(from, to, date);
            Object price = r.get("price");
            if (price instanceof Number n) return n.doubleValue();
        } catch (Exception ignored) {}
        return 0;
    }

    @GetMapping("/api/dia-diem/quoc-gia")
    public List<String> quocGia(@RequestParam(required = false) String chauLuc) {
        return List.of("Việt Nam", "Thái Lan", "Singapore", "Hàn Quốc", "Pháp", "Mỹ");
    }

    @GetMapping("/api/dia-diem/thanh-pho")
    public List<Map<String, Object>> thanhPho(@RequestParam String quocGia) {
        return List.of(
                Map.of("id", 1, "ten", "Hà Nội", "thanhPho", "Hà Nội", "quocGia", quocGia),
                Map.of("id", 3, "ten", "Đà Nẵng", "thanhPho", "Đà Nẵng", "quocGia", quocGia),
                Map.of("id", 5, "ten", "Phú Quốc", "thanhPho", "Phú Quốc", "quocGia", quocGia));
    }
}
