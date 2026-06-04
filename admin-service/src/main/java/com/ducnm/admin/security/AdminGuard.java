package com.ducnm.admin.security;

import com.ducnm.common.exception.BusinessException;

public final class AdminGuard {
    private AdminGuard() {}

    public static void requireAdmin(String roles) {
        if (roles == null || !roles.contains("ADMIN")) {
            throw BusinessException.forbidden("Chỉ admin mới có quyền");
        }
    }
}
