-- ============================================================
-- NOVATECH MACHINERY — SEED DATA
-- Run AFTER schema.sql
-- ============================================================

-- ============================================================
-- SEO GLOBAL SETTINGS
-- ============================================================
INSERT INTO seo_global (id, site_name, site_url, title_suffix, default_meta_description, default_keywords, default_og_image, twitter_handle)
VALUES (
  'global',
  'Novatech Machinery',
  'https://novatechmachinery.com',
  '| Novatech Machinery',
  'Used industrial machinery, CNC systems, fabrication equipment and production lines sourced by Novatech Machinery.',
  'used machinery, industrial machines, cnc machines, novatech machinery, machine dealers',
  '/images/seo/novatech-default-og.jpg',
  '@novatechmachinery'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ADMIN SETTINGS
-- ============================================================
INSERT INTO admin_settings (id, profile, smtp, tracking, security)
VALUES (
  'global',
  '{"fullName":"Admin Novatech Machinery","phone":"+91 9646255855","email":"admin@novatechmachinery.com"}',
  '{"host":"smtp.gmail.com","port":"587","username":"admin@novatechmachinery.com","password":"","fromEmail":"info@novatechmachinery.com","fromName":"Novatech Machinery","useSsl":false}',
  '{"googleAnalyticsId":"G-P6982NCZTC","metaPixelId":"1254549116261073","microsoftClarityId":"w8fhp8peo"}',
  '{"passwordHash":"","passwordUpdatedAt":null}'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (name, email, phone, role, joined) VALUES
  ('Admin Novatech Machinery', 'admin@novatechmachinery.com', '+91 9646255855', 'Super Admin', '2026-04-06'),
  ('Sales Manager',            'sales@novatechmachinery.com', '+91 9090909090', 'Sales',       '2026-04-11')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- MACHINES (from dummyMachines in lib/api.ts)
-- ============================================================
INSERT INTO machines (id, name, brand, model, serial_number, country_of_origin, price, category, subcategory, condition, stock_status, machine_type, description, specifications, images) VALUES
(
  'MCH-1001', 'Heavy Duty CNC Slant Bed Lathe', 'Doosan', 'Puma GT 2600', 'SN-88342', 'South Korea',
  92000, 'Metal Working Machinery', 'Heavy Duty Lathes', 'Used', 'In Stock', 'CNC',
  'Rigid slant bed lathe for high accuracy turning in medium and heavy production.',
  '[{"key":"Swing","value":"660 mm"},{"key":"Chuck","value":"10 inch"},{"key":"Control","value":"Fanuc i Series"}]',
  ARRAY['https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7']
),
(
  'MCH-1002', 'CNC Gear Hobber', 'Pfauter', 'PE 160', 'SN-20455', 'Germany',
  68000, 'Metal Working Machinery', 'Gear Hobbers', 'Used', 'In Stock', 'Conventional',
  'Gear hobbing machine for repeatable cutting quality and production-grade reliability.',
  '[{"key":"Max Diameter","value":"160 mm"},{"key":"Module","value":"6"},{"key":"Voltage","value":"415V"}]',
  ARRAY['https://images.unsplash.com/photo-1581092918484-8313f4e2dd4e']
),
(
  'MCH-1003', 'UPETROM Heavy-Duty CNC Lathe', 'UPETROM', 'UHD 40', 'SN-45990', 'Romania',
  78000, 'Metal Working Machinery', 'Heavy Duty Lathes', 'Used', 'In Stock', 'CNC',
  'Heavy-duty turning solution built for large shaft and cylindrical components.',
  '[{"key":"Bed Length","value":"4000 mm"},{"key":"Power","value":"22 kW"},{"key":"Max Turning Dia","value":"800 mm"}]',
  ARRAY['https://images.unsplash.com/photo-1581093458791-9f3c3900df4b']
),
(
  'MCH-1004', '4 Rolls Hydraulic Plate Bender', 'Faccin', '4HEL 1264', 'SN-77122', 'Italy',
  126000, 'Metal Working Machinery', 'Bending Machines', 'Used', 'In Stock', 'CNC',
  'Four-roll plate rolling machine for precise bending in fabrication lines.',
  '[{"key":"Rolling Width","value":"3100 mm"},{"key":"Thickness","value":"25 mm"},{"key":"Hydraulic","value":"Yes"}]',
  ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b']
),
(
  'MCH-1005', 'Horizontal Machining Centre', 'Doosan', 'HM 500', 'SN-12001', 'South Korea',
  112000, 'Metal Working Machinery', 'Horizontal Machining Centres', 'Used', 'Limited', 'CNC',
  'Horizontal machining centre suited for continuous multi-face machining operations.',
  '[{"key":"Pallet Size","value":"500 x 500"},{"key":"Tool Capacity","value":"60"},{"key":"Spindle","value":"12000 rpm"}]',
  ARRAY['https://images.unsplash.com/photo-1517048676732-d65bc937f952']
),
(
  'MCH-1006', 'CNC Turning and Milling Center', 'DMG Gildemeister', 'CTX Beta 1250', 'SN-45003', 'Germany',
  143000, 'Metal Working Machinery', 'Turning and Milling Centres', 'Refurbished', 'In Stock', 'CNC',
  'Combined turning and milling center for complex part production with reduced setups.',
  '[{"key":"Axis","value":"5 Axis"},{"key":"Chuck","value":"12 inch"},{"key":"Controller","value":"Siemens"}]',
  ARRAY['https://images.unsplash.com/photo-1497366754035-f200968a6e72']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- LEADS (from dummyLeads in lib/api.ts)
-- ============================================================
INSERT INTO leads (name, company, interested_in, stage) VALUES
  ('Manjunatha', 'Manjunatha Swamy Engineering Services', 'Gear Hobber WMW Modul ZFWZ 1250/1500', 'New'),
  ('Gurdev Singh', 'RC Engineering', 'GEAR HOBBER WMW MODUL ZFWZ 6300', 'New'),
  ('Adeel Khan', 'Khan Fabrication Works', '4 Rolls Hydraulic Plate Bender', 'Contacted');

-- ============================================================
-- CATEGORIES (top-level + subcategories from categories page)
-- ============================================================
-- Top-level categories first
INSERT INTO categories (name, slug, parent_id) VALUES ('Metal Working Machinery', 'metal-working-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Plastic Machinery', 'plastic-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Textile Machinery', 'textile-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Pharmaceutical Machinery', 'pharmaceutical-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Bar Machinery', 'bar-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Bending Machines', 'bending-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Bolt & Fasteners Machines', 'bolt-fasteners-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Broaching Machinery & Keyseaters', 'broaching-machinery-keyseaters', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('CNC Machines', 'cnc-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Drilling Machinery', 'drilling-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('EDM Machines', 'edm-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Forging & Foundry Machinery', 'forging-foundry-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Gear Machinery', 'gear-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Grinders', 'grinders', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Honing Machines', 'honing-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Horizontal Boring Mills', 'horizontal-boring-mills', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Industrial Plants', 'industrial-plants', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Inspection & Measuring Machines', 'inspection-measuring-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Laser Cutting Machines', 'laser', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Lathes & Turning Machines', 'lathes-turning-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Machining Centres', 'machining-centres', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Milling Machines', 'milling-machines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Other Equipment', 'other-equipment', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Power Plants & Turbines', 'power-plants-turbines', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Presses', 'presses', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Robots', 'robots', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Roll Formers & Rolling Mills', 'roll-formers-rolling-mills', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Saws', 'saws', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Sheet Metal Machinery', 'sheet-metal-machinery', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Textile Machinery', 'textile-machinery-2', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Vertical Turning Lathes', 'vertical-turning-lathes', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Welding Equipment', 'welding-equipment', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug, parent_id) VALUES ('Wire Machinery', 'wire-machinery', NULL) ON CONFLICT (slug) DO NOTHING;

-- Subcategories (using WITH clause to get parent IDs)
INSERT INTO categories (name, slug, parent_id)
SELECT 'Bar Milling', 'bar-milling', id FROM categories WHERE slug = 'bar-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Bar Peeling', 'bar-peeling', id FROM categories WHERE slug = 'bar-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Heavy Duty Lathes', 'heavy-duty-lathes', id FROM categories WHERE slug = 'lathes-turning-machines'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Gear Hobbers', 'gear-hobbers', id FROM categories WHERE slug = 'gear-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Gear Grinders', 'gear-grinders', id FROM categories WHERE slug = 'gear-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Horizontal Machining Centres', 'horizontal-machining-centres', id FROM categories WHERE slug = 'machining-centres'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Turning and Milling Centres', 'turning-milling-centres', id FROM categories WHERE slug = 'lathes-turning-machines'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Injection Moulding', 'injection-moulding', id FROM categories WHERE slug = 'plastic-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Blow Moulding', 'blow-moulding', id FROM categories WHERE slug = 'plastic-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Extrusion Lines', 'extrusion-lines', id FROM categories WHERE slug = 'plastic-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Tablet Press', 'tablet-press', id FROM categories WHERE slug = 'pharmaceutical-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Capsule Fillers', 'capsule-fillers', id FROM categories WHERE slug = 'pharmaceutical-machinery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Packaging Lines', 'packaging-lines', id FROM categories WHERE slug = 'pharmaceutical-machinery'
ON CONFLICT (slug) DO NOTHING;

-- SEO pages (system pages)
INSERT INTO seo_pages (id, path, page_title, meta_title, meta_description, keywords, canonical_url, og_title, og_description, source, locked_path) VALUES
('system:/', '/', 'Home', 'Home | Novatech Machinery', 'Used industrial machinery marketplace by Novatech Machinery featuring CNC, fabrication and production equipment.', 'novatech machinery, used industrial machinery, cnc machines', '/', 'Home | Novatech Machinery', 'Used industrial machinery marketplace by Novatech Machinery.', 'system', TRUE),
('system:/about', '/about', 'About Us', 'About Us | Novatech Machinery', 'Learn about Novatech Machinery, our sourcing network and expertise in industrial machine trading.', 'about novatech machinery', '/about', 'About Us | Novatech Machinery', 'Learn about Novatech Machinery.', 'system', TRUE),
('system:/categories', '/categories', 'Machine Categories', 'Machine Categories | Novatech Machinery', 'Browse machine categories offered by Novatech Machinery.', 'machine categories, industrial machinery', '/categories', 'Machine Categories | Novatech Machinery', 'Browse machine categories.', 'system', TRUE),
('system:/contact', '/contact', 'Contact Us', 'Contact Us | Novatech Machinery', 'Contact Novatech Machinery for machine sourcing, pricing and support.', 'contact novatech machinery', '/contact', 'Contact Us | Novatech Machinery', 'Contact Novatech Machinery.', 'system', TRUE),
('system:/machines', '/machines', 'All Machines', 'All Machines | Novatech Machinery', 'Explore all listed machines available with Novatech Machinery.', 'all machines, industrial equipment', '/machines', 'All Machines | Novatech Machinery', 'Explore all listed machines.', 'system', TRUE)
ON CONFLICT (id) DO NOTHING;
