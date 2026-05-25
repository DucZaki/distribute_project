package com.ducnm.web.security;

import com.ducnm.common.util.SecurityHeaders;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return;
        HttpSession session = attrs.getRequest().getSession(false);
        if (session == null) return;
        AuthSession auth = (AuthSession) session.getAttribute(AuthSession.KEY);
        if (auth == null) return;
        if (auth.getAccessToken() != null) {
            template.header("Authorization", "Bearer " + auth.getAccessToken());
        }
        if (auth.getUserId() != null) {
            template.header(SecurityHeaders.USER_ID, String.valueOf(auth.getUserId()));
        }
        if (auth.getEmail() != null) {
            template.header(SecurityHeaders.USER_EMAIL, auth.getEmail());
        }
        if (auth.getVaiTro() != null) {
            template.header(SecurityHeaders.USER_ROLES, auth.getVaiTro());
        }
    }
}
