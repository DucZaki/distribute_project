package com.ducnm.tour.service;

import com.ducnm.common.exception.BusinessException;
import com.ducnm.tour.dto.TourDtos.NgayKhoiHanhDto;
import com.ducnm.tour.entity.ChuyenDi;
import com.ducnm.tour.entity.NgayKhoiHanh;
import com.ducnm.tour.mapper.TourMapper;
import com.ducnm.tour.repository.ChuyenDiRepository;
import com.ducnm.tour.repository.NgayKhoiHanhRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final NgayKhoiHanhRepository scheduleRepo;
    private final ChuyenDiRepository tourRepo;
    private final TourMapper mapper;

    @Transactional(readOnly = true)
    public List<NgayKhoiHanhDto> listActive(Integer tourId) {
        return mapper.toNgayDtos(scheduleRepo.findByChuyenDi_IdAndTrangThai(tourId, "ACTIVE"));
    }

    @Transactional
    public NgayKhoiHanhDto create(Integer tourId, NgayKhoiHanhDto req) {
        ChuyenDi tour = tourRepo.findById(tourId)
                .orElseThrow(() -> BusinessException.notFound("Tour", tourId));
        NgayKhoiHanh entity = NgayKhoiHanh.builder()
                .chuyenDi(tour)
                .ngayKhoiHanh(req.getNgayKhoiHanh())
                .ngayKetThuc(req.getNgayKetThuc())
                .soChoToiDa(req.getSoChoToiDa())
                .soChoDaDat(0)
                .giaOverride(req.getGiaOverride())
                .trangThai("ACTIVE")
                .build();
        return mapper.toNgayDto(scheduleRepo.save(entity));
    }

    /**
     * Atomic seat reservation. Called by booking-service via Feign.
     * @return true if reservation succeeded, false if not enough seats / inactive.
     */
    @Transactional
    public boolean reserveSeats(Integer scheduleId, int seats) {
        int updated = scheduleRepo.reserveSeats(scheduleId, seats);
        log.info("Reserve seats scheduleId={} seats={} updated={}", scheduleId, seats, updated);
        return updated > 0;
    }

    /**
     * Compensation: release seats when booking fails / is cancelled.
     */
    @Transactional
    public boolean releaseSeats(Integer scheduleId, int seats) {
        int updated = scheduleRepo.releaseSeats(scheduleId, seats);
        log.info("Release seats scheduleId={} seats={} updated={}", scheduleId, seats, updated);
        return updated > 0;
    }
}
