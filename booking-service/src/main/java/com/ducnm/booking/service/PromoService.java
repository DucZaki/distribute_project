package com.ducnm.booking.service;

import com.ducnm.booking.dto.BookingDtos.ApplyPromoRequest;
import com.ducnm.booking.dto.BookingDtos.PromoApplyResult;
import com.ducnm.booking.entity.MaGiamGia;
import com.ducnm.booking.repository.MaGiamGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromoService {

    private final MaGiamGiaRepository repo;

    @Transactional(readOnly = true)
    public PromoApplyResult apply(ApplyPromoRequest req) {
        Optional<MaGiamGia> opt = repo.findByMaIgnoreCase(req.getMa());
        if (opt.isEmpty()) {
            return PromoApplyResult.builder().valid(false).message("Mã không tồn tại").build();
        }
        MaGiamGia ma = opt.get();
        LocalDate today = LocalDate.now();
        if (!ma.getActive()) return invalid("Mã đã bị vô hiệu");
        if (ma.getNgayBatDau() != null && today.isBefore(ma.getNgayBatDau())) return invalid("Mã chưa có hiệu lực");
        if (ma.getNgayKetThuc() != null && today.isAfter(ma.getNgayKetThuc())) return invalid("Mã đã hết hạn");
        if (ma.getSoLanDungToiDa() != null && ma.getSoLanDaDung() >= ma.getSoLanDungToiDa()) {
            return invalid("Mã đã hết lượt sử dụng");
        }

        BigDecimal discount = calcDiscount(ma, req.getSubtotal());
        BigDecimal finalAmount = req.getSubtotal().subtract(discount).max(BigDecimal.ZERO);
        return PromoApplyResult.builder()
                .valid(true)
                .message("Áp dụng thành công")
                .discount(discount)
                .finalAmount(finalAmount)
                .build();
    }

    public Optional<MaGiamGia> findByCode(String ma) {
        return repo.findByMaIgnoreCase(ma);
    }

    @Transactional
    public boolean consume(Integer id) {
        return repo.incrementUsage(id) > 0;
    }

    static BigDecimal calcDiscount(MaGiamGia ma, BigDecimal subtotal) {
        if ("PERCENT".equalsIgnoreCase(ma.getLoai())) {
            return subtotal.multiply(ma.getGiaTri())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        return ma.getGiaTri();
    }

    private static PromoApplyResult invalid(String msg) {
        return PromoApplyResult.builder().valid(false).message(msg).build();
    }
}
