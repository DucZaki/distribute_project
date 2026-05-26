# BookingTour - Microservices Edition

Phiên bản microservice của ứng dụng [BookingTour](../Java/BookingTour) (monolith Spring Boot + Thymeleaf gốc). Được tách theo **bounded context** (DDD), sử dụng **Spring Cloud 2023**, **Java 21**, **Kafka** event-driven, **MySQL DB-per-service**, **Redis caching**, **Resilience4j** circuit breaker, và **OpenTelemetry-compatible tracing** (Zipkin + Prometheus + Grafana).

## Kiến trúc

```
                                     ┌─────────────────┐
                                     │  Web Browser    │
                                     └────────┬────────┘
                                              │ fetch /api/*
                                     ┌────────▼────────┐
                                     │ React Frontend  │ ◀── Vite :5173 (dev), nginx :8088 (Docker)
                                     └────────┬────────┘
                                              │
                                     ┌────────▼────────┐
                                     │   API Gateway   │ ◀── JWT validate, CORS, rate-limit
                                     │   (8080)        │     route lb://service-name
                                     └────────┬────────┘
                                              │
              ┌───────────────┬───────────────┼───────────────┬───────────────┐
              ▼               ▼               ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ Identity │    │  Tour    │    │ Booking  │    │ Payment  │    │  Review  │
        │  :8081   │    │  :8082   │    │  :8083   │    │  :8084   │    │  :8086   │
        └─────┬────┘    └─────┬────┘    └─────┬────┘    └─────┬────┘    └─────┬────┘
              │               │               │               │               │
              ▼               ▼               ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ identity │    │   tour   │    │ booking  │    │ payment  │    │  review  │
        │  schema  │    │  schema  │    │  schema  │    │  schema  │    │  schema  │
        └──────────┘    └─────┬────┘    └────┬─────┘    └────┬─────┘    └──────────┘
                              │              │               │
                            Redis            ▼               ▼
                                       ┌────────────────────────┐
                                       │       Kafka            │
                                       │  booking.created       │
                                       │  payment.succeeded     │
                                       │  booking.confirmed     │
                                       └───────────┬────────────┘
                                                   │
                                       ┌───────────▼────────────┐
                                       │   Notification Service │ ◀── Email + Thymeleaf templates
                                       │       :8085            │
                                       └────────────────────────┘

       ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
       │  Discovery   │  │   Config     │  │ Integration  │ ◀── Amadeus, NewsAPI, OpenAI Chat
       │  Eureka 8761 │  │  Server 8888 │  │     :8087    │
       └──────────────┘  └──────────────┘  └──────────────┘

       ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
       │   Zipkin     │  │ Prometheus   │  │   Grafana    │
       │     9411     │  │    9090      │  │     3000     │
       └──────────────┘  └──────────────┘  └──────────────┘
```

## Map từ Monolith → Microservices

