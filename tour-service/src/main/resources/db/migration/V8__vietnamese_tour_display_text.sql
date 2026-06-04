UPDATE chuyen_di SET tieu_de = 'Tour Hạ Long 2N1Đ' WHERE id = 4;
UPDATE chuyen_di SET tieu_de = 'Nghỉ dưỡng biển Nha Trang 3N' WHERE id = 5;
UPDATE chuyen_di SET tieu_de = 'Nghỉ dưỡng Phú Quốc 4N' WHERE id = 6;
UPDATE chuyen_di SET tieu_de = 'Trekking Sa Pa 2N' WHERE id = 7;
UPDATE chuyen_di SET tieu_de = 'Du lịch Bắc Kinh 4N' WHERE id = 9;
UPDATE chuyen_di SET tieu_de = 'Khám phá Thượng Hải 3N' WHERE id = 10;
UPDATE chuyen_di SET tieu_de = 'Thiên nhiên Trương Gia Giới 3N' WHERE id = 11;
UPDATE chuyen_di SET tieu_de = 'Tokyo cho gia đình 5N' WHERE id = 12;
UPDATE chuyen_di SET tieu_de = 'Văn hóa Kyoto 3N' WHERE id = 13;
UPDATE chuyen_di SET tieu_de = 'Ẩm thực Osaka 2N' WHERE id = 14;
UPDATE chuyen_di SET tieu_de = 'Du lịch Seoul 4N' WHERE id = 15;

UPDATE phuong_tien SET loai = 'Máy bay' WHERE LOWER(loai) = 'plane';
UPDATE phuong_tien SET loai = 'Xe khách' WHERE LOWER(loai) = 'bus';
UPDATE phuong_tien SET ten = 'Phà Phú Quốc', loai = 'Tàu thủy / phà' WHERE id = 9;

UPDATE noi_luu_tru SET loai = 'Khách sạn' WHERE LOWER(loai) = 'hotel';
UPDATE noi_luu_tru SET loai = 'Căn hộ' WHERE LOWER(loai) = 'apartment';
UPDATE noi_luu_tru SET loai = 'Nhà nghỉ' WHERE LOWER(loai) = 'inn';
