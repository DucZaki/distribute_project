package com.ducnm.tour.specification;

import com.ducnm.tour.dto.TourDtos.SearchRequest;
import com.ducnm.tour.entity.ChuyenDi;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ChuyenDiSpecification {

    private ChuyenDiSpecification() {}

    public static Specification<ChuyenDi> filter(SearchRequest req) {
        return (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                String like = "%" + req.getKeyword().toLowerCase() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("tieuDe")), like),
                        cb.like(cb.lower(root.get("moTa")), like)));
            }
            if (req.getIdDiemDen() != null) {
                preds.add(cb.equal(root.get("diemDen").get("id"), req.getIdDiemDen()));
            }
            if (req.getIdPhuongTien() != null) {
                preds.add(cb.equal(root.get("phuongTien").get("id"), req.getIdPhuongTien()));
            }
            if (req.getGiaTu() != null) {
                preds.add(cb.greaterThanOrEqualTo(root.get("gia"), req.getGiaTu()));
            }
            if (req.getGiaDen() != null) {
                preds.add(cb.lessThanOrEqualTo(root.get("gia"), req.getGiaDen()));
            }
            if (req.getNgayTu() != null) {
                preds.add(cb.greaterThanOrEqualTo(root.get("ngayKhoiHanh"), req.getNgayTu()));
            }
            if (req.getNgayDen() != null) {
                preds.add(cb.lessThanOrEqualTo(root.get("ngayKhoiHanh"), req.getNgayDen()));
            }
            return cb.and(preds.toArray(new Predicate[0]));
        };
    }
}
