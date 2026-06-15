Here is a copy-paste-ready onboarding write-up that you can send directly to your client, **V TEXTILE company** (operating the brand **The Wolf Cabin**):

***

### 🔑 Welcome to the Seyon ERP & Storefront Suite

Here are the access details and default credentials configured for your workspace. 

#### 🌐 Workspace Access URLs
*   **ERP Administration Panel**: `http://fabricvault.vercel.app` *(to manage inventory, print barcode tags, verify purchase orders, and monitor sales channels)*
*   **Your Brand Storefront**: `http://fabricvault-storefront.vercel.app/?companyId=a0621217-fc73-406a-b2a0-f933cf934706`

---

#### 👥 Configured User Accounts & Permissions

Your workspace is pre-provisioned with three user accounts tailored to different roles in your business operations:

##### 1. Tenant Administrator (Full Owner Access)
This account has master administrative control over your tenant workspace, billing details, settings, and full database tables.
*   **Username**: `wolfadmin`
*   **Default Password**: `password123`
*   **Role**: `TENANTADMIN`
*   **Scope**: Global access (can manage all brands, warehouses, inventory allocations, and create additional staff logins).

##### 2. Operator Team Logins (Staff Access)
These logins are created for warehouse managers, fulfillment operators, and billing staff. They can manage daily inventory audits, scan barcodes for inward/outward movements, and update orders, but cannot alter tenant billing or platform settings.

*   **Staff Login - Alpha**:
    *   **Username**: `alpha`
    *   **Default Password**: `password123`
    *   **Role**: `STAFF`
    *   **Scope**: Scoped permissions (assigned to manage stock and order dispatch).
*   **Staff Login - Beta**:
    *   **Username**: `beta`
    *   **Default Password**: `password123`
    *   **Role**: `STAFF`
    *   **Scope**: Scoped permissions (assigned to manage stock and order dispatch).

---

#### 💡 Getting Started Instructions for Staff
1.  Log in to the **ERP Administration Panel** (`http://fabricvault.vercel.app`) using your respective username and default password.
2.  Go to **Settings > Security** to reset your default password to a secure one.
3.  Go to the **Inventory Module** to start adding product variants, configuring barcode scanners, and mapping stock levels to your default warehouse (*Primary Fulfillment Hub*).