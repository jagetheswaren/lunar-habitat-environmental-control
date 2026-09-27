package com.lunar.habitat.config;

import com.lunar.habitat.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final com.lunar.habitat.security.BearerTokenAuthFilter bearerTokenAuthFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          com.lunar.habitat.security.BearerTokenAuthFilter bearerTokenAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.bearerTokenAuthFilter = bearerTokenAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin())) // For H2 console if used
            .authorizeHttpRequests(auth -> auth
                // Static resources & documentation & public authentication
                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**", "/favicon.ico").permitAll()
                .requestMatchers("/login", "/error").permitAll()
                .requestMatchers("/api/v1/lunar/auth/login", "/api/v1/lunar/auth/refresh",
                                 "/api/v2/auth/login", "/api/v2/auth/refresh").permitAll()
                .requestMatchers("/api/v1/lunar/auth/me", "/api/v1/lunar/auth/logout",
                                 "/api/v2/auth/me", "/api/v2/auth/logout").authenticated()
                .requestMatchers("/api/v2/telemetry/stream", "/ws/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                // Operations & Telemetry APIs (V1 and V2)
                .requestMatchers(HttpMethod.POST, "/api/v1/lunar/telemetry/**", "/api/v2/telemetry/**").hasAnyRole("ADMIN", "HABITAT_OPERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/lunar/alerts/**", "/api/v2/alerts/**").hasAnyRole("ADMIN", "HABITAT_OPERATOR")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/lunar/alerts/**", "/api/v2/alerts/**").hasAnyRole("ADMIN", "HABITAT_OPERATOR")
                .requestMatchers("/api/v1/lunar/telemetry/**", "/api/v2/telemetry/**",
                                 "/api/v1/lunar/alerts/**", "/api/v2/alerts/**",
                                 "/api/v2/zones/**", "/api/v2/dashboard/**", "/api/v2/lunar-core/**").hasAnyRole("ADMIN", "HABITAT_OPERATOR", "VIEWER", "ACCOUNTANT")

                // Commercial & Accounting APIs (V1 and V2)
                .requestMatchers("/api/v1/lunar/purchase-orders/**", "/api/v2/purchase-orders/**",
                                 "/api/v1/lunar/vendor-bills/**", "/api/v2/vendor-bills/**",
                                 "/api/v1/lunar/sales-orders/**", "/api/v2/sales-orders/**",
                                 "/api/v1/lunar/invoices/**", "/api/v2/invoices/**",
                                 "/api/v1/lunar/payments/**", "/api/v2/payments/**",
                                 "/api/v1/lunar/journals/**", "/api/v2/journals/**").hasAnyRole("ADMIN", "ACCOUNTANT")

                // Master Data, Inventory, Maintenance, Reports (V1 and V2)
                .requestMatchers(HttpMethod.GET, "/api/v1/lunar/contacts/**", "/api/v2/contacts/**",
                                                 "/api/v1/lunar/products/**", "/api/v2/products/**",
                                                 "/api/v1/lunar/zones/**",
                                                 "/api/v1/lunar/habitat-zones/**",
                                                 "/api/v1/lunar/accounts/**", "/api/v2/accounts/**",
                                                 "/api/v1/lunar/budgets/**", "/api/v2/budgets/**",
                                                 "/api/v1/lunar/inventory/**", "/api/v2/inventory/**",
                                                 "/api/v1/lunar/resources/**", "/api/v2/resources/**",
                                                 "/api/v1/lunar/maintenance/**", "/api/v2/maintenance/**",
                                                 "/api/v1/lunar/reports/**", "/api/v2/reports/**").authenticated()
                .requestMatchers("/api/v1/lunar/contacts/**", "/api/v2/contacts/**",
                                 "/api/v1/lunar/products/**", "/api/v2/products/**",
                                 "/api/v1/lunar/zones/**",
                                 "/api/v1/lunar/habitat-zones/**",
                                 "/api/v1/lunar/accounts/**", "/api/v2/accounts/**",
                                 "/api/v1/lunar/inventory/**", "/api/v2/inventory/**",
                                 "/api/v1/lunar/resources/**", "/api/v2/resources/**",
                                 "/api/v1/lunar/maintenance/**", "/api/v2/maintenance/**",
                                 "/api/v1/lunar/budgets/**", "/api/v2/budgets/**").hasAnyRole("ADMIN", "ACCOUNTANT", "HABITAT_OPERATOR")

                // Admin-only endpoints (V1 and V2)
                .requestMatchers("/admin/**",
                                 "/api/v1/lunar/users/**", "/api/v2/users/**",
                                 "/api/v1/lunar/thresholds/**", "/api/v2/thresholds/**",
                                 "/api/v1/lunar/audit-logs/**", "/api/v2/audit-logs/**").hasRole("ADMIN")

                // Web UI pages require authentication
                .requestMatchers("/", "/dashboard/**", "/operations/**", "/commercial/**", "/finance/**", "/reports/**").authenticated()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .addFilterBefore(bearerTokenAuthFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
            .httpBasic(Customizer.withDefaults()); // Enables HTTP Basic for Postman testing

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8081", "http://127.0.0.1:8081"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
