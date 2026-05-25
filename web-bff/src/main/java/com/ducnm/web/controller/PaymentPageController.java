package com.ducnm.web.controller;

import com.ducnm.web.client.BookingClient;
import com.ducnm.web.client.PaymentClient;
import com.ducnm.web.security.AuthSession;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PaymentPageController {

    private final BookingClient bookingClient;
    private final PaymentClient paymentClient;

    @PostMapping("/booking/submit")
    public String submitBooking(@RequestParam Integer tourId,
                                @RequestParam Integer nkhId,
                                @RequestParam Integer departureId,
                                @RequestParam String hoTen,
                                @RequestParam String email,
                                @RequestParam String soDienThoai,
                                @RequestParam Integer soLuong,
                                @RequestParam(required = false) String diaChi,
                                @RequestParam(required = false) String ghiChu,
                                @RequestParam(required = false) String maGiamGia,
                                HttpSession session,
                                RedirectAttributes ra) {
        AuthSession auth = (AuthSession) session.getAttribute(AuthSession.KEY);
        if (auth == null) return "redirect:/login";

        if (email == null || !email.trim().toLowerCase().endsWith("@gmail.com")) {
            ra.addFlashAttribute("promoError", "Vui lòng nhập Gmail hợp lệ (@gmail.com).");
            return "redirect:/tour/" + tourId + "/dat-tour?nkhId=" + nkhId;
        }

        Map<String, Object> req = new HashMap<>();
        req.put("idChuyenDi", tourId);
        req.put("idNgayKhoiHanh", nkhId);
        req.put("idDiemDon", departureId);
        req.put("soLuong", soLuong);
        req.put("hoTen", hoTen);
        req.put("email", email);
        req.put("soDienThoai", soDienThoai);
        req.put("diaChi", diaChi);
        req.put("ghiChu", ghiChu);
        if (maGiamGia != null && !maGiamGia.isBlank()) req.put("maGiamGia", maGiamGia);

        try {
            Map<String, Object> booking = bookingClient.create(req).getData();
            Integer bookingId = ((Number) booking.get("id")).intValue();
            BigDecimal amount = new BigDecimal(booking.get("tongGia").toString());

            Map<String, Object> payReq = Map.of(
                    "bookingId", bookingId,
                    "amount", amount,
                    "orderInfo", "Thanh toan don dat tour #" + bookingId);
            Map<String, Object> pay = paymentClient.initVnPay(payReq).getData();
            String redirectUrl = (String) pay.get("redirectUrl");
            return "redirect:" + redirectUrl;
        } catch (Exception e) {
            ra.addFlashAttribute("promoError", e.getMessage());
            return "redirect:/tour/" + tourId + "/dat-tour?nkhId=" + nkhId;
        }
    }

    @GetMapping("/payment/vnpay-result")
    public String vnpayResult(@RequestParam(required = false) String status,
                              @RequestParam(required = false) String message,
                              Model model) {
        model.addAttribute("status", status);
        model.addAttribute("message", message);
        return "chuyendi/vnpay-result";
    }
}
