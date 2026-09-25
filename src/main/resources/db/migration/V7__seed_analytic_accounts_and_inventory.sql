-- V7__seed_analytic_accounts_and_inventory.sql
-- Seed Analytic Accounts and Initial Resource Inventory Configuration

INSERT INTO analytic_accounts (id, code, name, habitat_zone_id, active) VALUES
(1, 'AN-DOME-ALPHA', 'Analytic Account - Habitat Dome Alpha', 1, TRUE),
(2, 'AN-DOME-BETA', 'Analytic Account - Habitat Dome Beta', 2, TRUE),
(3, 'AN-MOD-RES', 'Analytic Account - Research Module', 3, TRUE),
(4, 'AN-MOD-MINE', 'Analytic Account - Mining Module', 4, TRUE),
(5, 'AN-MOD-AGRI', 'Analytic Account - Agricultural Hydroponics', 5, TRUE);

INSERT INTO resource_inventories (id, resource_name, sku, quantity, unit_of_measure, location, minimum_stock, maximum_stock, last_updated) VALUES
(1, 'Reclaimed Oxygen', 'RES-O2-REC', 4500.0000, 'M3', 'Cryogenic Tank Battery Alpha', 500.0000, 10000.0000, CURRENT_TIMESTAMP),
(2, 'Potable Water', 'RES-H2O-POT', 18500.0000, 'LITER', 'Central Subsurface Reservoir 1', 2000.0000, 50000.0000, CURRENT_TIMESTAMP),
(3, 'CO2 Filter Cartridge', 'EQP-FLT-CART', 45.0000, 'UNIT', 'Life Support Logistics Vault B', 10.0000, 200.0000, CURRENT_TIMESTAMP);
