package com.ducnm.integration.amadeus;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AmadeusFlightOffer {
    private boolean available;
    private double price;
    private String airline;
    private String flightNumber;
    private String departureTime;
    private String arrivalTime;
    private String currency;
    private boolean fallback;

    public Map<String, Object> toMap() {
        return Map.of(
                "available", available,
                "price", price,
                "airline", airline != null ? airline : "",
                "flightNumber", flightNumber != null ? flightNumber : "",
                "departureTime", departureTime != null ? departureTime : "",
                "arrivalTime", arrivalTime != null ? arrivalTime : "",
                "currency", currency != null ? currency : "VND",
                "fallback", fallback);
    }
}
