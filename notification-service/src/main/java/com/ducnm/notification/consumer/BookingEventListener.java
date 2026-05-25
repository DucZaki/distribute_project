package com.ducnm.notification.consumer;

import com.ducnm.common.event.BookingConfirmedEvent;
import com.ducnm.common.event.BookingCreatedEvent;
import com.ducnm.common.event.Topics;
import com.ducnm.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEventListener {

    private final EmailService emailService;

    @KafkaListener(topics = Topics.BOOKING_CREATED, groupId = "notification-service")
    public void onBookingCreated(BookingCreatedEvent event) {
        log.info("BookingCreated received id={} email={}", event.getBookingId(), event.getUserEmail());
        emailService.sendHtml(
                event.getUserEmail(),
                "[BookingTour] Đơn đặt #" + event.getBookingId() + " - Vui lòng thanh toán",
                "booking-created",
                Map.of(
                        "bookingId", event.getBookingId(),
                        "userName", event.getUserName(),
                        "tourTitle", event.getTourTitle(),
                        "soLuong", event.getSoLuong(),
                        "tongGia", event.getTongGia()));
    }

    @KafkaListener(topics = Topics.BOOKING_CONFIRMED, groupId = "notification-service")
    public void onBookingConfirmed(BookingConfirmedEvent event) {
        log.info("BookingConfirmed received id={}", event.getBookingId());
        emailService.sendHtml(
                event.getUserEmail() == null ? "noreply@bookingtour.com" : event.getUserEmail(),
                "[BookingTour] Đơn #" + event.getBookingId() + " đã được xác nhận",
                "booking-confirmed",
                Map.of(
                        "bookingId", event.getBookingId(),
                        "userName", event.getUserName() == null ? "Quý khách" : event.getUserName(),
                        "tourTitle", event.getTourTitle() == null ? "" : event.getTourTitle(),
                        "maCheckIn", event.getMaCheckIn() == null ? "" : event.getMaCheckIn()));
    }
}
