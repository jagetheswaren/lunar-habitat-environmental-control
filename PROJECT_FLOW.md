# PROJECT WORKFLOW & ARCHITECTURAL SPECIFICATION

**Project:** Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure  
**Core Stack:** Java 17 | Spring Boot 3.4.3 | Spring Data JPA | Hibernate | MySQL 8+ | Thymeleaf | Postman | Chart.js  

---

## 1. System Architecture Diagram

The software architecture implements an enterprise-grade multi-tier clean architecture pattern with separation of concerns, transactional boundaries, and input validation:

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                 CLIENT & INTEGRATION TIER                   │
       │   Thymeleaf HTML5 Web UI   /   Postman & Newman REST Test   │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ HTTP Requests (JSON / Forms)
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                   CONTROLLER LAYER (MVC)                    │
       │    Spring MVC Web Controllers   /   @RestController APIs    │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ Inbound Payload Binding
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                 DTO & VALIDATION PIPELINE                   │
       │  Jakarta Bean Validation (@NotNull, @Positive, @NotBlank)   │
       │             Structured Error Handling Responses             │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ Validated Transfer Objects
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                      SERVICE LAYER                          │
       │    @Service Components with Spring @Transactional Boundaries│
       └──────────────────────────────┬──────────────────────────────┘
                                      │ Invariants & Constraints
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                     BUSINESS RULES                          │
       │   • Threshold Evaluation & Alert State Machines             │
       │   • Double-Entry Ledger Invariant: SUM(Debit) == SUM(Credit)│
       │   • Commercial 3-Way Match & Budget Variance Tracking       │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ Managed Entity State
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │               PERSISTENCE TIER (JPA / ORM)                  │
       │     Spring Data JPA Repositories   /   Hibernate ORM 6.6    │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ JDBC / Hikari Connection Pool
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                       DATABASE                              │
       │           MySQL 8+ Relational Database Engine               │
       │     27 Tables Version-Controlled via Flyway (V1 - V7)       │
       └─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Business Workflows

### A. Environmental Life-Support Flow

```text
 ┌────────────────────┐
 │  Sensor Hardware   │
 │ / Ingestion Client │
 └─────────┬──────────┘
           │ POST /telemetry (Pressure, O2, CO2, Temp, Humidity, Water Purity)
           ▼
 ┌────────────────────┐
 │  Telemetry Service │ ──► Saves Telemetry Reading to Database
 └─────────┬──────────┘
           │ Dispatches reading to Threshold Evaluation Engine
           ▼
 ┌────────────────────┐
 │  Threshold Engine  │ ──► Evaluates reading against Zone Target Boundaries
 └─────────┬──────────┘
           │ CO2 > 1000 PPM (Critical Threshold Breach Detected)
           ▼
 ┌────────────────────┐
 │  Alert Dispatcher  │ ──► Creates Environmental Alert in Database
 └─────────┬──────────┘     Status: TRIGGERED | Severity: CRITICAL
           │
           ├──────────────────────────────┬─────────────────────────────┐
           ▼                              ▼                             ▼
 ┌───────────────────┐         ┌────────────────────┐       ┌──────────────────────┐
 │ Human Acknowledge │         │  Scrubber Actuator │       │ Resource Consumption │
 │  & Resolution     │         │ Automated Increase │       │  Calculation Engine  │
 │  (Operator UI)    │         │ of Amine Loop      │       │ (O2 & Water Deltas)  │
 └───────────────────┘         └────────────────────┘       └──────────────────────┘
```

---

### B. Procurement & Vendor Disbursement Flow

```text
 ┌────────────────────┐
 │  Vendor Selection  │ (e.g., Environmental Sensor Vendor)
 └─────────┬──────────┘
           │
           ▼
 ┌────────────────────┐
 │   Purchase Order   │ ──► Status: DRAFT
 └─────────┬──────────┘
           │ Submit & Mission Controller Review
           ▼
 ┌────────────────────┐
 │   Approval Step    │ ──► Status: APPROVED
 └─────────┬──────────┘
           │ Automatically / Manually convert to Vendor Bill
           ▼
 ┌────────────────────┐
 │    Vendor Bill     │ ──► Total: ₹500.00 | Status: DRAFT
 └─────────┬──────────┘
           │ Post to General Ledger
           ▼
 ┌────────────────────┐
 │ Double-Entry Post  │ ──► Journal Entry Created:
 └─────────┬──────────┘     • DEBIT:  Maintenance Expense / Inventory (5000) = ₹500.00
           │                • CREDIT: Accounts Payable / Vendor Creditors (2000) = ₹500.00
           ▼
 ┌────────────────────┐
 │ Cash Disbursement  │ ──► Record Payment via Cash/Bank:
 └────────────────────┘     • DEBIT:  Accounts Payable (2000) = ₹500.00
                            • CREDIT: Cash & Bank Liquid Reserves (1200) = ₹500.00
                            Bill Status transitioned to: PAID
```

