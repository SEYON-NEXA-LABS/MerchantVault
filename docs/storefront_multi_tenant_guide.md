# Multi-Tenant Storefront Configuration Guide

This document explains how to configure and deploy the **Storefront application (`apps/storefront` running on port `:3001`)** in **Multi-Tenant mode**, allowing multiple client brands and companies to share a single codebase and database while maintaining strict tenant isolation.

---

## 1. Tenant Resolution Strategies

There are **three supported strategies** for routing customer storefront traffic to the correct tenant company context:

### Strategy 1: URL Query Parameters (Development & Testing)
Pass the tenant ID or unique company code directly in the URL:

- **Company A (The Wolf Cabin)**: `http://localhost:3001/?companyCode=wolfcabin`
- **Company B (FabricVault Default)**: `http://localhost:3001/?companyId=00000000-0000-0000-0000-000000000000`

> **Behavior**: Upon initial visit, the Storefront saves `companyId` in browser `localStorage`. All catalog requests, pricing, themes, and order submissions are filtered strictly for that tenant.

---

### Strategy 2: Subdomain Multi-Tenancy (SaaS Model)
Map tenant subdomains to the same Storefront deployment:

- `wolfcabin.fabricvault.app` ➔ Resolves tenant `wolfcabin`
- `denimco.fabricvault.app` ➔ Resolves tenant `denimco`

#### Next.js Middleware (`apps/storefront/middleware.ts`):
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
    const url = req.nextUrl.clone();
    url.searchParams.set('companyCode', subdomain);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
```

---

### Strategy 3: Custom Domains (White-Label Retail)
Map client custom CNAME records (e.g., `shop.wolfcabin.com`) directly to your Vercel deployment:

1. Add `shop.wolfcabin.com` to Vercel Domains list.
2. Store `customDomain: "shop.wolfcabin.com"` in the PostgreSQL `Company` table.
3. The Storefront API inspects the `Host` header to resolve `companyId` automatically.

---

## 2. Multi-Tenant Isolated Features

| Feature Component | How Multi-Tenancy Is Enforced |
| :--- | :--- |
| **Branding & Logos** | Loads dynamic company name, logo image, and theme colors. |
| **Product Catalog** | Product queries are scoped with `.eq("companyId", companyId)`. |
| **Brands & Collections** | Sub-brands are filtered via `Brand.companyId`. |
| **Checkout & Webhooks** | Orders created are tagged with `companyId` in the ERP database. |
| **Oversell Protection** | Stock balance checks & safety buffers apply per tenant warehouse pool. |
