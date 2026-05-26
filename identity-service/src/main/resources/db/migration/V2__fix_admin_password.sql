-- Fix admin bcrypt hash (password: admin123)
UPDATE nguoi_dung
SET mat_khau = '$2y$10$UL/RON44HldK/FK1S8Tjse83m4/nZNBSxV7cte.FlIyeVzGmElF9i'
WHERE email = 'admin@bookingtour.com';
