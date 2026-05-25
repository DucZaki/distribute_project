package com.ducnm.tour.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.tour.dto.TourDtos.*;
import com.ducnm.tour.service.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
@Tag(name = "Tours")
public class TourController {

    private final TourService service;

    @GetMapping("/{id}")
    @Operation(summary = "Get tour detail by id")
    public ApiResponse<TourResponse> getById(@PathVariable Integer id) {
        return ApiResponse.ok(service.getById(id));
    }

    @GetMapping("/featured")
    public ApiResponse<List<TourSummary>> featured() {
        return ApiResponse.ok(service.getFeatured());
    }

    @GetMapping
    public ApiResponse<PageResponse<TourSummary>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer idDiemDen,
            @RequestParam(required = false) BigDecimal giaTu,
            @RequestParam(required = false) BigDecimal giaDen,
            @RequestParam(required = false) LocalDate ngayTu,
            @RequestParam(required = false) LocalDate ngayDen,
            @RequestParam(required = false) Integer idPhuongTien,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort) {
        SearchRequest req = new SearchRequest(keyword, idDiemDen, giaTu, giaDen, ngayTu, ngayDen, idPhuongTien);
        return ApiResponse.ok(service.search(req, page, size, sort));
    }
}
