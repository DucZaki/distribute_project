package com.ducnm.tour.service;

import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.tour.dto.TourDtos.*;
import com.ducnm.tour.entity.*;
import com.ducnm.tour.mapper.TourMapper;
import com.ducnm.tour.repository.*;
import com.ducnm.tour.specification.ChuyenDiSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourService {

    private final ChuyenDiRepository chuyenDiRepo;
    private final DiemDenRepository diemDenRepo;
    private final DiemDonRepository diemDonRepo;
    private final PhuongTienRepository phuongTienRepo;
    private final NoiLuuTruRepository noiLuuTruRepo;
    private final TourMapper mapper;

    @Cacheable(value = "tours", key = "#id")
    @Transactional(readOnly = true)
    public TourResponse getById(Integer id) {
        ChuyenDi tour = chuyenDiRepo.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Tour", id));
        return mapper.toResponse(tour);
    }

    @Cacheable(value = "tours-featured")
    @Transactional(readOnly = true)
    public List<TourSummary> getFeatured() {
        return mapper.toSummaryList(chuyenDiRepo.findTop6ByNoiBatTrueOrderByIdDesc());
    }

    @Transactional(readOnly = true)
    public PageResponse<TourSummary> search(SearchRequest req, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(parseSort(sort)));
        Page<ChuyenDi> result = chuyenDiRepo.findAll(ChuyenDiSpecification.filter(req), pageable);
        List<TourSummary> content = mapper.toSummaryList(result.getContent());
        return PageResponse.<TourSummary>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    @CacheEvict(value = {"tours", "tours-featured"}, allEntries = true)
    @Transactional
    public TourResponse create(CreateTourRequest req) {
        DiemDen diemDen = diemDenRepo.findById(req.getIdDiemDen())
                .orElseThrow(() -> BusinessException.notFound("DiemDen", req.getIdDiemDen()));
        ChuyenDi tour = ChuyenDi.builder()
                .tieuDe(req.getTieuDe())
                .moTa(req.getMoTa())
                .gia(req.getGia())
                .ngayKhoiHanh(req.getNgayKhoiHanh())
                .ngayKetThuc(req.getNgayKetThuc())
                .diemDen(diemDen)
                .noiBat(Boolean.TRUE.equals(req.getNoiBat()))
                .hinhAnh(req.getHinhAnh())
                .highlight(req.getHighlight())
                .build();

        if (req.getIdPhuongTien() != null) {
            tour.setPhuongTien(phuongTienRepo.findById(req.getIdPhuongTien())
                    .orElseThrow(() -> BusinessException.notFound("PhuongTien", req.getIdPhuongTien())));
        }
        if (req.getIdNoiLuuTru() != null) {
            tour.setNoiLuuTru(noiLuuTruRepo.findById(req.getIdNoiLuuTru())
                    .orElseThrow(() -> BusinessException.notFound("NoiLuuTru", req.getIdNoiLuuTru())));
        }
        if (req.getIdDiemDonDefault() != null) {
            tour.setDiemDonDefault(diemDonRepo.findById(req.getIdDiemDonDefault())
                    .orElseThrow(() -> BusinessException.notFound("DiemDon", req.getIdDiemDonDefault())));
        }
        if (req.getDiemDonIds() != null && !req.getDiemDonIds().isEmpty()) {
            Set<DiemDon> diemDons = new HashSet<>(diemDonRepo.findAllById(req.getDiemDonIds()));
            tour.setDiemDons(diemDons);
        }

        ChuyenDi saved = chuyenDiRepo.save(tour);

        if (req.getLichTrinhs() != null) {
            ChuyenDi finalTour = saved;
            req.getLichTrinhs().forEach(lt -> {
                LichTrinh entity = mapper.fromLichTrinhDto(lt);
                entity.setChuyenDi(finalTour);
                finalTour.getLichTrinhs().add(entity);
            });
        }

        log.info("Created tour id={} title={}", saved.getId(), saved.getTieuDe());
        return mapper.toResponse(saved);
    }

    @CacheEvict(value = {"tours", "tours-featured"}, allEntries = true)
    @Transactional
    public void delete(Integer id) {
        if (!chuyenDiRepo.existsById(id)) {
            throw BusinessException.notFound("Tour", id);
        }
        chuyenDiRepo.deleteById(id);
    }

    private Sort.Order parseSort(String sort) {
        if (sort == null || sort.isBlank()) return Sort.Order.desc("id");
        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return new Sort.Order(dir, parts[0]);
    }
}
