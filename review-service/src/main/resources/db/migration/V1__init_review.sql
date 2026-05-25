CREATE TABLE IF NOT EXISTS danh_gia (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_chuyen_di    INT NOT NULL,
    id_nguoi_dung   INT NOT NULL,
    diem            INT NOT NULL,
    noi_dung        TEXT,
    created_at      DATETIME,
    INDEX idx_chuyen_di (id_chuyen_di)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS yeu_thich (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_nguoi_dung   INT NOT NULL,
    id_chuyen_di    INT NOT NULL,
    created_at      DATETIME,
    UNIQUE KEY uk_user_tour (id_nguoi_dung, id_chuyen_di)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contact (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten          VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    so_dien_thoai   VARCHAR(20),
    tieu_de         VARCHAR(255),
    noi_dung        TEXT NOT NULL,
    trang_thai      VARCHAR(30) DEFAULT 'NEW',
    created_at      DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
