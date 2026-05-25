package com.ducnm.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "vnp")
public class VnPayProperties {
    private String payUrl;
    private String returnUrl;
    private String tmnCode;
    private String hashSecret;
    private String apiUrl;
    private String ipnUrl;
}
