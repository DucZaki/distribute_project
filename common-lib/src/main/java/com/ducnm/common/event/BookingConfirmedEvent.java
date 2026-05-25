package com.ducnm.common.event;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmedEvent {
    private Integer bookingId;
    private Integer paymentId;
    private String maCheckIn;
    private String userEmail;
    private String userName;
    private String tourTitle;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
