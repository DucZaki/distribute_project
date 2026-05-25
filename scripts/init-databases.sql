CREATE DATABASE IF NOT EXISTS bookingtour_identity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS bookingtour_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS bookingtour_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS bookingtour_payment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS bookingtour_review CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON bookingtour_identity.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON bookingtour_tour.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON bookingtour_booking.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON bookingtour_payment.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON bookingtour_review.* TO 'root'@'%';
FLUSH PRIVILEGES;
