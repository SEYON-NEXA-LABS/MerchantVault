# Seyon Shopping — Dynamic Custom Domain & Multi-Tenant Deployment SOP

This document provides a step-by-step Standard Operating Procedure (SOP) for deploying **Seyon Shopping ERP & D2C Storefront OS** on **Vercel** and **Hostinger VPS (PM2 / NGINX)**, and explains how multi-tenant SaaS resolution works across query parameters, subdomains, and custom domains.


---

## 1. Architecture & Multi-Tenant Resolution Engine

**MerchantVault** runs as a **single, unified Next.js 16 application** on **Port 3000**. The engine supports **3 flexible tenant resolution modes**:

```text
  Customer Traffic Modes:
  1. Direct URL Link       (http://localhost:3000/?slug=clientcode)           ──┐
  2. Subdomain Alias       (https://clientcode.<YOUR_PLATFORM_DOMAIN>)        ──┼─► [Edge Router: proxy.ts]
  3. Custom Domain         (https://clientcustomdomain.com)                   ──┘         │
                                                                                        │ Rewrites to ?slug=clientcode
                                                                                        ▼
                                                                             ┌───────────────────────┐
  Staff Access Portals:                                                      │ Storefront API        │
  • Admin Login Portal     (http://localhost:3000/admin)                    │ (/api/products)       │
  • ERP & POS Terminal     (http://localhost:3000/dashboard)                │ Loads brand, catalog, │
                                                                             │ & Razorpay keys       │
                                                                             └───────────────────────┘
```

### Multi-Tenant Resolution Modes Breakdown:

| Resolution Mode | URL Example | Technical Resolution Workflow | Target Use Case |
| :--- | :--- | :--- | :--- |
| **A. URL Query Parameter** | `https://<YOUR_PLATFORM_DOMAIN>/?slug=wolfcabin`<br>`https://<YOUR_PLATFORM_DOMAIN>/?companyId=UUID` | API endpoint `/api/products` directly queries Supabase `Company` by `code` or `id`. | Direct marketing links, WhatsApp shares, QR code tags. |
| **B. Multi-Store Brand Parameter** | `https://<YOUR_PLATFORM_DOMAIN>/?brand=ethnic`<br>`https://<YOUR_PLATFORM_DOMAIN>/?brand=kids` | Resolves store branding, logos, theme colors, and category products by matching `Brand.code`. | Running multiple brand stores under 1 company context. |
| **C. Subdomain Alias** | `https://wolfcabin.<YOUR_PLATFORM_DOMAIN>/` | Edge proxy extracts `wolfcabin` from Host header and auto-rewrites internally to `?slug=wolfcabin`. | Platform SaaS multi-tenant subdomains. |
| **D. Custom Domain** | `https://wolfcabin.com/` | Edge proxy checks database custom domain mapping (`Company.customDomain = "wolfcabin.com"`). | White-label custom domain (Shopify-style). |


---

## 2. Vercel Custom Domain Deployment

Since **MerchantVault** is a unified Next.js project, deployment on Vercel requires **only 1 Vercel Project**:

