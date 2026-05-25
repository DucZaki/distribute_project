package com.ducnm.web.controller;

import com.ducnm.web.client.DestinationClient;
import com.ducnm.web.client.ReviewClient;
import com.ducnm.web.client.TourClient;
import com.ducnm.web.service.TourViewMapper;
import com.ducnm.web.view.ChuyenDiView.DiemDenView;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final TourClient tourClient;
    private final DestinationClient destinationClient;
    private final ReviewClient reviewClient;
    private final TourViewMapper viewMapper;

    @GetMapping("/")
    public String home(Model model) {
        try {
            List<DiemDenView> dsNoiBat = destinationClient.featured().getData().stream()
                    .map(viewMapper::toDiemDenView).toList();
            model.addAttribute("dsNoiBat", dsNoiBat);
        } catch (Exception e) {
            model.addAttribute("dsNoiBat", List.of());
        }
        try {
            model.addAttribute("dsnoibatcd", viewMapper.toViewList(tourClient.featured().getData()));
        } catch (Exception e) {
            model.addAttribute("dsnoibatcd", List.of());
        }
        try {
            var reviews = reviewClient.byTour(1, 0, 6).getData();
            model.addAttribute("dsDanhGia", reviews != null ? reviews.getContent() : List.of());
        } catch (Exception e) {
            model.addAttribute("dsDanhGia", List.of());
        }
        model.addAttribute("dsnd", List.of("Khách hàng ZakiBooking"));
        return "index";
    }
}
