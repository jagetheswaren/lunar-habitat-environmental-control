package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.UserRequest;
import com.lunar.habitat.entity.Role;
import com.lunar.habitat.entity.User;
import com.lunar.habitat.enums.RoleType;
import com.lunar.habitat.repository.RoleRepository;
import com.lunar.habitat.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/lunar/users")
@Tag(name = "Users", description = "User Management and Access Control API")
public class UserApiController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserApiController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @Operation(summary = "List Users", description = "Retrieves all registered system users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get User by ID", description = "Retrieves a user by ID")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create User", description = "Registers a new system user with assigned role")
    public ResponseEntity<User> createUser(@Valid @RequestBody UserRequest request) {
        User existing = userRepository.findByUsername(request.getUsername()).orElse(null);
        if (existing != null) {
            existing.setFullName(request.getFullName());
            existing.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                existing.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(existing));
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getEmail(),
                request.getFullName()
        );

        String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "ROLE_HABITAT_OPERATOR";
        if (!roleStr.startsWith("ROLE_")) {
            roleStr = "ROLE_" + roleStr;
        }

        RoleType roleType = RoleType.valueOf(roleStr);
        Role role = roleRepository.findByName(roleType)
                .orElseGet(() -> roleRepository.save(new Role(roleType, roleType.name())));

        user.setRoles(Set.of(role));
        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