| Monolith entity / module | Microservice |
|---|---|
| `NguoiDung`, `SecurityConfig`, `CustomOAuth2UserService`, `AuthController` | **identity-service** |
| `ChuyenDi`, `DiemDen`, `DiemDon`, `LichTrinh`, `NgayKhoiHanh`, `PhuongTien`, `NoiLuuTru`, `QuanLyCho`, `TourService`, `*Specification` | **tour-service** |
| `DatCho`, `ChoXacNhan`, `MaGiamGia`, `CheckInService`, `QrCodeService`, `DatChoService` | **booking-service** |
| `VNPayConfig`, `PaymentController` | **payment-service** |
| `DanhGia`, `YeuThich`, `Contact` + service tương ứng | **review-service** |
| `EmailService`, templates email | **notification-service** |
| `AmadeusClient`, `newsapi`, `ChatService`, `ChatController` | **integration-service** |
| `HomeController`, `controller/user/**`, `controller/admin/**`, `templates/`, `static/` | **frontend/** React SPA |

## Stack

| Layer | Công nghệ |
|---|---|
| Runtime | Java 21, Spring Boot 3.3 |
| Microservice | Spring Cloud 2023 (Gateway, Eureka, Config, OpenFeign), Resilience4j |
| Data | MySQL 8 (DB-per-service), Flyway migrations, Redis (cache + token blacklist) |
| Messaging | Apache Kafka (event-driven, choreography saga) |
| Auth | JWT (HS512) at gateway, OAuth2 (Google) at identity-service |
| Observability | Micrometer Tracing → Zipkin, Micrometer → Prometheus, Grafana dashboards |
| API Docs | springdoc-openapi (Swagger UI per service) |
| Containerization | Docker, docker-compose |

## Saga Flow (Choreography)

**Đặt tour + thanh toán** (eventual consistency, không có 2PC):

```
1. POST /api/bookings                    [Booking Service]
   - Feign call → Tour Service: reserveSeats(scheduleId, qty)  ← atomic UPDATE
   - Save DatCho (status=PENDING) + maCheckIn (UUID)
   - Publish "booking.created" → Kafka

2. Notification Service consume "booking.created"
   - Send email "Vui lòng thanh toán đơn #X"

3. POST /api/payments/vnpay/init         [Payment Service]
   - Save Payment (status=PENDING)
   - Return VNPay redirect URL

4. User pays → VNPay calls /api/vnpay/ipn (HMAC-signed)
   - Verify signature
   - Update Payment.status = SUCCESS/FAILED
   - Publish "payment.succeeded" or "payment.failed" → Kafka

5. Booking Service consume "payment.succeeded"
   - Update DatCho.status = CONFIRMED
   - Publish "booking.confirmed" → Kafka

6. Notification Service consume "booking.confirmed"
   - Send confirmation email + QR ticket

Compensation:
- If reserveSeats fails → BusinessException (no rollback needed)
- If payment.failed → booking-service cancels DatCho + releaseSeats (call tour-service)
```

## Khởi động nhanh

### Yêu cầu
- Java 21
- Docker + Docker Compose
- Maven 3.9+ (hoặc dùng `./mvnw`)

### Cách 1: Full stack với Docker

```bash
cp .env.example .env
# Điền VNPay/Mail credentials vào .env

# Build maven trước (Docker chỉ copy jar)
./mvnw -DskipTests clean package
# hoặc
bash scripts/build-all.sh

docker compose up -d

# Theo dõi logs
docker compose logs -f gateway booking
```

### Cách 2: Local dev (chạy từng service trên IDE)

```bash
# Hạ tầng dùng Docker
docker compose up -d mysql redis kafka zipkin zookeeper prometheus grafana

# Khởi động Java services lần lượt
bash scripts/start-local.sh
# Hoặc Run cấu hình IntelliJ từng module
```

Thứ tự khởi động: `discovery-server` → `config-server` → các service domain → `api-gateway` → `frontend`.

### React frontend (khuyến nghị)

```bash
# Backend đang chạy (Docker hoặc local), sau đó:
cd frontend
npm install
npm run dev
# → http://localhost:5173 (Vite proxy /api → gateway :8080)
```

Production build + Docker:

```bash
cd frontend && npm run build
docker compose up -d frontend   # http://localhost:8088
```

## Endpoints

| Component | URL |
|---|---|
| **React UI (dev)** | http://localhost:5173 |
| **React UI (Docker)** | http://localhost:8088 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Config Server | http://localhost:8888 (basic auth: configuser/configpass) |
| Zipkin | http://localhost:9411 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |
| Swagger UI (mỗi service) | http://localhost:808X/swagger-ui.html |

## Test API

```bash
# 1. Đăng ký
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456","tenDangNhap":"user","hoTen":"Test User"}'

# 2. Lấy access token từ response, gắn vào header
TOKEN="..."

# 3. Browse tours (public)
curl http://localhost:8080/api/tours/featured

# 4. Đặt tour
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idChuyenDi":1,"idNgayKhoiHanh":1,"soLuong":2,"hoTen":"NV A","email":"a@b.c","soDienThoai":"0900"}'

# 5. Init payment
curl -X POST http://localhost:8080/api/payments/vnpay/init \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":1,"amount":2000000}'
# → redirectUrl trỏ tới sandbox VNPay
```

## Production Checklist

- [ ] Thay `JWT_SECRET` bằng giá trị random >= 256-bit
- [ ] Bật TLS cho mọi service (TLS termination tại gateway hoặc service mesh)
- [ ] Thay MySQL root password
- [ ] Đặt `DDL_AUTO=validate` (đã set) + Flyway sản phẩm
- [ ] Cấu hình Kubernetes NetworkPolicy: internal services chỉ accept traffic từ gateway
- [ ] Idempotency key trên `POST /api/bookings` (header `Idempotency-Key`)
- [ ] Outbox pattern cho Kafka publish (đảm bảo exactly-once)
- [ ] Schema Registry (Confluent) thay vì JSON tự do
- [ ] OpenTelemetry Collector → vendor (Datadog, NewRelic, Tempo)
- [ ] Centralized logging (Loki/ELK) thay vì stdout
- [ ] HPA (Horizontal Pod Autoscaler) trên CPU + custom metric

## Cấu trúc thư mục

```
distribute_project/
├── pom.xml                      # Parent POM (BOM, plugin mgmt)
├── docker-compose.yml
├── .env.example
├── common-lib/                  # Shared DTOs, exceptions, JWT, event schema
├── discovery-server/            # Eureka :8761
├── config-server/               # Spring Cloud Config :8888
├── api-gateway/                 # Spring Cloud Gateway :8080
├── identity-service/            # NguoiDung + JWT + OAuth2 :8081
├── tour-service/                # Tour catalog + schedule + seats :8082
├── booking-service/             # DatCho + check-in QR + Kafka :8083
├── payment-service/             # VNPay :8084
├── notification-service/        # Email + Kafka consumer :8085
├── review-service/              # DanhGia + YeuThich + Contact :8086
├── integration-service/         # Amadeus + News + OpenAI :8087
├── frontend/                    # React SPA (Vite) — UI gọi gateway
├── config-repo/                 # Properties cho Config Server
├── monitoring/
│   ├── prometheus/
│   └── grafana/
└── scripts/
    ├── build-all.sh
    ├── start-local.sh
    └── init-databases.sql
```

## Tài khoản mặc định (sau khi seed)

| Username | Password | Role |
|---|---|---|
| admin@bookingtour.com | admin123 | ADMIN |
