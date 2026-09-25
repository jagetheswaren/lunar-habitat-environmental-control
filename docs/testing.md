# Testing

The project uses JUnit 5, Mockito, and Spring Boot Test for comprehensive testing.

### Running Tests
Execute:
`mvn clean test`

### Critical Paths Tested
- **Accounting Validation**: Ensures debit equals credit.
- **Billing Logic**: Ensures invoices are correctly calculated from telemetry.
- **API Controllers**: Verifies REST endpoints handle DTOs correctly.
- **Service Logic**: Mocks dependencies to verify core business transitions and exception handling.

The build enforces that 0 failures are present before compilation succeeds.
