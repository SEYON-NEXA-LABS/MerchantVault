# FABRIC VAULT — Enterprise Apparel ERP & Storefront OS

[![Powered by](https://img.shields.io/badge/Engineered%20By-SEYON%20NEXA%20LABS-0d9488?style=for-the-badge)](https://fabricvault.vercel.app)
[![Framework](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Monorepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?style=for-the-badge&logo=turborepo)](https://turbo.build)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Gateway](https://img.shields.io/badge/Razorpay-Integrated-02042b?style=for-the-badge&logo=razorpay)](https://razorpay.com)

**FABRIC VAULT** is an enterprise-grade, multi-tenant D2C apparel operations suite and storefront engine built by **SEYON NEXA LABS**. It features an all-in-one ERP management suite, warehouse logistics coordinator, dynamic pricing & velocity analytics, multi-tenant storefront engine, and real-time payment gateway capabilities.

---

## 🌐 Live Production Deployments

- 🏢 **FABRIC VAULT ERP Admin Panel**: [https://fabricvault.vercel.app](https://fabricvault.vercel.app)
- 🛍️ **FABRIC VAULT Public Storefront**: [https://fabricvault-storefront.vercel.app](https://fabricvault-storefront.vercel.app)

---

## 🌟 Key Platform Capabilities

### 1. Multi-Tenant Architecture & Domain Engine
- **Tenant Slug Resolution**: Route storefront traffic effortlessly via `?slug=tenant_code` or `?code=tenant_code`.
- **Single Custom Domain + `/admin` Routing**: Support Shopify-style unified domains (`storedomain.com` for public customer shopping and `storedomain.com/admin` for staff ERP operations) via Next.js multi-zone rewrites.
- **Custom Domains & Forwarding**: Support tenant-owned custom domains via 301 redirects, CNAME aliases, and wildcard subdomains (`wolfcabin.fabricvault-storefront.vercel.app`).
- **Storefront Theme Customizer**: Choose from 5 preset color palettes (*Emerald Teal*, *Streetwear Dark*, *Royal Indigo*, *Blush Rose*, *Forest Sage*), Google Fonts (`Inter`, `Outfit`, `Playfair Display`, `Plus Jakarta Sans`, `Cinzel`), and UI corner radius settings with live preview.
- **Multi-Tenant SEO & Rich Snippets**:
  - **Dynamic `Organization` & `Product` JSON-LD**: Schema.org structured data scripts dynamically reading active tenant domains via `headers()`.
  - **Dynamic `/sitemap.xml` & `/robots.txt`**: Native Next.js 16 metadata routes auto-generating product sitemaps and search crawler rules per tenant domain.

### 2. POS Counter Billing & Multi-Channel Sales
- **POS / Counter Direct Sales**: Full-screen billing terminal (`/dashboard/pos`) with auto-focus barcode scanner, location-bound inventory pool deduction (`📍 activeWarehouseId`), staff role gating, split payments (Cash 💵, UPI 📱, Card 💳, Credit 🧾), and printable thermal receipts.
- **Sales Channel Order Separation**: Automatically distinguishes **Storefront** online orders (`OrderSource: "STOREFRONT"`), **POS Counter** sales (`OrderSource: "POS"`), and **Shopify** sync orders (`OrderSource: "SHOPIFY"`).
- **Razorpay Payment Gateway**: Independent tenant gateway credentials (`Razorpay Key ID` & `Key Secret`) with server-side HMAC SHA256 signature verification.

### 3. Inventory & Fulfillment Intelligence
- **CSV & JSON Bulk Import**: Onboard products in bulk using standard `.csv` spreadsheets or `.json` catalog files with downloadable sample templates (`fabricvault_bulk_import_template.csv` & `.json`).
- **Warehouse Fulfillment & Stock Balances**: Track inventory balances across multiple pickup centers and warehouses.
- **Inter-Warehouse Stock Transfers**: Coordinate stock movements between facilities with operator approval workflows.
- **RTO & COD Verification**: Calculate dynamic RTO risk scores based on pincode validity and delivery address quality.

---

## 🎨 System Interface Schema

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ☰ FABRIC VAULT ERP                                      (🔗 WhatsApp)  🔔  [Admin Profile]  │
├───────────────┬─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Dashboard  │  [Today's Orders] [Sales Revenue] [New Customers] [RTO %] [Gross Profit]    │
│               │  ───────────────────────────────────────────────────────────────────────    │
│ INVENTORY     │  ┌───────────────────────┐ ┌────────────────────┐ ┌───────────────────────┐ │
│ ├─ Stock      │  │   [Sales Overview]    │ │   [Top Products]   │ │   [Recent Orders]     │ │
│ └─ Transfers  │  │   (Bar / Line Graph)  │ │   1. SKU-M / Black │ │   #ORD-10253 (AWB)    │ │
│               │  └───────────────────────┘ └────────────────────┘ └───────────────────────┘ │
│ SETTINGS      │  ───────────────────────────────────────────────────────────────────────    │
│ ├─ Company    │  ┌───────────────────────┐ ┌────────────────────┐ ┌───────────────────────┐ │
│ ├─ Gateways   │  │ [Payment Gateways]    │ │ [Storefront Link]  │ │   [Logistics Hubs]    │ │
│ └─ Logistics  │  │ (Razorpay Active)     │ │ (Copy / Share URL) │ │   (Coimbatore WH-01)  │ │
│               │  └───────────────────────┘ └────────────────────┘ └───────────────────────┘ │
└───────────────┴─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Monorepo Architecture Layout

```text
fabricvault-monorepo/
├── apps/
│   ├── erp-admin/                 # FABRIC VAULT ERP Operations & Settings Panel (Next.js)
│   │   ├── app/                   # App Router dashboard, settings, orders, logistics
│   │   └── package.json
│   └── storefront/                # FABRIC VAULT Consumer Catalog & Checkout Engine (Next.js)
│       ├── app/                   # Public product catalog, Razorpay API, checkout page
│       ├── middleware.ts          # Edge middleware for tenant slug & domain routing
│       └── package.json
├── packages/
│   └── db/                        # Shared database SDK layer (@repo/db)
│       ├── index.ts               # Supabase database client exports
│       └── package.json
├── docs/                          # Comprehensive technical guides & SOPs
│   ├── domain_routing_sop.md     # Tenant custom domain & redirection SOP
│   ├── storefront_multi_tenant_guide.md # Multi-tenant architecture guide
│   ├── superadmin_onboarding.md  # Tenant onboarding SOP
│   └── progress.md               # Recent completion logs
├── supabase/                      # PostgreSQL database schema & migrations
│   ├── schema.sql                 # Master database schema
│   ├── migration_add_razorpay.sql # Razorpay columns migration
│   └── migration_add_order_source.sql # OrderSource enum migration
├── package.json                   # Root monorepo workspace configurations
├── turbo.json                     # Turborepo build pipeline configurations
└── README.md                      # Primary repository README
```

---

## 🛠️ Tech Stack & Dependencies

- **Orchestration**: [Turborepo](https://turbo.build) monorepo build pipeline
- **Framework**: Next.js 16 (App Router, Edge Middleware, React 19)
- **Database**: Supabase PostgreSQL SDK client (`@repo/db`)
- **Payments**: Razorpay Node SDK (`razorpay`) with HMAC SHA256 verification
- **Styling & UI**: Tailwind CSS & Lucide React Icons

---

## 🚀 Local Development Guide

### 1. Environment Setup (`.env.local`)

Add a `.env.local` file inside `apps/erp-admin/` and `apps/storefront/`:

```env
# Database Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-service-role-key

# Production URLs
NEXT_PUBLIC_APP_URL=https://fabricvault.vercel.app
NEXT_PUBLIC_STOREFRONT_URL=https://fabricvault-storefront.vercel.app
```

### 2. Launch Development Servers

```bash
# Install root dependencies
npm install

# Run both dev servers concurrently (ERP Admin on 3000, Storefront on 3001)
npm run dev
```

### 3. Build & Run Individual Apps

Target specific workspace applications using npm workspaces or Turbo filters:

- **FABRIC VAULT ERP Admin (`apps/erp-admin`)**:
  ```bash
  # Run Dev Server
  npm run dev --workspace=erp-admin
  # OR: npx turbo dev --filter=erp-admin

  # Build Production Bundle
  npm run build --workspace=erp-admin
  # OR: npx turbo build --filter=erp-admin
  ```

- **FABRIC VAULT Storefront (`apps/storefront`)**:
  ```bash
  # Run Dev Server
  npm run dev --workspace=storefront
  # OR: npx turbo dev --filter=storefront

  # Build Production Bundle
  npm run build --workspace=storefront
  # OR: npx turbo build --filter=storefront
  ```

---

## ☁️ Hosting & Custom Domain Deployment Methods

### 1. Vercel Hosting & Custom Domain Deployment

Vercel natively understands Turborepo monorepos. To deploy with your own custom domain:

1. **Create Vercel Projects**:
   - Point **Project 1 (ERP Admin)** to `apps/erp-admin`.
   - Point **Project 2 (Storefront)** to `apps/storefront`.
2. **Add Custom Domain**:
   - Open **Storefront Project &rarr; Settings &rarr; Domains** and add your custom domain (e.g. `wolfcabin.com` and `www.wolfcabin.com`).
3. **Configure Registrar DNS**:
   - **A Record**: `@` ➔ `76.76.21.21`
   - **CNAME Record**: `www` ➔ `cname.vercel-dns.com`
4. **Live URL Access**:
   - 🛍️ **Storefront**: `https://wolfcabin.com`
   - 🏢 **ERP & POS Admin**: `https://wolfcabin.com/admin` (Automatically proxied behind the scenes to your ERP instance!)

> 📖 **Full SOP**: See **[domain_routing_sop.md](docs/domain_routing_sop.md)** for comprehensive DNS & CNAME configuration details.

### 2. Hostinger VPS / Node.js + PM2 Deployment

If deploying on **Hostinger VPS**, **cPanel Node.js**, or **AWS EC2**:

1. **SSH into Hostinger VPS & Install Node.js + PM2**:
   ```bash
   ssh root@your-hostinger-vps-ip
   npm install -g pm2
   ```
2. **Start Next.js Applications Concurrently**:
   ```bash
   # Start ERP Admin on port 3000
   pm2 start npm --name "erp-admin" --workspace=erp-admin -- run start

   # Start Storefront on port 3001
   pm2 start npm --name "storefront" --workspace=storefront -- run start
   pm2 save
   ```
3. **Configure NGINX Reverse Proxy for Single Domain (`wolfcabin.com` & `wolfcabin.com/admin`)**:
   ```nginx
   server {
       server_name wolfcabin.com www.wolfcabin.com;

       location / {
           proxy_pass http://127.0.0.1:3001; # Storefront
       }

       location /admin {
           proxy_pass http://127.0.0.1:3000/dashboard; # ERP Admin
       }
   }
   ```
4. **Issue Free SSL Certificate**:
   `sudo certbot --nginx -d wolfcabin.com -d www.wolfcabin.com`

### 3. Self-Hosted Docker Containers

Prune the monorepo for isolated container builds:

```bash
# Extract storefront files and shared @repo/db dependencies
npx turbo prune --scope=storefront --docker

# Extract erp-admin files and shared @repo/db dependencies
npx turbo prune --scope=erp-admin --docker
```

This generates an `out/` directory containing target app code and shared `@repo/db` dependencies for fast, minimal Docker builds.

---

## 📚 Technical Documentation & Guides

- 📖 **[Domain Routing SOP](docs/domain_routing_sop.md)** — Custom domain & subdomain redirection setup for clients.
- 🏢 **[Multi-Tenant Architecture Guide](docs/storefront_multi_tenant_guide.md)** — Tenant resolution & isolation details.
- 🚀 **[Superadmin Onboarding SOP](docs/superadmin_onboarding.md)** — Tenant provisioning API flow.
- 📝 **[Project Progress Log](docs/progress.md)** — Feature completions & security audit logs.

---

<p center align="center">
  Crafted with precision by <strong>SEYON NEXA LABS</strong> © 2026. All rights reserved.
</p>
