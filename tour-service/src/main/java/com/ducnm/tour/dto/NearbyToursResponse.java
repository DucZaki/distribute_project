package com.ducnm.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/** Cùng contract JSON với monolith {@code /api/tour/nearby}. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyToursResponse {
    private List<NearbyTourItem> tours;
    private boolean inRange;
    private int page;
    private int limit;
    private int total;
    private int totalPages;
    private boolean hasPrev;
    private boolean hasNext;
    private int count;
    private Double radiusKm;
    private Double distanceKm;
    private String departureCity;
    private String nearestDepartureCity;
    private Double nearestDistanceKm;
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyTourItem {
        private Integer id;
        private String tieuDe;
        private BigDecimal gia;
        private String hinhAnh;
        private String diemDon;
        private String diemDen;
        private Double distanceKm;
        private Boolean noiBat;
        private Double averageRating;
        private Long ratingCount;
        private Long bookingCount;
    }
}
