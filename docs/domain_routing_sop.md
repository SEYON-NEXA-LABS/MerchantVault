# Tenant Custom Domain & Subdomain Routing SOP

This document provides a step-by-step Standard Operating Procedure (SOP) for configuring **Custom Domains** and **Subdomain Routing** for client tenants on **FABRIC VAULT Storefront**.

---

## 1. Overview & Architecture

FABRIC VAULT uses Next.js Edge Middleware ([apps/storefront/middleware.ts](../apps/storefront/middleware.ts)) to dynamically resolve incoming request hostnames to tenant slugs (`?slug=tenant_code`).

```text
                                       ┌───────────────────────────────────────┐
  Custom Domain (shop.wolfcabin.com) ─►│ Next.js Edge Middleware               │
  Subdomain (wolfcabin.fabricvault)  ─►│ (apps/storefront/middleware.ts)     │
  Direct Link (?slug=wolfcabin)      ─►│ Rewrites request to ?slug=wolfcabin │
                                       └──────────────────┬────────────────────┘
                                                          │
                                                          ▼
                                       ┌───────────────────────────────────────┐
                                       │ FABRIC VAULT Storefront Engine        │
                                       │ Loads tenant branding, catalog & keys │
                                       └───────────────────────────────────────┘
```

---

## 2. Configuration Methods for Client Tenants

### Method 1: Tenant Purchased Domain Forwarding (Recommended for Small Businesses)
If the client owns `www.wolfcabin.com` and wants a zero-code setup:

1. **Log into Domain Registrar**: (GoDaddy, Namecheap, BigRock, Hostinger, Cloudflare).
2. **Navigate to DNS / Domain Forwarding**:
   - **Forward To**: `https://fabricvault-storefront.vercel.app/?slug=wolfcabin`
   - **Redirect Type**: `301 Permanent Redirect`
   - **Forwarding Type**: `Forward with Masking` (keeps their custom domain in address bar) or `Standard Forward`.

---

### Method 2: CNAME Subdomain Alias (White-Label E-Commerce)
If the client wants a branded URL like `shop.wolfcabin.com` or `store.denimco.in`:

1. **Client DNS Record Setup**:
   Ask the client to add a `CNAME` record in their DNS manager:
   - **Type**: `CNAME`
   - **Host / Name**: `shop` (or `store`)
   - **Target / Points To**: `cname.vercel-dns.com` (or `fabricvault-storefront.vercel.app`)
   - **TTL**: `Auto` or `3600`

2. **Vercel Domain Mapping**:
   In Vercel Project Settings &rarr; **Domains**:
   - Add domain `shop.wolfcabin.com`.
   - Vercel automatically issues an SSL/TLS certificate.

3. **Next.js Middleware Auto-Rewrite**:
   The middleware extracts `shop.wolfcabin.com` and maps it directly to `Company.code = "wolfcabin"`.

### Method 4: Single Custom Domain with `/admin` Routing (Shopify-Style Unified Domain)
If a tenant or your company purchases a new custom domain (e.g. `wolfcabin.com` or `fabricvault.in`), here is the exact step-by-step Vercel deployment guide:

#### Step 1: Add Custom Domain in Vercel
1. Log into your **Vercel Dashboard**.
2. Open your **Storefront Project** (`fabricvault-storefront`).
3. Go to **Settings &rarr; Domains**.
4. Type your new domain (e.g. `wolfcabin.com` and `www.wolfcabin.com`) and click **Add**.

#### Step 2: Configure DNS Records in your Registrar (GoDaddy, Namecheap, Cloudflare, Hostinger)
In your domain registrar's DNS manager, add the 2 standard Vercel DNS records:

| Record Type | Name / Host | Value / Target | Notes |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (or leave empty) | `76.76.21.21` | Points `wolfcabin.com` to Vercel |
| **CNAME Record** | `www` | `cname.vercel-dns.com` | Points `www.wolfcabin.com` to Vercel |

*(Vercel automatically provisions free SSL/TLS security certificates in ~2 minutes!)*

#### Step 3: Update Environment Variables
In **Vercel Project Settings &rarr; Environment Variables**:
- Set `NEXT_PUBLIC_STOREFRONT_URL=https://wolfcabin.com`
- Set `NEXT_PUBLIC_APP_URL=https://fabricvault.vercel.app` (or `https://wolfcabin.com/admin`)

#### Step 4: How Your URLs Work Live:
- 🛍️ **`https://wolfcabin.com`** ➔ Customer Shopping Catalog & Checkout.
- 🏢 **`https://wolfcabin.com/admin`** ➔ ERP Admin Operations Panel & POS Billing Terminal!

---

### Method 3: SaaS Platform Subdomains (e.g. `wolfcabin.fabricvault-storefront.vercel.app`)
If you provide SaaS subdomains on your primary platform domain:

1. **Vercel Wildcard Domain**: Add `*.fabricvault-storefront.vercel.app` in Vercel domains.
2. **Automatic Middleware Parsing**:
   Next.js Middleware inspects `request.headers.get("host")`:
   ```ts
   const subdomain = hostname.split(".")[0];
   // rewrites request to /?slug=subdomain
   ```

---

## 4. Deploying on Hostinger VPS / cPanel / AWS / Docker (Self-Hosted)

If you host on **Hostinger (VPS)**, **AWS EC2**, **DigitalOcean**, or **cPanel Node.js**:

### Method A: Hostinger VPS Node.js + PM2 Process Manager (Recommended for Hostinger)

#### Step 1: Install Node.js & PM2 on Hostinger VPS
```bash
# Connect to Hostinger VPS via SSH
ssh root@your-vps-ip

# Install Node.js 20+ and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
```

#### Step 2: Clone Repo & Build Both Apps
```bash
git clone https://github.com/your-org/fabricvault.git
cd fabricvault
npm install
npm run build
```

#### Step 3: Start Apps with PM2
```bash
# Start ERP Admin on port 3000
pm2 start npm --name "erp-admin" --workspace=erp-admin -- run start

# Start Storefront on port 3001
pm2 start npm --name "storefront" --workspace=storefront -- run start

# Save PM2 process list to start automatically on VPS reboot
pm2 save
pm2 startup
```

#### Step 4: Configure NGINX Reverse Proxy on Hostinger VPS
In `/etc/nginx/sites-available/default`:

```nginx
server {
    server_name wolfcabin.com www.wolfcabin.com;

    # Storefront Customer Catalog
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # ERP Admin Operations Panel & POS
    location /admin {
        proxy_pass http://127.0.0.1:3000/dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Reload NGINX & Generate Free SSL Certificate with Certbot
sudo systemctl reload nginx
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d wolfcabin.com -d www.wolfcabin.com
```

---

### Method B: Docker Container Deployment (Hostinger / AWS)

Prune the monorepo for containerized Docker deployments:

```bash
# Extract storefront app files & shared @repo/db dependencies
npx turbo prune --scope=storefront --docker

# Extract erp-admin app files & shared @repo/db dependencies
npx turbo prune --scope=erp-admin --docker
```

Run both containers on Hostinger VPS using `docker-compose`:
```yaml
version: '3.8'
services:
  erp-admin:
    build:
      context: .
      dockerfile: apps/erp-admin/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=https://your-supabase.supabase.co
  storefront:
    build:
      context: .
      dockerfile: apps/storefront/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_APP_URL=http://erp-admin:3000
```
