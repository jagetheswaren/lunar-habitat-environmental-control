-- V1__initial_schema.sql
-- Production schema for Autonomous Lunar Habitat Environmental Control & Resource Reclamation Infrastructure

-- 1. Security & Authentication
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 2. Master Data: Contacts, Products, Habitat Zones
CREATE TABLE contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    contact_type VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    address VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    product_type VARCHAR(20) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    unit_price DECIMAL(19,4) NOT NULL,
    tax_rate DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habitat_zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'OPERATIONAL',
    location_description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Environmental Telemetry & Thresholds
CREATE TABLE environmental_thresholds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parameter VARCHAR(50) NOT NULL UNIQUE,
    minimum_value DECIMAL(19,4),
    maximum_value DECIMAL(19,4),
    unit VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    action_description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telemetry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    habitat_zone_id BIGINT NOT NULL,
    atmospheric_pressure_kpa DECIMAL(19,4) NOT NULL,
    water_purity_percent DECIMAL(19,4) NOT NULL,
    oxygen_consumption_m3 DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    water_consumption_liters DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    co2_level_ppm DECIMAL(19,4) NOT NULL DEFAULT 400.0000,
    temperature_celsius DECIMAL(19,4) NOT NULL DEFAULT 22.0000,
    humidity_percent DECIMAL(19,4) NOT NULL DEFAULT 45.0000,
    scrubber_status VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    scrubber_auto_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
    source VARCHAR(20) NOT NULL DEFAULT 'SENSOR',
    status VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telemetry_zone FOREIGN KEY (habitat_zone_id) REFERENCES habitat_zones(id)
);

CREATE TABLE environmental_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    habitat_zone_id BIGINT NOT NULL,
    telemetry_id BIGINT,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    acknowledged_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    CONSTRAINT fk_alerts_zone FOREIGN KEY (habitat_zone_id) REFERENCES habitat_zones(id),
    CONSTRAINT fk_alerts_telemetry FOREIGN KEY (telemetry_id) REFERENCES telemetry(id) ON DELETE SET NULL
);

-- 4. Chart of Accounts & Journals (Finance)
CREATE TABLE accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_code VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    parent_account_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_parent FOREIGN KEY (parent_account_id) REFERENCES accounts(id)
);

CREATE TABLE journals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    journal_type VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE journal_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    journal_number VARCHAR(50) NOT NULL UNIQUE,
    journal_id BIGINT NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    entry_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'POSTED',
    total_debit DECIMAL(19,4) NOT NULL,
    total_credit DECIMAL(19,4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_journal_entries_journal FOREIGN KEY (journal_id) REFERENCES journals(id)
);

CREATE TABLE analytic_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    habitat_zone_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analytic_zone FOREIGN KEY (habitat_zone_id) REFERENCES habitat_zones(id)
);

CREATE TABLE journal_entry_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    analytic_account_id BIGINT,
    description VARCHAR(255),
    debit DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    credit DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    CONSTRAINT fk_jel_entry FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_jel_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT fk_jel_analytic FOREIGN KEY (analytic_account_id) REFERENCES analytic_accounts(id)
);

CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analytic_account_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    fiscal_year INT NOT NULL,
    period VARCHAR(20) NOT NULL,
    planned_amount DECIMAL(19,4) NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_analytic FOREIGN KEY (analytic_account_id) REFERENCES analytic_accounts(id),
    CONSTRAINT fk_budget_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT uq_budget UNIQUE (analytic_account_id, account_id, fiscal_year, period)
);

-- 5. Commercial Purchasing (PO, Vendor Bills)
CREATE TABLE purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    vendor_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    tax DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    total DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    notes VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_vendor FOREIGN KEY (vendor_id) REFERENCES contacts(id)
);

