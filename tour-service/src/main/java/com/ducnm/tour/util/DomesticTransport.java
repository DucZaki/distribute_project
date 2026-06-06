package com.ducnm.tour.util;

import com.ducnm.tour.entity.DiemDen;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Optional;

/** Vận chuyển nội địa: điểm đến không có sân bay → xe khách giá cố định. */
public final class DomesticTransport {

    public static final BigDecimal BUS_FARE_VND = BigDecimal.valueOf(300_000);

    private DomesticTransport() {
    }

    public static boolean isDomestic(DiemDen destination) {
        if (destination == null || destination.getVungMien() == null) {
            return false;
        }
        String region = destination.getVungMien().trim().toLowerCase(Locale.ROOT);
        return region.equals("việt nam") || region.equals("viet nam");
    }

    public static boolean hasAirport(String placeName) {
        return AirportIata.resolve(placeName).isPresent();
    }

    /** Điểm đến Việt Nam không có mã sân bay IATA → dùng xe khách. */
    public static boolean useDomesticBus(DiemDen destination) {
        if (!isDomestic(destination)) {
            return false;
        }
        return !hasAirport(destination.getTen());
    }

    public static Optional<String> resolveOriginCode(String pickupName) {
        return AirportIata.resolve(pickupName);
    }
}
