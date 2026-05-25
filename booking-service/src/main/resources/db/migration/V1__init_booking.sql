CREATE TABLE IF NOT EXISTS ma_giam_gia (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    ma                      VARCHAR(50) NOT NULL,
    mo_ta                   VARCHAR(500),
    loai                    VARCHAR(20) NOT NULL DEFAULT 'PERCENT',
    gia_tri                 DECIMAL(12,2) NOT NULL,
    ngay_bat_dau            DATE,
    ngay_ket_thuc           DATE,
    so_lan_dung_toi_da      INT,
    so_lan_da_dung          INT NOT NULL DEFAULT 0,
    active                  TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE KEY uk_ma (ma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dat_cho (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    id_nguoi_dung       INT NOT NULL,
    id_chuyen_di        INT NOT NULL,
    id_ngay_khoi_hanh   INT,
    id_diem_don         INT,
    id_ma_giam_gia      INT,
    so_luong            INT NOT NULL,
    ngay_dat            DATE,
    created_at          DATETIME,
    trang_thai          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    ho_ten              VARCHAR(255),
    email               VARCHAR(255),
    so_dien_thoai       VARCHAR(20),
    dia_chi             VARCHAR(500),
    ghi_chu             TEXT,
    tong_gia            DECIMAL(12,2),
    tien_giam_gia       DECIMAL(12,2),
    ma_check_in         VARCHAR(64),
    checked_in_at       DATETIME,
    payment_id          INT,
    INDEX idx_nguoi_dung (id_nguoi_dung),
    INDEX idx_chuyen_di (id_chuyen_di),
    UNIQUE KEY uk_ma_checkin (ma_check_in),
    INDEX idx_trang_thai (trang_thai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cho_xac_nhan (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    id_dat_cho  INT NOT NULL,
    ho_ten      VARCHAR(255),
    gioi_tinh   VARCHAR(10),
    ngay_sinh   DATE,
    so_cmnd     VARCHAR(20),
    CONSTRAINT fk_cxn_datcho FOREIGN KEY (id_dat_cho) REFERENCES dat_cho(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
