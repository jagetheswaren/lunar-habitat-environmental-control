# Multi-stage Dockerfile for Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure
# Stage 1: Build JAR using Maven and OpenJDK 17
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-root system user for secure lunar operations
RUN groupadd -r lunar && useradd -r -g lunar lunar

# Copy compiled executable JAR
COPY --from=builder /app/target/lunar-habitat-*.jar /app/lunar-habitat.jar
RUN chown -R lunar:lunar /app

USER lunar:lunar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/lunar-habitat.jar"]
