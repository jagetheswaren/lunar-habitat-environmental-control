# Changelog

All notable changes to the Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-09-27

### Added
- dedicated Digital Twin inspection page (`/digital-twin`) with multi-angle technical framing, live status badges, environmental telemetry dossier, active alert triage, and preventative maintenance schedules
- refined operational UI components (high-density `DataTable`, `StatusBadge`, `MetricCard`, `PageHeader`, `Header`, `Sidebar`)

### Changed
- Taste Skill mission-control design system: migrated from arbitrary purple/neon SaaS styling to deep graphite/lunar black substrates (`#0B0E14`), charcoal command panels (`#111622`), 1px razor borders (`#1E2638`), and restrained cyan/emerald/amber state accents
- telemetry and alert presentation: tabular monospace numeric readouts, time-range selectors, threshold guide lines, and severity KPI counters
- application shell/navigation: logical aerospace grouping (MISSION, LIFE SUPPORT, OPERATIONS, FINANCE, SYSTEM) with clean Lucide icons (0 emojis)
- resource/maintenance/finance UI density: compact technical grids, safety stock reserve percentage bars, and preventative maintenance timelines

### Fixed
- React module resolution and Vite JSX runtime configuration
- Lucide icon import resolution across all components
- Three.js type definitions resolution
- Java Language Server memory configuration (`-Xms512m -Xmx4g -XX:+UseG1GC`) with heavy directory watcher exclusions

### Verified
- Java CI with Maven (GitHub Actions)
- Frontend CI (GitHub Actions)
- JUnit 5 test suite (27/27 passed)
- Newman V2 API test suite (72/72 requests, 141/141 assertions passed)
- production frontend build (`tsc && vite build`)

## [2.0.0] - 2026-09-27

### Added
- **Mission Control V2 Frontend:** Modern React 18, TypeScript, and Tailwind CSS operation console with 24 pages covering telemetry, alerts, life-support, procurement, billing, inventory, maintenance, budgets, and financial reporting.
- **3D Digital Twin:** Interactive WebGL/Three.js multi-module lunar surface installation model with animated camera zoom, module selection HUD, and live telemetry overlays.
- **LUNAR CORE Intelligence:** Algorithmic habitat stability index computation (0-100) and context-grounded diagnostics engine.
- **Real-Time Telemetry Streaming:** Dual-mode real-time telemetry streaming via Server-Sent Events (`/api/v2/telemetry/stream`) and Spring STOMP WebSockets (`/ws`, `/topic/telemetry`).
- **REST API V2 Layer:** Complete `/api/v2/*` endpoints covering authentication, habitat zones, telemetry, alerts, and executive reporting.
- **CI/CD Automation:** Added dedicated `Frontend CI` and `Java CI with Maven` workflows in `.github/workflows/` and automated dependency checking via `dependabot.yml`.
- **Postman / Newman V2 Test Suite:** 21 folders, 72 automated requests, 141 JavaScript test assertions validating end-to-end mission workflows.

### Changed
- Refactored authentication to issue signed JSON Web Tokens (JJWT) with HMAC-SHA256 signature verification and refresh token rotation.
- Updated Balance Sheet reporting in `ReportServiceImpl` to maintain strict double-entry balance ($\sum \text{Debit} = \sum \text{Credit}$) across all posted general ledger entries.
- Modernized habitat zone responses to include 3D spatial coordinates `[x, y, z]` for digital twin synchronization.

### Security
- Cryptographic JWT signature verification enforced on all `/api/*` endpoints.
- In-memory token blacklisting and session revocation implemented on logout.
- Rejection of tampered, malformed, or expired tokens with HTTP 401 Unauthorized.
- Development-only credential warnings and environment-based secret injection for production deployments.

### Fixed
- Resolved missing `HttpStatus` import in `HabitatZoneV2ApiController`.
- Fixed cascading environment variable assignment in automated Postman suites.
- Resolved orphaned background process file locks on node dependencies and configured Java Language Server heap settings.

### Testing
- 27/27 JUnit 5 backend unit and integration tests passing (`BUILD SUCCESS`).
- 72/72 requests and 141/141 assertions passing in Newman V2 API suite (100% pass rate).
- Full TypeScript typecheck (`tsc --noEmit`) and production bundle build verified with 0 errors.
