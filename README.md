# Seyon ERP - Multi-App Turborepo Monorepo

A high-performance apparel operations workspace built using **Turborepo** to orchestrate the internal **Seyon ERP** application and a consumer-facing **Seyon Storefront**. Both apps share type-safe database models, helpers, and UI structures.

## 🎨 System Interface Schema

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ☰  [Searchbar...]                                       (🔗 WhatsApp)  🔔  [Admin Profile] │
├───────────────┬─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Dashboard  │  [Today's Orders] [Sales Revenue] [New Customers] [RTO %] [Gross Profit]    │
│               │  ───────────────────────────────────────────────────────────────────────    │
│ INVENTORY     │  ┌───────────────────────┐ ┌────────────────────┐ ┌───────────────────────┐ │
│ ├─ Stock      │  │   [Sales Overview]    │ │   [Top Products]   │ │   [Recent Orders]     │ │
│ └─ Purchase   │  │   (Bar / Line Graph)  │ │   1. SKU-M / Black │ │   #ORD-10253 (AWB)    │ │
│               │  └───────────────────────┘ └────────────────────┘ └───────────────────────┘ │
│ BARCODES      │  ───────────────────────────────────────────────────────────────────────    │
│ ├─ Print      │  ┌───────────────────────┐ ┌────────────────────┐ ┌───────────────────────┐ │
│ ├─ In/Out Scan│  │ [Inventory Overview]  │ │ [Low Stock Alerts] │ │    [RTO Overview]     │ │
│ └─ Audits     │  │   (Doughnut Chart)    │ │ (Variant Warning)  │ │   (Doughnut Chart)    │ │
│               │  └───────────────────────┘ └────────────────────┘ └───────────────────────┘ │
└───────────────┴─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Monorepo Directory Layout

```text
seyon-monorepo/
├── apps/
│   ├── erp-admin/                 # Seyon ERP operations panel (Next.js)
│   │   ├── app/                   # Dashboard & settings page routes
│   │   └── package.json
│   └── storefront/                # Seyon Storefront (Consumer catalog Next.js app)
│       ├── app/                   # Public shopping page catalog (uses shared @repo/db)
│       └── package.json
├── packages/
│   └── db/                        # Shared database library (Supabase JS SDK initialization)
│       ├── index.ts               # Shared database client exports
│       └── package.json
├── package.json                   # Root monorepo workspace configurations
├── turbo.json                     # Turborepo task pipeline configs
└── README.md
```

---

## 🛠️ Monorepo Engineering Stack

- **Build Orchestrator**: [Turborepo](https://turbo.build) for fast, parallel build pipeline cache execution
- **Application Framework**: Next.js 16 (TypeScript / App Router)
- **Shared Database Layer**: Supabase PostgreSQL SDK client encapsulated under `@repo/db` workspace package
- **Styling & Components**: Tailwind CSS & Lucide React Icons

---

## 🔐 Authentication & Session Resolver

- **Single-Input Lookup**: The authentication system supports resolving the user's tenant context automatically via their username or email (no separate company code input required).
- **Remember Me**: Option to extend the login session token lifespan from 1 day to 30 days.

---

## 🚀 Environment Setup & Local Dev

### 1. Configure Environment (`.env.local`)

Since both applications connect to the same Supabase database, create a `.env.local` file inside **both** `apps/erp-admin/` and `apps/storefront/` directories containing your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-service-role-key
```

### 2. Local Setup Sequence

Install dependencies at the root:

```bash
npm install
```

#### Run & Build Everything Concurrently

```bash
# Start both dev servers concurrently (ERP on 3000, Storefront on 3001)
npm run dev

# Build production bundles for all apps
npm run build
```

#### Run & Build Individual Apps

You can target a specific app using npm workspaces or Turbo filters:

- **Seyon ERP App**:

  ```bash
  # Run Dev Server
  npm run dev --workspace=erp-admin
  # OR: npx turbo dev --filter=erp-admin

  # Build Production
  npm run build --workspace=erp-admin
  # OR: npx turbo build --filter=erp-admin
  ```

- **Seyon Storefront App**:

  ```bash
  # Run Dev Server
  npm run dev --workspace=storefront
  # OR: npx turbo dev --filter=storefront

  # Build Production
  npm run build --workspace=storefront
  # OR: npx turbo build --filter=storefront
  ```

---

## ☁️ Hosting & Deployment Methods

### 1. Vercel Hosting (Recommended)

Vercel natively understands Turborepo monorepos. To set it up:

1. Create **two separate Vercel projects** pointing to the same Git repository.
2. In each project's settings:
   - **Project 1 (ERP Admin)**: Set **Root Directory** to `apps/erp-admin`.
   - **Project 2 (Storefront)**: Set **Root Directory** to `apps/storefront`.
3. Add your environment variables in Vercel settings.
4. During deployments, Vercel automatically runs the build using Turbo (`npx turbo build --filter=<app>`).

### 2. Self-Hosted (Docker Containers)

If you want to host on a VPS or AWS using Docker, you can prune the monorepo to isolate dependencies for a single app before building:

```bash
# Extract only the storefront files and shared dependencies
npx turbo prune --scope=storefront --docker

# Extract only the erp-admin files and shared dependencies
npx turbo prune --scope=erp-admin --docker
```

This will create a `out/` directory containing only the target app code and shared packages (`@repo/db`), which makes Docker builds extremely small and fast.
