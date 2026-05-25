package com.ducnm.booking.client;

import com.ducnm.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service")
public interface IdentityClient {

    @GetMapping("/api/v1/users/{id}")
    ApiResponse<UserBrief> getUser(@PathVariable("id") Integer id);

    record UserBrief(Integer id, String email, String hoTen, String number, String anhDaiDien) {}
}