### Step 1: Push Code & Connect Repository
1. Push your repository to GitHub / GitLab.
2. Log into [Vercel](https://vercel.com).
3. Import the repository as a **single project**.

### Step 2: Set Environment Variables
In Vercel Project Settings &rarr; **Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=https://<YOUR_PLATFORM_DOMAIN>
```

### Step 3: Add Custom Domain & Wildcard Record in Vercel
1. Go to **Settings &rarr; Domains**.
2. Type your main domain (e.g. `<YOUR_PLATFORM_DOMAIN>` and `*.<YOUR_PLATFORM_DOMAIN>`) and click **Add**.

### Step 4: Configure DNS Records in Registrar
Add these DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger):

| Record Type | Host / Name | Value / Target | Notes |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` | `76.76.21.21` | Points domain root to Vercel |
| **CNAME Record** | `www` | `cname.vercel-dns.com` | Points `www` subdomain to Vercel |
| **CNAME Record** | `*` | `cname.vercel-dns.com` | **Wildcard Subdomains**: Enables instant client subdomains |

*(Vercel automatically issues free SSL/TLS certificates within ~2 minutes!)*

### Step 5: Live Application Endpoints
- 🛍️ **`https://<YOUR_PLATFORM_DOMAIN>/`** ➔ Public D2C Storefront & Checkout.
- 🏢 **`https://<YOUR_PLATFORM_DOMAIN>/admin`** ➔ Retail Merchant & Staff Access Portal.
- 📊 **`https://<YOUR_PLATFORM_DOMAIN>/dashboard`** ➔ ERP Management & POS Counter Billing Terminal!

---

## 3. Hostinger VPS Deployment (PM2 + NGINX)

For Hostinger VPS, Ubuntu, AWS EC2, or DigitalOcean servers, deploy using **PM2** and **NGINX Reverse Proxy**:

### Step 1: Install Dependencies on VPS
```bash
# Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+ & NGINX
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### Step 2: Clone & Build Application
```bash
cd /var/www
sudo git clone https://github.com/your-username/fabricvault.git merchantvault
cd merchantvault

# Create environment file
sudo nano .env.local
```

Paste environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=https://<YOUR_PLATFORM_DOMAIN>
```

Build the production bundle:
```bash
sudo npm install
sudo npm run build
```

### Step 3: Start Application with PM2
```bash
# Start Next.js production server on Port 3000
pm2 start npm --name "merchantvault" -- run start

# Save PM2 process list & enable auto-restart on boot
pm2 save
pm2 startup
```

### Step 4: Configure NGINX Reverse Proxy
Create an NGINX server block:
```bash
sudo nano /etc/nginx/sites-available/merchantvault
```

Paste configuration:
```nginx
server {
    listen 80;
    server_name <YOUR_PLATFORM_DOMAIN> www.<YOUR_PLATFORM_DOMAIN> *.<YOUR_PLATFORM_DOMAIN>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site & restart NGINX:
```bash
sudo ln -s /etc/nginx/sites-available/merchantvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Enable Free SSL with Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <YOUR_PLATFORM_DOMAIN> -d www.<YOUR_PLATFORM_DOMAIN>
```

---

## 4. Multi-Store Outlets, Manufacturer Brands & Categories SOP

### Overview & 3-Tier Nomenclature
Merchant Vault supports running multiple distinct sub-stores under a single `Company` context. Centralized inventory in shared warehouses prevents overselling across stores while maintaining isolated store branding, logos, theme colors, and product category displays.

To ensure zero ambiguity, the system enforces a strict 3-tier hierarchy:
1. **Store Outlet / Sales Channel** (`Brand` table in schema): The storefront destination (e.g. *Seyon Beauty Store*, *Seyon Fashion Outlet*). Stores own logos, theme colors, and custom subdomains (`?brand=code`).
2. **Manufacturer / Label Brand** (`ProductVariant.vendor` column): The product maker (e.g. *L'Oréal*, *MAC*, *Maybelline*, *Nike*, *Zara*). Matches Shopify's `vendor` field.
3. **Product Category** (`Category` table): The product type (e.g. *Cosmetics & Beauty*, *Apparel & Dresses*, *Baby & Kids*). Matches Shopify's `product_type` field.

### Brand & Store Routing Resolution Rules
1. **URL Store Query Parameter (`?brand=code`)**:
   - `https://<YOUR_PLATFORM_DOMAIN>/?brand=ethnic` ➔ Renders Ethnic Store Outlet theme, logo, and Chanderi Silk / Sarees catalog.
   - `https://<YOUR_PLATFORM_DOMAIN>/?brand=beauty` ➔ Renders Beauty Store Outlet theme, logo, and cosmetics catalog.
2. **Subdomain Store Routing**:
   - `ethnic.<YOUR_PLATFORM_DOMAIN>` ➔ Edge router maps Host header `ethnic` to `Brand.code = "ethnic"`.
3. **Store Categories, Manufacturer Brands & Coupon Isolation**:
   - Storefront categories (`Apparel & Dresses`, `Cosmetics & Beauty`, `Baby & Kids`, `Jewelry & Accessories`) adapt dynamically based on store outlet context.
   - Products display their individual Manufacturer Brands (e.g. *by L'Oréal*) cleanly on product cards without confusing the store outlet theme.
   - Merchant coupon codes (`/api/coupons` and `/api/storefront/coupons/validate`) evaluate against the active company and store brand context.

---

## 5. Superadmin Operations & Tenant Administration SOP

This section provides the Standard Operating Procedure for platform **Superadmins** managing tenant companies, custom domain add-ons, white-labeling, subscription plans, and database integrity.

### 5.1 Superadmin Landing Hub (`/dashboard/superadmin`)
- **ARR & Financial Overview**: Live tracking of platform ARR, active tenant accounts, trial count, and past-due alerts.
- **Database & RLS Integrity Auditor**: Click **"Run Schema Audit"** to verify Row Level Security (RLS) policies on all tables and confirm zero tenant data crosstalk or orphaned records.

### 5.2 Company & Tenant Management (`/dashboard/superadmin/companies`)
1. **Onboarding New Tenants**:
   - Click **"Onboard Company"**.
   - Input Company Name, unique Company Code (e.g. `acme`), contact email, initial Tenant Admin credentials, and starting billing plan.
2. **Configuring Custom Domains & Subdomains**:
   - Click **"Manage Workspace"** for the target tenant company.
   - Go to **Profile Settings** &rarr; **Custom Domain & Subdomain Add-On Settings**.
   - Enter **Custom Domain (TLD)** (e.g. `wolfcabin.com`) or **Custom Subdomain Alias** (e.g. `wolfcabin.<YOUR_PLATFORM_DOMAIN>`).
3. **White-Label Branding Add-On**:
   - Toggle **"White-Label Branding Add-On"** to **ON**.
   - When enabled (`Company.hasWhiteLabelAddon = true`), the storefront footer automatically hides the `"Powered by Merchant Vault"` badge.
4. **Fulfillment Warehouses & Brand Store Outlets**:
   - Use the **Warehouses** tab to add, edit, or set default pickup fulfillment hubs.
   - Use the **Brands** tab to configure sub-brand outlets, logos, primary/accent color palettes, top announcement banner text, and hero welcome headers.

### 5.3 Subscriptions, Pricing Plans & Account Recovery (`/dashboard/superadmin/subscriptions`)
1. **Assigning Pricing Plans**:
   - Select target tenant and click **"Adjust Billing"**.
   - Choose pricing plan model:
     - **Micro / Budget Plan (₹299/mo)** (For low-income merchants & micro-units)
     - **Free Trial** (14 days)
     - **Monthly Starter (₹999/mo)**
     - **Yearly Subscription (₹9,990/yr)**
     - **Perpetual Setup + AMC (₹75,000 + ₹15,000/yr AMC)** (Includes all 4 Add-On Packs)

2. **Tenant Password Recovery**:
   - In the billing editor modal, click **"Recover Password"**.
   - Set a new password for the primary `TENANTADMIN` account to restore access immediately.

### 5.4 Provisioning Production Superadmin Accounts (Option 2 - SQL Method)

To provision a platform **Superadmin account** in production via Supabase SQL Editor:

1. Open your **Supabase Project Dashboard &rarr; SQL Editor**.
2. Run the following SQL query to create or upgrade the Superadmin user account:

```sql
-- Step 1: Ensure Platform System Company Record Exists
INSERT INTO "Company" ("id", "name", "code", "currency", "timezone", "onboardingCompleted", "isActive")
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Platform Administration',
  'superadmin',
  'INR',
  'IST',
  true,
  true
)
ON CONFLICT ("code") DO NOTHING;

-- Step 2: Provision Superadmin User Account
INSERT INTO "User" ("companyId", "username", "email", "password", "role", "isActive")
VALUES (
  (SELECT "id" FROM "Company" WHERE "code" = 'superadmin' LIMIT 1),
  'superadmin',
  'seyonnexalabs@gmail.com',
  'super123', -- Set your production password here
  'SUPERADMIN',
  true
)
ON CONFLICT ("email") DO UPDATE 
SET "role" = 'SUPERADMIN', "isActive" = true;
```


3. Log in at **`https://<YOUR_PLATFORM_DOMAIN>/admin`** using:
   - **Email**: `seyonnexalabs@gmail.com` (or **Username**: `superadmin`)
   - **Password**: Your configured password
