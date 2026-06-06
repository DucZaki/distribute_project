package com.ducnm.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightQuoteResponse {
    private boolean available;
    private BigDecimal unitPrice;
    private BigDecimal giaVeDi;
    private BigDecimal giaVeVe;
    private BigDecimal tongGiaVe;
    private String maChuyenBayDi;
    private String maChuyenBayVe;
    private String gioBayDi;
    private String gioBayVe;
    private String gioDenDi;
    private String gioDenVe;
    private String ngayDi;
    private String ngayVe;
    private String originCode;
    private String destinationCode;
    /** FLIGHT hoặc BUS */
    private String transportMode;
    private String transportLabel;
    private String message;
}
