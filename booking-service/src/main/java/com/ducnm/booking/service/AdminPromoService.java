package com.ducnm.booking.service;

import com.ducnm.booking.dto.AdminDtos.PromoRequest;
import com.ducnm.booking.dto.AdminDtos.PromoResponse;
import com.ducnm.booking.entity.MaGiamGia;
import com.ducnm.booking.repository.MaGiamGiaRepository;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminPromoService {

    private final MaGiamGiaRepository repo;

    @Transactional(readOnly = true)
    public PageResponse<PromoResponse> list(int page, int size) {
        var p = repo.findAll(PageRequest.of(page, size));
        return PageResponse.<PromoResponse>builder()
                .content(p.getContent().stream().map(this::map).toList())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public PromoResponse create(PromoRequest req) {
        if (repo.findByMaIgnoreCase(req.getMa()).isPresent()) {
            throw BusinessException.conflict("Mã đã tồn tại");
        }
        MaGiamGia e = MaGiamGia.builder()
                .ma(req.getMa())
                .moTa(req.getMoTa())
                .loai(req.getLoai() != null ? req.getLoai() : "PERCENT")
                .giaTri(req.getGiaTri())
                .ngayBatDau(req.getNgayBatDau())
                .ngayKetThuc(req.getNgayKetThuc())
                .soLanDungToiDa(req.getSoLanDungToiDa())
                .active(req.getActive() == null || req.getActive())
                .build();
        return map(repo.save(e));
    }

    @Transactional
    public PromoResponse update(Integer id, PromoRequest req) {
        MaGiamGia e = repo.findById(id).orElseThrow(() -> BusinessException.notFound("Promo", id));
        if (req.getMa() != null) e.setMa(req.getMa());
        if (req.getMoTa() != null) e.setMoTa(req.getMoTa());
        if (req.getLoai() != null) e.setLoai(req.getLoai());
        if (req.getGiaTri() != null) e.setGiaTri(req.getGiaTri());
        if (req.getNgayBatDau() != null) e.setNgayBatDau(req.getNgayBatDau());
        if (req.getNgayKetThuc() != null) e.setNgayKetThuc(req.getNgayKetThuc());
        if (req.getSoLanDungToiDa() != null) e.setSoLanDungToiDa(req.getSoLanDungToiDa());
        if (req.getActive() != null) e.setActive(req.getActive());
        return map(repo.save(e));
    }

    @Transactional
    public void delete(Integer id) {
        if (!repo.existsById(id)) throw BusinessException.notFound("Promo", id);
        repo.deleteById(id);
    }

    private PromoResponse map(MaGiamGia e) {
        return PromoResponse.builder()
                .id(e.getId())
                .ma(e.getMa())
                .moTa(e.getMoTa())
                .loai(e.getLoai())
                .giaTri(e.getGiaTri())
                .ngayBatDau(e.getNgayBatDau())
                .ngayKetThuc(e.getNgayKetThuc())
                .soLanDungToiDa(e.getSoLanDungToiDa())
                .soLanDaDung(e.getSoLanDaDung())
                .active(e.getActive())
                .build();
    }
}
