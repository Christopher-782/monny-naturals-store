# Monny Naturals Store + Full Admin CMS

A premium React/Vite ecommerce storefront for Monny Naturals with a Node/Express backend, WhatsApp checkout, persistent cart state, image uploads and a password-protected content-management dashboard.

The storefront remains focused on natural beauty ecommerce, while the client can manage normal day-to-day store updates from `/admin` without editing source code.

## What the admin can manage

### Products

- Add new products
- Edit product names
- Change categories
- Change prices in Nigerian Naira
- Change stock quantities
- Edit short descriptions
- Edit ingredients, benefits and usage instructions
- Change ratings and review counts
- Mark products as Featured, Best Selling or Newest
- Upload/replace product images
- Delete products

### Categories

- Add categories
- Rename categories
- Upload/replace category images
- Delete unused categories
- Product category assignments are automatically updated when a category is renamed

### Homepage

- Add/remove hero carousel slides
- Change hero images
- Change hero eyebrow, heading and supporting text
- Edit Shop by Category headings
- Edit Featured Products headings
- Edit the brand-story heading and paragraph
- Replace both brand-story images
- Edit the three brand-story points
- Add/edit/remove customer testimonials
- Edit checkout-flow copy
- Edit newsletter copy

### Store settings

- WhatsApp number
- Delivery fee
- Free-shipping threshold
- Announcement-bar text
- Brand name
- Brand tagline
- Contact email
- Business location
- Customer-care hours

The WhatsApp number saved in the CMS is used by the floating WhatsApp button, hero WhatsApp button, Contact page, Product Buy Now button and full WhatsApp checkout flow.

## Publishing workflow

The dashboard works as a draft-first CMS. Changes are previewed in the admin state and do not become public until the client presses **Save website changes**.

In local development, public store content is stored in `data/content.json` and uploaded files are stored in `client/public/uploads/`. On Vercel, published CMS content and new admin uploads are stored persistently in Vercel Blob.

## Local setup

1. Install dependencies:

```bash
npm run install:all
```

2. Copy `.env.example` to `.env` and set secure admin credentials:

```env
PORT=5000
ADMIN_EMAIL=admin@monnynaturals.com
ADMIN_PASSWORD=use-a-strong-password
JWT_SECRET=use-a-long-random-secret
```

3. Start development mode:

```bash
npm run dev
```

Storefront: `http://localhost:5173`

Admin: `http://localhost:5173/admin`

## Development-only fallback login

If no `.env` file exists, local development uses:

- Email: `admin@monnynaturals.local`
- Password: `MonnyAdmin123!`

Do **not** deploy with the fallback credentials.

## Important WhatsApp change

The WhatsApp number is no longer edited in `client/src/config.js`. The client changes it from **Admin → Store settings**. This prevents normal business updates from requiring a code deployment.

Use international number format without spaces, for example:

```text
2348012345678
```

## Cart synchronization

The cart is stored in `localStorage`, but saved cart items are reconciled against the latest backend product catalogue. If the admin changes a product's price, stock, image or name, the cart updates to the live product data instead of continuing to use stale details.

## Image uploads

Accepted formats:

- JPG/JPEG
- PNG
- WEBP
- GIF

Maximum source file size: **8 MB** per image. On Vercel, larger source images are automatically optimized in the browser before they are sent to the API.

## Production hosting — Vercel

This version is Vercel-ready. Runtime CMS writes no longer depend on the deployment filesystem.

Production architecture:

- React/Vite static storefront → Vercel `public/` assets
- Express API/admin endpoints → Vercel Function
- CMS content → Vercel Blob
- New admin image uploads → Vercel Blob
- Bundled seed images → `client/public/uploads/`

See **`VERCEL-DEPLOYMENT.md`** for the exact deployment steps.

## Production build

```bash
npm run build
npm start
```

In production mode Vite builds into root `public/`. Vercel serves those static assets while Express handles the API and SPA fallback routes.


## Official logo

The shared `Logo.jsx` component uses the official Cloudinary logo URL configured as `BRAND_LOGO_URL` in `client/src/config.js`. Change that single value if the logo URL ever changes.

## 2.1 collection photo update

The homepage now includes two client-editable photo collections built from the supplied Monny Naturals product photography:

- Skin & Body Essentials — 10 supplied skincare/body/soap images
- Hair Growth & Care — 5 supplied haircare images

The optimized originals are stored under `client/public/uploads/catalog/` and are available through `/uploads/catalog/...`.

To change any of these photos later, sign in to `/admin`, open **Homepage**, then use **Skin & hair collection sections**. Each card supports direct image upload or an image URL, and the section heading, description, linked category, and display names are editable too.

## SEO setup

The storefront includes production SEO support for `https://www.monnynatural.com`:

- page-specific titles, descriptions, canonical URLs, Open Graph and Twitter metadata
- `Product` structured data for product pages
- `Organization` and `WebSite` structured data on the homepage
- indexable category collection pages
- `noindex` handling for admin, cart, checkout, filtered search URLs and 404s
- `robots.txt`
- an automatically generated `sitemap.xml` during every client production build

After deploying, add `https://www.monnynatural.com/sitemap.xml` in Google Search Console and request indexing for the homepage and main product/catalog pages.

If the production domain changes, update `SITE_URL` in `client/src/components/SeoManager.jsx`, `client/public/robots.txt`, and set the `SITE_URL` environment variable for sitemap generation.
