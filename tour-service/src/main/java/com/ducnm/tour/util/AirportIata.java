package com.ducnm.tour.util;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/** Mã sân bay IATA cho Amadeus (điểm đón / điểm đến). */
public final class AirportIata {

    private static final Map<String, String> CITY_TO_IATA = Map.ofEntries(
            Map.entry("hà nội", "HAN"),
            Map.entry("ha noi", "HAN"),
            Map.entry("hồ chí minh", "SGN"),
            Map.entry("ho chi minh", "SGN"),
            Map.entry("tp.hcm", "SGN"),
            Map.entry("sài gòn", "SGN"),
            Map.entry("sai gon", "SGN"),
            Map.entry("đà nẵng", "DAD"),
            Map.entry("da nang", "DAD"),
            Map.entry("huế", "HUI"),
            Map.entry("hue", "HUI"),
            Map.entry("nha trang", "CXR"),
            Map.entry("phú quốc", "PQC"),
            Map.entry("phu quoc", "PQC"),
            Map.entry("đà lạt", "DLI"),
            Map.entry("da lat", "DLI"),
            Map.entry("cần thơ", "VCA"),
            Map.entry("can tho", "VCA"),
            Map.entry("tokyo", "NRT"),
            Map.entry("kyoto", "KIX"),
            Map.entry("osaka", "KIX"),
            Map.entry("seoul", "ICN"),
            Map.entry("bắc kinh", "PEK"),
            Map.entry("bac kinh", "PEK"),
            Map.entry("beijing", "PEK"),
            Map.entry("thượng hải", "PVG"),
            Map.entry("thuong hai", "PVG"),
            Map.entry("shanghai", "PVG"),
            Map.entry("singapore", "SIN"),
            Map.entry("bangkok", "BKK"),
            Map.entry("bali", "DPS")
    );

    private AirportIata() {
    }

    public static Optional<String> resolve(String placeName) {
        if (placeName == null || placeName.isBlank()) {
            return Optional.empty();
        }
        String key = placeName.trim().toLowerCase(Locale.ROOT);
        if (CITY_TO_IATA.containsKey(key)) {
            return Optional.of(CITY_TO_IATA.get(key));
        }
        for (var e : CITY_TO_IATA.entrySet()) {
            if (key.contains(e.getKey())) {
                return Optional.of(e.getValue());
            }
        }
        return Optional.empty();
    }
}
