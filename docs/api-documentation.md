# API Documentation

The REST API provides comprehensive endpoints for all business domains.
OpenAPI (Swagger) is configured at `/v3/api-docs` and `/swagger-ui/index.html`.

### Endpoints
- **Auth**: `/api/v1/lunar/auth/**` (Public)
- **Telemetry**: `/api/v1/lunar/telemetry/**`
- **Alerts**: `/api/v1/lunar/alerts/**`
- **Commercial**: `/api/v1/lunar/contacts`, `/api/v1/lunar/invoices`, `/api/v1/lunar/payments`
- **Accounting**: `/api/v1/lunar/accounts`, `/api/v1/lunar/journals`
- **Reports**: `/api/v1/lunar/reports/balance-sheet`, `/api/v1/lunar/reports/profit-loss`

All requests requiring authentication must include the appropriate session cookie or token.
