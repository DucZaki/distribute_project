import type { NewsArticle } from '../types/news'

const IMG = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'

/** 12 tin mẫu — bổ sung khi API trả ít hơn (giống layout monolith). */
export const NEWS_FALLBACK: NewsArticle[] = [
  {
    title: 'Xu hướng du lịch bền vững 2026',
    description: 'Các điểm đến ưu tiên trải nghiệm xanh và giảm rác thải nhựa.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Zaki Travel',
    source: { name: 'Zaki Travel' },
  },
  {
    title: 'Phú Quốc mở rộng đường bay quốc tế',
    description: 'Nhiều hãng hàng không tăng chuyến bay thẳng, kích cầu mùa cao điểm.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'VnExpress Du lịch',
    source: { name: 'VnExpress Du lịch' },
  },
  {
    title: 'Sapa đón khách đông dịp hè',
    description: 'Khách quốc tế đặt tour trekking và homestay trước 2–3 tháng.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Tuổi Trẻ',
    source: { name: 'Tuổi Trẻ' },
  },
  {
    title: 'Đà Nẵng quảng bá MICE và beach break',
    description: 'Combo hội nghị + nghỉ dưỡng biển thu hút doanh nhân Đông Nam Á.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Báo Đà Nẵng',
    source: { name: 'Báo Đà Nẵng' },
  },
  {
    title: 'Hạ Long nâng cấp tour ngủ đêm trên vịnh',
    description: 'Tàu 4–5 sao tăng suất, cam kết an toàn và tiêu chí xanh.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Vietnamnet',
    source: { name: 'Vietnamnet' },
  },
  {
    title: 'Tokyo – Osaka: visa đơn giản hóa cho nhóm',
    description: 'Công ty lữ hành báo tăng 30% booking tour Nhật mùa hoa anh đào.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Travel Weekly',
    source: { name: 'Travel Weekly' },
  },
  {
    title: 'Seoul: shopping tour kết hợp ẩm thực đường phố',
    description: 'Gen Z Việt chọn tour 5 ngày với budget 18–22 triệu.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Korea Herald',
    source: { name: 'Korea Herald' },
  },
  {
    title: 'Huế – Đà Nẵng: combo di sản và biển',
    description: 'Tuyến mới 4 ngày 3 đêm được ưa chuộng dịp lễ.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Zaki Travel',
    source: { name: 'Zaki Travel' },
  },
  {
    title: 'Cần Thơ: tour miệt vườn cuối tuần',
    description: 'Đặt tour trước qua app giảm 10% cho nhóm từ 4 người.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Tuổi Trẻ',
    source: { name: 'Tuổi Trẻ' },
  },
  {
    title: 'Kyoto mở rộng slot tham quan đền',
    description: 'Hệ thống đặt giờ online giúp giảm ùn tắc mùa thu.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Japan Times',
    source: { name: 'Japan Times' },
  },
  {
    title: 'Nha Trang: lặn biển và island hopping',
    description: 'Tour 1 ngày kết hợp đảo Hòn Mun, cam kết an toàn PADI.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'VnExpress Du lịch',
    source: { name: 'VnExpress Du lịch' },
  },
  {
    title: 'Bangkok – Pattaya: tour tiết kiệm 4 ngày',
    description: 'Giá trọn gói từ 9 triệu, bay sáng về tối cuối tuần.',
    url: 'https://vnexpress.net/du-lich',
    urlToImage: IMG,
    publishedAt: '2026-06-01T08:00:00Z',
    author: 'Travel Weekly',
    source: { name: 'Travel Weekly' },
  },
]

export function ensureNewsArticleCount(articles: NewsArticle[], min = 12): NewsArticle[] {
  const list = [...articles]
  if (list.length >= min) return list.slice(0, min)
  for (const fb of NEWS_FALLBACK) {
    if (list.length >= min) break
    const dup = list.some((a) => a.title === fb.title)
    if (!dup) list.push(fb)
  }
  return list
}
