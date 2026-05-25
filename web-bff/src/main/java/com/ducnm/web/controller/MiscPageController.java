package com.ducnm.web.controller;

import com.ducnm.web.client.BookingClient;
import com.ducnm.web.client.IntegrationClient;
import com.ducnm.web.client.ReviewClient;
import com.ducnm.web.client.TourClient;
import com.ducnm.web.security.AuthSession;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class MiscPageController {

    private final ReviewClient reviewClient;
    private final IntegrationClient integrationClient;
    private final BookingClient bookingClient;

    @PostMapping("/danh-gia/add")
    public String addReview(@RequestParam Integer idChuyenDi,
                            @RequestParam Integer diem,
                            @RequestParam String noiDung,
                            HttpSession session) {
        if (session.getAttribute(AuthSession.KEY) == null) return "redirect:/login";
        Map<String, Object> req = Map.of("idChuyenDi", idChuyenDi, "diem", diem, "noiDung", noiDung);
        reviewClient.create(req);
        return "redirect:/tour/" + idChuyenDi;
    }

    @PostMapping("/favorites/add")
    public String addFavorite(@RequestParam Integer tourId,
                              HttpSession session,
                              @RequestHeader(value = "Referer", required = false) String referer) {
        if (session.getAttribute(AuthSession.KEY) == null) return "redirect:/login";
        reviewClient.addFavorite(tourId);
        return "redirect:" + (referer != null ? referer : "/tour/" + tourId);
    }

    @GetMapping("/favorites/my-favorites")
    public String favorites(HttpSession session, Model model) {
        if (session.getAttribute(AuthSession.KEY) == null) return "redirect:/login";
        model.addAttribute("favorites", reviewClient.favorites().getData());
        return "user/favorite";
    }

    @GetMapping("/favorites/delete/{id}")
    public String deleteFavorite(@PathVariable Integer id, HttpSession session) {
        if (session.getAttribute(AuthSession.KEY) == null) return "redirect:/login";
        reviewClient.removeFavorite(id);
        return "redirect:/favorites/my-favorites";
    }

    @GetMapping("/tin-tuc")
    public String news(Model model) {
        try {
            model.addAttribute("articles", integrationClient.news(null));
        } catch (Exception e) {
            model.addAttribute("articles", java.util.List.of());
        }
        return "tintuc/tintuc";
    }

    @GetMapping("/contact")
    public String contact() {
        return "user/contact";
    }

    @PostMapping("/contact")
    public String submitContact(@RequestParam String name,
                                @RequestParam String email,
                                @RequestParam String message,
                                RedirectAttributes ra) {
        Map<String, Object> req = new HashMap<>();
        req.put("hoTen", name);
        req.put("email", email);
        req.put("noiDung", message);
        try {
            reviewClient.contact(req);
            ra.addFlashAttribute("successMessage", "Gửi liên hệ thành công!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Không gửi được, vui lòng thử lại.");
        }
        return "redirect:/contact";
    }

    @GetMapping("/check-in/{token}")
    public String checkInPage(@PathVariable String token, Model model) {
        model.addAttribute("token", token);
        return "checkin/verify";
    }

    @PostMapping("/check-in/{token}/confirm")
    public String confirmCheckIn(@PathVariable String token, HttpSession session, RedirectAttributes ra) {
        AuthSession auth = (AuthSession) session.getAttribute(AuthSession.KEY);
        if (auth == null || !auth.isAdmin()) {
            ra.addFlashAttribute("errorMessage", "Chỉ admin mới xác nhận check-in.");
            return "redirect:/check-in/" + token;
        }
        try {
            bookingClient.confirmCheckIn(token);
            ra.addFlashAttribute("successMessage", "Check-in thành công!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/check-in/" + token;
    }
}
