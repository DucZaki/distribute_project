package com.ducnm.gateway.filter;

import com.ducnm.common.security.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtProperties props;

    public JwtAuthenticationFilter(JwtProperties props) {
        super(Config.class);
        this.props = props;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unauthorized(exchange.getResponse(), "Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            try {
                SecretKey key = Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .requireIssuer(props.getIssuer())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String userId = String.valueOf(claims.get("uid"));
                String email = claims.getSubject();
                @SuppressWarnings("unchecked")
                List<String> roles = claims.get("roles", List.class);

                ServerHttpRequest mutated = request.mutate()
                        .header("X-User-Id", userId == null ? "" : userId)
                        .header("X-User-Email", email == null ? "" : email)
                        .header("X-User-Roles", roles == null ? "" : String.join(",", roles))
                        .build();

                return chain.filter(exchange.mutate().request(mutated).build());
            } catch (Exception e) {
                log.warn("JWT validation failed: {}", e.getMessage());
                return unauthorized(exchange.getResponse(), "Invalid token");
            }
        };
    }

    private Mono<Void> unauthorized(ServerHttpResponse response, String reason) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("X-Auth-Error", reason);
        return response.setComplete();
    }

    public static class Config {
    }
}
