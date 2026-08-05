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
  - **Sample Template Downloads**: Added instant download buttons for sample CSV (`fabricvault_bulk_import_template.csv`) and sample JSON (`fabricvault_bulk_import_template.json`).
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
