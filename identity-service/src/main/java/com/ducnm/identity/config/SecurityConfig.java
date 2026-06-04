package com.ducnm.identity.config;

import com.ducnm.common.security.JwtProperties;
import com.ducnm.common.security.JwtService;
import com.ducnm.identity.oauth.CustomOAuth2UserService;
import com.ducnm.identity.oauth.OAuth2LoginSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${spring.security.oauth2.client.registration.google.client-id:disabled}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.facebook.client-id:disabled}")
    private String facebookClientId;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtService jwtService(JwtProperties props) {
        return new JwtService(props);
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            CustomOAuth2UserService oAuth2UserService,
            OAuth2LoginSuccessHandler successHandler) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .anyRequest().permitAll());

        if (oauthEnabled()) {
            http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                    .oauth2Login(oauth -> oauth
                            .userInfoEndpoint(u -> u.userService(oAuth2UserService))
                            .successHandler(successHandler));
        } else {
            http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        }

        return http.build();
    }

    private boolean oauthEnabled() {
        return clientActive(googleClientId) || clientActive(facebookClientId);
    }

    private static boolean clientActive(String clientId) {
        return clientId != null && !clientId.isBlank() && !"disabled".equalsIgnoreCase(clientId);
    }
}
