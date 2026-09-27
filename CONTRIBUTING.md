# Contributing to Autonomous Lunar Habitat Infrastructure

Thank you for your interest in contributing to the **Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure**!

## Development Workflow

### Prerequisites
- Java 17 LTS (OpenJDK / Eclipse Temurin)
- Maven 3.8+
- Node.js 20 LTS & npm
- MySQL 8.0+ (or use the built-in embedded H2 in MySQL mode for development)

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/jagetheswaren/lunar-habitat-environmental-control.git
   cd lunar-habitat-environmental-control
   ```

2. Backend execution:
   ```bash
   mvn clean test
   mvn spring-boot:run
   ```
   The backend will be available at `http://localhost:8081`.

3. Frontend execution:
   ```bash
   cd frontend
   npm ci
   npm run dev
   ```
   The frontend Mission Control console will run at `http://localhost:5173`.

### Branching Strategy
- `main`: Production-ready, stable codebase.
- Feature branches: `feat/<feature-name>`, `fix/<bug-name>`, or `refactor/<name>`.
- All pull requests must pass both `Java CI with Maven` and `Frontend CI` workflows prior to merge.

### Pre-commit Verification
Before opening a pull request, ensure all tests and builds pass:
```bash
# Backend checks
mvn clean test
mvn clean package

# Frontend checks
cd frontend
npm ci
npm run typecheck
npm run lint
npm run build
```
