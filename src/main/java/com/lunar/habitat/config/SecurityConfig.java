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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
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
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**", "/login", "/logout", "/h2-console/**")
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin())) // For H2 console if used
            .authorizeHttpRequests(auth -> auth
                // Static resources & documentation & authentication
                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**", "/favicon.ico").permitAll()
                .requestMatchers("/login", "/error").permitAll()
                .requestMatchers("/api/v1/lunar/auth/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                // Operations & Telemetry APIs
                .requestMatchers(HttpMethod.POST, "/api/v1/lunar/telemetry/**").hasAnyRole("ADMIN", "HABITAT_OPERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/lunar/alerts/**").hasAnyRole("ADMIN", "HABITAT_OPERATOR")
                .requestMatchers("/api/v1/lunar/telemetry/**", "/api/v1/lunar/alerts/**").hasAnyRole("ADMIN", "HABITAT_OPERATOR", "VIEWER")

                // Commercial & Accounting APIs
                .requestMatchers("/api/v1/lunar/purchase-orders/**",
                                 "/api/v1/lunar/vendor-bills/**",
                                 "/api/v1/lunar/sales-orders/**",
                                 "/api/v1/lunar/invoices/**",
                                 "/api/v1/lunar/payments/**",
                                 "/api/v1/lunar/journals/**").hasAnyRole("ADMIN", "ACCOUNTANT")

                // Master Data & Budgets APIs
                .requestMatchers(HttpMethod.GET, "/api/v1/lunar/contacts/**",
                                                 "/api/v1/lunar/products/**",
                                                 "/api/v1/lunar/habitat-zones/**",
                                                 "/api/v1/lunar/accounts/**",
                                                 "/api/v1/lunar/budgets/**",
                                                 "/api/v1/lunar/reports/**").authenticated()
                .requestMatchers("/api/v1/lunar/contacts/**",
                                 "/api/v1/lunar/products/**",
                                 "/api/v1/lunar/accounts/**",
                                 "/api/v1/lunar/budgets/**").hasAnyRole("ADMIN", "ACCOUNTANT")

                // Admin-only endpoints
                .requestMatchers("/admin/**", "/api/v1/lunar/thresholds/**", "/api/v1/lunar/audit-logs/**").hasRole("ADMIN")

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
            .httpBasic(Customizer.withDefaults()); // Enables HTTP Basic for Postman testing

        return http.build();
    }
}
