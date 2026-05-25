package com.ducnm.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public BusinessException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static BusinessException notFound(String resource, Object id) {
        return new BusinessException(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                "%s not found with id: %s".formatted(resource, id));
    }

    public static BusinessException conflict(String message) {
        return new BusinessException(HttpStatus.CONFLICT, "CONFLICT", message);
    }

    public static BusinessException badRequest(String message) {
        return new BusinessException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }

    public static BusinessException unauthorized(String message) {
        return new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }

    public static BusinessException forbidden(String message) {
        return new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }
}
