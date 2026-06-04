-- V3 import reset users; restore admin password (admin123) and role
UPDATE nguoi_dung
SET mat_khau = '$2a$10$UL/RON44HldK/FK1S8Tjse83m4/nZNBSxV7cte.FlIyeVzGmElF9i',
    vai_tro  = 'ADMIN',
    enabled  = 1,
    provider = 'LOCAL'
WHERE email = 'admin@bookingtour.com';

INSERT INTO nguoi_dung (ten_dang_nhap, email, mat_khau, vai_tro, ho_ten, provider, enabled)
SELECT 'admin', 'admin@bookingtour.com', '$2a$10$UL/RON44HldK/FK1S8Tjse83m4/nZNBSxV7cte.FlIyeVzGmElF9i', 'ADMIN', 'Administrator', 'LOCAL', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM nguoi_dung WHERE email = 'admin@bookingtour.com');
