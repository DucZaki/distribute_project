package com.ducnm.payment.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingPayView {
    private Integer id;
    private String trangThai;
    private BigDecimal tongGia;
    private LocalDateTime createdAt;
}
