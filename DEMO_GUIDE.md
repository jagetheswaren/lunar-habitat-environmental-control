# LUNAR HABITAT MISSION CONTROL — FACULTY PRESENTATION & DEMO GUIDE

**Project Title:** Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure  
**Repository:** [lunar-habitat-environmental-control](https://github.com/jagetheswaren/lunar-habitat-environmental-control)  
**Target Environment:** Java 17 | Spring Boot 3.4.3 | MySQL 8+ / H2 In-Memory | Maven | Thymeleaf | Chart.js  

---

## Quick Reference for Demo Day

- **Application URL:** `http://localhost:8080`
- **Login URL:** `http://localhost:8080/login`
- **Swagger / OpenAPI Documentation:** `http://localhost:8080/swagger-ui.html`
- **Demo Credentials:**
  - **Administrator:** `admin` / `admin123` (Clearance: `ROLE_ADMIN`)
  - **Habitat Operator:** `operator` / `admin123` (Clearance: `ROLE_HABITAT_OPERATOR`)
  - **Chief Accountant:** `accountant` / `admin123` (Clearance: `ROLE_ACCOUNTANT`)
  - **Database:** `lunar_habitat` (MySQL 8+ on port 3306)

---

## 20-Step Faculty Presentation Walkthrough

### 1. Project Introduction
- **WHAT TO OPEN:** Browser tab at `http://localhost:8080/login`
- **WHAT TO CLICK:** Point out the station terminal header and the aesthetic lunar mission theme.
- **WHAT TO EXPLAIN:**
  > "Respected faculty, welcome to the demonstration of the Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure. This system simulates a production-grade mission operations and enterprise ERP platform deployed to manage atmospheric life support, resource recycling, procurement, utility billing, and general ledger double-entry accounting for human lunar settlements."

---

### 2. Problem Statement
- **WHAT TO OPEN:** Keep on the Login page or show project abstract.
- **WHAT TO EXPLAIN:**
  > "Operating a closed-loop extraterrestrial habitat presents two critical challenges:
  > 1. **Life-Support Safety:** Gaseous levels (CO2, O2, atmospheric pressure) and water purity must be monitored continuously with zero margin for unhandled threshold breaches.
  > 2. **Financial Viability & Resource Accountability:** Reclaimed oxygen, water, and scrubber consumables must be accounted for using strict commercial double-entry ledger principles so utility bills, vendor contracts, and departmental budgets maintain financial integrity."

---

### 3. Proposed Solution
- **WHAT TO OPEN:** `http://localhost:8080/dashboard` (after login)
- **WHAT TO EXPLAIN:**
  > "We developed a unified, full-stack platform integrating real-time environmental telemetry evaluation with double-entry accounting. When an environmental anomaly occurs, the system triggers alerts, activates scrubber maintenance, generates procurement work orders, records utility consumption, and updates general ledger accounts in real-time."

---

### 4. Technology Stack
- **WHAT TO EXPLAIN:**
  > - **Backend Core:** Java 17, Spring Boot 3.4.3, Maven
  > - **Persistence & ORM:** Spring Data JPA, Hibernate ORM, Flyway database migrations (V1-V7)
  > - **Database:** MySQL 8+ enterprise relational database
  > - **Security:** Spring Security 6, BCrypt password hashing, Role-Based Access Control (RBAC)
  > - **Presentation Layer:** Thymeleaf HTML5, CSS3 Glassmorphism UI, JavaScript, Chart.js
  > - **API & Testing:** OpenAPI 3.0 / Swagger UI, Postman (Newman E2E suite with 65 requests & 130 assertions), JUnit 5, Mockito.

---

### 5. Architecture
- **WHAT TO OPEN:** Show `PROJECT_FLOW.md` architecture diagram.
- **WHAT TO EXPLAIN:**
  > "The application strictly adheres to a multi-tiered Enterprise Java pattern:
  > - **Client Tier:** Thymeleaf Web UI and Postman REST Client
  > - **Controller Tier:** Spring MVC Web Controllers & `@RestController` API endpoints with Jakarta Bean Validation
  > - **Service Tier:** Business logic layer executing automated threshold evaluations and accounting rules
  > - **Repository Tier:** Spring Data JPA abstractions
  > - **Database Tier:** Relational MySQL schema with strict foreign keys, unique constraints, and Flyway versioning."

---

### 6. Database Design
- **WHAT TO OPEN:** MySQL workbench / CLI or explain Flyway migrations.
- **WHAT TO EXPLAIN:**
  > "Our database features 27 relational tables organized into three domain schemas:
  > - **Life Support:** `habitat_zones`, `telemetry_readings`, `environmental_thresholds`, `environmental_alerts`, `resource_inventory`, `equipment_maintenance`.
  > - **Commercial:** `contacts`, `products`, `purchase_orders`, `po_lines`, `vendor_bills`, `bill_lines`, `sales_orders`, `so_lines`, `invoices`, `invoice_lines`, `payments`.
  > - **Accounting:** `chart_of_accounts`, `journals`, `journal_entries`, `journal_lines`, `analytic_accounts`, `budgets`.
  > All schemas are created deterministically via Flyway migrations V1 to V7."

---

### 7. Login & Authentication
- **WHAT TO OPEN:** `http://localhost:8080/login`
- **WHAT TO CLICK:** Enter `admin` and `admin123`, then click **Authenticate Access Key**.
- **WHAT TO EXPLAIN:**
  > "Authentication is handled by Spring Security using DaoAuthenticationProvider with BCrypt encryption. Upon login, the user's role (`ROLE_ADMIN`) is established in the security context, granting clearance to flight control consoles and financial ledgers."

---

### 8. Mission Operations Dashboard
- **WHAT TO OPEN:** `http://localhost:8080/dashboard`
- **WHAT TO CLICK:** Scroll smoothly through the two KPI sections and Chart.js graphs.
- **WHAT TO EXPLAIN:**
  > "The Dashboard reflects **live database metrics**:
  > - **Atmospheric Panel:** Real pressure (101.325 kPa), CO2 level (420 ppm / 1250 ppm), water purity (99.5%), and 24-hour oxygen/water usage.
  > - **Commercial ERP Panel:** Live General Ledger balances including Liquid Cash Reserves (Account 1200), Utility Revenue (Account 4000), and Maintenance Expenses (Account 5000).
  > - **Dynamic Visualizations:** Chart.js plots real chronological telemetry and financial revenue vs expense trends."

---

### 9. Environmental Monitoring & Zones
- **WHAT TO OPEN:** Click **🪐 Habitat Zones** (`/habitat-zones`) in the sidebar.
- **WHAT TO CLICK:** Point to `Habitat Dome Alpha` and show details (Target Pressure: 101.325 kPa, Target O2: 21.0%, Max Capacity: 8 crew).
- **WHAT TO EXPLAIN:**
  > "Each habitat zone represents an isolated pressurized volume with specific target environmental parameters and designated crew capacity."

---

### 10. Safety Threshold Detection
- **WHAT TO OPEN:** Click **⚙️ Safety Thresholds** (`/thresholds`) in the sidebar.
- **WHAT TO CLICK:** Locate the `CO2_LEVEL` threshold for Habitat Dome Alpha.
- **WHAT TO EXPLAIN:**
  > "The threshold engine defines warning (800 ppm) and critical (1000 ppm) boundaries. Any incoming sensor reading exceeding 1000 ppm instantly triggers an automated life-support incident."

---

### 11. Telemetry Ingestion & Real-Time Alert Workflow
- **WHAT TO OPEN:** Click **📡 Telemetry Readings** (`/telemetry`), then click **⚠️ Environmental Alerts** (`/alerts`).
- **WHAT TO CLICK:**
  - In Telemetry, show the reading where CO2 spiked to 1250 ppm.
  - In Alerts, point to the `CRITICAL` alert `Zone [Habitat Dome Alpha] CO2_LEVEL breach: Above maximum threshold`.
  - Click the **Acknowledge** button, then click **Resolve**.
- **WHAT TO EXPLAIN:**
  > "The system automatically evaluated the sensor reading, transitioned the alert state from `TRIGGERED` to `ACKNOWLEDGED` to `RESOLVED`, and logged the mitigation protocol in the immutable audit trail."

---

### 12. Resource Inventory & Scrubber Maintenance
- **WHAT TO OPEN:** Click **🧪 Resource Stock** (`/resources`) and **🛠️ Scrubber Maintenance** (`/maintenance`).
- **WHAT TO CLICK:**
  - View stock levels for Reclaimed Oxygen and Potable Water.
  - View the maintenance schedule for CO2 Scrubber Unit Alpha-1.
- **WHAT TO EXPLAIN:**
  > "Life-support buffer levels are audited by a scheduled background daemon. Following a CO2 breach, a maintenance work order is scheduled to replace the amine filter cartridge."

---

### 13. Procurement Workflow (Purchase Order to Vendor Bill)
- **WHAT TO OPEN:** Click **🛒 Purchase Orders** (`/purchase-orders`) and **📑 Vendor Bills** (`/vendor-bills`).
- **WHAT TO CLICK:**
  - Show PO for vendor `Environmental Sensor Vendor` (₹500.00).
  - Show the status progression: `DRAFT` → `SUBMITTED` → `APPROVED`.
  - In Vendor Bills, show the generated bill `BILL-...` in `POSTED` status.
- **WHAT TO EXPLAIN:**
  > "Procurement follows a rigorous 3-way match ERP workflow. Once approved, the PO generates a Vendor Bill which is posted directly into Accounts Payable."

---

### 14. Customer Billing & Utility Invoicing
- **WHAT TO OPEN:** Click **📋 Sales Orders** (`/sales-orders`) and **🧾 Utility Invoices** (`/invoices`).
- **WHAT TO CLICK:**
  - Show Sales Order `SO-...` for customer `Commercial Lunar Mining Firm` (₹1,110.00).
  - Show the generated Customer Invoice with calculated 8% GST/utility tax.
  - Highlight the **Post to General Ledger** action.
- **WHAT TO EXPLAIN:**
  > "Commercial tenants are billed for reclaimed oxygen and potable water. Posting the invoice creates the receivable and recognizes life-support utility revenue."

---

### 15. Double-Entry Accounting Demonstration (Debit = Credit)
- **WHAT TO OPEN:** Click **📜 General Ledger** (`/journals`).
- **WHAT TO CLICK:** Locate the posted entries for the customer invoice, vendor bill, and cash payments.
- **WHAT TO EXPLAIN:**
  > "Accounting integrity is mathematically verified:
  > - **Customer Invoice:** Debit: *Accounts Receivable (1100)* = Credit: *Life-Support Revenue (4000)*
  > - **Customer Payment:** Debit: *Cash & Bank (1200)* = Credit: *Accounts Receivable (1100)*
  > - **Vendor Bill:** Debit: *Maintenance Expense (5000)* = Credit: *Accounts Payable (2000)*
  > - **Vendor Payment:** Debit: *Accounts Payable (2000)* = Credit: *Cash & Bank (1200)*
  > Notice that on every journal entry, **TOTAL DEBIT = TOTAL CREDIT**."

---

### 16. Budget Management & Cost Centers
- **WHAT TO OPEN:** Click **📊 Budget vs Actuals** (`/budgets`) and **🏷️ Analytic Accounts** (`/analytic-accounts`).
- **WHAT TO CLICK:**
  - In Analytic Accounts, show `Dome Alpha Operations & Reclamation Center`.
  - In Budgets, show the planned ₹100,000.00 allocation and the computed variance percentage.
- **WHAT TO EXPLAIN:**
  > "Analytic cost centers map expenses directly to specific habitat domes, allowing mission controllers to monitor budget burn rates and variance in real-time."

---

### 17. Executive Reports
- **WHAT TO OPEN:** Click **⚖️ Balance Sheet** (`/reports/balance-sheet`) and **📈 Profit & Loss** (`/reports/profit-loss`).
- **WHAT TO CLICK:**
  - On the Balance Sheet, verify `Total Assets = Total Liabilities + Total Equity`.
  - On the Profit & Loss report, verify Net Operating Income = Revenue - Expenses.
- **WHAT TO EXPLAIN:**
  > "Our financial reporting module synthesizes all posted journal entries into IFRS-compliant Balance Sheet and P&L financial statements."

---

### 18. Postman Automated API Verification (Newman Suite)
- **WHAT TO OPEN:** Terminal / IDE test report.
- **WHAT TO EXPLAIN:**
  > "To ensure full API test coverage, we built a comprehensive Postman test suite comprising:
  > - **20 Folders** representing every business module
  > - **65 API Requests** covering CRUD and state machine transitions
  > - **130 Automated JavaScript Assertions** verifying HTTP 200/201, schema compliance, and business invariants
  > - Executed via Newman CLI with **0 failures (100% pass rate)**."

---

### 19. Security & Role-Based Access Control
- **WHAT TO OPEN:** Click **👤 Personnel & Users** (`/users`) and **🔒 Immutable Audit Trail** (`/audit-logs`).
- **WHAT TO CLICK:**
  - View the operator directory showing roles: `ROLE_ADMIN`, `ROLE_HABITAT_OPERATOR`, `ROLE_ACCOUNTANT`.
  - In Audit Logs, demonstrate the immutable log recording timestamps, IP addresses, entity IDs, and user actions.
- **WHAT TO EXPLAIN:**
  > "Security is strictly enforced through Spring Security method security and HTTP request matching. Every state change in the habitat is recorded into an append-only audit trail."

---

### 20. Conclusion & Demonstration Sign-Off
- **WHAT TO EXPLAIN:**
  > "In summary, the Autonomous Lunar Habitat Infrastructure bridges mission-critical life-support operations with enterprise resource accounting. The system is verified through 21 JUnit unit tests, 65 Newman E2E tests, 27 database tables, and 23 interactive Thymeleaf screens. Thank you, and I am now ready to answer any questions!"
