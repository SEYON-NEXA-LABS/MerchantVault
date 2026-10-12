# Vendor Surplus & Direct Bulk Billing SOP (Without Barcodes)
**MerchantVault by Seyon Nexa Labs**  
*Document Version: 1.0 | Audience: Warehouse Managers, Store Staff & Sales Executives*

---

## 1. Executive Summary & Use Case
This guide covers the end-to-end flow when you receive surplus goods, fabric bales, or bulk off-catalog lots from a vendor **without pre-printed barcodes**, and want to immediately sell and invoice them in bulk to a customer.

---

## 2. Sidebar Navigation Reference Map

| Step | Navigation Menu | Sidebar Code | Route | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Quick Bulk Bill** | **POS Counter Sales** | *Top Menu* | `/dashboard/pos` | Instant counter bill, bulk quantity input, cash/UPI/credit checkout |
| **Receive Surplus** | **1.4 Inward Receiving** | `1.4` | `/dashboard/inward` | Manual stock intake without barcode scanning |
| **Catalog Check** | **2.1 Stock & SKU Inventory** | `2.1` | `/dashboard/inventory` | Check product or create new surplus product lot |
| **Orders Directory** | **3.1 Orders Directory** | `3.1` | `/dashboard/orders` | View past B2B orders, reprint invoices & tracking |
| **Dispatch** | **3.2 Outward Dispatch** | `3.2` | `/dashboard/outward` | Outward verification and delivery challan |

---

## 3. Step-by-Step Operating Workflow

### Step 1: Catalog Check (2.1 Stock & SKU Inventory)
*(Only needed if the surplus lot is a brand new item not in your catalog)*
1. Go to **Dashboard &rarr; 2.1 Stock & SKU Inventory** (`/dashboard/inventory`).
2. Search for the product or fabric title.
   - **If it exists:** Note the name and proceed to Step 2.
   - **If brand new:** Click **`+ Add Product`**, enter the Title (e.g., *Vendor Surplus Cotton Twill*), SKU, base price, and save.

---

### Step 2: Inward Surplus Stock (1.4 Inward Receiving)
*(Brings stock into the system without scanning any barcode)*
1. Go to **Dashboard &rarr; 1.4 Inward Receiving** (`/dashboard/inward`).
2. Select your destination **Warehouse** or Store.
3. In the product field, **search by name** from the dropdown (no barcode scanner needed).
4. Enter the **received surplus quantity** (e.g., `50` or `500`).
5. Click **Submit Inward**.
> *Note:* This prevents POS from rejecting your sale with "Insufficient stock".

---

### Step 3: Create Bulk Customer Bill (POS Counter Sales)
*(Creates the customer invoice and handles bulk wholesale pricing)*
1. Click **`POS Counter Sales`** (`/dashboard/pos`) from the top sidebar.
2. In the search box, type the product name and click to add to cart.
3. In the Cart panel on the right:
   - Click the **Quantity** field and type your bulk quantity (e.g., `50`).
   - If a discounted wholesale rate was agreed, enter a **Discount** (Flat ₹ or %) or adjust price.
4. Enter Customer Information:
   - **Customer Name:** Buyer or business name (e.g., *Ramesh Textiles*).
   - **Phone / Email:** Buyer's mobile number for SMS/WhatsApp receipt.
5. Select **Payment Method**:
   - `CASH`, `UPI`, `CARD`, or `CREDIT` (if payment is due later).
6. Click **Complete Sale**.

---

### Step 4: Invoice Generation & Dispatch
1. A popup with the order confirmation and receipt will appear immediately.
2. Click **Print Receipt** or **Download Invoice** (A4 or thermal format).
3. Save or share the PDF directly with the customer via WhatsApp / Email.
4. Stock is automatically decremented from your inventory balance.

---

## 4. Quick Reference Checklist
- [x] **1. Add Stock:** `1.4 Inward Receiving` &rarr; Search item by name & enter surplus quantity.
- [x] **2. Create Bill:** `POS Counter Sales` &rarr; Add item, set bulk quantity & customer details.
- [x] **3. Receive Payment:** Select Cash/UPI/Card/Credit & click *Complete Sale*.
- [x] **4. Print Invoice:** Click *Print Receipt / Invoice* for the buyer.
