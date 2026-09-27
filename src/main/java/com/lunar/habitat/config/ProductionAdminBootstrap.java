package com.lunar.habitat.config;

import com.lunar.habitat.entity.Role;
import com.lunar.habitat.entity.User;
import com.lunar.habitat.repository.RoleRepository;
import com.lunar.habitat.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Production Administrator Bootstrap Component.
 * Securely provisions the root operations administrator if ADMIN_USERNAME and ADMIN_PASSWORD
 * are injected via environment variables. Does not overwrite existing accounts.
 * Never logs credentials.
 */
@Component
public class ProductionAdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductionAdminBootstrap.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    public ProductionAdminBootstrap(UserRepository userRepository,
                                    RoleRepository roleRepository,
                                    PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminUsername == null || adminUsername.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        String username = adminUsername.trim();
        if (userRepository.findByUsername(username).isPresent()) {
            log.info("Production administrator account '{}' is already present in persistent storage. Skipping bootstrap.", username);
            return;
        }

        com.lunar.habitat.enums.RoleType adminRoleType = com.lunar.habitat.enums.RoleType.ROLE_ADMIN;
        Role adminRole = roleRepository.findByName(adminRoleType)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(adminRoleType);
                    r.setDescription("System Operations Administrator");
                    return roleRepository.save(r);
                });

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(adminPassword.trim()));
        user.setEmail(username + "@lunar-habitat.ops");
        user.setEnabled(true);

        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        user.setRoles(roles);

        userRepository.save(user);
        log.info("Production administrator account successfully bootstrapped for operator call-sign: '{}' (BCrypt hashed).", username);
    }
}
