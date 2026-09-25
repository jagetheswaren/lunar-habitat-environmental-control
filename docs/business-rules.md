# Business Rules

1. **Double-Entry Ledger**: Any posted financial transaction (Invoice, Bill, Payment) must create a balanced Journal Entry where `Total Debit == Total Credit`. Unbalanced entries will throw an `UnbalancedJournalException`.
2. **Billing**: Invoices are generated based on actual `resource_consumption` multiplied by product unit prices defined in master data.
3. **Alerts**: Telemetry readings are evaluated against `environmental_thresholds`. Violations generate alerts of `WARNING` or `CRITICAL` severity and trigger simulated actuator logic.
4. **Inventory**: Negative inventory is prevented.
5. **Audit Trail**: All critical operations (Login, Create, Update, Post, Acknowledge, Pay) are logged immutably in the `audit_logs` table.
