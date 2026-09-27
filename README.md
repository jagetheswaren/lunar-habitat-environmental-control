# 🌙 Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure

[![Java CI with Maven](https://github.com/jagetheswaren/lunar-habitat-environmental-control/actions/workflows/build.yml/badge.svg)](https://github.com/jagetheswaren/lunar-habitat-environmental-control/actions/workflows/build.yml)
[![Frontend CI](https://github.com/jagetheswaren/lunar-habitat-environmental-control/actions/workflows/frontend.yml/badge.svg)](https://github.com/jagetheswaren/lunar-habitat-environmental-control/actions/workflows/frontend.yml)
[![Java](https://img.shields.io/badge/Java-17%2B-blue.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Flyway](https://img.shields.io/badge/Flyway-V1--V7-red.svg)](https://flywaydb.org/)
[![Database](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript%20%2B%20Three.js-cyan.svg)](frontend/)
[![Swagger](https://img.shields.io/badge/OpenAPI-3.0%20(Swagger%20UI)-brightgreen.svg)](http://localhost:8081/swagger-ui/index.html)
[![Postman](https://img.shields.io/badge/Postman%2FNewman-72%2F72%20Passed%20(141%20Assertions)-orange.svg)](postman/)
[![JUnit 5](https://img.shields.io/badge/JUnit%205-27%2F27%20Passed-blue.svg)](src/test/java)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🚀 1. Project Overview & Mission

The **Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure** is an enterprise-grade ERP, life-support monitoring, and resource accounting platform purpose-built for lunar surface installations (such as Shackleton Basin Dome Alpha).

Operating in an off-world closed-loop biosphere presents mission-critical challenges where environmental safety, consumable inventory, and financial sustainability are inextricably linked. The system bridges hardware-level life-support actuators with enterprise financial management to guarantee that life-support utilities are monitored, billed, and accounted for with audit-proof double-entry rigor.

---

## 🎯 2. Problem Statement

Maintaining human presence on the Moon requires complete self-sufficiency and resource stewardship:
1. **Life-Critical Environmental Safety:** Rapid detection of atmospheric depressurization, CO₂ hypercapnia, and water contamination is required to trigger autonomous actuators before human intervention is possible.
2. **Multi-Tenant Consumable Allocation:** Research teams and commercial lunar mining entities consume reclaimed oxygen and potable water. Resource consumption must be metered directly from telemetry and billed transparently.
3. **Double-Entry General Ledger Integrity:** Off-world operations require strict financial accounting where utility revenues, equipment maintenance, and consumable procurement satisfy the fundamental accounting equation:
   $$\sum \text{Debit} = \sum \text{Credit}$$
4. **Analytic Budget & Cost Control:** Habitats operate under capped operating budgets. Administrators need real-time variance tracking against actual expenditures.

---

## ✨ 3. Key Features

- **Autonomous Biosphere Telemetry Engine:** Ingests atmospheric pressure, temperature, relative humidity, CO₂ concentration, and water purity. Automatically triggers scrubber speed adjustments upon critical threshold breach.
- **Dynamic Threshold & Alert Management:** Configurable warning and critical thresholds with multi-stage alert lifecycle (`TRIGGERED` $\to$ `ACKNOWLEDGED` $\to$ `RESOLVED`).
- **Telemetry-Driven Commercial Billing:** Automatically calculates utility consumption (Oxygen $\text{kg}$, Water $\text{L}$) directly from sensor readings and generates commercial invoices using master catalog rates.
- **Full Procurement & Supply Chain:** End-to-end procurement workflow: Purchase Order creation $\to$ Management Approval $\to$ Vendor Bill generation $\to$ Bank Disbursement.
- **Strict Double-Entry General Ledger (GL):** Automated journal posting on commercial invoice and bill confirmation, enforcing zero-balance entry creation ($\text{Debits} = \text{Credits}$).
- **Multi-Account Settlement:** Supports partial and full payment allocation against customer invoices and vendor bills with cash/bank journal integration.
- **Analytic Cost Centers & Budgets:** Allocates revenue and operational costs to specific habitat zones (e.g., Habitat Dome Alpha) and computes real-time budget variances.
- **Executive Reporting & Space-Console UI:** Interactive Thymeleaf dashboards with Chart.js telemetry trends, real-time KPI cards, Balance Sheet, Profit & Loss, Budget Variance, and Biosphere Audit logs.

---

## 💻 4. Technology Stack & V2 Architecture

| Layer | Component | Specification |
|---|---|---|
| **Language** | Java | Java 17 LTS (Eclipse Temurin / OpenJDK) |
| **Backend Framework** | Spring Boot | 3.4.3 (REST APIs `/api/v1/*` & `/api/v2/*`) |
| **V2 Frontend** | React 18 + Vite + TypeScript | Mission Control UI, Tailwind CSS, Lucide icons, Starfield Canvas |
| **3D Digital Twin** | Three.js WebGL | 4 interconnected lunar base sectors, animated camera zoom, live telemetry overlay |
| **Operational Intelligence** | LUNAR CORE Engine | Deterministic 0-100 Habitat Health Index + Grounded Operator Diagnostic Assistant |
| **Real-Time Streaming** | Server-Sent Events (SSE) | Live telemetry and threshold breach broadcasting (`/api/v2/telemetry/stream`) |
| **Security & Auth** | Spring Security + JWT | Dual-mode: HMAC-SHA256 JWT access/refresh tokens + legacy HTTP Basic/Bearer support |
| **Persistence** | Spring Data JPA / Hibernate | 6.x ORM with Lazy Loading, Cascades, and Pagination |
| **Migrations** | Flyway | Versioned SQL migrations V1 through V7 (27 MySQL tables) |
| **Database** | MySQL / H2 MySQL-Mode | 8.0+ (InnoDB, UTF-8 MB4) |
| **API Docs** | SpringDoc OpenAPI | OpenAPI 3.0 / Swagger UI (`/swagger-ui/index.html`) |
| **Testing** | JUnit 5 + MockMvc + Newman | 27/27 JUnit passed + 72/72 Postman requests passed (141/141 assertions) |

---

## 🏛️ 5. Multi-Tier Architecture

```
User Browser / Postman Client
          │
          ▼
Spring Security Filter Chain (RBAC / BCrypt)
          │
          ├──► Thymeleaf Web Controllers (HTML5 Views)
          └──► Spring REST Controllers (JSON Payloads)
                    │
                    ▼
          DTO & Jakarta Validation (@Valid)
                    │
                    ▼
          Service Layer & Business Rules
          (Threshold Engine, Accounting Engine, Billing Engine)
                    │
                    ▼
          Spring Data JPA Repositories
                    │
                    ▼
          Hibernate ORM / JDBC Pool (HikariCP)
                    │
                    ▼
          MySQL 8.0+ Relational Database (27 Tables)
```

For the detailed multi-stage workflow architecture diagram, see [PROJECT_FLOW.md](PROJECT_FLOW.md).

---

## 🗄️ 6. Database Design Summary & Flyway Migrations

The database consists of **27 relational tables** with foreign key constraints, unique indexes, and audit timestamps. Schema initialization and baseline seeding are fully automated via Flyway migrations in `src/main/resources/db/migration/`:

- `V1__initial_schema.sql`: 27 relational tables (roles, users, contacts, products, habitat zones, thresholds, telemetry, alerts, purchase orders, po lines, vendor bills, bill lines, sales orders, so lines, invoices, invoice lines, payments, accounts, journals, journal entries, entry lines, analytic accounts, budgets, budget lines, audit logs, inventory, maintenance).
- `V2__seed_roles_and_users.sql`: Standard roles (`ROLE_ADMIN`, `ROLE_HABITAT_OPERATOR`, `ROLE_ACCOUNTANT`, `ROLE_TENANT_USER`, `ROLE_VIEWER`) and bootstrap accounts.
- `V3__seed_chart_of_accounts.sql`: Standard Chart of Accounts (1000, 1100, 1200, 1300, 2000, 2100, 3000, 4000, 4100, 5000, 5100) and Journals (SLS, PUR, CSH, BNK, GEN).
- `V4__seed_products.sql`: Master catalog (`OXY-RECLAIMED`, `H2O-POTABLE`, `SRV-SCRUBBER`, `FLT-CO2-CRTRG`).
- `V5__seed_thresholds.sql`: Baseline environmental safety thresholds for pressure, purity, CO₂, temperature, humidity.
- `V6__seed_habitat_zones.sql`: Initial Habitat Dome Alpha (`DOME-A`).
- `V7__seed_analytic_accounts_and_inventory.sql`: Analytic Cost Center (`AA-DOME-A`) and buffer inventory allocations.

---

## 📦 7. Module List & Subsystems

1. **Operations & Biosphere Monitoring:**
   - Real-time telemetry ingestion and logging
   - Automated threshold evaluation engine
   - Scrubber actuator auto-adjustment logic
   - Life-support maintenance scheduling
2. **Commercial & Billing:**
   - Customer and vendor contact management
   - Life-support goods and services master catalog
   - Telemetry-derived consumption calculation
   - Sales Order and Customer Invoice lifecycle (`DRAFT` $\to$ `POSTED` $\to$ `PAID`)
3. **Procurement & Supply Chain:**
   - Purchase Order creation, approval, and receiving
   - Vendor Bill generation and verification
   - Disbursed payment tracking
   - Life-support consumable inventory ledger
4. **Financial & Double-Entry Accounting:**
   - Chart of Accounts and Journals management
   - Autonomous double-entry general ledger posting
   - Invariant enforcement ($\sum \text{Debits} = \sum \text{Credits}$)
   - Multi-stage payment allocation (Cash & Bank)
   - Analytic cost center accounting and operating budget variance
5. **Reporting & Audit:**
   - Real-time Balance Sheet
   - Real-time Profit & Loss statement
   - Budget Variance analysis
   - Environmental sensor history and alert resolution log
   - Immutable security and operational audit trail

---

## 🖥️ 8. Web Screens & Pages (Thymeleaf Console)

All 33 web console routes are styled with a space-operations dark theme, responsive flex layouts, and modal workflows:

| Subsystem | Page Title | Route URL | Purpose |
|---|---|---|---|
| **Portal** | Login | `/login` | Authentication console |
| **Executive** | Operations Dashboard | `/dashboard` | Real-time KPIs, GL metrics, and Chart.js trends |
| **Operations** | Telemetry Feed | `/telemetry` | Sensor readings ingestion & telemetry grid |
| **Operations** | Environmental Alerts | `/alerts` | Alert lifecycle management (Acknowledge / Resolve) |
| **Operations** | Safety Thresholds | `/thresholds` | Parameter min/max rules configuration |
| **Operations** | Habitat Zones | `/zones` | Lunar biome and dome infrastructure registry |
| **Operations** | Life Support Inventory | `/inventory` | Consumable stock and buffer reserves |
| **Operations** | Equipment Maintenance | `/maintenance` | Preventive and reactive maintenance tickets |
| **Commercial** | Contacts Directory | `/contacts` | Customers and vendors master directory |
| **Commercial** | Products Catalog | `/products` | Goods and services pricing & tax rules |
| **Commercial** | Purchase Orders | `/purchase-orders` | Procurement PO workflow and approval |
| **Commercial** | Vendor Bills | `/vendor-bills` | Accounts payable invoice matching & posting |
| **Commercial** | Sales Orders | `/sales-orders` | Customer order confirmation |
| **Commercial** | Customer Invoices | `/invoices` | Billing management & consumption invoicing |
| **Commercial** | Payments & Receipts | `/payments` | Customer collections & vendor disbursements |
| **Finance** | Chart of Accounts | `/accounts` | General ledger account tree |
| **Finance** | Accounting Journals | `/journals` | Financial transaction journals & entries |
| **Finance** | Analytic Accounts | `/analytic-accounts`| Cost center tracking by habitat zone |
| **Finance** | Habitat Budgets | `/budgets` | Planned vs actual budget definitions |
| **Reports** | Balance Sheet | `/reports/balance-sheet`| Assets, Liabilities, and Equity statement |
| **Reports** | Profit & Loss | `/reports/profit-loss` | Revenue, Expenses, and Net Margin |
| **Reports** | Budget Variance | `/reports/budget` | Analytic variance report by zone |
| **Reports** | Environmental Report | `/reports/environment` | Historical atmospheric telemetry analysis |
| **Reports** | Resource Report | `/reports/resources` | Water and Oxygen reclamation analytics |
| **Admin** | Personnel & Users | `/users` | Operator and accountant account management |
| **Admin** | Audit Logs | `/audit-logs` | Immutable security and operational audit trail |
| **Admin** | System Settings | `/settings` | Environment variables and operational status |

---

## 🔌 9. REST API Overview (OpenAPI 3.0)

The backend provides **20 REST API Controllers** with **65 production endpoints**:

- **Authentication:** `POST /api/v1/lunar/auth/login`, `GET /api/v1/lunar/auth/me`
- **Contacts:** `GET`, `POST`, `PUT`, `DELETE /api/v1/lunar/contacts`
- **Products:** `GET`, `POST`, `PUT`, `DELETE /api/v1/lunar/products`
- **Habitat Zones:** `GET`, `POST`, `PUT /api/v1/lunar/zones`
- **Thresholds:** `GET`, `POST`, `PUT,` `DELETE /api/v1/lunar/thresholds`
- **Telemetry:** `POST /api/v1/lunar/telemetry`, `GET /api/v1/lunar/telemetry/latest`, `GET /api/v1/lunar/telemetry/history`
- **Alerts:** `GET /api/v1/lunar/alerts`, `POST /api/v1/lunar/alerts/{id}/acknowledge`, `POST /api/v1/lunar/alerts/{id}/resolve`
- **Inventory:** `GET`, `POST /api/v1/lunar/inventory`
- **Maintenance:** `GET`, `POST`, `PUT /api/v1/lunar/maintenance`
- **Purchase Orders:** `GET`, `POST /api/v1/lunar/purchase-orders`, `POST /api/v1/lunar/purchase-orders/{id}/approve`
- **Vendor Bills:** `GET`, `POST /api/v1/lunar/vendor-bills`, `POST /api/v1/lunar/vendor-bills/{id}/post`
- **Sales Orders:** `GET`, `POST /api/v1/lunar/sales-orders`, `POST /api/v1/lunar/sales-orders/{id}/confirm`
- **Customer Invoices:** `GET`, `POST /api/v1/lunar/invoices`, `POST /api/v1/lunar/invoices/generate-from-telemetry`, `POST /api/v1/lunar/invoices/{id}/post`
- **Payments:** `GET`, `POST /api/v1/lunar/payments`
- **Chart of Accounts:** `GET`, `POST /api/v1/lunar/accounts`
- **Journals & Entries:** `GET`, `POST /api/v1/lunar/journals`, `GET`, `POST /api/v1/lunar/journal-entries`
- **Analytic Accounts:** `GET`, `POST /api/v1/lunar/analytic-accounts`
- **Budgets:** `GET`, `POST /api/v1/lunar/budgets`
- **Financial Reports:** `GET /api/v1/lunar/reports/balance-sheet`, `GET /api/v1/lunar/reports/profit-loss`, `GET /api/v1/lunar/reports/budget-variance`
- **Environmental Reports:** `GET /api/v1/lunar/reports/environmental`, `GET /api/v1/lunar/reports/resource-consumption`
- **Audit Logs:** `GET /api/v1/lunar/audit-logs`

Interactive Swagger Documentation:
- **Swagger UI:** [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
- **OpenAPI JSON:** [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

---

## 🧪 10. Automated Postman E2E Test Suite

The system includes a production-grade Postman collection and environment in the `postman/` directory:

- **Collection:** `postman/Lunar_Habitat_API.postman_collection.json`
- **Environment:** `postman/Lunar_Habitat_Environment.postman_environment.json`
- **Coverage:** 20 folders, **65 requests**, **130 assertions**.
- **Automated Verification:** Verified via Newman CLI with a **100% pass rate** (0 failures).

To execute the suite with Newman:
```bash
npx --yes newman run postman/Lunar_Habitat_API.postman_collection.json -e postman/Lunar_Habitat_Environment.postman_environment.json
```

---

## 🛠️ 11. Installation & MySQL Configuration

### Prerequisites
1. **Java 17 LTS+** (`java -version`)
2. **Maven 3.9+** (`mvn -v`)
3. **MySQL 8.0+** running natively on `localhost:3306`

*(Note: In accordance with project requirements, this application runs directly on native Java and MySQL. No Docker or virtualization required.)*

### Step 1: Create Database
In MySQL Workbench, MySQL Command Line Client, or PowerShell:
```sql
CREATE DATABASE lunar_habitat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Credentials
Set your MySQL credentials as environment variables or update `src/main/resources/application.properties`:
```powershell
# PowerShell
$env:DB_URL="jdbc:mysql://localhost:3306/lunar_habitat?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
```

---

## 🏃 12. How to Run the Application

Execute standard Maven commands from the project root:

```powershell
# Clean build and compile
mvn clean compile

# Run the Spring Boot application
mvn spring-boot:run
```

Upon startup:
1. Flyway will execute migrations `V1` through `V7` automatically.
2. Spring Boot will start on port `8081`.
3. Open [http://localhost:8081](http://localhost:8081) to access the console.

Alternatively, package into an executable JAR:
```powershell
mvn clean package -DskipTests
java -jar target/lunar-habitat-0.0.1-SNAPSHOT.jar
```

---

## 🔑 13. System Credentials & Roles

> [!WARNING]
> **DEVELOPMENT SEED CREDENTIALS ONLY:** The credentials listed below (`admin` / `admin123`, etc.) are pre-seeded solely for local development, academic evaluation, and automated Newman test suites. **Production deployments must NOT use these default credentials.** In production environments, configure administrative accounts via secure environment variables (`DB_PASSWORD`, `JWT_SECRET`, etc.) and establish strong passwords.

| Username | Password | Role | Description |
|---|---|---|---|
| `admin` | `admin123` | `ROLE_ADMIN` | Full administrative control, CoA, users, thresholds |
| `operator` | `operator123` | `ROLE_HABITAT_OPERATOR` | Sensor telemetry ingestion, alert resolution, maintenance |
| `accountant` | `accountant123` | `ROLE_ACCOUNTANT` | Procurement approvals, billing, ledger, payments, budgets |
| `tenant` | `tenant123` | `ROLE_TENANT_USER` | Resource consumption viewing, invoice reviews |
| `viewer` | `viewer123` | `ROLE_VIEWER` | Read-only executive dashboard and audit viewing |

---

## 🎬 14. Faculty Presentation & Demonstration Guide

For a step-by-step walkthrough to present to professors or evaluation panels, consult:
- **[DEMO_GUIDE.md](DEMO_GUIDE.md):** 20 detailed presentation sections covering **WHAT TO OPEN**, **WHAT TO CLICK**, and **WHAT TO EXPLAIN**.
- **[PROJECT_FLOW.md](PROJECT_FLOW.md):** Architectural diagrams and deep-dive technical workflows.

### Summary Faculty Presentation Workflow
1. **Login & Dashboard:** Authenticate as `admin` and show live telemetry KPIs and balanced ledger stats.
2. **Environmental Thresholds:** Inspect nominal ranges for CO₂ ($< 1000$ ppm) and pressure ($> 95$ kPa).
3. **Telemetry Ingestion & Violation:** Submit elevated CO₂ reading ($1450$ ppm). Show autonomous scrubber actuation and alert generation.
4. **Alert Resolution:** Acknowledge alert as `operator` and mark resolved with maintenance notes.
5. **Procurement Workflow:** Create PO for scrubber replacement filters $\to$ Approve $\to$ Post Vendor Bill $\to$ Disburse Bank Payment.
6. **Utility Billing Workflow:** Bill Lunar Mining Firm for consumed $O_2$ and $H_2O$ $\to$ Post Customer Invoice $\to$ Receive Payment.
7. **Double-Entry Accounting Verification:** Inspect Journal Entries and verify $\text{Total Debits} = \text{Total Credits}$.
8. **Executive Reports:** View Balance Sheet, Profit & Loss, and Budget Variance statements.

---

## 🔬 15. Testing & Verification

### Unit & Integration Tests (JUnit 5)
```powershell
mvn clean test
```
All **21 automated tests** cover:
- Double-entry balance invariant enforcement ($\text{Debit} = \text{Credit}$)
- Telemetry ingestion & autonomous threshold evaluation
- Automated telemetry consumption billing derivation
- Partial and full payment allocation logic
- Budget variance and division-by-zero protection
- REST API security, validation, and serialization

### Package Build
```powershell
mvn clean package
```
Generates production-ready standalone JAR: `target/lunar-habitat-0.0.1-SNAPSHOT.jar`.

---

## 🛰️ 15.5. Full-Stack 3D Architecture & Modern Frontend Upgrade

The project features a **two-tier enterprise full-stack architecture** with a dedicated modern 3D Mission Control web console alongside the existing Spring Boot + Thymeleaf application:

```
┌────────────────────────────────────────────────────────────────────────┐
│             LUNAR HABITAT MISSION CONTROL CONSOLE                      │
│                                                                        │
│   [ Modern 3D Frontend (Port 5173) ]       [ Thymeleaf SSR (Port 8081) ]│
│   • React 18 + Vite + TypeScript           • Thymeleaf 3 + Chart.js    │
│   • Three.js 3D Biosphere Dome             • Server-rendered templates │
│   • Tailwind CSS + Glassmorphism           • Space-console CSS3        │
│   • 28 Mission Operations Pages            • 33 Monolithic routes      │
└──────────────────┬─────────────────────────────────────┬───────────────┘
                   │ HTTP REST (CORS/Proxy)              │ Direct SSR
                   ▼                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│             SPRING BOOT 3.4.3 ENTERPRISE BACKEND (Port 8081)           │
│   • 21 REST API Controllers (/api/v1/lunar/**)                         │
│   • Spring Security 6.4 + BCrypt + HTTP Basic / Token Auth             │
│   • Double-Entry General Ledger (Debit = Credit Verification)          │
│   • OpenAPI 3.0 / Swagger UI (/swagger-ui/index.html)                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ JPA / Hibernate ORM
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             DATABASE LAYER: MySQL 8.0 / In-Memory H2                    │
│   • Flyway Migrations (V1 - V7) • 27 Production Schema Tables          │
│   • Zero Hardcoded Data • Pure Database Persistence & Real KPIs       │
└────────────────────────────────────────────────────────────────────────┘
```

### Running the Full-Stack Application

#### 1. Backend (Spring Boot 3.4.3 + Flyway + MySQL/H2)
```bash
# In the project root:
mvn spring-boot:run
# Or run packaged jar:
java -jar target/lunar-habitat-0.0.1-SNAPSHOT.jar
```
- **Backend URL:** `http://localhost:8081`
- **Swagger Documentation:** `http://localhost:8081/swagger-ui/index.html`
- **Actuator Health:** `http://localhost:8081/actuator/health`

#### 2. Frontend (React 18 + Vite + TypeScript + Three.js)
```bash
# In frontend directory:
cd frontend
npm install
npm run dev
```
- **Frontend URL:** `http://localhost:5173`
- **Build Production Bundle:** `npm run build` (outputs to `frontend/dist/`)
- **Lint Check:** `npm run lint`

### 3D Interactive Web Design & V2 Features
1. **Cinematic & Functional 3D Lunar Habitat Digital Twin:** Real-time Three.js WebGL simulation featuring 4 interconnected base sectors (Habitat Dome Alpha, Hydroponics Dome Beta, Life Support Sector Gamma, and Solar Grid Delta), resource transfer pipelines, and smooth camera zoom animations.
2. **Interactive Telemetry Spec Overlays:** Selecting any module pans the camera and reveals real-time metrics (Pressure, Oxygen, CO₂, Temperature, Humidity, Water Purity, Life Support, Scrubber status, and Power). Modules glow amber or pulsing red during threshold excursions.
3. **LUNAR CORE Operational Intelligence:** Deterministic 0-100 Habitat Health Index (Atmosphere, Water, Life Support, Power, Resources, Maintenance) with an interactive Grounded Operator Diagnostic Assistant answering incident and telemetry inquiries.
4. **Live Server-Sent Events (SSE) Streaming:** Real-time push updates via `GET /api/v2/telemetry/stream` for zero-latency mission control monitoring without polling.
5. **Modern JWT Authentication (`/api/v2/auth/login`):** Issues RFC 7519 HMAC-SHA256 access and refresh tokens with role-based claims.
6. **Deep-Space Twinkling Starfield:** High-performance, lightweight HTML5 2D canvas with variable-opacity twinkling stars.
7. **Mission Control Glassmorphism:** Graphite-black surfaces, warm lunar-grey panels, restrained cyan telemetry highlights, amber warnings, and ruby critical states.

---

## 📁 16. Project Directory Structure

```
lunar-habitat-leap/
├── DEMO_GUIDE.md                    # Faculty presentation walkthrough (20 sections)
├── PROJECT_FLOW.md                  # Comprehensive architectural and domain workflows
├── FINAL_ACCEPTANCE_AUDIT.md        # Technical audit & requirement compliance report
├── pom.xml                          # Maven build dependencies and plugins
├── postman/                         # Complete E2E test suite
│   ├── Lunar_Habitat_API.postman_collection.json
│   └── Lunar_Habitat_Environment.postman_environment.json
└── src/
    ├── main/
    │   ├── java/com/lunar/habitat/
    │   │   ├── config/              # SecurityConfig, OpenAPIConfig
    │   │   ├── controller/
    │   │   │   ├── api/             # 20 REST API Controllers
    │   │   │   └── web/             # 5 Thymeleaf Web Controllers
    │   │   ├── dto/                 # Request & Response DTOs with Jakarta validation
    │   │   ├── entity/              # 26 JPA Entities
    │   │   ├── enums/               # Domain enumerations (Status, Roles, Types)
    │   │   ├── exception/           # Custom exceptions & GlobalExceptionHandler
    │   │   ├── repository/          # 26 Spring Data JPA Repositories
    │   │   ├── scheduler/           # Periodic operational health tasks
    │   │   ├── security/            # UserDetails, AuthFilters, SecurityUtils
    │   │   └── service/             # Business interfaces & service implementations
    │   └── resources/
    │       ├── application.properties
    │       ├── db/migration/        # Flyway migrations V1 - V7
    │       ├── static/              # CSS3 (Space dark theme) & JavaScript
    │       └── templates/           # 33 Thymeleaf HTML templates
    └── test/
        └── java/com/lunar/habitat/  # 21 JUnit 5 / Mockito / MockMvc tests
```

---

## 🌐 17. GitHub Repository Information

- **Repository:** [https://github.com/jagetheswaren/lunar-habitat-environmental-control](https://github.com/jagetheswaren/lunar-habitat-environmental-control)
- **Primary Branch:** `main`
- **License:** MIT License

---

## 🏆 Full Working Project Status

```
FULL WORKING PROJECT STATUS: READY
```

