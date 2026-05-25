package com.ducnm.common.event;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreatedEvent {
    private Integer bookingId;
    private Integer userId;
    private String userEmail;
    private String userName;
    private Integer tourId;
    private String tourTitle;
    private Integer scheduleId;
    private Integer soLuong;
    private BigDecimal tongGia;
    private String maCheckIn;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
