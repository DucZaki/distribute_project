-- Mở rộng mã giảm giá: giới hạn %, đơn tối thiểu, Early Bird, Last-minute, tour cụ thể
ALTER TABLE ma_giam_gia
    ADD COLUMN giam_toi_da DECIMAL(12, 2) NULL COMMENT 'Trần giảm khi loai=PERCENT',
    ADD COLUMN don_toi_thieu DECIMAL(12, 2) NULL COMMENT 'Đơn tối thiểu (VND)',
    ADD COLUMN gioi_han_moi_user INT NULL COMMENT 'Số lần tối đa mỗi user, NULL=không giới hạn',
    ADD COLUMN kieu_chien_dich VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN so_ngay_dat_truoc INT NULL COMMENT 'Early Bird: đặt trước X ngày so với ngày khởi hành',
    ADD COLUMN so_gio_last_minute INT NULL COMMENT 'Last-minute: khởi hành trong vòng X giờ';

CREATE TABLE IF NOT EXISTS ma_giam_gia_tour (
    id_ma_giam_gia INT NOT NULL,
    id_chuyen_di   INT NOT NULL,
    PRIMARY KEY (id_ma_giam_gia, id_chuyen_di),
    CONSTRAINT fk_mggt_promo FOREIGN KEY (id_ma_giam_gia) REFERENCES ma_giam_gia (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
