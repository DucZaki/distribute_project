package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "payment-service")
public interface PaymentClient {

    @PostMapping("/api/v1/payments/vnpay/init")
    ApiResponse<Map<String, Object>> initVnPay(@RequestBody Map<String, Object> req);
}
