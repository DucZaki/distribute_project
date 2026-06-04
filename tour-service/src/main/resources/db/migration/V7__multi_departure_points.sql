-- Điểm xuất phát theo đích đến:
-- Đích Hà Nội → đón TP.HCM (2) + Đà Nẵng (3)
-- Đích Đà Nẵng → đón Hà Nội (1) + TP.HCM (2)
-- Đích TP.HCM / Sài Gòn → đón Hà Nội (1) + Đà Nẵng (3)
-- Còn lại → cả 3: HN, HCM, Đà Nẵng

DELETE FROM chuyen_di_diem_don;

INSERT INTO chuyen_di_diem_don (chuyen_di_id, diem_don_id)
SELECT cd.id, ddn.id
FROM chuyen_di cd
         JOIN diem_den den ON den.id = cd.id_diem_den
         JOIN diem_don ddn ON ddn.id IN (2, 3)
WHERE den.ten LIKE '%Hà Nội%';

INSERT INTO chuyen_di_diem_don (chuyen_di_id, diem_don_id)
SELECT cd.id, ddn.id
FROM chuyen_di cd
         JOIN diem_den den ON den.id = cd.id_diem_den
         JOIN diem_don ddn ON ddn.id IN (1, 2)
WHERE den.ten LIKE '%Đà Nẵng%';

INSERT INTO chuyen_di_diem_don (chuyen_di_id, diem_don_id)
SELECT cd.id, ddn.id
FROM chuyen_di cd
         JOIN diem_den den ON den.id = cd.id_diem_den
         JOIN diem_don ddn ON ddn.id IN (1, 3)
WHERE den.ten LIKE '%Hồ Chí Minh%'
   OR den.ten LIKE '%TP%Hồ Chí Minh%'
   OR den.ten LIKE '%TP.HCM%'
   OR den.ten LIKE '%Sài Gòn%'
   OR den.ten LIKE '%Sai Gon%';

INSERT INTO chuyen_di_diem_don (chuyen_di_id, diem_don_id)
SELECT cd.id, ddn.id
FROM chuyen_di cd
         JOIN diem_den den ON den.id = cd.id_diem_den
         JOIN diem_don ddn ON ddn.id IN (1, 2, 3)
WHERE den.ten NOT LIKE '%Hà Nội%'
  AND den.ten NOT LIKE '%Đà Nẵng%'
  AND den.ten NOT LIKE '%Hồ Chí Minh%'
  AND den.ten NOT LIKE '%TP%Hồ Chí Minh%'
  AND den.ten NOT LIKE '%TP.HCM%'
  AND den.ten NOT LIKE '%Sài Gòn%'
  AND den.ten NOT LIKE '%Sai Gon%';

UPDATE chuyen_di cd
    LEFT JOIN chuyen_di_diem_don cddd ON cddd.chuyen_di_id = cd.id AND cddd.diem_don_id = cd.id_diem_don
SET cd.id_diem_don = (SELECT x.diem_don_id
                      FROM chuyen_di_diem_don x
                      WHERE x.chuyen_di_id = cd.id
                      ORDER BY x.diem_don_id
                      LIMIT 1)
WHERE cd.id_diem_don IS NULL
   OR cddd.diem_don_id IS NULL;
