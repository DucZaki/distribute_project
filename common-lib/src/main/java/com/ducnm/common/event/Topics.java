package com.ducnm.common.event;

public final class Topics {
    public static final String BOOKING_CREATED = "booking.created";
    public static final String BOOKING_CONFIRMED = "booking.confirmed";
    public static final String BOOKING_CANCELLED = "booking.cancelled";
    public static final String PAYMENT_REQUESTED = "payment.requested";
    public static final String PAYMENT_SUCCEEDED = "payment.succeeded";
    public static final String PAYMENT_FAILED = "payment.failed";

    private Topics() {}
}