---

### C. Commercial Billing & Utility Invoicing Flow

```text
 ┌────────────────────┐
 │ Telemetry Readings │ (Reclaimed Oxygen Generated & Potable Water Distributed)
 └─────────┬──────────┘
           │ Resource consumption computed per Habitat Zone
           ▼
 ┌────────────────────┐
 │    Sales Order     │ ──► Customer: Commercial Lunar Mining Firm
 └─────────┬──────────┘     Status: DRAFT
           │ Confirm Order
           ▼
 ┌────────────────────┐
 │  Confirmed Order   │ ──► Status: CONFIRMED
 └─────────┬──────────┘
           │ Generate Customer Utility Invoice
           ▼
 ┌────────────────────┐
 │  Customer Invoice  │ ──► Line items: Reclaimed O2 + Potable Water + Tax
 └─────────┬──────────┘     Total: ₹1,110.00 | Status: DRAFT
           │ Post to General Ledger
           ▼
 ┌────────────────────┐
 │ Double-Entry Post  │ ──► Journal Entry Created:
 └─────────┬──────────┘     • DEBIT:  Accounts Receivable (1100) = ₹1,110.00
           │                • CREDIT: Life-Support Utility Revenue (4000) = ₹1,110.00
           ▼
 ┌────────────────────┐
 │ Customer Receipt   │ ──► Inflow of Funds recorded in Bank/Cash Register:
 └────────────────────┘     • DEBIT:  Cash & Bank Liquid Reserves (1200) = ₹1,110.00
                            • CREDIT: Accounts Receivable (1100) = ₹1,110.00
                            Invoice Status transitioned to: PAID
```

---

### D. Financial & Managerial Reporting Flow

```text
  Customer Invoices       Vendor Bills         Cash Receipts        Disbursements
         │                      │                    │                     │
         └───────────────┬──────┴────────────────────┴─────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────┐
        │            DOUBLE-ENTRY JOURNAL ENTRIES        │
        │     Invariant: SUM(Debits) == SUM(Credits)     │
        └───────────────────────┬────────────────────────┘
                                │
                                ▼
        ┌────────────────────────────────────────────────┐
        │                 GENERAL LEDGER                 │
        │     Real-Time Trial Balances & Account Totals  │
        └───────────────────────┬────────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│  Balance Sheet   │  │  Profit & Loss   │  │   Budget Variance    │
│                  │  │                  │  │                      │
│ • Total Assets   │  │ • Utility Rev    │  │ • Analytic Accounts  │
│ • Liabilities    │  │ • Maint Expense  │  │ • Planned Allocation │
│ • Habitat Equity │  │ • Net Income     │  │ • Actual vs Variance │
└──────────────────┘  └──────────────────┘  └──────────────────────┘
```

---

## 3. Database Schema Summary

The database consists of 27 tables organized into 3 logical clusters:

| Domain | Entity Tables | Key Foreign Keys & Constraints |
|---|---|---|
| **Operations & Biosphere** | `habitat_zones`, `telemetry_readings`, `environmental_thresholds`, `environmental_alerts`, `resource_inventory`, `equipment_maintenance` | `habitat_zone_id` FK, metric threshold bounds, unique zone codes. |
| **Commercial & Trade** | `contacts`, `products`, `purchase_orders`, `po_lines`, `vendor_bills`, `bill_lines`, `sales_orders`, `so_lines`, `invoices`, `invoice_lines`, `payments` | Contact type enum, SKU uniqueness, line item FK cascade rules. |
| **Accounting & ERP** | `chart_of_accounts`, `journals`, `journal_entries`, `journal_lines`, `analytic_accounts`, `budgets` | Account code index, balanced debit/credit checks, FY constraints. |
| **Identity & Auditing** | `users`, `roles`, `user_roles`, `audit_logs` | Username uniqueness, BCrypt hashed passwords, timestamped audit log. |
