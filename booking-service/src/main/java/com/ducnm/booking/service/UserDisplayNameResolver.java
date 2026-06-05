package com.ducnm.booking.service;

import com.ducnm.booking.client.IdentityClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserDisplayNameResolver {

    private final IdentityClient identityClient;

    public String resolve(Integer userId, String hoTen, String email) {
        if (isDisplayable(hoTen)) {
            return hoTen.trim();
        }
        if (userId != null) {
            try {
                var res = identityClient.getUser(userId);
                if (res != null && res.getData() != null) {
                    var u = res.getData();
                    if (isDisplayable(u.hoTen())) {
                        return u.hoTen().trim();
                    }
                    if (isDisplayable(u.tenDangNhap())) {
                        return u.tenDangNhap().trim();
                    }
                    if (u.email() != null && !u.email().isBlank()) {
                        return u.email().trim();
                    }
                }
            } catch (Exception ignored) {
                // fallback below
            }
        }
        if (email != null && !email.isBlank()) {
            int at = email.indexOf('@');
            if (at > 0) {
                return email.substring(0, at);
            }
        }
        if (hoTen != null && !hoTen.isBlank()) {
            return hoTen.trim();
        }
        return "Khách vãng lai";
    }

    private static boolean isDisplayable(String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        String t = name.trim();
        if (t.matches("(?i)user#?\\d+")) {
            return false;
        }
        if (t.matches("(?i)user\\d*")) {
            return false;
        }
        return true;
    }
}
