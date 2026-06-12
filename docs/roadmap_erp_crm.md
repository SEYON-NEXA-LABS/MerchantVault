# Seyon ERP & CRM Implementation Roadmap

This document outlines the phased development plan and TODO checklist for the **Seyon ERP & CRM** systems. It is structured into 4 sequential phases designed to transition the software from its current state to a fully automated, production-ready enterprise suite.

---

## 📌 Phase 1: Bridge Sync & Core Database Schema
*Focuses on establishing real-time connections between Shopify, Seyon Storefront, and the shared database schema.*

- [ ] **Database Schema Enhancements (`@repo/db`)**
  - [ ] Add `customers` table with columns: `id`, `name`, `phone`, `email`, `city`, `state`, `zip`, `country`, `tags`, `tenant_id`, `created_at`, `updated_at`.
  - [ ] Add `orders` table with columns: `id`, `order_number`, `shopify_order_id`, `customer_id`, `payment_status`, `fulfillment_status`, `total_price`, `currency`, `raw_payload`, `created_at`.
  - [ ] Add `order_items` table with columns: `id`, `order_id`, `product_id`, `variant_id`, `quantity`, `price`.
  - [ ] Add `abandoned_checkouts` table with columns: `id`, `shopify_checkout_id`, `customer_name`, `customer_phone`, `cart_value`, `recovery_status` (`PENDING`, `WHATSAPP_SENT`, `RECOVERED`), `recovered_order_id`, `created_at`.
- [ ] **Shopify Webhook Receivers (`/api/bridge/webhooks/shopify`)**
  - [ ] Implement `orders/create` webhook handler to parse incoming orders, register/link customer record, update physical stock inventory, and log transactional stats.
  - [ ] Implement `checkouts/create` and `checkouts/update` webhook handlers to populate the `abandoned_checkouts` table.
  - [ ] Implement webhook signing verification using the `Webhook API Secret Key` configured in Settings.
- [ ] **Seyon Storefront Sync Engine**
  - [ ] Direct database synchronization to reflect real-time inventory on the storefront.
  - [ ] Storefront checkout flow to directly write orders and register customers to the database with `0ms` reconciliation lag.

---

## 📦 Phase 2: Advanced Inventory & Barcode Automation
*Focuses on physical logistics, stock accuracy, purchasing, and warehouse management.*

- [ ] **Physical Barcode Operations**
  - [ ] Implement barcode printing templates (ZPL/PDF generation) with customization for SKU, size, color, and price tags.
  - [ ] Build barcode scanner input helper supporting rapid hardware scanners for Inward/Outward stock logging.
  - [ ] Add auditing module: scan shelf items, auto-reconcile with database inventory, and highlight discrepancies.
- [ ] **Size-wise & Color-wise Variant Matrices**
  - [ ] Refactor product inventory tables to support strict variations matrix (e.g., SKU: `FABRIC-BLUE-M`).
  - [ ] Implement bulk stock adjustments (add/subtract stock counts in a grid layout of sizes and colors).
- [ ] **Purchase Order (PO) Management**
  - [ ] Create PO creation UI: specify vendor, items, target prices, and scheduled arrival dates.
  - [ ] Build PO receiving flow: mark items as received, auto-generate barcode tags, and update warehouse stock levels.
- [ ] **Multi-Warehouse Allocation & Transfers**
  - [ ] Support transferring stock inventory between warehouses with transit tracking status.
  - [ ] Define warehouse inventory priorities for storefront auto-fulfillments.

---

## 💬 Phase 3: CRM Automation & Marketing Integration
*Focuses on turning passive buyer data into active marketing assets and automated recovery flows.*

- [ ] **Abandoned Cart Recovery Flow**
  - [ ] Integrate official WhatsApp Business API (e.g., via Interakt, Wati, or Twilio).
  - [ ] Schedule automated WhatsApp templates (e.g., send recovery message 30 minutes and 24 hours after checkout abandonment).
  - [ ] Implement unique URL shorteners with UTM tracking codes to measure WhatsApp cart recovery conversion rates.
- [ ] **Customer Profile Ledger & Metrics**
  - [ ] Display unified Customer Profile detailing lifetime value (LTV), repeat purchase rate, and location heatmaps.
  - [ ] Build Customer Segmentation: filter by "VIP Buyers" (e.g., > 3 orders), "Inactive" (e.g., no purchases in 90 days), or location.
- [ ] **Marketing & Broadcasting Panel**
  - [ ] Create WhatsApp broadcasting templates targeting specific customer segments (e.g., launch new fabric collections).
  - [ ] Add campaign logs showing message delivery rate, read rate, and order conversions.

---

## 🚚 Phase 4: Logistics, Orders & RTO Analytics
*Focuses on order processing, multi-partner courier integration, RTO prevention, and cost analytics.*

- [ ] **Logistics Shipments Automation**
  - [ ] Build bulk shipment generation API integrations with Shiprocket, Delhivery, and BlueDart.
  - [ ] Auto-generate and download shipping labels and packing manifests in bulk.
  - [ ] Track live AWB delivery updates, updating order status in real time.
- [ ] **RTO (Return to Origin) Control Suite**
  - [ ] Build RTO risk-scoring engine: flag high-risk orders (e.g., repetitive COD orders with history of delivery failures).
  - [ ] Implement automated COD Verification calls or WhatsApp confirmations before dispatching orders.
- [ ] **Financial & Returns Ledger**
  - [ ] Track courier shipping costs vs. customer shipping fees to calculate shipping margin leakages.
  - [ ] Implement customer returns portal and reverse pickup AWB generation flow.
