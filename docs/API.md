# REST API V2 Specification

The Lunar Habitat backend exposes a fully verified, production-ready REST API V2 layer conforming to OpenAPI 3.0 standards.

- **Interactive Swagger UI:** [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
- **OpenAPI JSON Definition:** [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

---

## 🔐 Authentication & Security

All requests to `/api/v2/*` (except `/api/v2/auth/login` and `/api/v2/auth/refresh`) require a Bearer token header:
```http
Authorization: Bearer <access-token>
```

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/api/v2/auth/login` | Authenticate credentials, issue access & refresh JWT tokens | Public |
| `POST` | `/api/v2/auth/refresh` | Rotate access token using valid refresh token | Public |
| `GET` | `/api/v2/auth/me` | Inspect authenticated user identity, authorities, and permissions | Authenticated |
| `POST` | `/api/v2/auth/logout` | Revoke current token and invalidate session | Authenticated |

---

## 🌐 Endpoint Directory

### 1. Operations & Habitat Digital Twin
- `GET /api/v2/dashboard/kpis` — Real-time telemetry KPIs, alert summary, inventory buffer, and financial balances.
- `GET /api/v2/zones` — List all registered 3D habitat zones with spatial coordinates `[x, y, z]` and live statuses.
- `POST /api/v2/zones` — Register a new habitat zone module.
- `GET /api/v2/zones/{code}` — Retrieve single zone digital twin specification.
- `GET /api/v2/lunar-core/health` — Retrieve deterministic LUNAR CORE stability score (0-100) and subsystem telemetry metrics.

### 2. Environmental Life-Support & Telemetry
- `POST /api/v2/telemetry` — Ingest live sensor telemetry payload (triggers threshold evaluation & scrubber actuation).
- `GET /api/v2/telemetry/latest` — Fetch the most recently ingested telemetry packet across habitat zones.
- `GET /api/v2/telemetry/stream` — Server-Sent Events (SSE) streaming endpoint for live telemetry broadcasting.
- `GET /api/v2/thresholds` — Retrieve operational thresholds for pressure, temperature, humidity, CO₂, and water purity.
- `POST /api/v2/thresholds` — Configure warning/critical limits for an environmental parameter.
- `GET /api/v2/alerts` — Query active and historical environmental threshold breach alerts.
- `POST /api/v2/alerts/{id}/acknowledge` — Acknowledge an open alert (transitions status to `ACKNOWLEDGED`).
- `POST /api/v2/alerts/{id}/resolve` — Resolve an acknowledged alert with operator mitigation notes.

### 3. Supply Chain & Commercial ERP
- `GET /api/v2/contacts` — Query registered external suppliers and research institution customers.
- `GET /api/v2/products` — Catalog of consumable goods (Reclaimed O₂, Potable H₂O) and maintenance services.
- `GET /api/v2/inventory` — Resource inventory levels, reorder buffers, and current reserves.
- `POST /api/v2/inventory/adjust` — Inward/outward stock movement adjustment.
- `GET /api/v2/maintenance` — Scheduled and completed life-support equipment servicing records.
- `POST /api/v2/purchase-orders` — Create PO (`DRAFT`).
- `POST /api/v2/purchase-orders/{id}/submit` — Submit PO for administrative authorization.
- `POST /api/v2/purchase-orders/{id}/approve` — Approve PO and initiate procurement delivery.
- `POST /api/v2/vendor-bills/from-po/{poId}` — Generate vendor bill from approved PO.
- `POST /api/v2/vendor-bills/{id}/post` — Post vendor bill to Accounts Payable General Ledger.
- `POST /api/v2/sales-orders` — Create commercial resource order (`DRAFT`).
- `POST /api/v2/sales-orders/{id}/confirm` — Confirm resource utility order (`CONFIRMED`).
- `POST /api/v2/invoices/from-so/{soId}` — Generate customer invoice from confirmed sales order.
- `POST /api/v2/invoices/generate-from-telemetry` — Automatically compute metered O₂/H₂O consumption into invoice.
- `POST /api/v2/invoices/{id}/post` — Post customer invoice to Accounts Receivable General Ledger.
- `POST /api/v2/payments` — Record customer payment or vendor disbursement and reconcile invoice balances.

### 4. Strict Double-Entry Financial Accounting
- `GET /api/v2/accounts` — Chart of accounts hierarchy (Asset, Liability, Equity, Revenue, Expense).
- `POST /api/v2/journals` — Post manual double-entry journal entry ($\sum \text{Debit} = \sum \text{Credit}$).
- `GET /api/v2/journals/entries` — Query General Ledger audit trail and verify debit/credit balance.
- `POST /api/v2/budgets` — Establish fiscal year operational budget allocations.
- `GET /api/v2/budgets/analysis` — Compute real-time budget versus actual GL variance.
- `GET /api/v2/reports/balance-sheet` — Full Balance Sheet ($Assets = Liabilities + Equity$).
- `GET /api/v2/reports/profit-loss` — Income statement ($Net Income = Revenues - Expenses$).
- `GET /api/v2/reports/general-ledger` — Complete journal entry transaction ledger.
