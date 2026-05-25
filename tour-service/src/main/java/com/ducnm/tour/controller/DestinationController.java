package com.ducnm.tour.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.tour.dto.TourDtos.DiemDenSummary;
import com.ducnm.tour.mapper.TourMapper;
import com.ducnm.tour.repository.DiemDenRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
@Tag(name = "Destinations")
public class DestinationController {

    private final DiemDenRepository diemDenRepo;
    private final TourMapper mapper;

    @GetMapping("/featured")
    public ApiResponse<List<DiemDenSummary>> featured() {
        return ApiResponse.ok(diemDenRepo.findByNoiBatTrue().stream().map(mapper::toDiemDenSummary).toList());
    }
}
