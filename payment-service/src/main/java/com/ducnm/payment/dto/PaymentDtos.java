package com.ducnm.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

public class PaymentDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePaymentRequest {
        @NotNull
        private Integer bookingId;
        /** Optional — server lấy tongGia từ booking-service. */
        private BigDecimal amount;
        private String orderInfo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInitResponse {
        private Integer paymentId;
        private String txnRef;
        private String redirectUrl;
    }
}
