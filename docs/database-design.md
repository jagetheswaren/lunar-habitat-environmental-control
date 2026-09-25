# Database Design

The system uses a relational database model implemented in MySQL.
Migrations are managed via Flyway (`V1` to `V7`).

### Core Domains:
1. **Master Data**: `contacts`, `products`, `habitat_zones`, `environmental_thresholds`.
2. **Operations**: `telemetry`, `alerts`, `resource_inventories`, `resource_consumption`.
3. **Commercial**: `sales_orders`, `sales_order_lines`, `purchase_orders`, `purchase_order_lines`, `invoices`, `invoice_lines`, `vendor_bills`.
4. **Finance**: `accounts`, `journals`, `journal_entries`, `journal_entry_lines`, `payments`, `analytic_accounts`, `budgets`.
5. **Security & Audit**: `users`, `roles`, `audit_logs`.

All financial values are stored as `DECIMAL(19,4)` to prevent rounding errors.
