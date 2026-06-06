package com.ducnm.tour.service;

import com.ducnm.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class TourImageStorage {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("Chưa chọn file ảnh");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED.contains(contentType.toLowerCase())) {
            throw BusinessException.badRequest("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF");
        }
        String original = file.getOriginalFilename();
        String safeName = original != null && !original.isBlank()
                ? original.replaceAll("[^a-zA-Z0-9._-]", "_")
                : "image.jpg";
        String fileName = UUID.randomUUID() + "_" + safeName;
        try {
            Path dir = Path.of(uploadDir);
            Files.createDirectories(dir);
            Path dest = dir.resolve(fileName);
            file.transferTo(dest.toFile());
            String publicPath = "/uploads/" + fileName;
            log.info("Stored tour image {}", publicPath);
            return publicPath;
        } catch (IOException ex) {
            throw BusinessException.badRequest("Không lưu được file ảnh: " + ex.getMessage());
        }
    }
}
