package com.ducnm.common.event;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFailedEvent {
    private Integer paymentId;
    private Integer bookingId;
    private String reason;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
