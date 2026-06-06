-- Điểm đến nội địa không có sân bay: hiển thị phương tiện xe khách
UPDATE chuyen_di cd
    JOIN diem_den dd ON dd.id = cd.id_diem_den
SET cd.id_phuong_tien = 3
WHERE dd.vung_mien = 'Việt Nam'
  AND dd.ten IN ('Hạ Long', 'Sa Pa');
