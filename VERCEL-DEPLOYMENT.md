# Monny Naturals — Vercel Deployment

This version has been converted for Vercel.

## What changed

- React/Vite still powers the storefront.
- Express still powers `/api/*` and the admin CMS.
- Bundled product, hero and About images live in `client/public/uploads/` and are copied into Vercel's `public/` output during build.
- Admin image uploads are stored permanently in **Vercel Blob**.
- Admin website/content changes are stored as versioned JSON objects in **Vercel Blob** instead of writing to `data/content.json` at runtime.
- Large admin images are automatically resized/compressed before upload so the request stays below Vercel Function payload limits.
- `data/content.json` remains the seed/fallback content for a brand-new deployment.

## 1. Push the project to GitHub

Push the **project root** — the folder containing:

- `package.json`
- `server.js`
- `vercel.json`
- `client/`
- `data/`

Do not upload `node_modules`.

## 2. Import into Vercel

Create a new Vercel project from the GitHub repository.

Important:

- **Root Directory:** repository root (do NOT choose `client`)
- **Build Command:** already defined by `vercel.json` as `npm run vercel-build`
- **Output Directory:** do not manually override it
- **Install Command:** leave Vercel default

The build installs the client dependencies and builds Vite into root `public/`, which Vercel's Express integration serves as static assets.

## 3. Add production admin environment variables

Vercel Project → Settings → Environment Variables:

```env
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=use-a-strong-unique-password
JWT_SECRET=use-a-long-random-secret-value
```

Use a long random `JWT_SECRET`. Do not use the local development defaults in production.

## 4. Create Vercel Blob storage

In the same Vercel project:

1. Open **Storage**.
2. Choose **Create Database** → **Blob**.
3. Create a **Public** Blob store.
4. Connect it to this project and the Production environment.

Vercel will provide the `BLOB_READ_WRITE_TOKEN` environment variable to the project.

After connecting the Blob store, redeploy the project so the Function receives the new environment variable.

## 5. Verify the deployment

Open:

```text
https://YOUR-DOMAIN.vercel.app/api/health
```

A correct Vercel deployment should include:

```json
{
  "ok": true,
  "platform": "vercel",
  "storage": "vercel-blob"
}
```

Then test:

- `/` — storefront
- `/products` — direct React route
- `/admin` — admin login
- Change a harmless item in Admin and press **Save website changes**
- Refresh the public site and confirm the change remains
- Upload an image from Admin, save, refresh and confirm it remains

## 6. Add the custom domain

Vercel Project → Settings → Domains → add the client's domain and follow the DNS instructions shown by Vercel.

## Local development

Local development continues to work without Vercel Blob:

```bash
npm run install:all
npm run dev
```

When `BLOB_READ_WRITE_TOKEN` is absent locally, content saves to `data/content.json` and uploads save to `client/public/uploads/`.

## Important notes

- On Vercel, the runtime filesystem is not used for persistent CMS changes.
- If Blob is not connected, the storefront can still load the bundled seed content, but CMS saves/uploads are deliberately blocked on Vercel to prevent silent data loss.
- Existing static catalogue images keep their `/uploads/...` URLs; new admin uploads use their permanent Vercel Blob URLs.
