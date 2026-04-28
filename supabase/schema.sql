-- ============================================================
-- NOVATECH MACHINERY — SUPABASE SCHEMA
-- Run this in your Supabase project SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug      ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- ============================================================
-- MACHINES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS machines (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  brand              TEXT NOT NULL DEFAULT '',
  model              TEXT NOT NULL DEFAULT '',
  serial_number      TEXT DEFAULT '',
  country_of_origin  TEXT DEFAULT '',
  price              NUMERIC(12,2) NOT NULL DEFAULT 0,
  category           TEXT NOT NULL DEFAULT '',
  subcategory        TEXT DEFAULT '',
  condition          TEXT NOT NULL DEFAULT 'Used' CHECK (condition IN ('New','Used','Refurbished')),
  stock_status       TEXT NOT NULL DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock','Limited','Out of Stock')),
  machine_type       TEXT NOT NULL DEFAULT 'Conventional' CHECK (machine_type IN ('CNC','Conventional')),
  description        TEXT DEFAULT '',
  specifications     JSONB DEFAULT '[]',
  images             TEXT[] DEFAULT '{}',
  is_published       BOOLEAN DEFAULT TRUE,
  is_special_deal    BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_machines_category    ON machines(category);
CREATE INDEX IF NOT EXISTS idx_machines_subcategory ON machines(subcategory);
CREATE INDEX IF NOT EXISTS idx_machines_condition   ON machines(condition);
CREATE INDEX IF NOT EXISTS idx_machines_stock       ON machines(stock_status);
CREATE INDEX IF NOT EXISTS idx_machines_published   ON machines(is_published);

-- ============================================================
-- LEADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  company       TEXT DEFAULT '',
  email         TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  interested_in TEXT DEFAULT '',
  message       TEXT DEFAULT '',
  stage         TEXT NOT NULL DEFAULT 'New' CHECK (stage IN ('New','Contacted','Quotation','Negotiation','Won','Lost')),
  source        TEXT DEFAULT 'website',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_stage      ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================================
-- CONTACT ENQUIRIES TABLE (public contact form)
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name   TEXT NOT NULL,
  last_name    TEXT DEFAULT '',
  phone        TEXT NOT NULL,
  email        TEXT NOT NULL,
  message      TEXT NOT NULL,
  is_converted BOOLEAN DEFAULT FALSE,
  lead_id      UUID REFERENCES leads(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS TABLE (admin panel users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT UNIQUE,
  phone           TEXT DEFAULT '',
  role            TEXT NOT NULL DEFAULT 'Sales' CHECK (role IN ('Super Admin','Admin','Sales','Viewer')),
  password_hash   TEXT DEFAULT '',
  is_active       BOOLEAN DEFAULT TRUE,
  joined          DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN SETTINGS TABLE (singleton row, id = 'global')
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id        TEXT PRIMARY KEY DEFAULT 'global',
  profile   JSONB DEFAULT '{}',
  smtp      JSONB DEFAULT '{}',
  tracking  JSONB DEFAULT '{}',
  security  JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEO GLOBAL SETTINGS TABLE (singleton row)
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_global (
  id                       TEXT PRIMARY KEY DEFAULT 'global',
  site_name                TEXT DEFAULT 'Novatech Machinery',
  site_url                 TEXT DEFAULT 'https://novatechmachinery.com',
  title_suffix             TEXT DEFAULT '| Novatech Machinery',
  default_meta_description TEXT DEFAULT '',
  default_keywords         TEXT DEFAULT '',
  default_og_image         TEXT DEFAULT '/images/seo/novatech-default-og.jpg',
  twitter_handle           TEXT DEFAULT '@novatechmachinery',
  machine_title_template        TEXT DEFAULT '{machineName} {brand} {model} {titleSuffix}',
  machine_description_template  TEXT DEFAULT 'Explore {machineName} from {brand}. Category: {category}. Condition: {condition}.',
  category_title_template       TEXT DEFAULT '{categoryName} Machines {titleSuffix}',
  category_description_template TEXT DEFAULT 'Browse {categoryName} machines curated by Novatech Machinery.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEO PAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_pages (
  id               TEXT PRIMARY KEY,
  path             TEXT NOT NULL,
  page_title       TEXT NOT NULL,
  meta_title       TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  keywords         TEXT DEFAULT '',
  canonical_url    TEXT DEFAULT '',
  og_title         TEXT DEFAULT '',
  og_description   TEXT DEFAULT '',
  no_index         BOOLEAN DEFAULT FALSE,
  no_follow        BOOLEAN DEFAULT FALSE,
  source           TEXT NOT NULL DEFAULT 'system' CHECK (source IN ('system','category','machine','custom')),
  locked_path      BOOLEAN DEFAULT TRUE,
  updated_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_seo_pages_path   ON seo_pages(path);
CREATE INDEX IF NOT EXISTS idx_seo_pages_source ON seo_pages(source);

-- ============================================================
-- ROW LEVEL SECURITY (all tables private by default)
-- ============================================================
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_global       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages        ENABLE ROW LEVEL SECURITY;

-- Public read for machines and categories (for the public website)
CREATE POLICY "machines_public_read"    ON machines         FOR SELECT USING (is_published = TRUE);
CREATE POLICY "categories_public_read"  ON categories       FOR SELECT USING (TRUE);
CREATE POLICY "seo_pages_public_read"   ON seo_pages        FOR SELECT USING (TRUE);
CREATE POLICY "seo_global_public_read"  ON seo_global       FOR SELECT USING (TRUE);

-- Public insert for contact enquiries
CREATE POLICY "enquiries_public_insert" ON contact_enquiries FOR INSERT WITH CHECK (TRUE);

-- Service role bypasses RLS automatically (used in server API routes)
