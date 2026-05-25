package com.ducnm.web.controller;

import com.ducnm.common.dto.PageResponse;
import com.ducnm.web.client.ReviewClient;
import com.ducnm.web.client.TourClient;
import com.ducnm.web.service.TourViewMapper;
import com.ducnm.web.view.CalendarDay;
import com.ducnm.web.view.ChuyenDiView;
import com.ducnm.web.view.ChuyenDiView.NgayKhoiHanhView;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class TourPageController {

    private final TourClient tourClient;
    private final ReviewClient reviewClient;
    private final TourViewMapper viewMapper;

    @GetMapping("/tour")
    public String list(@RequestParam(required = false) String diemDen,
                       @RequestParam(required = false) String khoangGia,
                       @RequestParam(required = false) String sort,
                       @RequestParam(required = false) String ngayDi,
                       @RequestParam(defaultValue = "0") int page,
                       @RequestParam(defaultValue = "10") int size,
                       Model model) {
        BigDecimal giaTu = null, giaDen = null;
        if ("DUOI5".equals(khoangGia)) giaDen = BigDecimal.valueOf(5_000_000);
        else if ("5_10".equals(khoangGia)) {
            giaTu = BigDecimal.valueOf(5_000_000);
            giaDen = BigDecimal.valueOf(10_000_000);
        } else if ("TREN10".equals(khoangGia)) giaTu = BigDecimal.valueOf(10_000_000);

        LocalDate ngayTu = parseNgayDi(ngayDi);
        PageResponse<Map<String, Object>> pageData = tourClient.search(
                diemDen, null, giaTu, giaDen, ngayTu, null, null, page, size, sort).getData();

        model.addAttribute("dschuyendi", viewMapper.toViewList(pageData.getContent()));
        model.addAttribute("dem", pageData.getTotalElements());
        model.addAttribute("diemDenSelected", diemDen);
        model.addAttribute("khoangGiaSelected", khoangGia);
        model.addAttribute("sortSelected", sort);
        model.addAttribute("ngayDiSelected", ngayDi);
        model.addAttribute("page", page);
        model.addAttribute("size", size);
        model.addAttribute("perPage", size);
        model.addAttribute("totalPage", pageData.getTotalPages());
        return "chuyendi/tour";
    }

    @GetMapping("/tour/{id}")
    public String detail(@PathVariable Integer id,
                         @RequestParam(required = false) Integer month,
                         @RequestParam(required = false) Integer year,
                         @RequestParam(required = false) String selectedDate,
                         Model model) {
        ChuyenDiView chuyenDi = viewMapper.toView(tourClient.getTour(id).getData());
        if (chuyenDi == null) return "redirect:/tour";

        LocalDate now = LocalDate.now();
        int viewMonth = month != null ? month : now.getMonthValue();
        int viewYear = year != null ? year : now.getYear();

        int[] months = new int[3];
        int[] years = new int[3];
        int startMonth = now.getMonthValue();
        int startYear = now.getYear();
        for (int i = 0; i < 3; i++) {
            int m = startMonth + i;
            int y = startYear;
            if (m > 12) { m -= 12; y++; }
            months[i] = m;
            years[i] = y;
        }

        List<NgayKhoiHanhView> allSchedules = chuyenDi.getNgayKhoiHanhs() != null
                ? chuyenDi.getNgayKhoiHanhs() : List.of();
        List<NgayKhoiHanhView> departureDates = allSchedules.stream()
                .filter(n -> n.getNgay() != null
                        && n.getNgay().getMonthValue() == viewMonth
                        && n.getNgay().getYear() == viewYear)
                .toList();

        List<CalendarDay> calendar = viewMapper.buildCalendar(viewMonth, viewYear, selectedDate, departureDates);

        NgayKhoiHanhView selectedNkh = null;
        double flightPrice = 0;
        if (selectedDate != null && !selectedDate.isBlank()) {
            LocalDate d = LocalDate.parse(selectedDate);
            selectedNkh = allSchedules.stream()
                    .filter(n -> d.equals(n.getNgay())).findFirst().orElse(null);
            if (selectedNkh != null) flightPrice = selectedNkh.getTongGiaVe();
        }

        model.addAttribute("calendar", calendar);
        model.addAttribute("currentMonth", viewMonth);
        model.addAttribute("currentYear", viewYear);
        model.addAttribute("selectedDate", selectedDate);
        model.addAttribute("id", chuyenDi);
        model.addAttribute("departureDates", departureDates);
        model.addAttribute("selectedNkh", selectedNkh);
        model.addAttribute("price", flightPrice);
        model.addAttribute("months", months);
        model.addAttribute("years", years);
        model.addAttribute("lichTrinhs", chuyenDi.getLichTrinhs());

        try {
            var summary = reviewClient.summary(id).getData();
            model.addAttribute("avgRating", Math.round(asDouble(summary.get("averageRating"))));
            model.addAttribute("totalReview", asInt(summary.get("totalReviews")));
            var reviews = reviewClient.byTour(id, 0, 20).getData();
            model.addAttribute("danhGiaList", reviews != null ? reviews.getContent() : List.of());
        } catch (Exception e) {
            model.addAttribute("avgRating", 0);
            model.addAttribute("totalReview", 0);
            model.addAttribute("danhGiaList", List.of());
        }
        model.addAttribute("userReview", null);
        return "chuyendi/chitiet";
    }

    @GetMapping("/tour/{tourId}/dat-tour")
    public String bookingForm(@PathVariable Integer tourId,
                              @RequestParam Integer nkhId,
                              Model model,
                              jakarta.servlet.http.HttpSession session) {
        ChuyenDiView chuyenDi = viewMapper.toView(tourClient.getTour(tourId).getData());
        if (chuyenDi == null) return "redirect:/tour";

        NgayKhoiHanhView nkh = chuyenDi.getNgayKhoiHanhs() == null ? null
                : chuyenDi.getNgayKhoiHanhs().stream().filter(s -> nkhId.equals(s.getId())).findFirst().orElse(null);
        if (nkh == null) return "redirect:/tour/" + tourId;

        double tongGia = chuyenDi.getGia().doubleValue() + nkh.getTongGiaVe();
        model.addAttribute("tour", chuyenDi);
        model.addAttribute("nkh", nkh);
        model.addAttribute("tongGia", tongGia);

        var departureOptions = chuyenDi.getDiemDons().stream().sorted(
                java.util.Comparator.comparing(ChuyenDiView.DiemDonView::getId)).toList();
        model.addAttribute("departureOptions", departureOptions);
        model.addAttribute("selectedDepartureId",
                departureOptions.isEmpty() ? null : departureOptions.get(0).getId());

        var auth = (com.ducnm.web.security.AuthSession) session.getAttribute(com.ducnm.web.security.AuthSession.KEY);
        if (auth != null) {
            model.addAttribute("userHoTen", auth.getHoTen());
            model.addAttribute("userEmail", auth.getEmail());
        }
        return "chuyendi/dat-tour";
    }

    private LocalDate parseNgayDi(String ngayDi) {
        if (ngayDi == null || ngayDi.isBlank()) return null;
        try {
            if (ngayDi.contains("/")) {
                return LocalDate.parse(ngayDi, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }
            return LocalDate.parse(ngayDi);
        } catch (Exception e) {
            return null;
        }
    }

    private double asDouble(Object o) {
        if (o == null) return 0;
        if (o instanceof Number n) return n.doubleValue();
        return Double.parseDouble(o.toString());
    }

    private int asInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number n) return n.intValue();
        return Integer.parseInt(o.toString());
    }
}
