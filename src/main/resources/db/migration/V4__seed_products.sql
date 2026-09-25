-- V4__seed_products.sql
-- Seed Standard Lunar Habitat Resource Products & Services

INSERT INTO products (id, sku, name, description, product_type, unit_of_measure, unit_price, tax_rate, active) VALUES
(1, 'RES-O2-REC', 'Reclaimed Oxygen', 'Medical and habitat-grade breathable reclaimed oxygen gas', 'GOODS', 'M3', 12.5000, 0.0500, TRUE),
(2, 'RES-H2O-POT', 'Potable Water', 'Filtered and mineralized lunar potable water for crew consumption', 'GOODS', 'LITER', 0.8000, 0.0500, TRUE),
(3, 'SRV-CO2-SCRUB', 'CO2 Scrubber Servicing', 'Certified technical inspection, cleaning and recalibration of scrubber beds', 'SERVICE', 'SERVICE', 250.0000, 0.1000, TRUE),
(4, 'EQP-FLT-CART', 'CO2 Filter Cartridge', 'High-efficiency zeolite chemical absorption replacement cartridge', 'GOODS', 'UNIT', 500.0000, 0.0800, TRUE);
