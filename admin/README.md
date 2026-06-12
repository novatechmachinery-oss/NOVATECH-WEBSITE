# Novatech Admin Frontend

Standalone admin app for the Novatech website.

It reuses shared admin components and server helpers from the parent project, but deploys as its own Next.js app. In this app, the admin dashboard is `/` and the login page is `/login`.

## Local Run

From this folder:

```bash
npm run dev
```

The admin app opens on `http://localhost:3002`.

## Separate Deployment

Deploy this folder as a separate project.

```text
Root directory: NOVATECH-WEBSITE/admin
Build command: npm run build
Start command: npm run start
```

Use a separate domain such as:

```text
https://admin.novatechmachinery.in
```

Admin URLs:

```text
/login
/
/api/admin/*
```

## Required Admin Env

Set these variables on the admin deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAIL=info@novatechmachinery.in
ADMIN_PASSWORD=...
```

Use `ADMIN_EMAILS` instead of `ADMIN_EMAIL` for multiple allowed admin emails:

```env
ADMIN_EMAILS=info@novatechmachinery.in,second-admin@example.com
```

## Main Website Env

On the public website deployment, disable the built-in admin surface:

```env
DISABLE_MAIN_ADMIN_ROUTES=true
ADMIN_APP_URL=https://admin.novatechmachinery.in
```

With those set, `/admin/*` on the main website redirects to the standalone admin app, and `/api/admin/*` returns `404` on the public deployment.
