# Project Progress Log

## Recent Completed Features

### 1. Razorpay Payment Gateway Integration
- **Database Schema**: Added `razorpayEnabled`, `razorpayKeyId`, and `razorpayKeySecret` to `Company` table in Supabase ([migration_add_razorpay.sql](../supabase/migration_add_razorpay.sql)).
- **ERP Admin Settings**: Added a **Payment Gateways** tab in `/dashboard/settings` ([apps/erp-admin/app/dashboard/settings/page.tsx](../apps/erp-admin/app/dashboard/settings/page.tsx)) enabling tenant admins to configure and toggle Razorpay credentials securely.
- **Storefront Payment APIs**:
  - `GET /api/payment-config`: Returns `enabled` status and public `keyId` without exposing secret credentials.
  - `POST /api/razorpay/create-order`: Server-side order creation (`razorpay.orders.create`) using the official `razorpay` Node.js SDK.
  - `POST /api/razorpay/verify-payment`: Server-side HMAC SHA256 signature verification (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) before marking order as `PAID`.
- **Storefront Checkout UI**: Added dynamic Razorpay popup modal checkout options (UPI, GPay, PhonePe, Cards, NetBanking).

### 2. POS Counter Sales & Manual Direct Billing Terminal (`/dashboard/pos`)
- **Backend POS API Endpoint**: Created `/api/pos/checkout` ([apps/erp-admin/app/api/pos/checkout/route.ts](../apps/erp-admin/app/api/pos/checkout/route.ts)):
  - Validates item stock levels for the selected active store/warehouse (`warehouseId`).
  - Automatically decrements stock levels in Supabase PostgreSQL (`ProductVariant.currentStockLevel`).
  - Records orders with `orderSource: "POS"`, `financialStatus: "paid"`, `fulfillmentStatus: "fulfilled"`.
- **POS Billing Terminal UI**: Built `/dashboard/pos` ([apps/erp-admin/app/dashboard/pos/page.tsx](../apps/erp-admin/app/dashboard/pos/page.tsx)):
  - **Fast Barcode / SKU Scanner**: Auto-focus input for instant barcode scanning and variant selection.
  - **Location-Bound Inventory**: Stock queries and deductions are strictly bound to the active store/warehouse selected in the top bar header.
  - **Payment Modes**: Supports Cash 💵, UPI 📱 (QR / GPay), Credit/Debit Card 💳, and Store Credit 🧾.
  - **Role Access Control**: Wrapped with `<RoleGuard allowedRoles={["SUPERADMIN", "TENANTADMIN", "STAFF"]}>` to allow counter staff and operators to perform billing while restricting settings.
  - **Thermal Receipt Printing**: Instant printable thermal bill invoice modal for walk-in counter customers.

### 3. CSV & JSON Bulk Product Import Engine (`/dashboard/inventory`)
- **Bulk Import API Endpoint**: Created `/api/products/bulk-import` ([apps/erp-admin/app/api/products/bulk-import/route.ts](../apps/erp-admin/app/api/products/bulk-import/route.ts)):
  - Grouping engine to resolve or create parent Product styles, Brand relationships, and ProductVariant rows in Supabase PostgreSQL.
  - Automatically handles SKU collision checks, updating stock levels and pricing when SKUs already exist.
- **Inventory Import UI**: Updated `/dashboard/inventory` ([apps/erp-admin/app/dashboard/inventory/page.tsx](../apps/erp-admin/app/dashboard/inventory/page.tsx)):
  - **CSV & JSON Parser**: Accepts both standard `.csv` spreadsheet files and `.json` catalog files.
  - **Sample Template Downloads**: Added instant download buttons for sample CSV (`merchantvault_bulk_import_template.csv`) and sample JSON (`merchantvault_bulk_import_template.json`).
  - **Pre-Import Analysis**: Displays live row validation preview before committing changes to the database.

