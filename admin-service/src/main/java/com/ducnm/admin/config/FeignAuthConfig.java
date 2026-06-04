package com.ducnm.admin.config;

import com.ducnm.common.util.SecurityHeaders;
import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignAuthConfig {

    @Bean
    RequestInterceptor forwardAuthHeaders() {
        return template -> {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return;
            HttpServletRequest req = attrs.getRequest();
            copy(template, SecurityHeaders.USER_ID, req.getHeader(SecurityHeaders.USER_ID));
            copy(template, SecurityHeaders.USER_EMAIL, req.getHeader(SecurityHeaders.USER_EMAIL));
            copy(template, SecurityHeaders.USER_ROLES, req.getHeader(SecurityHeaders.USER_ROLES));
        };
    }

    private static void copy(feign.RequestTemplate t, String name, String value) {
        if (value != null && !value.isBlank()) {
            t.header(name, value);
        }
    }
}
