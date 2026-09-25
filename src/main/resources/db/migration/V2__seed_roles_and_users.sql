-- V2__seed_roles_and_users.sql
-- Seed default roles and authorized system users

INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'System Administrator with full access to master data, users, and audit logs'),
(2, 'ROLE_HABITAT_OPERATOR', 'Habitat Operator responsible for telemetry, environmental thresholds, and alerts'),
(3, 'ROLE_ACCOUNTANT', 'Financial Controller managing commercial orders, invoices, payments, and accounting journals'),
(4, 'ROLE_TENANT_USER', 'Commercial Tenant User with visibility into organization consumption and invoices'),
(5, 'ROLE_VIEWER', 'Read-only observer for telemetry monitoring and public reports');

-- Passwords are hashed with BCrypt.
-- Default password for all seed accounts is: admin123
-- BCrypt hash: $2a$10$xYdhABfm507mQW/Szypt1eRTral0cwDWTwZDmeCfVuWCs8WVGHc5a
INSERT INTO users (id, username, password, email, full_name, enabled, created_at, updated_at) VALUES
(1, 'admin', '$2a$10$xYdhABfm507mQW/Szypt1eRTral0cwDWTwZDmeCfVuWCs8WVGHc5a', 'admin@lunar-habitat.internal', 'Commander Alex Vance', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'operator', '$2a$10$xYdhABfm507mQW/Szypt1eRTral0cwDWTwZDmeCfVuWCs8WVGHc5a', 'operator@lunar-habitat.internal', 'ECLSS Engineer Sarah Chen', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'accountant', '$2a$10$xYdhABfm507mQW/Szypt1eRTral0cwDWTwZDmeCfVuWCs8WVGHc5a', 'accountant@lunar-habitat.internal', 'Chief Comptroller Marcus Brody', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'tenant', '$2a$10$xYdhABfm507mQW/Szypt1eRTral0cwDWTwZDmeCfVuWCs8WVGHc5a', 'liaison@lunar-mining.example', 'Mining Liaison Elena Rostova', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'viewer', '$2a$10$xYdhABfm507mQW/Szypt1eRTral0cwDWTwZDmeCfVuWCs8WVGHc5a', 'observer@un-space.org', 'UN Space Inspector David Kim', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> ROLE_ADMIN
(2, 2), -- operator -> ROLE_HABITAT_OPERATOR
(3, 3), -- accountant -> ROLE_ACCOUNTANT
(4, 4), -- tenant -> ROLE_TENANT_USER
(5, 5); -- viewer -> ROLE_VIEWER
