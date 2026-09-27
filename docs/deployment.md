# Deployment & Execution Guide

The system runs natively on Java 17 LTS, Maven, and MySQL 8.0+. (Zero Docker dependency required).

### Native Execution
1. Ensure MySQL 8.0+ is running locally on port `3306`.
2. Configure `application-mysql.properties` or set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables:
   ```powershell
   $env:DB_URL="jdbc:mysql://localhost:3306/lunar_habitat?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
   $env:DB_USERNAME="root"
   $env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
   ```
3. Run using Spring Boot Maven plugin:
   ```powershell
   mvn spring-boot:run
   ```
   Or run the standalone packaged JAR:
   ```powershell
   java -jar target/lunar-habitat-0.0.1-SNAPSHOT.jar
   ```
4. The application will be available on `http://localhost:8081`.
5. Swagger / OpenAPI is available on `http://localhost:8081/swagger-ui/index.html`.
