package com.ducnm.web.controller;

import com.ducnm.web.client.IdentityClient.RegisterRequest;
import com.ducnm.web.security.AuthSessionService;
import com.ducnm.web.view.RegisterForm;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class AuthPageController {

    private final AuthSessionService authSessionService;

    @GetMapping("/login")
    public String login(@RequestParam(required = false) String error,
                        @RequestParam(required = false) String logout,
                        Model model) {
        if (error != null) model.addAttribute("errorMessage", "Email hoặc mật khẩu không đúng!");
        if (logout != null) model.addAttribute("successMessage", "Đăng xuất thành công!");
        return "login/login";
    }

    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("nguoiDung", new RegisterForm());
        return "login/register";
    }

    @PostMapping("/register")
    public String registerSubmit(@RequestParam String tenDangNhap,
                                 @RequestParam String email,
                                 @RequestParam String matKhau,
                                 @RequestParam String confirmPassword,
                                 @RequestParam String hoTen,
                                 @RequestParam(required = false) String number,
                                 Model model) {
        RegisterForm form = new RegisterForm();
        form.setTenDangNhap(tenDangNhap);
        form.setHoTen(hoTen);
        form.setEmail(email);
        form.setNumber(number);
        model.addAttribute("nguoiDung", form);

        if (!matKhau.equals(confirmPassword)) {
            model.addAttribute("errorMessage", "Mật khẩu xác nhận không khớp!");
            return "login/register";
        }
        if (!email.toLowerCase().endsWith("@gmail.com")) {
            model.addAttribute("errorMessage", "Email phải là Gmail (@gmail.com)!");
            return "login/register";
        }
        try {
            authSessionService.registerOnly(new RegisterRequest(email, matKhau, tenDangNhap, hoTen, number));
        } catch (Exception e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "login/register";
        }
        return "redirect:/login?logout=false";
    }

    @PostMapping("/perform-login")
    public String performLogin(@RequestParam String username,
                               @RequestParam String password,
                               HttpSession session,
                               RedirectAttributes ra) {
        try {
            authSessionService.login(username, password, session);
            return "redirect:/redirect-after-login";
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Email hoặc mật khẩu không đúng!");
            return "redirect:/login?error";
        }
    }

    @GetMapping("/redirect-after-login")
    public String redirectAfterLogin(Authentication authentication) {
        if (authentication != null && authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return "redirect:/admin";
        }
        return "redirect:/";
    }

    @GetMapping("/access-denied")
    public String accessDenied(Model model) {
        model.addAttribute("errorMessage", "Bạn không có quyền truy cập trang này!");
        return "error/403";
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        authSessionService.logout(session);
        return "redirect:/login?logout=true";
    }
}
