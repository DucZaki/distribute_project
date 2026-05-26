# ZakiBooking — React Frontend

SPA gọi **Java backend** qua **API Gateway** (`/api/*`).

## Chạy dev

```bash
# 1. Backend (gateway + services) phải đang chạy
docker compose up -d discovery config gateway identity tour booking payment review

# 2. Frontend
npm install
npm run dev
```

Mở http://localhost:5173 — Vite proxy `/api` → `http://localhost:8080`.

## Build production

```bash
npm run build
npm run preview
```

Hoặc Docker (nginx proxy `/api` → gateway):

```bash
docker compose up -d frontend
# http://localhost:8088
```

## Auth

JWT lưu `localStorage` (`accessToken`, `authUser`). Request protected gửi header:

```
Authorization: Bearer <token>
```

Gateway validate JWT và forward `X-User-Id` tới booking/payment services.

## Cấu trúc

```
src/
  api/          # client gọi gateway
  auth/         # AuthContext, ProtectedRoute
  components/   # Layout, Navbar, TourCard
  pages/        # Home, Tours, Detail, Login, Bookings...
  types/        # ApiResponse, Tour, Booking...
```

## Env

| Biến | Mô tả |
|---|---|
| `VITE_API_URL` | Base API path. Dev: `/api` (proxy). Prod Docker: `/api` (nginx proxy). |
