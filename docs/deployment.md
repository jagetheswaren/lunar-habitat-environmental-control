# 🚀 Lunar Habitat V2.1 — Production Deployment Guide

Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure  
Repository: [github.com/jagetheswaren/lunar-habitat-environmental-control](https://github.com/jagetheswaren/lunar-habitat-environmental-control)  
Release: `v2.1.0` / `v2.1.1`

---

## 📋 1. Architecture Overview

The production architecture consists of two decoupled, high-performance tiers:

1. **Backend API Gateway & Telemetry Daemon (Spring Boot 3.4.3 on Java 17/21 LTS):**
   - RESTful API endpoints (`/api/v1/lunar/*` and `/api/v2/*`)
   - Realtime Server-Sent Events (SSE) stream (`/api/v2/telemetry/stream`)
   - Dual-layer authentication: Cryptographic HMAC-SHA256 JWT tokens + HTTP Basic fallback
   - Flyway database migration runner (V1 through V7)
   - Strict General Ledger double-entry engine and deterministic LUNAR CORE diagnostics
   - Spring Boot Actuator health probes (`/actuator/health`)

2. **Frontend Mission Control Client (React 18 + Vite 6 + TypeScript + Three.js):**
   - Mission Control dark-themed tactical operations dashboard
   - Realtime 3D Digital Twin (Three.js WebGL Geodesic Biosphere & Dome Sectors)
   - Code-split vendor, 3D WebGL, and icon bundles
   - Dynamic API base routing via `VITE_API_URL`
   - Configurable demo credential visibility via `VITE_ENABLE_DEMO_CREDENTIALS`

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC CLOUD ACCESS                      │
│                                                             │
│   Frontend: https://*.trycloudflare.com / GitHub Pages      │
│   Backend:  https://*.trycloudflare.com (HTTPS + WSS)       │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       Static Web Hosting            Public Reverse Proxy
               │                     (Cloudflare / NGINX)
               ▼                               ▼
      ┌─────────────────┐             ┌─────────────────┐
      │  Vite React App │────REST────►│   Spring Boot   │
      │  (3D WebGL Twin)│◄───SSE─────│  (Port: ${PORT})│
      └─────────────────┘             └────────┬────────┘
                                               │
                                       HikariCP Pool
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │   MySQL 8.0+    │
                                      │   (27 Tables)   │
                                      └─────────────────┘
```

---

## ⚙️ 2. Environment Variables Specification

### Backend Variables (`application-prod.properties`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `8081` | HTTP listening port for Spring Boot embedded Tomcat |
| `SPRING_PROFILES_ACTIVE` | Recommended | `prod` | Active Spring profile (`prod` activates strict security & Hikari pool) |
| `DB_URL` | **Yes (Prod)** | — | JDBC connection URL (e.g. `jdbc:mysql://host:3306/lunar_habitat?useSSL=true`) |
| `DB_USERNAME` | **Yes (Prod)** | — | Persistent database user |
| `DB_PASSWORD` | **Yes (Prod)** | — | Strong database password |
| `JWT_SECRET` | **Yes (Prod)** | — | Cryptographically secure 256-bit+ HMAC-SHA256 secret (min. 32 chars) |
| `FRONTEND_URL` | Optional | `https://jagetheswaren.github.io` | Comma-separated allowed CORS origins |

> [!CAUTION]
> In `prod` profile, `JwtTokenProvider` validates `JWT_SECRET` at boot time. If `JWT_SECRET` is unset, blank, or matches the local development fallback, application startup will abort immediately with an `IllegalStateException`.

### Frontend Variables (`.env.production` / CI Build)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Optional | `""` (relative) | Public URL of Backend API Gateway (e.g. `https://api.lunar-habitat.com`) |
| `VITE_WS_URL` | Optional | `""` | Public WebSocket endpoint URL |
| `VITE_ENABLE_DEMO_CREDENTIALS` | Optional | `false` | Set to `false` in production to omit demo credential quick-fill buttons |
| `VITE_BASE_PATH` | Optional | `/` | Asset base path (set to `/lunar-habitat-environmental-control/` for GitHub Pages) |

---

## 🔐 3. Security & Production Hardening

1. **CORS Policy:**
   - Spring Security enforces explicit origin whitelisting:
     - Configured domains via `FRONTEND_URL` (e.g. `https://jagetheswaren.github.io`)
     - Cloudflare Tunnel origins (`https://*.trycloudflare.com`)
     - Localhost dev origins (`http://localhost:5173`, `http://localhost:8081`)
   - Credentials (`Access-Control-Allow-Credentials: true`) are enabled with explicit origins, avoiding insecure wildcard `*` credentials.

2. **Flyway Migrations:**
   - Migrations V1 through V7 execute automatically on application boot.
   - `spring.jpa.hibernate.ddl-auto` is set to `none` in production to prevent schema drift.

3. **Actuator Exposure:**
   - In `prod` profile, only `health` and `info` endpoints are exposed.
   - Health details (`management.endpoint.health.show-details`) are set to `never` to prevent internal infrastructure disclosure.

---

## 📦 4. Building the Production Artifacts

### 1. Build Spring Boot Executable JAR
```bash
mvn clean package -DskipTests
```
The deployable uber-jar is created at:
```text
target/lunar-habitat-0.0.1-SNAPSHOT.jar
```

### 2. Build Frontend Optimized Static Bundle
```bash
cd frontend
npm ci
npm run typecheck
npm run build
```
Production assets are generated in `frontend/dist/` with automated Rollup code splitting:
- `assets/vendor-*.js`: React & ReactDOM runtime
- `assets/three-*.js`: Three.js WebGL 3D Biosphere engine
- `assets/lucide-*.js`: Vector icons
- `assets/index-*.js`: Application logic & route components

---

## 🌐 5. Public Deployment Recipes

### Option A: Cloudflare Zero Trust Tunnel (Recommended for Instant HTTPS/WSS)

Cloudflare Tunnels create encrypted outbound tunnels without opening inbound router/firewall ports or purchasing domain certificates.

1. **Install Cloudflared CLI:**
   Download the latest `cloudflared` binary from [developers.cloudflare.com/cloudflare-one/connections/connect-apps](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps).

2. **Run Backend Tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:8081
   ```
   *Output:*
   ```text
   https://flame-respective-thunder-netscape.trycloudflare.com
   ```

3. **Run Frontend Tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```
   *Output:*
   ```text
   https://slowly-compliance-spend-awards.trycloudflare.com
   ```

### Option B: GitHub Pages (Frontend) + Cloudflare (Backend)

1. Enable GitHub Pages in repository settings:
   - Source: **GitHub Actions**
2. Push changes to `main` with `.github/workflows/deploy-pages.yml`.
3. GitHub Actions automatically packages `frontend/dist` and deploys to:
   ```text
   https://jagetheswaren.github.io/lunar-habitat-environmental-control/
   ```

### Option C: Docker Container Deployment

1. **Build Container:**
   ```bash
   docker build -t lunar-habitat-backend:v2.1 .
   ```

2. **Run with Environment Variables:**
   ```bash
   docker run -d \
     -p 8081:8081 \
     -e SPRING_PROFILES_ACTIVE=prod \
     -e DB_URL="jdbc:mysql://mysql.internal:3306/lunar_habitat?useSSL=true" \
     -e DB_USERNAME="lunar_admin" \
     -e DB_PASSWORD="StrongProductionPassword2026!" \
     -e JWT_SECRET="c2VjdXJlX2x1bmFyX2hhYml0YXRfZW52aXJvbm1lbnRhbF9jb250cm9sX2tleV8yMDI2" \
     -e FRONTEND_URL="https://jagetheswaren.github.io,https://lunar-habitat.pages.dev" \
     --name lunar-backend \
     lunar-habitat-backend:v2.1
   ```

---

## 🩺 6. Verification & Health Probes

Run these commands to verify public operational status:

```bash
# 1. Health Probe
curl -s -i https://flame-respective-thunder-netscape.trycloudflare.com/actuator/health
# Expected: HTTP 200 OK -> {"status":"UP"}

# 2. JWT Authentication
curl -s -X POST https://flame-respective-thunder-netscape.trycloudflare.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Expected: HTTP 200 OK -> Returns JWT accessToken & refreshToken

# 3. 3D Digital Twin Zones Verification
curl -s -H "Authorization: Bearer <TOKEN>" \
  https://flame-respective-thunder-netscape.trycloudflare.com/api/v2/zones
# Expected: HTTP 200 OK -> JSON Array of 5 active habitat zones

# 4. Realtime Telemetry SSE Stream
curl -N -H "Authorization: Bearer <TOKEN>" \
  https://flame-respective-thunder-netscape.trycloudflare.com/api/v2/telemetry/stream
# Expected: HTTP 200 OK -> data: {...} event stream
```
