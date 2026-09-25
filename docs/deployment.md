# Deployment

The system is containerized and deployable via Docker.

### Running with Docker Compose
1. Ensure Docker is running.
2. Run `docker-compose up -d --build`.
3. The application will be available on `http://localhost:8080`.
4. MySQL will run on `localhost:3306`.

### Manual Deployment
- Ensure Java 17+ and Maven are installed.
- Configure `application-mysql.properties` or set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables.
- Run `mvn spring-boot:run -Dspring-boot.run.profiles=mysql`.
