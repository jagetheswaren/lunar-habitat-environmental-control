# 🌙 Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure

[![Java](https://img.shields.io/badge/Java-17%2B-blue.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Flyway](https://img.shields.io/badge/Flyway-V1--V7-red.svg)](https://flywaydb.org/)
[![Database](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg)](https://www.mysql.com/)
[![Thymeleaf](https://img.shields.io/badge/UI-Thymeleaf%20%2B%20CSS3-green.svg)](https://www.thymeleaf.org/)
[![Swagger](https://img.shields.io/badge/OpenAPI-3.0%20(Swagger%20UI)-brightgreen.svg)](http://localhost:8080/swagger-ui/index.html)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🚀 1. Project Overview & Mission

The **Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure** is an enterprise-grade ERP, life-support monitoring, and resource accounting platform designed for lunar habitat installations (such as Shackleton Basin Dome Alpha). 

Operating in an off-world closed-loop biosphere presents mission-critical challenges:
1. **Biosphere Environmental Safety:** Real-time ingestion of atmospheric pressure, water purity, oxygen levels, and CO₂ concentration with autonomous threshold monitoring and automatic life-support actuator control (e.g. CO₂ scrubber speed adjustments).
2. **Commercial Multi-Tenant Billing:** Commercial tenants (e.g. Lunar Mining Firms) consume life-support utilities (reclaimed oxygen and potable water). The system calculates consumption directly from sensor telemetry and generates automated utility bills based on product master rates.
3. **Double-Entry General Ledger Accounting:** Every commercial transaction (customer invoice, vendor bill, utility payment) automatically generates immutable, balanced double-entry journal entries enforcing the core invariant:
$$\sum \text{Debit} = \sum \text{Credit}$$
4. **Analytic Budgeting & Variance:** Tracks planned capital and operating budgets against real posted transactions by analytic habitat zone to provide live variance reporting.
5. **Biosphere Audit & Executive Reporting:** Dynamic Balance Sheet, Profit & Loss, Budget Variance, Environmental Health Audit, and Resource Reclamation analytics.

---

## 🏛️ 2. Architectural Blueprint & Project Leap Alignment

The system strictly follows the **Project Leap** 3-Day syllabus curriculum:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROJECT LEAP PROGRESSION                        │
├────────────────────┬────────────────────┬──────────────────────────────┤
│       DAY 1        │       DAY 2        │            DAY 3             │
│  REST API & Engine │  JPA, DB & CRUD    │  UI, Validation, Tests & Sec │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ • 20 REST API      │ • MySQL 8+ Schema  │ • Space-Console Thymeleaf UI │
│   Controllers      │ • Flyway V1 - V7   │ • Jakarta Bean Validation    │
│ • Service layer    │ • 26 JPA Entities  │ • Spring Security RBAC       │
│ • DTO validations  │ • 26 Repositories  │ • Global Exception Handling  │
│ • Postman Ready    │ • Double-Entry GL  │ • JUnit 5 + MockMvc Tests    │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

### High-Level Interconnected Domains

```
┌────────────────────────────────────────────────────────────────────────┐
│                LUNAR HABITAT ARCHITECTURAL WORKFLOW                    │
└────────────────────────────────────────────────────────────────────────┘

 [1. OPERATIONS]
  Environmental Sensors / Hardware Telemetry
                     │
                     ▼ (POST /api/v1/lunar/telemetry)
             Telemetry Record
                     │
                     ├──► Dynamic Threshold Engine ──► Critical Alert (if unsafe)
                     │                                      │
                     └──► Scrubber Actuator Trigger ◄───────┘
                                 │
                                 ▼
                     Resource Consumption (O2, H2O)
                                 │
 [2. COMMERCIAL]                 ▼
  Commercial Tenant ◄── Automated Consumption Billing (Invoice Service)
                                 │
                         Customer Invoice
                                 │
                                 ▼ (POST /invoices/{id}/post)
 [3. FINANCE]            Double-Entry Ledger Engine
                                 │
                       General Ledger Entry
                  (DEBIT: 1300 AR | CREDIT: 4000 Revenue)
                                 │
                                 ▼
                     Payment Settlement (Bank Wire)
                  (DEBIT: 1200 Bank | CREDIT: 1300 AR)
                                 │
                                 ▼
                Executive Reports & Variance Analytics
               • Balance Sheet (Assets = Liabilities + Equity)
               • Profit & Loss (Revenue - Expenses = Net)
               • Budget Variance (Actual vs Planned)
               • Operations Dashboard KPIs & Biosphere Audit
```

---

## 💻 3. Technology Stack

| Layer | Component | Specification |
|---|---|---|
| **Language** | Java | Java 17 LTS (Eclipse Temurin / OpenJDK) |
| **Framework** | Spring Boot | 3.4.3 |
| **Persistence** | Spring Data JPA / Hibernate | 6.x ORM with Lazy Loading & Cascades |
| **Migrations** | Flyway | Versioned scripts V1 through V7 |
| **Database** | MySQL | 8.0+ (with H2 in MySQL compatibility for tests) |
| **Security** | Spring Security | Role-Based Access Control (RBAC) + BCrypt Hashing |
| **Validation** | Jakarta Bean Validation | `@NotNull`, `@NotBlank`, `@Positive`, `@Email` |
| **API Docs** | SpringDoc OpenAPI | OpenAPI 3.0 / Swagger UI |
| **Frontend** | Thymeleaf + HTML5 + CSS3 | Space-console dark theme, Chart.js, Vanilla JS |
| **Testing** | JUnit 5 + Mockito + MockMvc | Unit testing + MockMvc Integration testing |
| **Container** | Docker & Compose | Multi-stage Dockerfile + docker-compose |

---

## ⚙️ 4. Master Configuration & Environment Variables

The application uses externalized environment variables with sensible defaults in `src/main/resources/application.properties`:

| Variable | Default Value | Description |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/lunar_habitat?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` | MySQL JDBC Connection URL |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | *(empty / prompt)* | Database password |
| `SERVER_PORT` | `8080` | HTTP Server port |
| `APP_SECRET` | *(internal)* | Secret key for operations |

---

## 🗄️ 5. Database Schema & Flyway Migrations

The database schema is fully managed via Flyway versioned migrations located in `src/main/resources/db/migration/`:

- `V1__initial_schema.sql`: 27 relational tables (roles, users, contacts, products, habitat zones, thresholds, telemetry, alerts, purchase orders, vendor bills, sales orders, invoices, payments, accounts, journals, journal entries, analytic accounts, budgets, audit logs, inventory).
- `V2__seed_roles.sql`: Roles (`ROLE_ADMIN`, `ROLE_HABITAT_OPERATOR`, `ROLE_ACCOUNTANT`, `ROLE_TENANT_USER`, `ROLE_VIEWER`) and bootstrap accounts.
- `V3__seed_accounts.sql`: Standard Chart of Accounts (1000, 1100, 1200, 1300, 2000, 2100, 3000, 4000, 4100, 5000, 5100) and Journals (SLS, PUR, CSH, BNK, GEN).
- `V4__seed_products.sql`: Master catalog (`OXY-RECLAIMED`, `H2O-POTABLE`, `SRV-SCRUBBER`, `FLT-CO2-CRTRG`).
- `V5__seed_thresholds.sql`: Baseline environmental safety thresholds for pressure, purity, CO₂, temperature, humidity.
- `V6__seed_habitat_zones.sql`: Initial Habitat Dome Alpha (`DOME-A`) and associated Analytic Account (`AA-DOME-A`).
- `V7__seed_inventory.sql`: Initial buffer inventory allocations for emergency life-support reserves.

---

## 🔑 6. Core User Roles & Credentials

Default seed credentials created in `V2__seed_roles.sql`:

| Username | Password | Role | Responsibilities |
|---|---|---|---|
| `admin` | `admin123` | `ROLE_ADMIN` | Full system control, CoA configuration, threshold setup, audit trail |
| `operator` | `operator123` | `ROLE_HABITAT_OPERATOR` | Sensor telemetry ingestion, alert resolution, equipment maintenance |
| `accountant` | `accountant123` | `ROLE_ACCOUNTANT` | Purchasing, PO approvals, bills, invoices, ledger entries, payments |
| `tenant` | `tenant123` | `ROLE_TENANT_USER` | View resource consumption, invoices, payment history |
| `viewer` | `viewer123` | `ROLE_VIEWER` | Read-only executive dashboard and financial reports |

---

## 📖 7. API Documentation & Postman Collection

### OpenAPI 3.0 (Swagger UI)
Once started, explore the interactive documentation with live execution capabilities:
- **Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI Schema (JSON):** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Postman Test Suite
Import `Lunar_Habitat_API.postman_collection.json` into Postman. It includes:
1. `Authentication` (Login, Token/Session check)
2. `Contacts Master` (Customers & Vendors CRUD)
3. `Products & Services` (Goods & Services catalog)
4. `Habitat Zones` (Biosphere commission)
5. `Environmental Telemetry` (Nominal & Critical sensor readings)
6. `Environmental Alerts` (Acknowledge & Resolve)
7. `Purchasing Flow` (PO -> Approval -> Vendor Bill -> Post)
8. `Sales & Invoicing` (Automated Telemetry Consumption Billing -> Post Invoice)
9. `Payments & Settlement` (Invoice payment & Ledger entry)
10. `Finance & Ledger` (Chart of Accounts, Journal search, Budgets)
11. `Financial Reports` (Balance Sheet, P&L, Resources, Environment)

---

## 🛠️ 8. How to Build & Run Locally

### Prerequisites
- **Java 17 LTS+** (`java -version`)
- **Maven 3.9+** (`mvn -v`)
- **MySQL 8.0+** running locally on port 3306

### Step 1: Create Database
In MySQL Workbench or command line:
```sql
CREATE DATABASE lunar_habitat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Set Environment Variables & Run
In PowerShell / Command Prompt:
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/lunar_habitat?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"

mvn clean spring-boot:run
```

### Step 3: Access Console
Open [http://localhost:8080](http://localhost:8080) in your browser:
- Log in with `admin` / `admin123` or `operator` / `operator123`.

---

## 🐳 9. Running with Docker Compose

To run the complete platform (Application + MySQL 8.0 Container):

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start services
docker-compose up --build -d

# 3. Inspect health
docker-compose ps
```

Access the application at [http://localhost:8080](http://localhost:8080).

---

## 🧪 10. Automated Testing & Verification

Run the complete test suite:
```bash
mvn test
```

### Test Coverage Highlights:
- **`AccountingEngineServiceTest`**: Verifies double-entry ledger balance ($\text{Debit} = \text{Credit}$), ensures unbalanced transactions throw `UnbalancedJournalException`, and validates automated ledger posting for invoices and payments.
- **`TelemetryServiceTest`**: Validates sensor telemetry ingestion and verifies autonomous invocation of the threshold evaluation engine.
- **`InvoiceServiceTest`**: Tests automated telemetry consumption billing (Oxygen usage $\times$ Price + Water usage $\times$ Price), ensures master product price derivation, and verifies state transition machine (`DRAFT` $\to$ `POSTED` $\to$ `PAID`).
- **`PaymentServiceTest`**: Tests partial payment transitions (`PARTIALLY_PAID`), full settlement (`PAID`), excess payment rejection (`InsufficientPaymentException`), and cash journal postings.
- **`BudgetServiceTest`**: Tests budget variance calculations ($\text{Actual} - \text{Planned}$), variance percentage calculations, and division-by-zero protection.
- **Integration Tests**: `ContactApiControllerTest`, `TelemetryApiControllerTest`, `InvoiceApiControllerTest`, and `ReportApiControllerTest` verify REST endpoints, HTTP status codes, security role enforcement, and JSON serialization using `MockMvc`.

---

## 📊 11. Core Operational & Accounting Rules

1. **Immutable General Ledger**: Journal entries cannot be deleted or modified once posted. Adjustments require explicit reversal entries.
2. **Double-Entry Balance Enforcement**: Any accounting transaction where `Total Debit != Total Credit` triggers a rollback and throws `UnbalancedJournalException`.
3. **Monetary Precision**: All currency amounts and quantities use `BigDecimal` with `DECIMAL(19,4)` precision. Floats or doubles are strictly prohibited in financial paths.
4. **Autonomous Life Support Actuation**: When telemetry readings breach critical thresholds (e.g. pressure $< 95$ kPa or CO₂ $> 1000$ ppm), the system flags `scrubberAutoAdjusted = true`, creates a `CRITICAL` environmental alert, and records an entry in the immutable audit log.
5. **No Demo Data**: The application starts exclusively with genuine configuration and master data (CoA, products, thresholds, zones). All business transactions are produced through live operations.
