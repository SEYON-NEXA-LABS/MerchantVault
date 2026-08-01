# Project Progress & Task Tracker

## Task: Environment-Based Mock/Demo Item Filtering & Development Sidebar Toggle

### Objective

Ensure all mock datasets, fallback product lists, demo state toggle buttons, test order simulations, and test login controls only render when `process.env.NODE_ENV === 'development'`, and are completely excluded in production builds across orders, purchase orders, catalog items, and logistics modules. Provide a dedicated DEV/PROD environment mode toggle pill in the ERP Admin sidebar during development.

---

### Progress Tracking

- [x] **Storefront Page (`apps/storefront/app/page.tsx`)**
  - [x] Restrict `FALLBACK_PRODUCTS` usage to `NODE_ENV === 'development'`.
  - [x] Hide "Load Sample Data / Clear Sample Data" button in production.
  - [x] Hide "Pre-Release / Demo Mode" banner in production.

- [x] **Storefront API (`apps/storefront/app/api/products/[id]/route.ts`)**
  - [x] Restrict fallback product lookup by ID (`mock-1`..`mock-15`) to development mode only. Return 404 in production if product is not in database.

- [x] **ERP Admin Login Page (`apps/erp-admin/app/page.tsx`)**
  - [x] Ensure quick-login demo profiles and dev mode toggle UI are strictly restricted to development mode.

- [x] **ERP Admin Dashboard Sidebar (`apps/erp-admin/app/dashboard/layout.tsx`)**
  - [x] Added DEV / PROD mode toggle pill in sidebar strictly wrapped in `process.env.NODE_ENV === 'development'`.
  - [x] Consolidated inventory links into a single, clean **Stock & SKU Inventory** link (`/dashboard/inventory`).

- [x] **ERP Admin Barcode Operations (`apps/erp-admin/app/dashboard/barcode/page.tsx`)**
  - [x] Integrated **Hybrid Barcode Strategy**: Displays whether the active variant barcode string originates from Shopify or internal ERP fallback.

- [x] **ERP Admin Settings & API (`apps/erp-admin/app/...`)**
  - [x] Restored **Barcode Integration Mode** dropdown in Settings form now that `barcodeMode` column exists in Supabase.
  - [x] Updated `/api/settings` GET and POST routes to select and allow `barcodeMode` and `shopifyWebhookSecret`.
  - [x] Disabled browser password manager autofill on Shopify integration form inputs (`autoComplete="new-password"`, `name` attributes, `spellCheck={false}`).
  - [x] Updated `executeHandshake` submit handler to save `shopifyStoreUrl`, `shopifyAccessToken`, `shopifyWebhookSecret`, and `barcodeMode` to database via POST `/api/settings`.
  - [x] Fixed Settings page dirty check logic (`initialCompanySettings` includes `secretKey` & `barcodeMode`) so the form loads clean without false dirty indicators.
  - [x] Updated placeholders for Webhook API Secret Key (`e.g. API Secret Key / Client Secret from Shopify App Settings`).
  - [x] Fixed domain check in `isMockToken` to ensure custom domain inputs (`thewolfcabin.in`, `etdkv5-de.myshopify.com`) with valid `shpat_` tokens execute live Shopify REST API pulls.
  - [x] Updated Shopify REST API version to active `2024-04` version.
  - [x] Made "Configure Credentials" button functional by routing directly to `/dashboard/settings`.
  - [x] Added 100% Data Safety & Non-Destructive Protection Guarantee Banners across Settings and Shopify Sync pages.

---

### Verification Status

- [x] Core schema & code audit across Orders, Purchase Orders (PO), Items/Variants, Logistics, and CRM modules.
- [x] Development verification (`NODE_ENV=development`).
- [x] Production verification (`NODE_ENV=production`).
- [x] Build compilation (`npm run build`).
