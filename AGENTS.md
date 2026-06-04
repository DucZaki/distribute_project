# AGENTS.md

## Project Shape
- Spring Boot 3.3.4 / Spring Cloud 2023.0.3 Maven microservices repo targeting Java 21.
- Root `pom.xml` is the reactor for `common-lib`, platform services, and domain services.
- **UI:** React SPA in `frontend/` (Vite, port `5173` dev / `8088` Docker). Browser calls **api-gateway** `:8080` only — no Thymeleaf BFF.
- Service split follows the monolith at `/Users/minhduc/Documents/WorkSpace/Java/BookingTour`: identity, tour, booking, payment, notification, review, integration.

## Build And Verification
- Use `./mvnw -q -DskipTests package` from repo root for a fast reactor build.
- Docker Java images expect jars to exist first; run Maven package before `docker compose up -d`.
- For local startup: infra → `discovery-server` → `config-server` → domain services → `api-gateway` → `frontend` (`npm run dev`).
- MySQL runs on host port `3307` in `docker-compose.yml`; DB-per-service schemas from `scripts/init-databases.sql`.

## Architecture Notes
- `common-lib` owns shared DTOs, JWT helpers, exception handling, security header constants, and Kafka event records/topics.
- `api-gateway` rewrites public `/api/auth/**` and GET `/api/tours/**`; protected routes use `JwtAuthenticationFilter` and forwarded user headers.
- Booking/payment confirmation is event-driven with Kafka topics in `common-lib` (`booking.created`, `payment.succeeded`, `payment.failed`, `booking.confirmed`).
- Flyway migrations live inside each service; seed data (`V2__`, `V3/V4__import_*.sql`) — không dùng Python/shell import.
- Frontend: React + TypeScript only (`frontend/src/`); legacy `public/js/*.js` đã bỏ khỏi `index.html`.
- `config-server` reads `config-repo/` and is secured with basic auth configured in its `application.yml`/security config.

## Cross-Service Contracts
- Gateway JWT validation expects `app.jwt.secret` and issuer `bookingtour` from `api-gateway/src/main/resources/application.yml`; identity must issue matching tokens.
- Authenticated gateway requests are forwarded with `X-User-Id`, `X-User-Email`, and `X-User-Roles`; use `common-lib`'s `SecurityHeaders` constants for these names.
- Shared API responses use `ApiResponse<T>` with `success`, `message`, `data`, `error`, and `timestamp`; shared paging uses `PageResponse<T>`.
