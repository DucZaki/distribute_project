package com.ducnm.review.service;

import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.review.entity.DanhGia;
import com.ducnm.review.repository.DanhGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final DanhGiaRepository repo;

    @Transactional(readOnly = true)
    public PageResponse<DanhGia> list(Integer tourId, int page, int size) {
        Page<DanhGia> p = tourId != null
                ? repo.findByIdChuyenDi(tourId, PageRequest.of(page, size))
                : repo.findAll(PageRequest.of(page, size));
        return PageResponse.<DanhGia>builder()
                .content(p.getContent())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public void delete(Integer id) {
        if (!repo.existsById(id)) throw BusinessException.notFound("Review", id);
        repo.deleteById(id);
    }
}
