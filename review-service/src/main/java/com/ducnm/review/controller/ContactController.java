package com.ducnm.review.controller;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.review.entity.Contact;
import com.ducnm.review.repository.ContactRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactRepository repo;

    @PostMapping
    public ApiResponse<Contact> create(@Valid @RequestBody ContactRequest req) {
        Contact c = Contact.builder()
                .hoTen(req.hoTen)
                .email(req.email)
                .soDienThoai(req.soDienThoai)
                .tieuDe(req.tieuDe)
                .noiDung(req.noiDung)
                .build();
        return ApiResponse.ok(repo.save(c), "Đã ghi nhận, chúng tôi sẽ liên hệ sớm");
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ContactRequest {
        @NotBlank private String hoTen;
        @NotBlank @Email private String email;
        private String soDienThoai;
        private String tieuDe;
        @NotBlank private String noiDung;
    }
}
