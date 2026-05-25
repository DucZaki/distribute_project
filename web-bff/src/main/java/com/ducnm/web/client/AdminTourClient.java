package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "tour-service", contextId = "adminTourClient")
public interface AdminTourClient {

    @PostMapping("/api/v1/admin/tours")
    ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> body);

    @DeleteMapping("/api/v1/admin/tours/{id}")
    ApiResponse<Void> delete(@PathVariable Integer id);

    @GetMapping("/api/v1/admin/tours/{id}/schedules")
    ApiResponse<List<Map<String, Object>>> schedules(@PathVariable Integer id);

    @PostMapping("/api/v1/admin/tours/{id}/schedules")
    ApiResponse<Map<String, Object>> createSchedule(@PathVariable Integer id, @RequestBody Map<String, Object> body);
}
