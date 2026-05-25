package com.ducnm.web.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, SessionAuthFilter sessionAuthFilter) throws Exception {
        http
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/api/chat", "/api/promo/**", "/api/tour/**", "/payment/**", "/booking/**"))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/login", "/register", "/perform-login", "/logout",
                                "/css/**", "/js/**", "/anh/**", "/img/**", "/images/**", "/uploads/**",
                                "/", "/tour/**", "/api/chat", "/api/promo/**", "/api/tour/**", "/api/flights/**",
                                "/tin-tuc", "/contact", "/payment/**", "/check-in/**",
                                "/api/dia-diem/**",
                                "/favicon.ico", "/error/**")
                        .permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/user/**", "/booking/**", "/favorites/**", "/danh-gia/**")
                        .authenticated()
                        .anyRequest().permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout=true")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll())
                .exceptionHandling(ex -> ex.accessDeniedPage("/access-denied"))
                .addFilterBefore(sessionAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
