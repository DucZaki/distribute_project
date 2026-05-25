package com.ducnm.web.controller;

import com.ducnm.web.client.BookingClient;
import com.ducnm.web.client.IdentityClient;
import com.ducnm.web.security.AuthSession;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserPageController {

    private final IdentityClient identityClient;
    private final BookingClient bookingClient;

    @GetMapping("/profile")
    public String profile(HttpSession session, Model model) {
        if (!requireAuth(session)) return "redirect:/login";
        model.addAttribute("user", identityClient.me().getData());
        return "user/profile";
    }

    @GetMapping("/bookings")
    public String bookings(HttpSession session, Model model) {
        if (!requireAuth(session)) return "redirect:/login";
        model.addAttribute("bookings", bookingClient.mine(0, 50).getData());
        return "user/bookings";
    }

    @GetMapping("/edit-profile")
    public String editProfile(HttpSession session, Model model) {
        if (!requireAuth(session)) return "redirect:/login";
        model.addAttribute("user", identityClient.me().getData());
        return "user/edit-profile";
    }

    @PostMapping("/update-profile")
    public String updateProfile(@RequestParam String hoTen,
                                @RequestParam(required = false) String number,
                                HttpSession session) {
        if (!requireAuth(session)) return "redirect:/login";
        identityClient.updateMe(new IdentityClient.UpdateProfileRequest(hoTen, number, null));
        return "redirect:/user/profile";
    }

    @GetMapping("/change-password")
    public String changePasswordForm(HttpSession session) {
        if (!requireAuth(session)) return "redirect:/login";
        return "user/change-password";
    }

    @PostMapping("/change-password")
    public String changePassword(@RequestParam String currentPassword,
                                 @RequestParam String newPassword,
                                 HttpSession session,
                                 RedirectAttributes ra) {
        if (!requireAuth(session)) return "redirect:/login";
        try {
            identityClient.changePassword(new IdentityClient.ChangePasswordRequest(currentPassword, newPassword));
            ra.addFlashAttribute("successMessage", "Đổi mật khẩu thành công");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/user/change-password";
    }

    private boolean requireAuth(HttpSession session) {
        return session.getAttribute(AuthSession.KEY) != null;
    }
}
