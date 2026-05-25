package com.ducnm.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties props;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(props.getIssuer())
                .issuedAt(new Date(now))
                .expiration(new Date(now + props.getAccessTokenExpirationMs()))
                .signWith(signingKey())
                .compact();
    }

    public String generateRefreshToken(String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(subject)
                .issuer(props.getIssuer())
                .issuedAt(new Date(now))
                .expiration(new Date(now + props.getRefreshTokenExpirationMs()))
                .signWith(signingKey())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .requireIssuer(props.getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extract(String token, Function<Claims, T> resolver) {
        return resolver.apply(parse(token));
    }

    public String extractUsername(String token) {
        return extract(token, Claims::getSubject);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = parse(token).get("roles");
        return roles instanceof List<?> list ? (List<String>) list : List.of();
    }

    public boolean isExpired(String token) {
        return extract(token, Claims::getExpiration).before(new Date());
    }
}
