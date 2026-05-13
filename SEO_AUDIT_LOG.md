# SEO Audit Log - Novatech Machinery

Date: 2026-05-11  
Scope: Step 1 audit only (no implementation edits)

## 1) Admin SEO data source (exact Supabase schema currently used)

The current project does **not** use separate `seo_config` / `seo_pages` relational tables in runtime code.  
It uses JSON payloads stored in two Supabase tables:

### Table: `seo_settings`
- Purpose: site-wide SEO defaults + per-route SEO records
- Accessed in:
  - `lib/seo-settings.service.ts`
  - `app/api/admin/seo/route.ts`
- Supabase REST paths used:
  - `seo_settings?id=eq.main&select=settings` (read)
  - `seo_settings` (upsert)
- Physical columns used by code:
  - `id` (value used: `"main"`)
  - `settings` (JSON object)

#### `settings` JSON keys in `seo_settings`
- `globalTitleSuffix`
- `defaultTitle`
- `defaultDescription`
- `analytics`
  - `googleAnalyticsId`
  - `metaPixelId`
  - `clarityProjectId`
- `pages[]` records:
  - `id`
  - `label`
  - `route`
  - `title`
  - `description`
  - `keywords`
  - `canonicalUrl`
  - `ogTitle`
  - `ogDescription`
  - `ogImageUrl`
  - `noIndex`
  - `noFollow`

### Table: `site_settings`
- Purpose: global site configuration including analytics IDs
- Accessed in:
  - `lib/site-settings.service.ts`
  - `app/api/admin/settings/route.ts`
- Supabase REST paths used:
  - `site_settings?id=eq.main&select=settings` (read)
  - `site_settings` (upsert)
- Physical columns used by code:
  - `id` (value used: `"main"`)
  - `settings` (JSON object)

#### Tracking IDs location currently used in `site_settings.settings`
- `operations.analytics.googleAnalyticsId`
- `operations.analytics.metaPixelId`
- `operations.analytics.clarityProjectId`

### Route count in current SEO source
- `data/seo-settings.json` currently contains **126** `pages[].route` entries (matches your stated route volume).

---

## 2) Metadata coverage audit

### Public pages currently using admin SEO source
These routes use `getSeoMetadata(...)`, which reads from `seo_settings`:
- `/`
- `/about`
- `/categories`
- `/contact`
- `/used-machinery` (query-aware route construction)
- `/metal-working-machinery` (query-aware lookup/canonical handling)
- `/textile-machinery`
- `/plastic-machinery`
- `/pharmaceutical-machinery`

### Root layout metadata
- `app/layout.tsx` uses `getRootMetadata()` from `lib/seo.ts`
- `getRootMetadata()` reads from `seo_settings` and `site_settings`

### Pages not reading admin SEO source
- `app/admin/page.tsx` (static `metadata` export)
- `app/admin/login/page.tsx` (static `metadata` export)

Note: these are admin-only routes and intentionally non-public.

---

## 3) Existing metadata (DO NOT OVERWRITE)

Existing metadata logic already present and should be extended only:
- `lib/seo.ts`
  - `getRootMetadata()`
  - `getSeoMetadata(...)`
  - `buildSeoRoute(...)`
  - URL normalization/title suffix handling/robots mapping
- All `generateMetadata()` implementations in public route files listed above
- `app/layout.tsx` root `generateMetadata()`

---

## 4) noindex/nofollow toggle compliance

### Current status
- For public pages using `getSeoMetadata(...)`, toggles are respected:
  - `noIndex -> robots.index = false`
  - `noFollow -> robots.follow = false`
- Implemented in `lib/seo.ts` via Metadata `robots` object.

### Gaps
- No issue for public pages already using the helper.
- Admin login route has hardcoded `robots: "noindex, nofollow"` (acceptable for admin route).

---

## 5) Tracking script audit (hardcoded vs Supabase-driven)

