package com.ducnm.web.client;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "identity-service", contextId = "adminIdentityClient")
public interface AdminIdentityClient {

    @GetMapping("/api/v1/admin/users")
    ApiResponse<PageResponse<Map<String, Object>>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size);

    @PutMapping("/api/v1/admin/users/{id}")
    ApiResponse<Map<String, Object>> updateUser(@PathVariable Integer id, @RequestBody Map<String, Object> body);

    @DeleteMapping("/api/v1/admin/users/{id}")
    ApiResponse<Void> deleteUser(@PathVariable Integer id);
}