### 5. Single Custom Domain & `/admin` Rewrite Routing
- **Storefront Next.js Config**: Created [apps/storefront/next.config.mjs](../apps/storefront/next.config.mjs) configuring automatic Next.js multi-zone rewrites for `/admin` and `/admin/:path*` to forward directly to the ERP Admin dashboard (`NEXT_PUBLIC_APP_URL`).
- **Storefront Edge Middleware**: Updated [apps/storefront/middleware.ts](../apps/storefront/middleware.ts) to bypass `/admin` paths so rewrites pass through cleanly.
- **Documentation**: Updated [docs/domain_routing_sop.md](../docs/domain_routing_sop.md) detailing the single custom domain setup for client tenants (`storedomain.com` for storefront & `storedomain.com/admin` for ERP staff).

### 6. Storefront SEO Optimization & Dynamic XML Sitemap
- **Root Storefront Layout** ([apps/storefront/app/layout.tsx](../apps/storefront/app/layout.tsx)):
  - Added OpenGraph (`og:title`, `og:description`, `og:site_name`, `og:type`) and Twitter Cards (`summary_large_image`).
  - Added Schema.org **`Organization`** JSON-LD structured data with dynamic headers host parsing (`headers()`).
- **Product Detail Pages** ([apps/storefront/app/products/[id]/page.tsx](../apps/storefront/app/products/[id]/page.tsx)):
  - Dynamically injects Schema.org **`Product`** and **`Offer`** JSON-LD structured data (SKU, title, price, currency `INR`, stock availability, and seller organization).
- **Dynamic XML Sitemap Generator** ([apps/storefront/app/sitemap.ts](../apps/storefront/app/sitemap.ts)):
  - Generates `/sitemap.xml` dynamically querying active product catalog items from Supabase PostgreSQL.
- **Search Engine Crawler Rules** ([apps/storefront/app/robots.ts](../apps/storefront/app/robots.ts)):
  - Generates `/robots.txt` allowing public indexing of product pages while restricting private `/checkout`, `/admin`, and `/api/` paths.

### 4. Sales Channel Order Separation
- **OrderSource Enum**: Added `OrderSource` enum (`STOREFRONT`, `SHOPIFY`, `POS`, `MANUAL`) in Supabase database schema ([migration_add_order_source.sql](../supabase/migration_add_order_source.sql)).
- **Database Schema**: Added `orderSource` column to both `Order` and `OrderFulfillment` tables.
- **Backend API & Webhooks**: Updated `/api/webhooks/shopify/orders-create` and `/api/orders` to automatically tag and filter orders by their origin (`orderSource: "STOREFRONT"` vs `orderSource: "SHOPIFY"`).
- **ERP Admin UI**: Rendered visual source badges (`STOREFRONT` in Teal vs `SHOPIFY` in Purple) in the orders dashboard ([apps/erp-admin/app/dashboard/orders/page.tsx](../apps/erp-admin/app/dashboard/orders/page.tsx)).

### 7. MerchantVault Rebranding & Generic E-Commerce Copy Refactoring
- **Environment & URL Configuration**: Updated `.env.local` and `.env.example` URLs to `https://merchantvault.vercel.app`.
- **Copy Generalization**: Replaced apparel-specific wording (*"garments"*, *"fabric"*, *"cloth"*) with generic retail e-commerce terms (*"products"*, *"items"*, *"catalog"*, *"inventory"*) across storefront fallbacks, fulfillment status badges (`Items Checked & Packed`), and superadmin onboarding defaults.

### 8. Separate Public Storefront Name (`storeName`) vs. Legal Entity (`name`)
- **Database Schema**: Added `supabase/migration_add_store_name.sql` adding `storeName` column to `Company` table in Supabase.
- **Backend APIs**: Updated `/api/products` and `/api/settings` to handle `storeName` alongside `name`.
- **ERP Admin Settings**: Added a **Public Storefront Name** (`storeName`) input field alongside **Company Legal Name** (`name`) and read-only **Tenant Slug** (`code`) in `/dashboard/settings`.
- **Storefront Rendering**: Updated storefront header, POS receipts, and footer to display `storeName` for public branding and `name` for legal operations.

