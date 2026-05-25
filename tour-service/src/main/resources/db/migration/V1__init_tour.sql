CREATE TABLE IF NOT EXISTS diem_den (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ten         VARCHAR(255) NOT NULL,
    mo_ta       TEXT,
    hinh_anh    VARCHAR(500),
    vung_mien   VARCHAR(50),
    noi_bat     TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS diem_don (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ten         VARCHAR(255) NOT NULL,
    dia_chi     VARCHAR(500),
    thanh_pho   VARCHAR(100),
    kinh_do     DOUBLE,
    vi_do       DOUBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS phuong_tien (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    ten     VARCHAR(100) NOT NULL,
    loai    VARCHAR(50),
    icon    VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS noi_luu_tru (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ten         VARCHAR(255) NOT NULL,
    dia_chi     VARCHAR(500),
    hang_sao    INT,
    loai        VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chuyen_di (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    tieu_de         VARCHAR(500) NOT NULL,
    mo_ta           TEXT,
    gia             DECIMAL(12,2) NOT NULL,
    ngay_khoi_hanh  DATE,
    ngay_ket_thuc   DATE,
    id_diem_den     INT,
    id_phuong_tien  INT,
    id_noi_luu_tru  INT,
    id_diem_don     INT,
    noi_bat         TINYINT(1) DEFAULT 0,
    hinh_anh        VARCHAR(500),
    highlight       TEXT,
    INDEX idx_diem_den (id_diem_den),
    INDEX idx_ngay_khoi_hanh (ngay_khoi_hanh),
    INDEX idx_noi_bat (noi_bat),
    CONSTRAINT fk_chuyendi_diemden FOREIGN KEY (id_diem_den) REFERENCES diem_den(id),
    CONSTRAINT fk_chuyendi_phuongtien FOREIGN KEY (id_phuong_tien) REFERENCES phuong_tien(id),
    CONSTRAINT fk_chuyendi_noiluutru FOREIGN KEY (id_noi_luu_tru) REFERENCES noi_luu_tru(id),
    CONSTRAINT fk_chuyendi_diemdon FOREIGN KEY (id_diem_don) REFERENCES diem_don(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chuyen_di_diem_don (
    chuyen_di_id    INT NOT NULL,
    diem_don_id     INT NOT NULL,
    PRIMARY KEY (chuyen_di_id, diem_don_id),
    CONSTRAINT fk_cd_dd_chuyendi FOREIGN KEY (chuyen_di_id) REFERENCES chuyen_di(id) ON DELETE CASCADE,
    CONSTRAINT fk_cd_dd_diemdon FOREIGN KEY (diem_don_id) REFERENCES diem_don(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lich_trinh (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_chuyen_di    INT NOT NULL,
    ngay_thu        INT NOT NULL,
    tieu_de         VARCHAR(255),
    mo_ta           TEXT,
    hinh_anh        VARCHAR(500),
    CONSTRAINT fk_lichtrinh_chuyendi FOREIGN KEY (id_chuyen_di) REFERENCES chuyen_di(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ngay_khoi_hanh (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    id_chuyen_di        INT NOT NULL,
    ngay_khoi_hanh      DATE NOT NULL,
    ngay_ket_thuc       DATE,
    so_cho_toi_da       INT NOT NULL,
    so_cho_da_dat       INT NOT NULL DEFAULT 0,
    gia_override        DECIMAL(12,2),
    trang_thai          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    INDEX idx_chuyendi_status (id_chuyen_di, trang_thai),
    CONSTRAINT fk_nkh_chuyendi FOREIGN KEY (id_chuyen_di) REFERENCES chuyen_di(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
