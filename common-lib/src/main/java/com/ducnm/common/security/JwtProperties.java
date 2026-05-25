package com.ducnm.common.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    private String secret;
    private long accessTokenExpirationMs = 3_600_000L;
    private long refreshTokenExpirationMs = 604_800_000L;
    private String issuer = "ducnm-microservices";
}