### Findings
- No GA/Meta Pixel/Clarity script injection exists in `app/layout.tsx` via `next/script`.
- Analytics IDs exist in data sources (`seo_settings.analytics` and `site_settings.operations.analytics`) but are not actually injected into frontend runtime scripts.
- No hardcoded `gtag`, `fbq`, or Clarity snippets found in app route/layout files.

### Gap classification
- Not a duplication issue.
- Missing runtime tracking script implementation.

---

## 6) Heading/H1 audit

### Pages/components with clear H1 present
- `app/about/page.tsx`
- `app/categories/page.tsx`
- `components/ContactPageClient.tsx` (for `/contact`)
- `components/ComingSoonPage.tsx` (used by textile/plastic/pharma)
- `components/MetalWorkingCatalogue.tsx` (used by `/used-machinery` and `/metal-working-machinery`)

### Missing H1
- Home route (`app/page.tsx`) has no visible H1 in rendered structure (hero uses image slider without page heading).

### Heading order issues
- `components/MetalWorkingCatalogue.tsx` uses top-level `h1` then card/detail `h3` headings without an intervening page-level `h2` structure in key sections (potential heading hierarchy skip).

---

## 7) Image implementation audit

### `<img>` usage
- No raw `<img>` tags found in scanned `.tsx` files.
- `next/image` is already used across image-heavy components.

### Remaining image-related SEO/perf concerns
- Several large visual areas use CSS `background-image` (not indexable like content images and not controllable with `next/image` optimization).
- Some `Image` components use `unoptimized` (not always wrong, but can reduce built-in optimization benefits).

---

## 8) Crawlability files audit

### `app/robots.ts`
Current rules:
- allow: `/`
- disallow: `["/admin", "/api/admin"]`
- sitemap set

Gaps vs target:
- `/api/` not fully disallowed (only `/api/admin`)
- `/_next/` not disallowed

### `app/sitemap.ts`
Current behavior:
- pulls from SEO admin source (`seo_settings.pages`)
- excludes `page.noIndex === true`
- preserves query-string URLs from configured routes
- includes `lastModified`, `changeFrequency`, `priority`

Status:
- Broadly aligned with requested behavior.

---

## 9) Structured data audit

### Current status
- Global JSON-LD is injected in `app/layout.tsx` using `getGlobalStructuredData()` from `lib/seo.ts`.
- Currently includes:
  - `Organization`
  - `WebSite` (+ `SearchAction`)

### Missing schemas from requested scope
- `BreadcrumbList` (deep pages)
- `Product` (machine listing/details)
- `FAQPage` (where applicable)
- `LocalBusiness` (homepage)
- `ItemList` (category listing pages)

---

## 10) Performance bottlenecks (SEO-impacting)

Observed risk areas from code audit:
- Large client-heavy components (notably `components/admin/AdminPanel.tsx`, `components/MetalWorkingCatalogue.tsx`, `components/ContactPageClient.tsx`) increase JS footprint.
- No `next/dynamic` lazy-splitting found for below-the-fold sections.
- No bundle analyzer setup found in project config/scripts.
- Tracking scripts not yet added with controlled `next/script` strategies.
- Potential rendering weight from large slider/gallery components on key landing pages.

---

## 11) Additional GSC readiness checks

### Found
- `<html lang="en">` already set in `app/layout.tsx`.

### Missing
- No root `error.tsx` found in `app/` for graceful 500 UI.
- No GSC verification meta tag found in root layout metadata.
- Middleware redirects use `NextResponse.redirect(...)` default behavior (temporary status) for auth flows; no explicit 301 strategy (relevant mainly where SEO-visible redirects are needed).

---

## 12) Audit conclusion

- The project already has a strong centralized SEO metadata system via Supabase-backed `seo_settings`.
- Main implementation gap is not metadata lookup itself, but **standardization to requested utility structure**, **tracking script runtime injection from Supabase**, **expanded structured data coverage**, **home H1 + heading hierarchy cleanup**, and **crawl/performance hardening**.
- Safe to proceed with Step 2+ using existing tables only (`seo_settings`, `site_settings`) and extending current logic without overwriting existing metadata infrastructure.

