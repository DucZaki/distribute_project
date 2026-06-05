package com.ducnm.booking.service;

import com.ducnm.booking.client.TourClient;
import com.ducnm.booking.dto.AdminDtos.AdminBookingResponse;
import com.ducnm.booking.entity.DatCho;
import com.ducnm.booking.repository.DatChoRepository;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminBookingService {

    private final DatChoRepository repo;
    private final TourClient tourClient;

    @Transactional(readOnly = true)
    public PageResponse<AdminBookingResponse> list(String trangThai, int page, int size) {
        Page<DatCho> p = trangThai != null && !trangThai.isBlank()
                ? repo.findByTrangThai(trangThai, PageRequest.of(page, size))
                : repo.findAll(PageRequest.of(page, size));
        return PageResponse.<AdminBookingResponse>builder()
                .content(p.getContent().stream().map(this::map).toList())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminBookingResponse get(Integer id) {
        return repo.findById(id).map(this::map)
                .orElseThrow(() -> BusinessException.notFound("Booking", id));
    }

    @Transactional
    public void cancel(Integer id, String reason) {
        DatCho b = repo.findById(id).orElseThrow(() -> BusinessException.notFound("Booking", id));
        if ("PAID".equals(b.getTrangThai())) {
            throw BusinessException.badRequest("Không thể hủy booking đã thanh toán");
        }
        b.setTrangThai("CANCELLED");
        if (reason != null) b.setGhiChu(reason);
    }

    AdminBookingResponse mapPublic(DatCho d) {
        return map(d);
    }

    private AdminBookingResponse map(DatCho d) {
        String tourTitle = null;
        try {
            var tour = tourClient.getTour(d.getIdChuyenDi()).getData();
            if (tour != null) tourTitle = tour.tieuDe();
        } catch (Exception ignored) {
            tourTitle = "Tour #" + d.getIdChuyenDi();
        }
        return AdminBookingResponse.builder()
                .id(d.getId())
                .idChuyenDi(d.getIdChuyenDi())
                .idNguoiDung(d.getIdNguoiDung())
                .trangThai(d.getTrangThai())
                .tongGia(d.getTongGia())
                .soLuong(d.getSoLuong())
                .ngayDat(d.getNgayDat())
                .createdAt(d.getCreatedAt())
                .hoTen(d.getHoTen())
                .email(d.getEmail())
                .tieuDeTour(tourTitle)
                .maCheckIn(d.getMaCheckIn())
                .build();
    }
}
