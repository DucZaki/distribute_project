package com.ducnm.identity.oauth;

import com.ducnm.identity.dto.AuthDtos.TokenResponse;
import com.ducnm.identity.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Value("${app.oauth.frontend-redirect:http://localhost:5173/oauth/callback}")
    private String frontendRedirect;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        TokenResponse tokens = authService.tokensForUsername(principal.getName());
        String userJson = objectMapper.writeValueAsString(tokens.getUser());

        String target = UriComponentsBuilder.fromUriString(frontendRedirect)
                .queryParam("accessToken", tokens.getAccessToken())
                .queryParam("refreshToken", tokens.getRefreshToken())
                .queryParam("user", userJson)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, target);
    }
}
