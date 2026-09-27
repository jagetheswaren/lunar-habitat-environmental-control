# Deployment & Production Readiness Guide

This guide details environment configuration, packaging, and production operations for the Autonomous Lunar Habitat Infrastructure.

---

## ⚙️ Environment Variables

### Backend Configuration (Spring Boot)

| Variable | Required | Default / Description |
|---|---|---|
| `DB_URL` | Yes | `jdbc:mysql://<host>:3306/lunar_habitat?useSSL=false&serverTimezone=UTC` |
| `DB_USERNAME` | Yes | Database user (e.g., `lunar_admin`) |
| `DB_PASSWORD` | Yes | Strong database password (do not leave blank in production) |
| `JWT_SECRET` | Yes | Cryptographic HMAC-SHA256 signing secret (minimum 256 bits / 32 characters) |
| `JWT_ACCESS_EXPIRY` | No | Access token validity in seconds (default: `1800` / 30m) |
| `JWT_REFRESH_EXPIRY` | No | Refresh token validity in seconds (default: `604800` / 7d) |
| `FRONTEND_URL` | No | CORS allowed origin (default: `http://localhost:5173`) |
| `SERVER_PORT` | No | Server HTTP listening port (default: `8081`) |

### Frontend Configuration (React / Vite)

| Variable | Required | Default / Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend REST API base URL (e.g., `http://localhost:8081` or production domain) |
| `VITE_WS_URL` | Yes | Spring WebSocket endpoint (e.g., `http://localhost:8081/ws`) |

---

## 📦 Production Build & Packaging

### 1. Build Backend Executable JAR
```bash
mvn clean package -DskipTests
```
The deployable artifact is generated at:
`target/lunar-habitat-0.0.1-SNAPSHOT.jar`

Run with production variables:
```bash
java -jar -Dspring.profiles.active=prod target/lunar-habitat-0.0.1-SNAPSHOT.jar
```

### 2. Build Frontend Static Assets
```bash
cd frontend
npm ci
npm run build
```
The optimized production bundle is generated in:
`frontend/dist/`
These static assets can be served by NGINX, Cloudflare Pages, AWS S3 / CloudFront, or any standard static web host.

---

## 🔍 Health Checks & Observability

- **Liveness & Readiness Probe:** `http://localhost:8081/actuator/health`
  Returns `{"status": "UP"}` when database and subsystems are operational.
- **Metrics Endpoint:** `http://localhost:8081/actuator/metrics`
- **Application Info:** `http://localhost:8081/actuator/info`
