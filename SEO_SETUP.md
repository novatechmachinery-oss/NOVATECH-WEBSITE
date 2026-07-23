# Novatech Machinery SEO deployment checklist

## Production environment variables

Add these in Vercel for the Production environment. Leave optional values empty until the new properties have been created.

```env
NEXT_PUBLIC_SITE_URL=https://novatechmachinery.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

Do not copy IDs from the website that previously used this domain. Preview deployments should not receive production analytics IDs.

## Google Search Console

1. Create a new **Domain property** for `novatechmachinery.com`.
2. Add the exact TXT record supplied by Google at the DNS provider. DNS verification is preferred for a Domain property.
3. After ownership verifies, submit `https://novatechmachinery.com/sitemap.xml`.
4. Inspect the homepage, `/categories`, `/used-machinery`, and several `/machines/{id}` pages and request indexing.
5. Monitor Page indexing, Core Web Vitals, HTTPS, and structured-data reports.
6. Remove an old Google verification TXT record only after confirming it belongs solely to the previous property and is no longer needed.

The `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` value provides optional HTML meta verification. Enter only the token, not the full meta tag.

## Bing Webmaster Tools

1. Create a new site for `https://novatechmachinery.com` or import the newly verified Search Console property.
2. For meta verification, place only the Bing token in `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
3. Submit `https://novatechmachinery.com/sitemap.xml` and inspect representative machine/category URLs.
4. Review crawl, indexing, and structured-data issues.

## GA4

1. Create a new GA4 property and Web data stream for `https://novatechmachinery.com`.
2. Add its `G-...` ID to `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel Production and redeploy.
3. Confirm `page_view` events in Realtime/DebugView during client-side navigation.
4. The machine detail CTAs emit `contact_whatsapp`, `contact_phone`, and `contact_email` without sending form values, phone numbers, email addresses, or message text.

## Domain and Vercel

1. Assign `novatechmachinery.com` as the primary production domain.
2. Connect `www.novatechmachinery.com` and configure a permanent redirect to the non-www domain.
3. Confirm HTTP redirects to HTTPS and that no redirect loop exists.
4. Keep Vercel preview deployments inaccessible to crawlers where possible; they are never used for canonical URLs by the application.
5. Revalidate the production deployment with Rich Results Test, Schema.org Validator, PageSpeed Insights, Search Console URL Inspection, and Bing URL Inspection.

Google decides whether to show sitelinks, rich treatments, AI answers, or a Knowledge Panel. For the business panel shown in the reference image, create or claim an eligible Google Business Profile separately and keep its public name, phone, address, URL, and category consistent with the website. Do not create duplicate profiles.

## Rollback

The SEO work is additive except for replacing the obsolete static `public/robots.txt` with the typed `app/robots.ts` route and removing the unused duplicate `lib/seo.ts`. Reverting the implementation commit restores the earlier behavior; do not roll back database or DNS settings as part of a code rollback.
