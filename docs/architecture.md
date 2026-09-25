# Architecture

The Lunar Habitat Infrastructure follows a standard layered architecture using Spring Boot:
- **Presentation Layer**: Thymeleaf Controllers (`src/main/resources/templates`) and REST Controllers (`/api/v1/lunar/**`).
- **Service Layer**: Domain services containing business logic for telemetry, accounting, billing, and thresholds.
- **Data Access Layer**: Spring Data JPA Repositories interacting with MySQL.
- **Security**: Spring Security enforcing RBAC (`ADMIN`, `HABITAT_OPERATOR`, `ACCOUNTANT`, `TENANT_USER`, `VIEWER`).
- **Database**: MySQL 8.0+ initialized via Flyway Migrations.
