# Novatech Admin Frontend

Standalone admin frontend for the Novatech website.

It reuses the existing admin UI component from `../components/admin/AdminPanel.tsx` and proxies `/api/admin/*` requests to the main website backend.

## Run

First run the main website backend:

```bash
npm run dev
```

Then run the admin frontend from this folder:

```bash
npm run dev
```

The admin frontend opens on `http://localhost:3002` and uses `http://localhost:3000` as the default backend.

To use a different backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000 npm run dev
```
