CREATE TABLE IF NOT EXISTS nguoi_dung (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ten_dang_nhap   VARCHAR(100),
    email           VARCHAR(255) NOT NULL,
    mat_khau        VARCHAR(255),
    vai_tro         VARCHAR(30) NOT NULL DEFAULT 'USER',
    ngay_tao        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ho_ten          VARCHAR(255),
    number          VARCHAR(20),
    provider        VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
    anh_dai_dien    VARCHAR(500),
    enabled         TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_username (ten_dang_nhap)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default admin (password: admin123 - bcrypt)
INSERT IGNORE INTO nguoi_dung (ten_dang_nhap, email, mat_khau, vai_tro, ho_ten, provider, enabled)
VALUES ('admin', 'admin@bookingtour.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Administrator', 'LOCAL', 1);
