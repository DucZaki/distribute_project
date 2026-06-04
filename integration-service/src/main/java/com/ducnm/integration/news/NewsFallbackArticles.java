package com.ducnm.integration.news;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 12 tin du lịch mẫu — giống layout monolith khi NewsAPI lỗi / chưa cấu hình key. */
final class NewsFallbackArticles {

    private static final String IMG = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80";

    private NewsFallbackArticles() {}

    static Map<String, Object> response() {
        return Map.of(
                "status", "ok",
                "totalResults", 12,
                "articles", articles());
    }

    @SuppressWarnings("unchecked")
    static List<Map<String, Object>> articles() {
        String today = LocalDate.now().toString();
        List<Object[]> rows = List.of(
                row("Xu hướng du lịch bền vững 2026", "Các điểm đến ưu tiên trải nghiệm xanh và giảm rác thải nhựa.", "Zaki Travel", today),
                row("Phú Quốc mở rộng đường bay quốc tế", "Nhiều hãng hàng không tăng chuyến bay thẳng, kích cầu mùa cao điểm.", "VnExpress Du lịch", today),
                row("Sapa đón khách đông dịp hè", "Khách quốc tế đặt tour trekking và homestay trước 2–3 tháng.", "Tuổi Trẻ", today),
                row("Đà Nẵng quảng bá MICE và beach break", "Combo hội nghị + nghỉ dưỡng biển thu hút doanh nhân Đông Nam Á.", "Báo Đà Nẵng", today),
                row("Hạ Long nâng cấp tour ngủ đêm trên vịnh", "Tàu 4–5 sao tăng suất, cam kết an toàn và tiêu chí xanh.", "Vietnamnet", today),
                row("Tokyo – Osaka: visa đơn giản hóa cho nhóm", "Công ty lữ hành báo tăng 30% booking tour Nhật mùa hoa anh đào.", "Travel Weekly", today),
                row("Seoul: shopping tour kết hợp ẩm thực đường phố", "Gen Z Việt chọn tour 5 ngày với budget 18–22 triệu.", "Korea Herald", today),
                row("Huế – Đà Nẵng: combo di sản và biển", "Tuyến mới 4 ngày 3 đêm được ưa chuộng dịp lễ.", "Zaki Travel", today),
                row("Cần Thơ: tour miệt vườn cuối tuần", "Đặt tour trước qua app giảm 10% cho nhóm từ 4 người.", "Tuổi Trẻ", today),
                row("Kyoto mở rộng slot tham quan đền", "Hệ thống đặt giờ online giúp giảm ùn tắc mùa thu.", "Japan Times", today),
                row("Nha Trang: lặn biển và island hopping", "Tour 1 ngày kết hợp đảo Hòn Mun, cam kết an toàn PADI.", "VnExpress Du lịch", today),
                row("Bangkok – Pattaya: tour tiết kiệm 4 ngày", "Giá trọn gói từ 9 triệu, bay sáng về tối cuối tuần.", "Travel Weekly", today)
        );
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            list.add(article((String) r[0], (String) r[1], (String) r[2], (String) r[3]));
        }
        return list;
    }

    private static Object[] row(String title, String desc, String source, String date) {
        return new Object[] { title, desc, source, date };
    }

    private static Map<String, Object> article(String title, String description, String sourceName, String publishedAt) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("title", title);
        m.put("description", description);
        m.put("url", "https://vnexpress.net/du-lich");
        m.put("urlToImage", IMG);
        m.put("publishedAt", publishedAt + "T08:00:00Z");
        m.put("author", sourceName);
        m.put("source", Map.of("name", sourceName));
        return m;
    }
}