### 9. Storefront Hero CSS Styling & Mobile Responsive UX
- **Modern Hero Styling**: Added ambient radial gradient background mesh glow, glassmorphism badge pill, text gradient masking, and interactive CTA shimmer buttons in `app/globals.css` and `app/page.tsx`.
- **Flexible Catalog Pagination**: Increased default pagination to `12` items per page and added a dynamic **Items per Page** dropdown selector (`12`, `24`, `48`, `96`).
- **Mobile Quick View Modal Fix**: Added `-webkit-overflow-scrolling: touch`, responsive max-height constraints, and adaptive image scaling so size/color selectors and cart buttons render cleanly on mobile viewports.

### 10. Next.js 16+ `proxy.ts` Edge Proxy Migration
- **Edge Proxy Migration**: Created root `proxy.ts` with `export function proxy(request: NextRequest)` conforming to Next.js 16 edge routing specification.
- **Clean Deprecation Fix**: Removed legacy `middleware.ts` to eliminate build conflicts and deprecation warnings.

### 11. Multi-Tenant Subscription & Disruptive Pricing Strategy
- **Architecture & Entitlement Matrix**: Designed comprehensive SaaS multi-tenant subscription engine documented in `docs/subscription_pricing_architecture.md`.
- **Shopify Competitive Positioning**: Positioned Merchant Vault as a 0% platform fee alternative with tiers: Starter (₹999/mo), Growth (₹1,999/mo), Enterprise (₹4,999/mo).
- **Database Schema Extensions**: Planned `SubscriptionPlan`, `TenantUsageMeter`, and `SubscriptionInvoice` tables in SQL schema.

### 12. Merchant Vault Branding Standardization & `NEXT_PUBLIC_APP_URL` Refactoring
- **Standardized Workspace Rules**: Configured `.agents/AGENTS.md` specifying official branding as **Merchant Vault** (`merchantvault`), mandatory relative file linking in documentation, and environment variable domain resolution.
- **Removed Hardcoded Domain URLs**: Replaced all hardcoded `merchantvault.vercel.app` and `fabricvault-storefront` instances across `app/sitemap.ts`, `app/robots.ts`, `app/page.tsx`, `app/checkout/page.tsx`, `app/dashboard/layout.tsx`, and `app/dashboard/settings/page.tsx` with dynamic `process.env.NEXT_PUBLIC_APP_URL`.

### 13. Hybrid Sales Channel Order Ingestion & Tenant Razorpay Integration
- **Native Orders API**: Refactored `app/api/orders/route.ts` to include a native `POST` handler for direct storefront order placement (`/api/orders`), decoupling native checkout from the external Shopify webhook endpoint.
- **Tenant Razorpay Credentials**: Updated `/api/razorpay/create-order` and `app/checkout/page.tsx` to dynamically parse `companyId` context, initializing payments using the active merchant's own Razorpay API keys (`razorpayKeyId` & `razorpayKeySecret`).
### 14. High-Volume Promotional Campaigns & Flash Sales Engine (Big Billion Sale, Wednesday Midnight Blitz)
- **Architectural Plan**: Created `implementation_plan.md` defining automated price drops, sticky countdown banners, WhatsApp broadcast triggers, and high-concurrency atomic stock locking for 10x-50x sales events.
- **Database Schema Migration**: Created `supabase/migration_add_campaigns.sql` and appended `Campaign`, `CampaignProduct`, and `CampaignAnalytics` schemas to `supabase/schema.sql`.
- **Backend API Routes**: Built `app/api/crm/campaigns/route.ts` with `GET` and `POST` handlers for querying active campaigns and dispatching promotional events.
- **ERP Campaign Desk Integration**: Added Big Billion Sale (`🔥 Big Billion Sale Special`) and Wednesday Blitz (`⚡ Wednesday Midnight Flash Sale`) pre-configured message templates in `app/dashboard/crm/page.tsx`.
- **Storefront Campaign Themes**: Added sticky promotional announcement banners in `app/page.tsx` with dynamic visual themes (`🔥 Big Billion Sale` Amber Gold, `⚡ Wednesday Flash Blitz` Electric Blue, `✨ Festive Mega Sale` Ruby Rose) complete with countdown timers, promo code snippets (`BBD50`), and dismissal controls.




