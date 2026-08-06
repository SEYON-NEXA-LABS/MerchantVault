# MERCHANT VAULT — Enterprise Retail ERP & D2C Storefront OS

[![Powered by](https://img.shields.io/badge/Engineered%20By-SEYON%20NEXA%20LABS-0d9488?style=for-the-badge)](https://merchantvault.vercel.app)
[![Framework](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Gateway](https://img.shields.io/badge/Razorpay-Integrated-02042b?style=for-the-badge&logo=razorpay)](https://razorpay.com)

**MERCHANT VAULT** is an enterprise-grade, multi-tenant D2C retail operations suite and storefront engine built by **SEYON NEXA LABS**. It features an all-in-one ERP management suite, POS counter billing terminal, warehouse logistics coordinator, dynamic pricing & velocity analytics, multi-tenant storefront engine, and real-time payment gateway capabilities.

---

## 🌐 Live Application Endpoints

- 🛍️ **Public D2C Customer Storefront**: `http://localhost:3000/` (or `https://yourcustomdomain.com/`)
- 🏢 **Retail Merchant & Staff Access Portal**: `http://localhost:3000/admin` (or `https://yourcustomdomain.com/admin`)
- 📊 **ERP Operations & POS Billing Terminal**: `http://localhost:3000/dashboard` (or `https://yourcustomdomain.com/dashboard`)

---

## 🌟 Key Platform Capabilities

### 1. Universal Multi-Tenant Architecture & Domain Engine
- **Any Retail Industry Category**: Built for apparel, footwear, electronics, cosmetics, groceries, jewelry, home decor, or hardware.
- **3 Flexible Tenant Resolution Modes**:
  - 🔗 **Query Params**: `http://localhost:3000/?slug=clientcode` (or `?companyId=UUID`) for direct links & WhatsApp shares.
  - 🌐 **Subdomain Aliases**: `https://clientcode.merchantvault.com/` auto-rewritten by Edge `middleware.ts`.
  - 🏷️ **Custom Domains**: `https://clientbrand.com/` (Customer Shopping) and `https://clientbrand.com/admin` (Staff Operations).
- **Storefront Theme Customizer**: Choose from 5 preset color palettes (*Emerald Teal*, *Streetwear Dark*, *Royal Indigo*, *Blush Rose*, *Forest Sage*), Google Fonts (`Inter`, `Outfit`, `Playfair Display`, `Plus Jakarta Sans`, `Cinzel`), and UI corner radius settings with live preview.
- **Multi-Tenant SEO & Rich Snippets**:
  - **Dynamic `Organization` & `Product` JSON-LD**: Schema.org structured data scripts dynamically reading active tenant domains via `headers()`.
  - **Dynamic `/sitemap.xml` & `/robots.txt`**: Native Next.js 16 metadata routes auto-generating product sitemaps and search crawler rules per tenant domain.

### 2. POS Counter Billing & Multi-Channel Sales
- **POS / Counter Direct Sales**: Full-screen billing terminal (`/dashboard/pos`) with auto-focus barcode scanner, location-bound inventory pool deduction (`📍 activeWarehouseId`), staff role gating, split payments (Cash 💵, UPI 📱, Card 💳, Credit 🧾), and printable thermal receipts.
- **Sales Channel Order Separation**: Automatically distinguishes **Storefront** online orders (`OrderSource: "STOREFRONT"`), **POS Counter** sales (`OrderSource: "POS"`), and **Shopify** sync orders (`OrderSource: "SHOPIFY"`).
- **Razorpay Payment Gateway**: Independent tenant gateway credentials (`Razorpay Key ID` & `Key Secret`) with server-side HMAC SHA256 signature verification.

### 3. Inventory & Fulfillment Intelligence
- **CSV & JSON Bulk Import**: Onboard products in bulk using standard `.csv` spreadsheets or `.json` catalog files with downloadable sample templates (`merchantvault_bulk_import_template.csv` & `.json`).
- **Warehouse Fulfillment & Stock Balances**: Track inventory balances across multiple pickup centers and warehouses.
- **Inter-Warehouse Stock Transfers**: Coordinate stock movements between facilities with operator approval workflows.
- **RTO & COD Verification**: Calculate dynamic RTO risk scores based on pincode validity and delivery address quality.

---

## 🚀 Quick Start (Development & Deployment)

### 1. Environment Setup
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Launch Development Server
```bash
# Install dependencies
npm install

# Run unified dev server on http://localhost:3000
npm run dev
```

### 3. Production Build & Start
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## ☁️ Deployment & Domain Routing Documentation

Detailed deployment guides for Vercel and Hostinger VPS (PM2 / NGINX):
- 📄 [Custom Domain & Hostinger VPS Deployment SOP](docs/domain_routing_sop.md)

---

## 🔒 Security & RBAC Enforcement

- **Role-Based Access Control (RBAC)**: Enforces `SUPERADMIN`, `TENANTADMIN`, and `STAFF` permissions across UI elements and API endpoints.
- **HMAC Payment Signature Verification**: Validates Razorpay Webhooks and Checkout payments server-side.
- **Supabase Row Level Security (RLS)**: Isolates tenant data strictly at the database level.
