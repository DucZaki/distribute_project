-- Mỗi tour 3 ngày khởi hành trong tháng 6/2026 (quản lý qua admin schedules)
-- Tắt lịch ACTIVE đã qua; dữ liệu cũ vẫn trong DB.

UPDATE ngay_khoi_hanh
SET trang_thai = 'INACTIVE'
WHERE trang_thai = 'ACTIVE'
  AND ngay_khoi_hanh < '2026-06-01';

INSERT INTO ngay_khoi_hanh (id_chuyen_di, ngay_khoi_hanh, ngay_ket_thuc, so_cho_toi_da, so_cho_da_dat, trang_thai)
SELECT cd.id,
       d.ngay_khoi_hanh,
       DATE_ADD(
           d.ngay_khoi_hanh,
           INTERVAL GREATEST(
               COALESCE(NULLIF(DATEDIFF(cd.ngay_ket_thuc, cd.ngay_khoi_hanh), 0), 2),
               1
           ) DAY
       ),
       20,
       0,
       'ACTIVE'
FROM chuyen_di cd
         CROSS JOIN (
    SELECT '2026-06-08' AS ngay_khoi_hanh
    UNION ALL
    SELECT '2026-06-15'
    UNION ALL
    SELECT '2026-06-22'
) d;

UPDATE chuyen_di
SET ngay_khoi_hanh = '2026-06-08',
    ngay_ket_thuc   = DATE_ADD(
        '2026-06-08',
        INTERVAL GREATEST(
            COALESCE(NULLIF(DATEDIFF(ngay_ket_thuc, ngay_khoi_hanh), 0), 2),
            1
        ) DAY
    )
WHERE id BETWEEN 1 AND 18;
