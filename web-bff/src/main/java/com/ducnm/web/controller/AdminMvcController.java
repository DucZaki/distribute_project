package com.ducnm.web.controller;

import com.ducnm.web.client.AdminIdentityClient;
import com.ducnm.web.client.AdminTourClient;
import com.ducnm.web.client.TourClient;
import com.ducnm.web.service.TourViewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.*;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminMvcController {

    private final TourClient tourClient;
    private final AdminTourClient adminTourClient;
    private final AdminIdentityClient adminIdentityClient;
    private final TourViewMapper viewMapper;

    @GetMapping({"", "/"})
    public String dashboard(Model model) {
        fillDashboardDefaults(model);
        return "admin/dashboard";
    }

    @GetMapping("/revenue")
    public String revenue(Model model) {
        fillDashboardDefaults(model);
        model.addAttribute("year", LocalDate.now().getYear());
        return "admin/revenue";
    }

    @GetMapping("/bookings")
    public String bookings(Model model) {
        model.addAttribute("bookings", List.of());
        return "admin/bookings";
    }

    @GetMapping("/tour-performance")
    public String tourPerformance(Model model) {
        model.addAttribute("topTours", List.of());
        return "admin/tour-performance";
    }

    @GetMapping("/tour/active")
    public String tourActive(Model model) {
        try {
            var page = tourClient.search(null, null, null, null, null, null, null, 0, 50, null).getData();
            model.addAttribute("dschuyendi", page);
        } catch (Exception e) {
            model.addAttribute("dschuyendi", emptyPage());
        }
        return "admin/tour/tour-active";
    }

    @GetMapping("/tour/completed")
    public String tourCompleted(Model model) {
        model.addAttribute("dschuyendi", emptyPage());
        return "admin/tour/tour-complete";
    }

    @GetMapping("/tour/create")
    public String tourCreate(Model model) {
        model.addAttribute("chuyenDi", new HashMap<String, Object>());
        return "admin/tour/tour-create";
    }

    @GetMapping("/tour/edit/{id}")
    public String tourEdit(@PathVariable Integer id, Model model) {
        model.addAttribute("chuyenDi", viewMapper.toView(tourClient.getTour(id).getData()));
        return "admin/tour/tour-edit";
    }

    @GetMapping("/tour/detail/{id}")
    public String tourDetail(@PathVariable Integer id, Model model) {
        model.addAttribute("chuyenDi", viewMapper.toView(tourClient.getTour(id).getData()));
        try {
            model.addAttribute("schedules", adminTourClient.schedules(id).getData());
        } catch (Exception e) {
            model.addAttribute("schedules", List.of());
        }
        return "admin/tour/tour-detail";
    }

    @GetMapping("/tour/delete/{id}")
    public String tourDelete(@PathVariable Integer id, RedirectAttributes ra) {
        try {
            adminTourClient.delete(id);
            ra.addFlashAttribute("successMessage", "Đã xoá tour");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/tour/active";
    }

    @GetMapping("/tour/extend/{id}")
    public String tourExtend(@PathVariable Integer id, Model model) {
        model.addAttribute("tourId", id);
        return "admin/tour/tour-extend";
    }

    @GetMapping("/tour/{tourId}/ngay-khoi-hanh")
    public String scheduleList(@PathVariable Integer tourId, Model model) {
        model.addAttribute("tourId", tourId);
        try {
            model.addAttribute("schedules", adminTourClient.schedules(tourId).getData());
        } catch (Exception e) {
            model.addAttribute("schedules", List.of());
        }
        return "admin/tour/ngay-khoi-hanh-list";
    }

    @GetMapping("/promo")
    public String promoList(Model model) {
        model.addAttribute("promos", List.of());
        return "admin/promo/promo-list";
    }

    @GetMapping("/promo/create")
    public String promoCreate(Model model) {
        model.addAttribute("promo", new HashMap<String, Object>());
        return "admin/promo/promo-form";
    }

    @GetMapping("/user")
    public String userList(Model model) {
        try {
            model.addAttribute("users", adminIdentityClient.listUsers(0, 50).getData());
        } catch (Exception e) {
            model.addAttribute("users", emptyPage());
        }
        return "admin/user/user-list";
    }

    @GetMapping("/user/create")
    public String userCreate(Model model) {
        model.addAttribute("user", new HashMap<String, Object>());
        return "admin/user/user-create";
    }

    @GetMapping("/danh-gia")
    public String reviewTours(Model model) {
        model.addAttribute("tours", List.of());
        return "admin/danh-gia/tour-list";
    }

    @GetMapping("/danh-gia/detail")
    public String reviewDetail(@RequestParam(required = false) Integer tourId, Model model) {
        model.addAttribute("tourId", tourId);
        model.addAttribute("reviews", List.of());
        return "admin/danh-gia/list";
    }

    @GetMapping("/contact")
    public String contactList(Model model) {
        model.addAttribute("contacts", List.of());
        return "admin/contact/contact-list";
    }

    @GetMapping("/contact/{id}")
    public String contactDetail(@PathVariable Integer id, Model model) {
        model.addAttribute("contact", Map.of("id", id));
        return "admin/contact/contact-detail";
    }

    @GetMapping("/api/revenue/monthly")
    @ResponseBody
    public Map<String, Object> revenueMonthly(@RequestParam(defaultValue = "2026") int year) {
        return Map.of("months", List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
                "revenues", Collections.nCopies(12, 0));
    }

    private void fillDashboardDefaults(Model model) {
        model.addAttribute("totalBookings", 0);
        model.addAttribute("successBookings", 0);
        model.addAttribute("failedBookings", 0);
        model.addAttribute("totalRevenue", 0.0);
        model.addAttribute("totalUsers", 0);
        model.addAttribute("totalTours", 0);
        model.addAttribute("topTours", List.of());
        model.addAttribute("chartMonths", List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));
        model.addAttribute("chartRevenues", Collections.nCopies(12, 0.0));
        model.addAttribute("statusLabels", List.of("PENDING", "CONFIRMED", "CANCELLED"));
        model.addAttribute("statusCounts", List.of(0L, 0L, 0L));
    }

    private Map<String, Object> emptyPage() {
        return Map.of("content", List.of(), "totalElements", 0, "totalPages", 0, "page", 0, "size", 10, "last", true);
    }
}