CREATE TABLE purchase_order_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(19,4) NOT NULL,
    unit_price DECIMAL(19,4) NOT NULL,
    tax_rate DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    line_total DECIMAL(19,4) NOT NULL,
    CONSTRAINT fk_pol_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_pol_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE vendor_bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    vendor_id BIGINT NOT NULL,
    purchase_order_id BIGINT,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    tax DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    total DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    paid_amount DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    journal_entry_id BIGINT,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vb_vendor FOREIGN KEY (vendor_id) REFERENCES contacts(id),
    CONSTRAINT fk_vb_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    CONSTRAINT fk_vb_journal FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE vendor_bill_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_bill_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(19,4) NOT NULL,
    unit_price DECIMAL(19,4) NOT NULL,
    tax_rate DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    line_total DECIMAL(19,4) NOT NULL,
    CONSTRAINT fk_vbl_bill FOREIGN KEY (vendor_bill_id) REFERENCES vendor_bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_vbl_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 6. Commercial Sales & Invoicing
CREATE TABLE sales_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    habitat_zone_id BIGINT,
    order_date DATE NOT NULL,
    service_period_start DATE,
    service_period_end DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    tax DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    total DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_so_customer FOREIGN KEY (customer_id) REFERENCES contacts(id),
    CONSTRAINT fk_so_zone FOREIGN KEY (habitat_zone_id) REFERENCES habitat_zones(id)
);

CREATE TABLE sales_order_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sales_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(19,4) NOT NULL,
    unit_price DECIMAL(19,4) NOT NULL,
    tax_rate DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    line_total DECIMAL(19,4) NOT NULL,
    CONSTRAINT fk_sol_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_sol_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    sales_order_id BIGINT,
    habitat_zone_id BIGINT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    subtotal DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    tax DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    total DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    paid_amount DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    journal_entry_id BIGINT,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) REFERENCES contacts(id),
    CONSTRAINT fk_inv_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    CONSTRAINT fk_inv_zone FOREIGN KEY (habitat_zone_id) REFERENCES habitat_zones(id),
    CONSTRAINT fk_inv_journal FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE invoice_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    description VARCHAR(255),
    quantity DECIMAL(19,4) NOT NULL,
    unit_price DECIMAL(19,4) NOT NULL,
    tax_rate DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    line_total DECIMAL(19,4) NOT NULL,
    CONSTRAINT fk_inl_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_inl_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 7. Payments
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    invoice_id BIGINT,
    vendor_bill_id BIGINT,
    contact_id BIGINT NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER',
    status VARCHAR(20) NOT NULL DEFAULT 'RECORDED',
    journal_entry_id BIGINT,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    CONSTRAINT fk_pay_bill FOREIGN KEY (vendor_bill_id) REFERENCES vendor_bills(id),
    CONSTRAINT fk_pay_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
    CONSTRAINT fk_pay_journal FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
);

-- 8. Resource Inventory & Maintenance
CREATE TABLE resource_inventories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    quantity DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    unit_of_measure VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    minimum_stock DECIMAL(19,4) NOT NULL DEFAULT 100.0000,
    maximum_stock DECIMAL(19,4) NOT NULL DEFAULT 10000.0000,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_maintenances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    habitat_zone_id BIGINT NOT NULL,
    equipment_name VARCHAR(150) NOT NULL,
    maintenance_type VARCHAR(30) NOT NULL DEFAULT 'ROUTINE',
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    cost DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maint_zone FOREIGN KEY (habitat_zone_id) REFERENCES habitat_zones(id)
);

-- 9. Audit Logging
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50)
);

-- Indexes for high performance querying
CREATE INDEX idx_telemetry_zone_rec ON telemetry(habitat_zone_id, recorded_at);
CREATE INDEX idx_alerts_status_sev ON environmental_alerts(status, severity);
CREATE INDEX idx_jel_account ON journal_entry_lines(account_id);
CREATE INDEX idx_jel_analytic ON journal_entry_lines(analytic_account_id);
CREATE INDEX idx_invoice_customer ON invoices(customer_id, status);
CREATE INDEX idx_audit_time ON audit_logs(timestamp);
