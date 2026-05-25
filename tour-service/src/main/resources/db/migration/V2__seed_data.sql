-- Dev seed data for tour-service (adapted from monolith Booking-Tour)

INSERT IGNORE INTO diem_den (id, ten, mo_ta, hinh_anh, vung_mien, noi_bat) VALUES
(1, 'Sapa', 'Thành phố sương mù với ruộng bậc thang tuyệt đẹp', '/anh/diemden/sapa.jpg', 'Miền Bắc', 1),
(2, 'Hạ Long', 'Vịnh Hạ Long - Di sản thiên nhiên thế giới', '/anh/diemden/halong.jpg', 'Miền Bắc', 1),
(3, 'Đà Nẵng', 'Thành phố đáng sống nhất Việt Nam', '/anh/diemden/danang.jpg', 'Miền Trung', 1),
(4, 'Huế', 'Cố đô với di sản văn hóa phong phú', '/anh/diemden/hue.jpg', 'Miền Trung', 0),
(5, 'Phú Quốc', 'Đảo ngọc phía Nam', '/anh/diemden/phuquoc.jpg', 'Miền Nam', 1),
(6, 'Hà Nội', 'Thủ đô ngàn năm văn hiến', '/anh/chuyendi/hanoi.jpg', 'Miền Bắc', 1);

INSERT IGNORE INTO diem_don (id, ten, dia_chi, thanh_pho) VALUES
(1, 'Hà Nội', 'Sân bay Nội Bài', 'Hà Nội'),
(2, 'Hồ Chí Minh', 'Sân bay Tân Sơn Nhất', 'Hồ Chí Minh'),
(3, 'Đà Nẵng', 'Sân bay Đà Nẵng', 'Đà Nẵng');

INSERT IGNORE INTO phuong_tien (id, ten, loai) VALUES
(1, 'Vietnam Airlines', 'Plane'),
(2, 'Xe khách cao cấp', 'Bus');

INSERT IGNORE INTO noi_luu_tru (id, ten, dia_chi, hang_sao, loai) VALUES
(1, 'Khách sạn Mường Thanh', 'Hà Nội', 4, 'Khách sạn'),
(2, 'Vinpearl Resort', 'Phú Quốc', 5, 'Resort'),
(3, 'InterContinental Đà Nẵng', 'Đà Nẵng', 5, 'Resort');

INSERT IGNORE INTO chuyen_di (id, tieu_de, mo_ta, gia, ngay_khoi_hanh, ngay_ket_thuc, id_diem_den, id_phuong_tien, id_noi_luu_tru, id_diem_don, noi_bat, hinh_anh, highlight) VALUES
(1, 'Tour Hà Nội 3N2Đ', 'Tham quan Hồ Gươm, Văn Miếu, Lăng Bác', 2500000.00, '2026-06-01', '2026-12-31', 6, 2, 1, 1, 1, '/anh/chuyendi/hanoi.jpg', 'Khám phá văn hóa Thủ đô ngàn năm'),
(2, 'Tour 4N3Đ Đà Nẵng - Hội An', 'Bà Nà Hill, Hội An cổ', 4200000.00, '2026-06-01', '2026-12-31', 3, 1, 3, 3, 1, '/anh/diemden/danang.jpg', 'Cầu Vàng và phố cổ Hội An'),
(3, 'Khám phá Huế 2N1Đ', 'Đại Nội, sông Hương', 1800000.00, '2026-06-01', '2026-12-31', 4, 2, 1, 1, 0, '/anh/diemden/hue.jpg', 'Di sản văn hóa cố đô'),
(4, 'Du thuyền Hạ Long 2N1Đ', 'Vịnh di sản thế giới', 3200000.00, '2026-06-01', '2026-12-31', 2, 2, 1, 1, 1, '/anh/diemden/halong.jpg', 'Du thuyền sang trọng trên vịnh'),
(5, 'Phú Quốc 3N2Đ', 'Biển đảo và resort', 5500000.00, '2026-06-01', '2026-12-31', 5, 1, 2, 2, 1, '/anh/diemden/phuquoc.jpg', 'Thiên đường nghỉ dưỡng'),
(6, 'Sapa mùa lúa chín 3N2Đ', 'Ruộng bậc thang Fansipan', 2900000.00, '2026-06-01', '2026-12-31', 1, 2, 1, 1, 1, '/anh/diemden/sapa.jpg', 'Sương mù và núi non hùng vĩ');

INSERT IGNORE INTO chuyen_di_diem_don (chuyen_di_id, diem_don_id) VALUES
(1, 1), (2, 1), (2, 3), (3, 1), (4, 1), (5, 2), (6, 1);

INSERT IGNORE INTO lich_trinh (id, id_chuyen_di, ngay_thu, tieu_de, mo_ta, hinh_anh) VALUES
(1, 1, 1, 'Hà Nội – Phố cổ', 'Hồ Gươm, 36 phố phường', '/anh/chuyendi/hanoi.jpg'),
(2, 1, 2, 'Hà Nội – Văn hóa', 'Lăng Bác, Văn Miếu', '/anh/chuyendi/hanoi.jpg'),
(3, 1, 3, 'Tiễn khách', 'Mua quà và tiễn sân bay', '/anh/chuyendi/hanoi.jpg'),
(4, 2, 1, 'Đà Nẵng – Ngũ Hành Sơn', 'Biển Mỹ Khê', '/anh/diemden/danang.jpg'),
(5, 2, 2, 'Bà Nà Hills', 'Cầu Vàng', '/anh/diemden/danang.jpg'),
(6, 2, 3, 'Hội An', 'Phố cổ, hoa đăng', '/anh/diemden/danang.jpg');

INSERT IGNORE INTO ngay_khoi_hanh (id, id_chuyen_di, ngay_khoi_hanh, ngay_ket_thuc, so_cho_toi_da, so_cho_da_dat, gia_override, trang_thai) VALUES
(1, 1, '2026-06-15', '2026-06-17', 30, 0, NULL, 'ACTIVE'),
(2, 1, '2026-07-10', '2026-07-12', 30, 0, NULL, 'ACTIVE'),
(3, 2, '2026-06-20', '2026-06-23', 25, 0, 500000.00, 'ACTIVE'),
(4, 2, '2026-08-05', '2026-08-08', 25, 0, 450000.00, 'ACTIVE'),
(5, 4, '2026-06-25', '2026-06-26', 20, 0, NULL, 'ACTIVE'),
(6, 5, '2026-07-01', '2026-07-03', 20, 0, 800000.00, 'ACTIVE'),
(7, 6, '2026-09-12', '2026-09-14', 25, 0, NULL, 'ACTIVE');
