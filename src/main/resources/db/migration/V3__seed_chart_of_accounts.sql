-- V3__seed_chart_of_accounts.sql
-- Seed Standard Chart of Accounts and Journals for Lunar Habitat Accounting

INSERT INTO accounts (id, account_code, account_name, account_type, parent_account_id, active) VALUES
(1, '1000', 'Lunar Habitat Dome Infrastructure', 'ASSET', NULL, TRUE),
(2, '1100', 'Scrubbing Equipment', 'ASSET', NULL, TRUE),
(3, '1200', 'Cash/Bank', 'ASSET', NULL, TRUE),
(4, '1300', 'Accounts Receivable', 'ASSET', NULL, TRUE),
(5, '2000', 'Sensor Vendor Creditors', 'LIABILITY', NULL, TRUE),
(6, '2100', 'Supply Vessel Payables', 'LIABILITY', NULL, TRUE),
(7, '3000', 'Habitat Capital & Retained Earnings', 'EQUITY', NULL, TRUE),
(8, '4000', 'Life-Support Utility Revenue', 'INCOME', NULL, TRUE),
(9, '4100', 'Habitat Lease Income', 'INCOME', NULL, TRUE),
(10, '5000', 'Scrubber Maintenance Expenditures', 'EXPENSE', NULL, TRUE),
(11, '5100', 'Supply Vessel Logistics Expenses', 'EXPENSE', NULL, TRUE);

INSERT INTO journals (id, code, name, journal_type, active) VALUES
(1, 'SLS', 'Customer Invoicing Journal', 'SALES', TRUE),
(2, 'PUR', 'Vendor Procurement Journal', 'PURCHASE', TRUE),
(3, 'BNK', 'Bank Operations Journal', 'BANK', TRUE),
(4, 'CSH', 'Cash Operations Journal', 'CASH', TRUE),
(5, 'GEN', 'General Miscellaneous Journal', 'GENERAL', TRUE);
