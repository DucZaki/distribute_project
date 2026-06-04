package com.ducnm.payment.controller;

import com.ducnm.payment.config.VnPayProperties;
import com.ducnm.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * VNPay IPN endpoint. Path mapped at gateway: /api/vnpay/ipn and /api/vnpay/return.
 * No JWT required - VNPay signs requests with HMAC-SHA512.
 */
@RestController
@RequestMapping("/api/v1/vnpay")
@RequiredArgsConstructor
public class VnPayCallbackController {

    private final PaymentService service;
    private final VnPayProperties vnPayProperties;

    @GetMapping("/ipn")
    public Map<String, String> ipnGet(HttpServletRequest req) {
        return service.handleIpn(extractParams(req));
    }

    @PostMapping("/ipn")
    public Map<String, String> ipnPost(HttpServletRequest req) {
        return service.handleIpn(extractParams(req));
    }

    /** Browser return: xử lý IPN rồi redirect SPA với query VNPay. */
    @GetMapping("/return")
    public void returnGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, String> params = extractParams(req);
        service.handleIpn(params);
        String target = vnPayProperties.getFrontendReturnUrl();
        if (target == null || target.isBlank()) {
            target = "http://localhost:8088/payment/result";
        }
        String qs = params.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "="
                        + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
        String url = target.contains("?") ? target + "&" + qs : target + "?" + qs;
        resp.sendRedirect(url);
    }

    private static Map<String, String> extractParams(HttpServletRequest req) {
        Map<String, String> params = new HashMap<>();
        req.getParameterMap().forEach((k, v) -> {
            if (v != null && v.length > 0 && v[0] != null && !v[0].isEmpty()) {
                params.put(k, v[0]);
            }
        });
        return params;
    }
}
