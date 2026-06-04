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
        private Integer diem;
        private String noiDung;
        private LocalDateTime createdAt;
        private String tourTitle;
    }
}
