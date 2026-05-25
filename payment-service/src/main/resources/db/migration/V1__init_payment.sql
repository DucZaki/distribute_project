CREATE TABLE IF NOT EXISTS payment (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    booking_id      INT NOT NULL,
    user_id         INT NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'VND',
    provider        VARCHAR(30) NOT NULL DEFAULT 'VNPAY',
    txn_ref         VARCHAR(64) NOT NULL,
    provider_txn_id VARCHAR(100),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    bank_code       VARCHAR(30),
    response_code   VARCHAR(10),
    raw_response    TEXT,
    created_at      DATETIME,
    paid_at         DATETIME,
    INDEX idx_booking (booking_id),
    UNIQUE KEY uk_txn_ref (txn_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
