# Novatech Machinery Website

Professional industrial machinery marketplace built for Novatech Machinery Corporation. The project presents machine categories, special deals, used machinery inventory, contact enquiries, and an admin experience for managing catalogue content from one clean Next.js codebase.

![Novatech Machinery](public/images/main%20logo.webp)

## Project Highlights

- Modern, responsive marketing and catalogue website for industrial machinery buyers.
- Homepage with hero slider, feature category cards, special deals carousel, and enquiry CTA.
- Machinery catalogue pages for metal working, pharmaceutical, plastic, textile, categories, used machinery, about, and contact.
- Contact form with client-side validation, server-side validation, and lead persistence.
- Admin dashboard for catalogue management, categories, machines, leads, homepage settings, SEO settings, and site configuration.
- Local JSON data fallback for development, with optional Supabase REST integration for production-style data sync.
- Built with Next.js App Router, TypeScript, Tailwind CSS, React, and lucide-react icons.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| Icons | lucide-react |
| Data | Local JSON files and optional Supabase REST |
| Linting | ESLint with Next.js config |
| Admin | Integrated admin routes plus optional standalone admin frontend |

## Screens And Pages

| Route | Purpose |
| --- | --- |
| `/` | Homepage with hero, categories, special deals, and CTA |
| `/metal-working-machinery` | Main machinery catalogue experience |
| `/used-machinery` | Used machinery listing |
| `/categories` | Category discovery page |
| `/about` | Company profile page |
| `/contact` | Contact form, map, phone, email, and WhatsApp actions |
| `/admin` | Admin panel inside the main website |
| `/api/contact` | Saves enquiry leads |
| `/api/admin/*` | Admin data APIs for catalogue, dashboard, machines, categories, SEO, and settings |

## Folder Structure

```text
NOVATECH-WEBSITE/
|-- app/                         # Next.js App Router pages and API routes
|   |-- api/                     # Contact and admin backend endpoints
|   |-- contact/                 # Contact page
|   |-- metal-working-machinery/ # Catalogue page
|   `-- ...
|-- components/                  # Reusable website and admin UI components
|   |-- Cards/                   # Category, deal, and machine cards
|   `-- admin/                   # Admin panel UI
|-- data/                        # Local JSON content and settings
|-- lib/                         # Services, types, validation, Supabase helpers
|-- public/images/               # Website visual assets
`-- admin/                       # Optional standalone admin frontend
```

## Development Workflow

The website has been developed component-by-component so every major area stays maintainable:

- `components/SiteHeader.tsx`, `Navbar.tsx`, `TopHeader.tsx`, and `Footer.tsx` handle the shared layout.
- `components/HeroSlider.tsx`, `CategoryCard.tsx`, and `SpecialDealsSlider.tsx` build the homepage experience.
- `lib/machine-catalog.service.ts` normalizes machine and category data from local admin JSON or Supabase.
- `lib/contactForm.ts` keeps contact form validation consistent on client and server.
- `components/admin/AdminPanel.tsx` provides the operational interface for managing machines, categories, leads, settings, and SEO.
- `data/site-settings.json`, `data/seo-settings.json`, and `data/admin-catalog.json` make the project easy to run locally without a database.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create `.env.local` in the root when Supabase integration is required:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Supabase is optional for local development. If these values are not provided, the app uses local JSON files from the `data/` folder.

### 3. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm run start
```

### 5. Run linting

```bash
npm run lint
```

## Admin Frontend

The main website includes an admin panel at:

```text
http://localhost:3000/admin
```

There is also a standalone admin frontend inside the `admin/` folder. It reuses the same admin panel UI and connects to the main website backend.

Run the main website first:

```bash
npm run dev
```

Then in another terminal:

```bash
cd admin
npm install
npm run dev
```

Standalone admin opens on:

```text
http://localhost:3002
```

To point it at a different backend:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000 npm run dev
```

## Data And Content Management

The project supports two data modes:

| Mode | How It Works |
| --- | --- |
| Local JSON | Reads and writes catalogue, settings, SEO, and lead data in `data/` files. Best for local development and demos. |
| Supabase | Uses Supabase REST when environment variables are available. Leads are saved locally first and then synced to Supabase. |

Key data files:

- `data/site-settings.json` for homepage, navigation, contact details, and footer content.
- `data/seo-settings.json` for SEO-related settings.
- `data/admin-catalog.json` for categories and machine inventory.
- `data/admin-leads.json` is generated when enquiries are submitted locally.

## Quality Notes

- Type-safe service layer keeps data transformation away from UI components.
- Shared form normalization and validation reduces mismatch between frontend and backend behaviour.
- Admin APIs are separated by responsibility for cleaner maintenance.
- Local fallback data makes the project easy for new developers to run immediately.
- Responsive UI is built with Tailwind utilities and reusable React components.

## Useful Commands

```bash
npm run dev      # Start local development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment Checklist

- Add production Supabase environment variables if database sync is required.
- Confirm contact details in `data/site-settings.json`.
- Review SEO settings in `data/seo-settings.json`.
- Run `npm run lint`.
- Run `npm run build`.
- Deploy to a Next.js-compatible platform.

## Project Status

This repository is ready for GitHub presentation and continued development. It shows a complete website structure, catalogue logic, enquiry handling, admin workflows, and production-minded configuration.

---

Developed for Novatech Machinery Corporation with a focus on clean UI, practical catalogue management, and a smooth buyer enquiry journey.
