-- Seed data adapted from monolith BookingTour V2 + bookingtour.sql

INSERT IGNORE INTO diem_den (id, ten, mo_ta, hinh_anh, vung_mien, noi_bat) VALUES
(1, 'Sapa', 'Thành phố sương mù với ruộng bậc thang tuyệt đẹp', '/img/destinations/sapa.jpg', 'Việt Nam', 1),
(2, 'Hạ Long', 'Vịnh Hạ Long - Di sản thiên nhiên thế giới', '/img/destinations/halong.jpg', 'Việt Nam', 1),
(3, 'Đà Nẵng', 'Thành phố đáng sống nhất Việt Nam', '/img/destinations/danang.jpg', 'Việt Nam', 1),
(4, 'Huế', 'Cố đô với di sản văn hóa phong phú', '/img/destinations/hue.jpg', 'Việt Nam', 0),
(5, 'Phú Quốc', 'Đảo ngọc phía Nam', '/img/destinations/phuquoc.jpg', 'Việt Nam', 1),
(6, 'Bangkok', 'Thủ đô Thái Lan sôi động', '/img/destinations/bangkok.jpg', 'Thái Lan', 1),
(7, 'Seoul', 'Thủ đô Hàn Quốc hiện đại', '/img/destinations/seoul.jpg', 'Hàn Quốc', 1);

INSERT IGNORE INTO diem_don (id, ten, dia_chi, thanh_pho) VALUES
(1, 'Hà Nội', 'Sân bay Nội Bài', 'Hà Nội'),
(2, 'Hồ Chí Minh', 'Sân bay Tân Sơn Nhất', 'Hồ Chí Minh'),
(3, 'Đà Nẵng', 'Sân bay Đà Nẵng', 'Đà Nẵng');

INSERT IGNORE INTO phuong_tien (id, ten, loai, icon) VALUES
(1, 'Vietnam Airlines', 'Plane', 'bi-airplane'),
(2, 'Xe khách cao cấp', 'Bus', 'bi-bus-front'),
(3, 'Xe khách cao cấp', 'Bus', 'bi-bus-front');

INSERT IGNORE INTO noi_luu_tru (id, ten, dia_chi, hang_sao, loai) VALUES
(1, 'Khách sạn Mường Thanh', 'Hà Nội', 4, 'Khách sạn'),
(2, 'Vinpearl Resort', 'Phú Quốc', 5, 'Resort'),
(3, 'Homestay Sapa', 'Sapa, Lào Cai', 3, 'Homestay'),
(4, 'InterContinental Đà Nẵng', 'Đà Nẵng', 5, 'Resort');

INSERT IGNORE INTO chuyen_di (id, tieu_de, mo_ta, gia, ngay_khoi_hanh, ngay_ket_thuc, id_diem_den, id_phuong_tien, id_noi_luu_tru, id_diem_don, noi_bat, hinh_anh, highlight) VALUES
(1, 'Tour Hà Nội 3N2Đ', 'Tham quan Hồ Gươm, Văn Miếu, Lăng Bác', 2500000.00, DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 1, 3, 1, 1, 1, '/img/tours/hanoi.jpg', 'Khám phá văn hóa Thủ đô ngàn năm văn hiến'),
(2, 'Tour 4N3Đ Đà Nẵng - Hội An', 'Bà Nà Hill, Hội An cổ', 4200000.00, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 3, 1, 4, 3, 1, '/img/tours/danang.jpg', 'Cầu Vàng, phố cổ Hội An lung linh'),
(3, 'Khám phá Huế 2N1Đ', 'Ăn uống cung đình, sông Hương', 1800000.00, DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 23 DAY), 4, 3, 1, 1, 0, '/img/tours/hue.jpg', 'Di sản cố đô Huế'),
(4, 'Phú Quốc 3N2Đ', 'Biển đảo, Vinpearl Safari', 3500000.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 5, 1, 2, 2, 1, '/img/tours/phuquoc.jpg', 'Nghỉ dưỡng đảo ngọc'),
(5, 'Sapa mùa lúa chín 3N2Đ', 'Fansipan, bản Cát Cát', 2200000.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 33 DAY), 1, 3, 3, 1, 1, '/img/tours/sapa.jpg', 'Ruộng bậc thang vàng óng'),
(6, 'Hạ Long 2N1Đ du thuyền', 'Du thuyền 5 sao trên vịnh', 2900000.00, DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 2, 3, 1, 1, 1, '/img/tours/halong.jpg', 'Di sản thiên nhiên thế giới');

INSERT IGNORE INTO chuyen_di_diem_don (chuyen_di_id, diem_don_id) VALUES
(1, 1), (2, 1), (2, 3), (3, 1), (4, 2), (5, 1), (6, 1);

INSERT IGNORE INTO ngay_khoi_hanh (id, id_chuyen_di, ngay_khoi_hanh, ngay_ket_thuc, so_cho_toi_da, so_cho_da_dat, trang_thai) VALUES
(1, 1, DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 30, 0, 'ACTIVE'),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 31 DAY), 30, 0, 'ACTIVE'),
(3, 2, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 25, 0, 'ACTIVE'),
(4, 4, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 20, 0, 'ACTIVE'),
(5, 5, DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 33 DAY), 35, 0, 'ACTIVE'),
(6, 6, DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 40, 0, 'ACTIVE');

INSERT IGNORE INTO lich_trinh (id, id_chuyen_di, ngay_thu, tieu_de, mo_ta) VALUES
(1, 1, 1, 'Hà Nội - Hồ Gươm', 'Tham quan Hồ Gươm, Văn Miếu Quốc Tử Giám'),
(2, 1, 2, 'Lăng Bác - Chùa Một Cột', 'Viếng Lăng Bác, chùa Một Cột'),
(3, 1, 3, 'Làng gốm Bát Tràng', 'Trải nghiệm làm gốm, mua sắm'),
(4, 2, 1, 'Đà Nẵng - Bà Nà Hills', 'Cầu Vàng, Fantasy Park'),
(5, 2, 2, 'Hội An cổ', 'Phố cổ, thả hoa đăng'),
(6, 4, 1, 'Phú Quốc - Bãi Sao', 'Tắm biển, hải sản tươi sống');
