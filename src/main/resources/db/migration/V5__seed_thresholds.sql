-- V5__seed_thresholds.sql
-- Seed Configurable Environmental Thresholds

INSERT INTO environmental_thresholds (id, parameter, minimum_value, maximum_value, unit, severity, enabled, action_description) VALUES
(1, 'ATMOSPHERIC_PRESSURE', 95.0000, 105.0000, 'kPa', 'CRITICAL', TRUE, 'Activate emergency pressurization buffers and auto-adjust scrubbers'),
(2, 'WATER_PURITY', 95.0000, 100.0000, '%', 'WARNING', TRUE, 'Reroute water lines through secondary catalytic reclamation filters'),
(3, 'CO2_LEVEL', 350.0000, 1000.0000, 'ppm', 'CRITICAL', TRUE, 'Engage emergency scrubber blowers and alert habitat life-support crew'),
(4, 'TEMPERATURE', 18.0000, 26.0000, 'C', 'WARNING', TRUE, 'Adjust radiator coolant flow and cabin heating/cooling manifolds'),
(5, 'HUMIDITY', 30.0000, 60.0000, '%', 'INFO', TRUE, 'Modulate condenser coils and moisture reclaimers');
