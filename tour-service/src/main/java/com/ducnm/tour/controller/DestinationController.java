package com.ducnm.tour.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.tour.dto.TourDtos.DiemDenSummary;
import com.ducnm.tour.mapper.TourMapper;
import com.ducnm.tour.repository.DiemDenRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tours/destinations")
@RequiredArgsConstructor
@Tag(name = "Destinations")
public class DestinationController {

    private final DiemDenRepository repo;
    private final TourMapper mapper;

    @GetMapping("/featured")
    @Operation(summary = "Featured destinations for home page")
    public ApiResponse<List<DiemDenSummary>> featured() {
        List<DiemDenSummary> list = repo.findByNoiBatTrue().stream()
                .map(mapper::toDiemDenSummary)
                .toList();
        return ApiResponse.ok(list);
    }

    @GetMapping
    public ApiResponse<List<DiemDenSummary>> all() {
        return ApiResponse.ok(repo.findAll().stream().map(mapper::toDiemDenSummary).toList());
    }
}
