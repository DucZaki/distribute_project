package com.ducnm.web.controller;

import com.ducnm.web.client.TourClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final TourClient tourClient;

    @GetMapping("/")
    public String home(Model model) {
        try {
            model.addAttribute("featuredTours", tourClient.featured().getData());
        } catch (Exception e) {
            model.addAttribute("featuredTours", List.of());
        }
        return "index";
    }

    @GetMapping("/tours")
    public String search(@RequestParam(required = false) String keyword,
                         @RequestParam(defaultValue = "0") int page,
                         Model model) {
        var pageData = tourClient.search(keyword, null, null, null, null, null, page, 12).getData();
        model.addAttribute("page", pageData);
        model.addAttribute("keyword", keyword);
        return "tours/list";
    }

    @GetMapping("/tours/{id}")
    public String detail(@PathVariable Integer id, Model model) {
        model.addAttribute("tour", tourClient.getTour(id).getData());
        return "tours/detail";
    }
}
