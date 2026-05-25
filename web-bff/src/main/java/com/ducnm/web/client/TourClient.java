package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@FeignClient(name = "tour-service")
public interface TourClient {

    @GetMapping("/api/v1/tours/{id}")
    ApiResponse<Map<String, Object>> getTour(@PathVariable Integer id);

    @GetMapping("/api/v1/tours/featured")
    ApiResponse<List<Map<String, Object>>> featured();

    @GetMapping("/api/v1/tours")
    ApiResponse<PageResponse<Map<String, Object>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer idDiemDen,
            @RequestParam(required = false) BigDecimal giaTu,
            @RequestParam(required = false) BigDecimal giaDen,
            @RequestParam(required = false) LocalDate ngayTu,
            @RequestParam(required = false) LocalDate ngayDen,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size);
}
