ALTER TABLE contact
    ADD COLUMN loai      VARCHAR(30)  NULL AFTER so_dien_thoai,
    ADD COLUMN dia_chi   VARCHAR(500) NULL AFTER loai,
    ADD COLUMN so_khach  INT          NULL AFTER dia_chi;
