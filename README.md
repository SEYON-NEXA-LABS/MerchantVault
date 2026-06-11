# Shopify Sync Bridge — V Textile Company ERP Core

A high-performance, single-instance Next.js monorepo architecture built to automate real-time multi-variant inventory matching, physical barcode ledger streaming, automated courier fulfillment handshakes, and event-driven CRM abandoned cart recoveries. This application is optimized for direct execution on **Vercel** cloud environments.

## 🎨 System Interface Schema (Wolf Cabin Matrix Theme)
The frontend panels render as a unified Single Page Interface directly matching your Next.js file routers:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ☰  [Searchbar...]                                           (🔗 WhatsApp)  🔔  [Admin Profile]│
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

## 🛠️ Monorepo Engineering Stack
*   **Hosting Target Platform:** [Vercel](https://vercel.com) (Fast Serverless Deployment and Edge Hosting)
*   **Application Framework:** Next.js 15 (TypeScript) — App Router (`app/` Workspace) running on Node.js Runtimes
*   **Visual Interface Engine:** Tailwind CSS + UI Foundations via shadcn/ui React Components
*   **Database Management Layer:** Supabase PostgreSQL with direct client initialization (no connection pool leaks)
*   **Prisma ORM:** Used for database schema alignment and synchronization maps

## 🏗 Multi-Tenant Architecture & Authentication
To support V Textile Company alongside other potential customers (SaaS model), the system implements a **Multi-Tenant Architecture**:
1. **Database Schema:** Includes `Company` and `Warehouse` models. Variant stock counts (`WarehouseStock`) and movements are tracked per warehouse location.
2. **Authentication:** Allows users to log in using just their **username** and **company code**. The system securely processes this into a dummy email (`username@companycode.local`) behind the scenes, integrating with Supabase.

## 📂 System Folder Map & File Matrix

```text
vtex-ops-portal/
├── app/
│   ├── layout.tsx                 # Base Root Shell layout with Global Header/Nav UI
│   ├── page.tsx                   # User Login Screen / Conditional Redirect Control
│   ├── dashboard/                 # Primary High-Density Analytics Display Tab
│   │   ├── settings/              # Settings panel (Shopify integration & Warehouse CRUD)
│   │   ├── inventory/             # Multi-warehouse stock catalog filters & adjustments
│   │   ├── orders/                # Fulfillments board with Split Stock & Transfer options
│   │   ├── logistics/             # Courier partner status tracking & AWB scans
│   │   ├── inward-outward/        # Inward/Outward scanning station with catalog fallbacks
│   │   ├── staff/                 # Staff credentials manager (reset password, enable/disable)
│   │   └── shopify-sync/          # Sync status logging logs
│   └── api/                       # API Routes (Fulfill, Inventory, Webhooks, Staff)
├── lib/                           # Database & External Service Clients (Supabase, Shopify)
├── components/                    # UI Foundations (Navbar, Tables, Forms, shadcn)
├── prisma/
│   └── schema.prisma              # Type-Safe Object Model blueprint
├── supabase/
│   └── schema.sql                 # Database Table setup definitions for Supabase
├── package.json
└── README.md                      # Target reference manifest file
```

## 🔒 Security Architecture & Guard Protocols

### 1. Global Role Isolation
Platform Administration (`SUPERADMIN`) is completely isolated from the standard Tenant login layout and Staff Directory view, ensuring tenant admins cannot view or manipulate global platform settings.

### 2. Double-Entry Stock Movement
All stock changes (direct adjustments, orders dispatch, RTO returns, or stock transfers) are committed with audit-trail logging using `INWARD`/`OUTWARD` flags, maintaining exact stock history across all facilities.

## 🚀 Environment Initialization & Vercel Deployment

### 1. Configure Local Variables (`.env.local`)
Create a `.env.local` file in the project root containing your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Local Setup Sequence
Execute these commands in the terminal to launch local dependencies:
```bash
# Install dependencies
npm install

# Initialize your database schema (after configuring DATABASE_URL)
npx prisma db push

# Seed initial store data (warehouses, variants, users)
npx prisma db seed

# Run the Next.js dev server
npm run dev
```

### 3. Vercel Hosting Configuration
To deploy the application to Vercel:
1. Connect your repository to your **Vercel account**.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Environment Variables in the Vercel Dashboard project settings.
3. Deploy the project. Vercel will automatically build the Next.js production serverless bundles.
