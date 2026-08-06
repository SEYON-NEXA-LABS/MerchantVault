## 1. Standard Project Branding
- The official product and platform name is **Merchant Vault** (or `merchantvault`). Always refer to the platform as Merchant Vault in documentation, user interfaces, logs, and comments.

## 2. Environment & Hostname Resolution Rules
- Use `process.env.NEXT_PUBLIC_APP_URL` for platform domain resolution instead of hardcoding URLs (`merchantvault.vercel.app` or `localhost:3000`).
- Do NOT include `-storefront` in platform hostname defaults (`merchantvault.vercel.app`).

## 3. Documentation & File Link Rules
- Do NOT use absolute local filesystem paths (e.g. `file:///d:/...` or `C:\Users\...`) in project documentation files or Markdown files.
- Always use clean relative project paths for repository links (e.g. `docs/subscription_pricing_architecture.md`).

## 4. Platform Pricing & Subscription Strategy
- Merchant Vault is positioned as a disruptive, cheaper alternative to Shopify for Indian D2C and retail merchants.
- Always maintain 0% platform transaction fees.
- Pricing tiers: Starter (₹999/mo), Growth (₹1,999/mo), Enterprise (₹4,999/mo).
- Refer to `docs/subscription_pricing_architecture.md` for multi-tenant subscription architecture and schema design.

## 5. Dual-Razorpay Integration Architecture
- **Tenant Razorpay (Merchant Storefront Payments)**: Tenant credentials stored per-company in Supabase (`Company.razorpayKeyId`, `Company.razorpayKeySecret`) are used EXCLUSIVELY for receiving customer order payments on merchant storefronts/POS.
- **Platform Razorpay (SaaS Subscriptions)**: Platform credentials stored in root `.env.local` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are used EXCLUSIVELY for billing merchant subscription plans (Starter ₹999/mo, Growth ₹1,999/mo, Enterprise ₹4,999/mo) and generating platform invoices.
- Do NOT mix or confuse merchant store checkout credentials with platform subscription billing credentials.
