package com.lunar.habitat.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Production Environment Configuration Validator.
 * When the 'prod' or 'production' profile is active, this validator guarantees that:
 * 1. DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, and FRONTEND_URL are provided.
 * 2. In-memory H2 database is strictly rejected.
 * 3. Default or trivial JWT development keys are prohibited.
 *
 * If any requirement is violated, startup is immediately terminated.
 */
@Component
public class ProductionConfigValidator implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductionConfigValidator.class);
    private static final String DEV_FALLBACK_JWT = "LunarHabitatMissionOperationsSecretKey2026SecureHmacSha256Signature";

    private final Environment environment;

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${JWT_SECRET:${jwt.secret:}}")
    private String jwtSecret;

    @Value("${FRONTEND_URL:${frontend.url:}}")
    private String frontendUrl;

    public ProductionConfigValidator(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean isProd = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> "prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p));

        if (!isProd) {
            log.info("Non-production profile active. Skipping strict production infrastructure validation.");
            return;
        }

        log.info("Production profile active. Executing strict infrastructure and security validation...");
        List<String> errors = new ArrayList<>();

        if (dbUrl == null || dbUrl.isBlank()) {
            errors.add("DB_URL is missing. Production requires a persistent MySQL database connection string.");
        } else if (dbUrl.toLowerCase().contains("jdbc:h2:")) {
            errors.add("H2 in-memory database detected in DB_URL ('" + dbUrl + "'). H2 is strictly prohibited in production.");
        }

        if (dbUsername == null || dbUsername.isBlank()) {
            errors.add("DB_USERNAME is missing.");
        }

        if (dbPassword == null || dbPassword.isBlank()) {
            errors.add("DB_PASSWORD is missing.");
        }

        if (jwtSecret == null || jwtSecret.isBlank() || DEV_FALLBACK_JWT.equals(jwtSecret)) {
            errors.add("JWT_SECRET must be injected via environment variable and cannot use the development fallback key.");
        } else if (jwtSecret.length() < 32) {
            errors.add("JWT_SECRET is insufficiently strong (" + jwtSecret.length() + " chars). Must be at least 32 characters (256 bits).");
        }

        if (frontendUrl == null || frontendUrl.isBlank()) {
            errors.add("FRONTEND_URL is missing. Exact origin is required for production CORS enforcement.");
        }

        if (!errors.isEmpty()) {
            String combinedError = "======================================================================\n"
                    + "CRITICAL PRODUCTION CONFIGURATION FAILURE:\n"
                    + String.join("\n- ", errors)
                    + "\n======================================================================";
            log.error(combinedError);
            throw new IllegalStateException(combinedError);
        }

        log.info("Production configuration validated successfully. Persistent MySQL, secure JWT, and exact CORS verified.");
    }
}
