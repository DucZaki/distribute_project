package com.ducnm.booking.consumer;

import com.ducnm.booking.service.BookingService;
import com.ducnm.common.event.BookingConfirmedEvent;
import com.ducnm.common.event.PaymentFailedEvent;
import com.ducnm.common.event.PaymentSucceededEvent;
import com.ducnm.common.event.Topics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final BookingService bookingService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = Topics.PAYMENT_SUCCEEDED, groupId = "booking-service")
    public void onPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Received PaymentSucceeded bookingId={} paymentId={}",
                event.getBookingId(), event.getPaymentId());
        bookingService.markConfirmed(event.getBookingId(), event.getPaymentId());

        kafkaTemplate.send(Topics.BOOKING_CONFIRMED, String.valueOf(event.getBookingId()),
                BookingConfirmedEvent.builder()
                        .bookingId(event.getBookingId())
                        .paymentId(event.getPaymentId())
                        .build());
    }

    @KafkaListener(topics = Topics.PAYMENT_FAILED, groupId = "booking-service")
    public void onPaymentFailed(PaymentFailedEvent event) {
        log.warn("Received PaymentFailed bookingId={} reason={}",
                event.getBookingId(), event.getReason());
        bookingService.cancel(event.getBookingId(), event.getReason());
    }
}
