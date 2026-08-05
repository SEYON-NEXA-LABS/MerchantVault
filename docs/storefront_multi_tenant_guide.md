# Multi-Tenant Storefront Configuration Guide

This document explains how to configure and deploy the **Storefront application (`apps/storefront` running on port `:3001`)** in **Multi-Tenant mode**, allowing multiple client brands and companies to share a single codebase and database while maintaining strict tenant isolation.

---

## 1. Tenant Resolution Strategies

There are **three supported strategies** for routing customer storefront traffic to the correct tenant company context:

### Strategy 1: URL Query Parameters & Slugs (Development, Testing & Direct Links)
Pass the tenant readable slug or unique company code directly in the URL:

- **Company A (The Wolf Cabin)**: `https://fabricvault-storefront.vercel.app/?slug=wolfcabin`
- **Company B (Seyon Default)**: `https://fabricvault-storefront.vercel.app/?slug=syn`
- **Legacy UUID Fallback**: `https://fabricvault-storefront.vercel.app/?companyId=00000000-0000-0000-0000-000000000000`

> **Behavior**: Upon initial visit, the Storefront saves the tenant slug in browser `localStorage`. All catalog requests, pricing, themes, payment gateway settings, and order submissions are filtered strictly for that tenant.

---

### Strategy 2: Subdomain Multi-Tenancy (SaaS Model)
Map tenant subdomains to the same Storefront deployment:

- `wolfcabin.fabricvault-storefront.vercel.app` ➔ Resolves tenant `wolfcabin`
- `denimco.fabricvault-storefront.vercel.app` ➔ Resolves tenant `denimco`

#### Next.js Middleware (`apps/storefront/middleware.ts`):
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
    const url = req.nextUrl.clone();
    url.searchParams.set('slug', subdomain);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
```

---

### Strategy 3: Custom Domains & Domain Forwarding (Tenant-Purchased Domains)

> 📖 **Complete SOP**: For detailed step-by-step instructions on setting up DNS records, domain forwarding, and CNAME records for client tenants, see **[domain_routing_sop.md](domain_routing_sop.md)**.

If a tenant purchases their own domain (e.g. `www.wolfcabin.com` or `shop.wolfcabin.com`), they have **3 seamless options** to connect to your Storefront:

#### Option A: Domain Forwarding / Redirect with Path (Easiest)
In their domain registrar (GoDaddy, Namecheap, Cloudflare, BigRock):
1. Navigate to **Domain Settings &rarr; Forwarding / Redirect**.
2. Set Destination URL to your Storefront URL with their slug:  
   `https://fabricvault-storefront.vercel.app/?slug=wolfcabin`
3. Select **301 Permanent Redirect** or **Masked Forwarding**.

#### Option B: CNAME Subdomain Alias (e.g., `shop.wolfcabin.com`)
1. Tenant creates a `CNAME` record pointing to your Storefront deployment:
   ```text
   Type: CNAME
   Host: shop (or store)
   Value: cname.vercel-dns.com (or fabricvault-storefront.vercel.app)
   ```
2. In Next.js Middleware ([apps/storefront/middleware.ts](../apps/storefront/middleware.ts)), the system automatically extracts `shop.wolfcabin.com` or inspects `slug` mapping.

#### Option C: Subdomain Routing (e.g., `wolfcabin.fabricvault-storefront.vercel.app`)
Add a wildcard CNAME `*.fabricvault-storefront.vercel.app` in Vercel. Any subdomain automatically maps to `?slug={subdomain}` via Next.js Middleware.

---

## 2. Multi-Tenant Isolated Features

| Feature Component | How Multi-Tenancy Is Enforced |
| :--- | :--- |
| **Branding & Logos** | Loads dynamic company name, logo image, and theme colors. |
| **Product Catalog** | Product queries are scoped via `ProductVariant.companyId`. |
| **Payment Gateways** | Independent Razorpay API keys (`razorpayKeyId`, `razorpayKeySecret`) configured per tenant in ERP Admin Settings. |
| **Order Origin Tracking** | Orders are tagged with `orderSource: "STOREFRONT"` vs `"SHOPIFY"`. |
| **Brands & Collections** | Sub-brands are filtered via `Brand.companyId`. |
| **Checkout & Webhooks** | Orders created are tagged with `companyId` in the ERP database. |
| **Oversell Protection** | Stock balance checks & safety buffers apply per tenant warehouse pool. |
