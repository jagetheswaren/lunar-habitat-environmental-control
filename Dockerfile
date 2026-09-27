# ==============================================================================
# LUNAR HABITAT V2.1 — MULTI-STAGE PRODUCTION DOCKERFILE
# Java 17 + Spring Boot 3.4.3 + Hardened Alpine Runtime
# ==============================================================================

# Stage 1: Build JAR using Eclipse Temurin JDK 17
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

# Install maven
RUN apk add --no-cache maven

# Cache dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and compile application
COPY src src
RUN mvn clean package -DskipTests -B

# Stage 2: Hardened, minimal JRE 17 runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root unprivileged runtime user
RUN addgroup -S lunar && adduser -S lunar -G lunar

# Copy compiled JAR from build stage
COPY --from=builder /workspace/target/lunar-habitat-0.0.1-SNAPSHOT.jar app.jar

RUN chown -R lunar:lunar /app

USER lunar

EXPOSE 8081

ENV PORT=8081
ENV SPRING_PROFILES_ACTIVE=prod

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8081}/actuator/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-XX:+UseG1GC", "-jar", "app.jar"]
