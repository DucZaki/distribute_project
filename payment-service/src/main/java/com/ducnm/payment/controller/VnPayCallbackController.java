package com.ducnm.payment.controller;

import com.ducnm.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * VNPay IPN endpoint. Path mapped at gateway: /api/vnpay/ipn and /api/vnpay/return.
 * No JWT required - VNPay signs requests with HMAC-SHA512.
 */
@RestController
@RequestMapping("/api/v1/vnpay")
@RequiredArgsConstructor
public class VnPayCallbackController {

    private final PaymentService service;

    @GetMapping("/ipn")
    public Map<String, String> ipnGet(HttpServletRequest req) {
        return service.handleIpn(extractParams(req));
    }

    @PostMapping("/ipn")
    public Map<String, String> ipnPost(HttpServletRequest req) {
        return service.handleIpn(extractParams(req));
    }

    /**
     * Browser return URL (user-facing). For SPA setups, you'd redirect to
     * frontend success/fail page; here we just return the params for the BFF to handle.
     */
    @GetMapping("/return")
    public Map<String, String> returnGet(HttpServletRequest req) {
        return service.handleIpn(extractParams(req));
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
