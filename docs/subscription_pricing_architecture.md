# Multi-Tenant Subscription & Competitive Pricing Architecture

## 1. Executive Summary
Merchant Vault is designed as a high-performance multi-tenant B2B SaaS platform specifically built for Indian D2C brands, textile hubs, and retail chains.

To aggressively compete against and disrupt legacy platforms like Shopify, Merchant Vault offers an **All-in-One ERP + Storefront + POS + WhatsApp CRM** with **0% platform transaction fees**.

---

## 2. Competitive Pricing Strategy vs Shopify

### Why Shopify is Expensive in India
* **Base Subscription**: ~$25 - $39/mo (**~₹1,999 - ₹3,200/mo**).
* **Platform Penalty**: **2.0% extra transaction fee** on all non-Shopify Payments transactions (COD, UPI, Razorpay).
* **Required Third-Party Apps**:
  * WhatsApp Order Recovery & CRM: ~₹2,000/mo
  * Multi-Warehouse Stock Sync: ~₹3,000/mo
  * POS Billing Pro: $89/mo (~₹7,400/mo)
* **Total Monthly Shopify Cost**: **₹7,000 – ₹15,000+ / month**

### Seyon Shopping Disruptive Subscription & Add-On Matrix

Seyon Shopping operates a **Low Base ERP (₹499/mo) + Modular A La Carte Add-On Architecture**:

| Feature / Limit | MICRO (POS ERP) | BASIC (STOREFRONT LITE) | STARTER BUNDLE | GROWTH BUNDLE | ENTERPRISE HUB |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Monthly Price** | **₹499 / mo** | **₹799 / mo** | **₹999 / mo** | **₹1,999 / mo** | **₹4,999 / mo** |
| **Annual Price (2 Mo Free)** | **₹4,990 / yr** | **₹7,990 / yr** | **₹9,990 / yr** | **₹19,990 / yr** | **₹49,990 / yr** |
| **Platform Transaction Fee** | **0%** | **0%** | **0%** | **0%** | **0%** |
| **POS Billing Terminal** | Included | Included | Included | Included | Included |
| **Multi-Location Inventory** | 1 Warehouse | 1 Warehouse | 1 Warehouse | 3 Warehouses | Unlimited |
| **1. Storefront & Domain Pack (₹499/mo)** | Add-On | **Included** | **Included** | **Included** | **Included** |
| **2. GST Engine & Tally Pack (₹299/mo)** | Add-On | Add-On | **Included** | **Included** | **Included** |
| **3. Marketplace Sync Pack (₹699/mo)** | Add-On | Add-On | Add-On | **Included** | **Included** |
| **4. B2B & TDS Compliance (₹499/mo)** | Add-On | Add-On | Add-On | Add-On | **Included** |


---

### 5 Modular "A La Carte" Add-On Bundles

1. 🌐 **Storefront & Custom Domain Pack (₹499 / mo)**: Custom domain (`brand.com`), custom subdomains (`brand.seyon.app`), white-labeling (removes "Powered by"), and storefront themes (`Company.customDomain`, `Company.hasWhiteLabelAddon`).
2. 🔄 **Marketplace Sync Pack (₹699 / mo)**: Automated Shopify, Amazon, and Flipkart multi-channel inventory sync (`Company.hasMarketplaceSyncAddon`).
3. 📜 **GST Tax Engine & Tally Pack (₹299 / mo)**: Dynamic CGST/SGST/IGST splits, GSTR-1 CSV reports, and one-click Tally Prime XML export (`Company.hasGstEngineAddon`).
4. 🏢 **B2B & TDS Compliance Pack (₹499 / mo)**: Section 194C/194Q TDS deductions, Section 206C(1H) TCS collections, and B2B credit limits (`Company.hasTdsAddon`).
5. 💬 **WhatsApp & AI Marketing Campaign Pack (₹599 / mo)**: Automated WhatsApp abandoned cart recovery, AI broadcast targeting, VIP customer segments, and automated Meta/Instagram leads integration (`Company.hasMarketingAiAddon`).

---

### Perpetual License Rule (₹75,000 + ₹15,000/yr AMC)

When a merchant is assigned the **Perpetual License (`ONETIME_AMC`)** or **ENTERPRISE** plan:
* **All 5 Add-On Modules are automatically activated (`true`)**:
  * `hasWhiteLabelAddon = true` (Full White-Labeling)
  * `hasMarketplaceSyncAddon = true` (Shopify/Amazon Multi-Channel Sync)
  * `hasGstEngineAddon = true` (Full GST & Tally Export)
  * `hasTdsAddon = true` (Section 194C/194Q TDS Withholding)
  * `hasMarketingAiAddon = true` (WhatsApp & AI Marketing Engine)
* Unlimited Warehouses, Products, Staff Accounts, and Storefront Outlets.





## 3. Database Schema Specification (`supabase/schema.sql`)

The database architecture uses three core entities to manage subscriptions, quotas, and invoices:

```sql
-- 1. Subscription Plans Master
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" TEXT UNIQUE NOT NULL, -- 'STARTER', 'GROWTH', 'ENTERPRISE'
    "name" TEXT NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION NOT NULL,
    "maxProducts" INTEGER DEFAULT 1000,
    "maxMonthlyOrders" INTEGER DEFAULT 1000,
    "maxStaffUsers" INTEGER DEFAULT 5,
    "maxWarehouses" INTEGER DEFAULT 2,
    "hasPosModule" BOOLEAN DEFAULT true,
    "hasShopifySync" BOOLEAN DEFAULT true,
    "hasAdvancedAnalytics" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tenant Monthly Meter Tracking
CREATE TABLE IF NOT EXISTS "TenantUsageMeter" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "billingMonth" TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g. '2026-08')
    "ordersCount" INTEGER DEFAULT 0 NOT NULL,
    "productsCount" INTEGER DEFAULT 0 NOT NULL,
    "whatsappAlertsSent" INTEGER DEFAULT 0 NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("companyId", "billingMonth")
);

-- 3. Billing Ledger & Invoices
CREATE TABLE IF NOT EXISTS "SubscriptionInvoice" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "subscriptionId" UUID NOT NULL REFERENCES "Subscription"("id") ON DELETE CASCADE,
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT DEFAULT 'INR' NOT NULL,
    "status" TEXT NOT NULL, -- 'PAID', 'FAILED', 'PENDING'
    "periodStart" TIMESTAMP WITH TIME ZONE NOT NULL,
    "periodEnd" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 4. Middleware & Access Control Flow

```mermaid
flowchart TD
    TenantRequest[Tenant Request to /dashboard or /api] --> CheckStatus{Check Tenant Subscription}
    CheckStatus -->|ACTIVE / TRIAL| CheckQuota{Check Resource Quotas}
    CheckStatus -->|PAST_DUE > 7 Days / SUSPENDED| Lock[Redirect to /dashboard/settings/billing]
    
    CheckQuota -->|Under Limit| Allow[Proceed with API Execution]
    CheckQuota -->|Limit Exceeded| QuotaError[Return 402 Payment Required - Upgrade Plan]
```

---

## 5. Razorpay Subscription & Webhook Lifecycle

1. **Plan Setup**: Razorpay recurring plans (`plan_id`) mapped to `STARTER`, `GROWTH`, and `ENTERPRISE`.
2. **Webhook Listener (`/api/webhooks/razorpay`)**:
   - `subscription.charged`: Extends `nextRenewalDate` by 30 days / 365 days, sets `status = 'ACTIVE'`, logs `SubscriptionInvoice`.
   - `subscription.halted`: Updates status to `PAST_DUE` with a 7-day grace period before lock.
