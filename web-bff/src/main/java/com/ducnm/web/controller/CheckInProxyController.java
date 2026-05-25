package com.ducnm.web.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@Controller
@RequiredArgsConstructor
public class CheckInProxyController {

    @GetMapping(value = "/check-in/{token}/qr.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qr(@PathVariable String token,
                                     @RequestParam(defaultValue = "300") int size) {
        try {
            RestTemplate rt = new RestTemplate();
            byte[] png = rt.getForObject(
                    "http://booking-service:8083/api/v1/check-in/" + token + "/qr?size=" + size, byte[].class);
            return ResponseEntity.ok(png);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
