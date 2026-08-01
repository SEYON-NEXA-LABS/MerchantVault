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

- [x] **ERP Admin Dashboard Sidebar & Footer (`apps/erp-admin/app/dashboard/layout.tsx`)**
  - [x] Added DEV / PROD mode toggle pill in sidebar strictly wrapped in `process.env.NODE_ENV === 'development'`.
  - [x] Removed all hardcoded token checks (`shpat_mockaccesstoken12345`) and fallback domain filters across layout footer status bar, sidebar badges, and sync board headers. All credentials now load dynamically from your PostgreSQL `Company` table.
  - [x] Consolidated inventory links into a single, clean **Stock & SKU Inventory** link (`/dashboard/inventory`).

- [x] **ERP Admin Settings & API (`apps/erp-admin/app/...`)**
  - [x] Updated `executeHandshake` validation check in `settings/page.tsx` so users can authenticate using **EITHER** Admin API Access Token **OR** App Client ID & Client Secret.
  - [x] Added dedicated **App Client ID** and **App Client Secret** input fields to the Settings form UI.
  - [x] Updated `POST /api/settings` and Supabase SQL schema script to persist `shopifyClientId` and `shopifyClientSecret` to the tenant's `Company` record.
  - [x] Implemented **Automated Client Credentials Token Exchange**: If a user pastes their App Client ID (`3feb678bbd3464dd6752e4bb0430ce39`) and API Secret into Settings, FabricVault automatically queries `POST https://{shop}.myshopify.com/admin/oauth/access_token` with `grant_type=client_credentials`, retrieves the valid `shpat_` token, and saves it into Supabase automatically.
  - [x] Replaced fake step timer simulation in `executeHandshake` with an authentic live HTTP API ping against Shopify REST API (`POST /api/shopify/sync`). If token/domain fails, Step 2 marks as **Failed** and blocks connection.
  - [x] Updated REST API endpoints in `api/inventory/push-shopify/route.ts` to active version `2024-04`.
  - [x] Restored **Barcode Integration Mode** dropdown in Settings form now that `barcodeMode` column exists in Supabase.
  - [x] Disabled browser password manager autofill on Shopify integration form inputs (`autoComplete="new-password"`, `name` attributes, `spellCheck={false}`).
  - [x] Fixed Settings page dirty check logic so the form loads clean without false dirty indicators.

---

### Verification Status
- [x] Core schema & code audit across Orders, Purchase Orders (PO), Items/Variants, Logistics, and CRM modules.
- [x] Development verification (`NODE_ENV=development`).
- [x] Production verification (`NODE_ENV=production`).
- [x] Build compilation (`npm run build`).
