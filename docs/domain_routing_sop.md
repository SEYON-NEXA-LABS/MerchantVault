# MerchantVault — Custom Domain & Deployment SOP

This document provides a step-by-step Standard Operating Procedure (SOP) for deploying **MerchantVault ERP & D2C Storefront OS** on **Vercel** and **Hostinger VPS (PM2 / NGINX)**, and explains how multi-tenant resolution works across query parameters, subdomains, and custom domains.

---

## 1. Architecture & Multi-Tenant Resolution Engine

**MerchantVault** runs as a **single, unified Next.js 16 application** on **Port 3000**. The engine supports **3 flexible tenant resolution modes**:

```text
  Customer Traffic Modes:
  1. Direct URL Link       (http://localhost:3000/?slug=wolfcabin)    ──┐
  2. Subdomain Alias       (https://wolfcabin.merchantvault.com)      ──┼─► [Edge Router: middleware.ts]
  3. Custom Domain         (https://wolfcabin.com)                    ──┘         │
                                                                                │ Rewrites to ?slug=wolfcabin
                                                                                ▼
                                                                     ┌───────────────────────┐
  Staff Access Portals:                                              │ Storefront API        │
  • Admin Login Portal     (http://localhost:3000/admin)             │ (/api/products)       │
  • ERP & POS Terminal     (http://localhost:3000/dashboard)         │ Loads brand, catalog, │
                                                                     │ & Razorpay keys       │
                                                                     └───────────────────────┘
```

### Multi-Tenant Resolution Modes Breakdown:

| Resolution Mode | URL Example | Technical Resolution Workflow | Target Use Case |
| :--- | :--- | :--- | :--- |
| **A. URL Query Parameter** | `https://merchantvault.com/?slug=wolfcabin`<br>`https://merchantvault.com/?companyId=UUID` | API endpoint `/api/products` directly queries Supabase `Company` by `code` or `id`. | Direct marketing links, WhatsApp shares, QR code tags. |
| **B. Multi-Store Brand Parameter** | `https://merchantvault.com/?brand=ethnic`<br>`https://merchantvault.com/?brand=kids` | Resolves store branding, logos, theme colors, and category products by matching `Brand.code`. | Running multiple brand stores under 1 company context. |
| **C. Subdomain Alias** | `https://wolfcabin.merchantvault.com/` | Edge proxy extracts `wolfcabin` from Host header and auto-rewrites internally to `?slug=wolfcabin`. | Platform SaaS multi-tenant subdomains. |
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
NEXT_PUBLIC_APP_URL=https://yourcustomdomain.com
```

### Step 3: Add Custom Domain in Vercel
1. Go to **Settings &rarr; Domains**.
2. Type your domain (e.g. `yourcustomdomain.com` and `www.yourcustomdomain.com`) and click **Add**.

### Step 4: Configure DNS Records in Registrar
Add these DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger):

| Record Type | Host / Name | Value / Target | Notes |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` | `76.76.21.21` | Points domain root to Vercel |
| **CNAME Record** | `www` | `cname.vercel-dns.com` | Points `www` subdomain to Vercel |

*(Vercel automatically issues free SSL/TLS certificates within ~2 minutes!)*

### Step 5: Live Application Endpoints
- 🛍️ **`https://yourcustomdomain.com/`** ➔ Public D2C Storefront & Checkout.
- 🏢 **`https://yourcustomdomain.com/admin`** ➔ Retail Merchant & Staff Access Portal.
- 📊 **`https://yourcustomdomain.com/dashboard`** ➔ ERP Management & POS Counter Billing Terminal!

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
NEXT_PUBLIC_APP_URL=https://yourcustomdomain.com
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
    server_name yourcustomdomain.com www.yourcustomdomain.com *.yourcustomdomain.com;

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
sudo certbot --nginx -d yourcustomdomain.com -d www.yourcustomdomain.com
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
   - `https://yourcustomdomain.com/?brand=ethnic` ➔ Renders Ethnic Store Outlet theme, logo, and Chanderi Silk / Sarees catalog.
   - `https://yourcustomdomain.com/?brand=beauty` ➔ Renders Beauty Store Outlet theme, logo, and cosmetics catalog.
2. **Subdomain Store Routing**:
   - `ethnic.yourcustomdomain.com` ➔ Edge router maps Host header `ethnic` to `Brand.code = "ethnic"`.
3. **Store Categories, Manufacturer Brands & Coupon Isolation**:
   - Storefront categories (`Apparel & Dresses`, `Cosmetics & Beauty`, `Baby & Kids`, `Jewelry & Accessories`) adapt dynamically based on store outlet context.
   - Products display their individual Manufacturer Brands (e.g. *by L'Oréal*) cleanly on product cards without confusing the store outlet theme.
   - Merchant coupon codes (`/api/coupons` and `/api/storefront/coupons/validate`) evaluate against the active company and store brand context.


