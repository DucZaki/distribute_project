package com.ducnm.booking.service;

import com.ducnm.booking.dto.AdminDtos.PromoRequest;
import com.ducnm.booking.dto.AdminDtos.PromoResponse;
import com.ducnm.booking.entity.MaGiamGia;
import com.ducnm.booking.entity.MaGiamGiaTour;
import com.ducnm.booking.repository.MaGiamGiaRepository;
import com.ducnm.booking.repository.MaGiamGiaTourRepository;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPromoService {

    private final MaGiamGiaRepository repo;
    private final MaGiamGiaTourRepository tourRepo;

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

    @Transactional(readOnly = true)
    public PromoResponse getById(Integer id) {
        MaGiamGia e = repo.findById(id).orElseThrow(() -> BusinessException.notFound("Promo", id));
        return map(e);
    }

    @Transactional
    public PromoResponse create(PromoRequest req) {
        if (repo.findByMaIgnoreCase(req.getMa()).isPresent()) {
            throw BusinessException.conflict("Mã đã tồn tại");
        }
        MaGiamGia e = new MaGiamGia();
        e.setSoLanDaDung(0);
        e.setActive(true);
        e = buildEntity(e, req);
        e = repo.save(e);
        saveTourIds(e.getId(), req.getTourIds());
        return map(e);
    }

    @Transactional
    public PromoResponse update(Integer id, PromoRequest req) {
        MaGiamGia e = repo.findById(id).orElseThrow(() -> BusinessException.notFound("Promo", id));
        if (req.getMa() != null && !req.getMa().equalsIgnoreCase(e.getMa())) {
            repo.findByMaIgnoreCase(req.getMa()).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw BusinessException.conflict("Mã đã tồn tại");
                }
            });
        }
        e = buildEntity(e, req);
        e = repo.save(e);
        if (req.getTourIds() != null) {
            tourRepo.deleteByIdMaGiamGia(id);
            saveTourIds(id, req.getTourIds());
        }
        return map(e);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repo.existsById(id)) throw BusinessException.notFound("Promo", id);
        tourRepo.deleteByIdMaGiamGia(id);
        repo.deleteById(id);
    }

    private MaGiamGia buildEntity(MaGiamGia e, PromoRequest req) {
        if (req.getMa() != null) e.setMa(req.getMa().trim().toUpperCase());
        if (req.getMoTa() != null) e.setMoTa(req.getMoTa());
        if (req.getLoai() != null) e.setLoai(req.getLoai());
        if (req.getGiaTri() != null) e.setGiaTri(req.getGiaTri());
        if (req.getGiamToiDa() != null) e.setGiamToiDa(req.getGiamToiDa());
        if (req.getDonToiThieu() != null) e.setDonToiThieu(req.getDonToiThieu());
        if (req.getNgayBatDau() != null) e.setNgayBatDau(req.getNgayBatDau());
        if (req.getNgayKetThuc() != null) e.setNgayKetThuc(req.getNgayKetThuc());
        if (req.getSoLanDungToiDa() != null) e.setSoLanDungToiDa(req.getSoLanDungToiDa());
        if (req.getGioiHanMoiUser() != null) e.setGioiHanMoiUser(req.getGioiHanMoiUser());
        if (req.getKieuChienDich() != null) e.setKieuChienDich(req.getKieuChienDich());
        if (req.getSoNgayDatTruoc() != null) e.setSoNgayDatTruoc(req.getSoNgayDatTruoc());
        if (req.getSoGioLastMinute() != null) e.setSoGioLastMinute(req.getSoGioLastMinute());
        if (req.getActive() != null) e.setActive(req.getActive());
        if (e.getKieuChienDich() == null) e.setKieuChienDich(PromoService.KIEU_STANDARD);
        return e;
    }

    private void saveTourIds(Integer promoId, List<Integer> tourIds) {
        if (tourIds == null || tourIds.isEmpty()) return;
        List<MaGiamGiaTour> rows = new ArrayList<>();
        for (Integer tourId : tourIds) {
            if (tourId != null) {
                rows.add(MaGiamGiaTour.builder().idMaGiamGia(promoId).idChuyenDi(tourId).build());
            }
        }
        tourRepo.saveAll(rows);
    }

    private PromoResponse map(MaGiamGia e) {
        List<Integer> tourIds = tourRepo.findByIdMaGiamGia(e.getId()).stream()
                .map(MaGiamGiaTour::getIdChuyenDi)
                .toList();
        return PromoResponse.builder()
                .id(e.getId())
                .ma(e.getMa())
                .moTa(e.getMoTa())
                .loai(e.getLoai())
                .giaTri(e.getGiaTri())
                .giamToiDa(e.getGiamToiDa())
                .donToiThieu(e.getDonToiThieu())
                .ngayBatDau(e.getNgayBatDau())
                .ngayKetThuc(e.getNgayKetThuc())
                .soLanDungToiDa(e.getSoLanDungToiDa())
                .soLanDaDung(e.getSoLanDaDung())
                .gioiHanMoiUser(e.getGioiHanMoiUser())
                .kieuChienDich(e.getKieuChienDich())
                .soNgayDatTruoc(e.getSoNgayDatTruoc())
                .soGioLastMinute(e.getSoGioLastMinute())
                .active(e.getActive())
                .tourIds(tourIds)
                .build();
    }
}
