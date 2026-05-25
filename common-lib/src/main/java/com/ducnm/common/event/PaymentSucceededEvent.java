package com.ducnm.common.event;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSucceededEvent {
    private Integer paymentId;
    private Integer bookingId;
    private BigDecimal amount;
    private String transactionId;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
