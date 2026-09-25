-- V6__seed_habitat_zones.sql
-- Seed Core Habitat Zones and Initial System Master Contacts

INSERT INTO habitat_zones (id, code, name, description, status, location_description) VALUES
(1, 'ZONE-DOME-A', 'Habitat Dome Alpha', 'Primary pressurized crew living habitat, dining, and central life support hub', 'OPERATIONAL', 'Sector 1 - North Ridge Rim'),
(2, 'ZONE-DOME-B', 'Habitat Dome Beta', 'Secondary crew quarters, engineering workshops, and medical bay', 'OPERATIONAL', 'Sector 1 - East Basin Terrace'),
(3, 'ZONE-MOD-RES', 'Research Module', 'Scientific laboratories, geology analyzers, and sample storage airlocks', 'OPERATIONAL', 'Sector 2 - Central Crater Lab'),
(4, 'ZONE-MOD-MINE', 'Mining Module', 'Industrial ore staging, regolith processing airlock, and excavator docking', 'OPERATIONAL', 'Sector 3 - South Rim Excavation Site'),
(5, 'ZONE-MOD-AGRI', 'Agricultural Hydroponics Module', 'Hydroponic crop chambers, biomass reclamation, and oxygen generation botanical bay', 'OPERATIONAL', 'Sector 4 - Solar Array Corridor');

INSERT INTO contacts (id, code, name, organization_name, contact_type, email, phone, address, status) VALUES
(1, 'CUST-MINE-01', 'Commercial Lunar Mining Firm', 'Commercial Lunar Mining Firm Corp', 'CUSTOMER', 'accounts@lunar-mining.example', '+00-1000-1000', 'Habitat Dome Alpha, Suite 104', 'ACTIVE'),
(2, 'VEND-SENS-01', 'Environmental Sensor Vendor', 'Orbital Sensor Dynamics Corp', 'VENDOR', 'sales@sensor-vendor.example', '+00-2000-2000', 'Orbital Supply Station Echo-4', 'ACTIVE');
