-- Taramiz Seed Data
-- Realistic Saudi business examples for demo/testing

-- Note: This seed file is for reference. User-specific data is created via the app.
-- Run after migration 001_initial_schema.sql

-- Example seed businesses (for documentation/demo purposes)
-- These represent the 8 industry verticals Taramiz supports:

/*
INDUSTRIES COVERED:
1. Laundry Services (Naseej Laundry Services - Riyadh)
2. Clinics (Al-Shifa Medical Center - Jeddah)
3. Hotels (Diriyah Boutique Hotel - Riyadh)
4. Restaurants (Mazaq Al-Khalij - Dammam)
5. Logistics (Sahara Express Logistics - Jeddah)
6. Maintenance (FixPro Facility Services - Riyadh)
7. Security (Himaya Security Solutions - Khobar)
8. HR Services (Talent Bridge HR - Riyadh)
*/

-- Demo analysis context examples (used by mock AI engine):
COMMENT ON TABLE analyses IS 'AI analysis sessions. Mock engine uses what_they_sell + target_market + location to generate deterministic results.';

-- Pricing reference:
-- Starter: 299 SAR/month
-- Growth: 999 SAR/month  
-- Scale: 2999 SAR/month
