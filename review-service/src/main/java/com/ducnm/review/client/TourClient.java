package com.ducnm.review.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "tour-service", contextId = "reviewTourClient")
public interface TourClient {

    @GetMapping("/api/v1/tours/{id}")
    ApiResponse<TourBrief> getTour(@PathVariable("id") Integer id);

    record TourBrief(Integer id, String tieuDe, String hinhAnh) {}
}
