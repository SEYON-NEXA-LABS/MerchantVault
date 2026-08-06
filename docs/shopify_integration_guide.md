# Shopify Integration Setup Guide

Follow this guide to connect your live Shopify Store with Merchant Vault ERP.

---

## 1. Credentials Required

| Field Name | Format Example | Source |
| :--- | :--- | :--- |
| **Store Domain URL** | `wolfcabin.myshopify.com` | Shopify Admin URL |
| **Admin API Access Token** | `shpat_xxxxxxxxxxxxxxxx` | Custom App (Shopify Admin) |
| **Webhook API Secret Key** | `whsec_xxxxxxxxxxxxxxxx` | Custom App (API Credentials) |

---

## 2. Step-by-Step Shopify Custom App Creation

1. **Log into Shopify Admin**:
   - Go to `https://your-store.myshopify.com/admin` (e.g. `https://wolfcabin.myshopify.com/admin`).
2. **Navigate to App Development**:
   - Go to **Settings** &rarr; **Apps and sales channels** &rarr; **Develop apps**.
   - Click **Create an app** and name it `MerchantVault ERP Sync`.
3. **Configure Access Scopes**:
   - Select **Configure Admin API scopes** and enable:
     - `read_products`, `write_products`
     - `read_inventory`, `write_inventory`
     - `read_orders`, `write_orders`
     - `read_customers`
     - `read_fulfillments`, `write_fulfillments`
4. **Install & Generate Token**:
   - Click **Install app** at the top right.
   - Copy the generated **Admin API access token** (`shpat_...`) and store it securely.

---

## 3. Entering Credentials in Merchant Vault ERP

1. Go to **ERP Dashboard** &rarr; **Settings** &rarr; **Shopify Integration** (or click **Configure Credentials** from the **Shopify Sync** board).
2. Enter your `.myshopify.com` domain, Admin API token, and Webhook secret.
3. Click **Connect & Initiate Handshake**.

Once saved, products, inventory updates, customer details, and order transactions will sync seamlessly between your store and your ERP database!
