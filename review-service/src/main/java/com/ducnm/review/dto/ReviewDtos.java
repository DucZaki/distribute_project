package com.ducnm.review.dto;

import lombok.*;

import java.time.LocalDateTime;

public class ReviewDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewResponse {
        private Integer id;
        private Integer idChuyenDi;
        private Integer idNguoiDung;
        private String hoTen;
        private String tenDangNhap;
        private Integer diem;
        private String noiDung;
        private LocalDateTime createdAt;
        private String tourTitle;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourReviewSummary {
        private Integer tourId;
        private String tieuDe;
        private String hinhAnh;
        private double avgRating;
        private long totalReviews;
        private long positivePercentage;
    }
}
