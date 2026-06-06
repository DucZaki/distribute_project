package com.ducnm.booking.service;

import com.ducnm.booking.dto.BookingDtos.ApplyPromoRequest;
import com.ducnm.booking.dto.BookingDtos.PromoApplyResult;
import com.ducnm.booking.dto.BookingDtos.PublicPromoSummary;
import com.ducnm.booking.entity.MaGiamGia;
import com.ducnm.booking.entity.MaGiamGiaTour;
import com.ducnm.booking.repository.DatChoRepository;
import com.ducnm.booking.repository.MaGiamGiaRepository;
import com.ducnm.booking.repository.MaGiamGiaTourRepository;
import com.ducnm.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromoService {

    public static final String LOAI_PERCENT = "PERCENT";
    public static final String LOAI_AMOUNT = "AMOUNT";
    public static final String KIEU_STANDARD = "STANDARD";
    public static final String KIEU_EARLY_BIRD = "EARLY_BIRD";
    public static final String KIEU_LAST_MINUTE = "LAST_MINUTE";

    private final MaGiamGiaRepository repo;
    private final MaGiamGiaTourRepository tourRepo;
    private final DatChoRepository bookingRepo;

    @Transactional(readOnly = true)
    public List<PublicPromoSummary> listActivePublic() {
        LocalDate today = LocalDate.now();
        return repo.findActivePromos(today).stream()
                .map(m -> PublicPromoSummary.builder()
                        .id(m.getId())
                        .ma(m.getMa())
                        .moTa(m.getMoTa())
                        .loai(m.getLoai())
                        .giaTri(m.getGiaTri())
                        .giamToiDa(m.getGiamToiDa())
                        .donToiThieu(m.getDonToiThieu())
                        .kieuChienDich(m.getKieuChienDich())
                        .ngayBatDau(m.getNgayBatDau())
                        .ngayKetThuc(m.getNgayKetThuc())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public PromoApplyResult apply(ApplyPromoRequest req, Integer userId) {
        Optional<MaGiamGia> opt = repo.findByMaIgnoreCase(req.getMa());
        if (opt.isEmpty()) {
            return invalid("Mã giảm giá không hợp lệ");
        }
        MaGiamGia ma = opt.get();
        String err = validateRules(ma, req, userId);
        if (err != null) {
            return invalid(err);
        }
        BigDecimal discount = calcDiscount(ma, req.getSubtotal());
        BigDecimal finalAmount = req.getSubtotal().subtract(discount).max(BigDecimal.ZERO);
        return PromoApplyResult.builder()
                .valid(true)
                .message("Áp dụng mã thành công")
                .discount(discount)
                .finalAmount(finalAmount)
                .build();
    }

    /** Dùng khi tạo đơn — ném lỗi nếu không hợp lệ */
    @Transactional(readOnly = true)
    public PromoApplyResult validateForBooking(Integer userId, String maCode, BigDecimal subtotal,
                                                Integer idChuyenDi, Integer idNgayKhoiHanh, LocalDate ngayKhoiHanh) {
        ApplyPromoRequest req = new ApplyPromoRequest(maCode, subtotal, idChuyenDi, idNgayKhoiHanh, ngayKhoiHanh);
        PromoApplyResult result = apply(req, userId);
        if (!result.isValid()) {
            throw BusinessException.badRequest(result.getMessage());
        }
        return result;
    }

    public Optional<MaGiamGia> findByCode(String ma) {
        return repo.findByMaIgnoreCase(ma);
    }

    @Transactional
    public boolean consume(Integer id) {
        return repo.incrementUsage(id) > 0;
    }

    static BigDecimal calcDiscount(MaGiamGia ma, BigDecimal subtotal) {
        BigDecimal raw;
        if (LOAI_PERCENT.equalsIgnoreCase(ma.getLoai())) {
            raw = subtotal.multiply(ma.getGiaTri())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (ma.getGiamToiDa() != null && raw.compareTo(ma.getGiamToiDa()) > 0) {
                raw = ma.getGiamToiDa();
            }
        } else {
            raw = ma.getGiaTri();
        }
        return raw.min(subtotal).max(BigDecimal.ZERO);
    }

    private String validateRules(MaGiamGia ma, ApplyPromoRequest req, Integer userId) {
        LocalDate today = LocalDate.now();
        if (!Boolean.TRUE.equals(ma.getActive())) {
            return "Mã giảm giá không hợp lệ";
        }
        if (ma.getNgayBatDau() != null && today.isBefore(ma.getNgayBatDau())) {
            return "Mã chưa có hiệu lực";
        }
        if (ma.getNgayKetThuc() != null && today.isAfter(ma.getNgayKetThuc())) {
            return "Mã đã hết hạn";
        }
        if (ma.getSoLanDungToiDa() != null && ma.getSoLanDaDung() >= ma.getSoLanDungToiDa()) {
            return "Mã này đã hết lượt sử dụng";
        }
        if (ma.getDonToiThieu() != null && req.getSubtotal().compareTo(ma.getDonToiThieu()) < 0) {
            return "Mã này chỉ áp dụng cho đơn hàng từ " + formatVnd(ma.getDonToiThieu());
        }
        if (req.getIdChuyenDi() != null) {
            long tourRules = tourRepo.countByIdMaGiamGia(ma.getId());
            if (tourRules > 0 && !tourRepo.existsByIdMaGiamGiaAndIdChuyenDi(ma.getId(), req.getIdChuyenDi())) {
                return "Mã không áp dụng cho tour này";
            }
        }
        String campaignErr = validateCampaignType(ma, req.getNgayKhoiHanh());
        if (campaignErr != null) {
            return campaignErr;
        }
        if (userId != null && ma.getGioiHanMoiUser() != null && ma.getGioiHanMoiUser() > 0) {
            long used = bookingRepo.countPromoUsageByUser(userId, ma.getId());
            if (used >= ma.getGioiHanMoiUser()) {
                if (ma.getGioiHanMoiUser() == 1) {
                    return "Bạn đã sử dụng mã này rồi";
                }
                return "Mỗi tài khoản chỉ được dùng mã này tối đa " + ma.getGioiHanMoiUser() + " lần";
            }
        }
        return null;
    }

    private String validateCampaignType(MaGiamGia ma, LocalDate ngayKhoiHanh) {
        String kieu = ma.getKieuChienDich() != null ? ma.getKieuChienDich() : KIEU_STANDARD;
        if (KIEU_STANDARD.equalsIgnoreCase(kieu)) {
            return null;
        }
        if (ngayKhoiHanh == null) {
            return "Thiếu thông tin ngày khởi hành để kiểm tra mã";
        }
        if (KIEU_EARLY_BIRD.equalsIgnoreCase(kieu)) {
            if (ma.getSoNgayDatTruoc() == null || ma.getSoNgayDatTruoc() <= 0) {
                return "Mã Early Bird chưa được cấu hình đúng";
            }
            long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), ngayKhoiHanh);
            if (daysUntil < ma.getSoNgayDatTruoc()) {
                return "Mã Early Bird chỉ áp dụng khi đặt trước ít nhất "
                        + ma.getSoNgayDatTruoc() + " ngày so với ngày khởi hành";
            }
            return null;
        }
        if (KIEU_LAST_MINUTE.equalsIgnoreCase(kieu)) {
            int hoursLimit = ma.getSoGioLastMinute() != null ? ma.getSoGioLastMinute() : 48;
            LocalDateTime departure = ngayKhoiHanh.atStartOfDay();
            long hoursUntil = ChronoUnit.HOURS.between(LocalDateTime.now(), departure);
            if (hoursUntil < 0) {
                return "Tour đã khởi hành, không thể dùng mã Last-minute";
            }
            if (hoursUntil > hoursLimit) {
                return "Mã Last-minute chỉ áp dụng cho tour khởi hành trong vòng " + hoursLimit + " giờ tới";
            }
            return null;
        }
        return null;
    }

    private static PromoApplyResult invalid(String msg) {
        return PromoApplyResult.builder().valid(false).message(msg).build();
    }

    private static String formatVnd(BigDecimal amount) {
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount.longValue()) + "đ";
    }
}
