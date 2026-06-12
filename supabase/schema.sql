-- Create Enum Types
CREATE TYPE "MovementType" AS ENUM ('INWARD', 'OUTWARD', 'ADJUSTMENT');
CREATE TYPE "SyncState" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE "RecoveryState" AS ENUM ('PENDING', 'WHATSAPP_SENT', 'RECOVERED');
CREATE TYPE "ShippingStatus" AS ENUM ('PROCESSING', 'SHIPPED', 'DELIVERED', 'RTO_INITIATED', 'RTO_RECEIVED');
CREATE TYPE "ProductVelocity" AS ENUM ('FAST', 'MEDIUM', 'SLOW');
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'TENANTADMIN', 'STAFF');

-- Create Company Table
CREATE TABLE "Company" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "shopifyStoreUrl" TEXT,
    "shopifyAccessToken" TEXT,
    "whatsappNumber" TEXT,
    "whatsappApiKey" TEXT,
    "onboardingStep" INTEGER DEFAULT 1 NOT NULL,
    "onboardingCompleted" BOOLEAN DEFAULT FALSE NOT NULL,
    "timezone" TEXT DEFAULT 'UTC' NOT NULL,
    "currency" TEXT DEFAULT 'USD' NOT NULL,
    "contactEmail" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Warehouse Table
CREATE TABLE "Warehouse" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefaultPickup" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Warehouse_companyId_code_key" UNIQUE ("companyId", "code")
);

-- Create User Table
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL,
    "password" TEXT DEFAULT 'password123' NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "role" "UserRole" DEFAULT 'STAFF' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "User_companyId_username_key" UNIQUE ("companyId", "username")
);

-- Create ProductVariant Table
CREATE TABLE "ProductVariant" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "shopifyVariantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "barcodeString" TEXT NOT NULL,
    "safetyStockLimit" INTEGER DEFAULT 5 NOT NULL,
    "currentStockLevel" INTEGER DEFAULT 0 NOT NULL,
    "velocity" "ProductVelocity" DEFAULT 'MEDIUM' NOT NULL,
    "leadTimeDays" INTEGER DEFAULT 7 NOT NULL,
    "averageDailySales" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "thumbnailConfig" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "ProductVariant_companyId_shopifyVariantId_key" UNIQUE ("companyId", "shopifyVariantId"),
    CONSTRAINT "ProductVariant_companyId_sku_key" UNIQUE ("companyId", "sku"),
    CONSTRAINT "ProductVariant_companyId_barcodeString_key" UNIQUE ("companyId", "barcodeString")
);

-- Create WarehouseStock Table
CREATE TABLE "WarehouseStock" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "warehouseId" UUID NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "currentStockLevel" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "WarehouseStock_warehouseId_variantId_key" UNIQUE ("warehouseId", "variantId")
);

-- Create StockMovement Table
CREATE TABLE "StockMovement" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "warehouseId" UUID REFERENCES "Warehouse"("id") ON DELETE SET NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "operatorEmail" TEXT NOT NULL,
    "syncStatus" "SyncState" DEFAULT 'PENDING' NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create OrderFulfillment Table
CREATE TABLE "OrderFulfillment" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "shopifyOrderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "shippingAddressLine1" TEXT,
    "shippingAddressLine2" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingZip" TEXT,
    "shippingCountry" TEXT,
    "totalWeightKg" DOUBLE PRECISION DEFAULT 0.35 NOT NULL,
    "awbNumber" TEXT,
    "courierPartner" TEXT,
    "deliveryStatus" "ShippingStatus" DEFAULT 'PROCESSING' NOT NULL,
    "warehouseId" UUID REFERENCES "Warehouse"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "OrderFulfillment_companyId_shopifyOrderId_key" UNIQUE ("companyId", "shopifyOrderId")
);

-- Create AbandonedCheckout Table
CREATE TABLE "AbandonedCheckout" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "shopifyCartId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "cartValue" DOUBLE PRECISION NOT NULL,
    "recoveryStatus" "RecoveryState" DEFAULT 'PENDING' NOT NULL,
    "whatsappSentAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "AbandonedCheckout_companyId_shopifyCartId_key" UNIQUE ("companyId", "shopifyCartId")
);

-- Create TransferStatus Enum and StockTransfer Table
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'CANCELLED');

CREATE TABLE "StockTransfer" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "fromWarehouseId" UUID NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "toWarehouseId" UUID NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL,
    "status" "TransferStatus" DEFAULT 'PENDING' NOT NULL,
    "operatorEmail" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create PurchaseOrderStatus Enum and PurchaseOrder/PurchaseOrderItem Tables
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "PurchaseOrder" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "poNumber" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorEmail" TEXT,
    "status" "PurchaseOrderStatus" DEFAULT 'DRAFT' NOT NULL,
    "warehouseId" UUID NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "PurchaseOrder_companyId_poNumber_key" UNIQUE ("companyId", "poNumber")
);

CREATE TABLE "PurchaseOrderItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "purchaseOrderId" UUID NOT NULL REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "quantityOrdered" INTEGER NOT NULL,
    "quantityReceived" INTEGER DEFAULT 0 NOT NULL,
    "costPrice" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes to Optimize Query Performance and Egress (Filters & Joins)
CREATE INDEX IF NOT EXISTS "idx_warehouse_company" ON "Warehouse"("companyId");
CREATE INDEX IF NOT EXISTS "idx_user_company" ON "User"("companyId");
CREATE INDEX IF NOT EXISTS "idx_variant_company" ON "ProductVariant"("companyId");
CREATE INDEX IF NOT EXISTS "idx_stock_warehouse" ON "WarehouseStock"("warehouseId");
CREATE INDEX IF NOT EXISTS "idx_stock_variant" ON "WarehouseStock"("variantId");
CREATE INDEX IF NOT EXISTS "idx_movement_company" ON "StockMovement"("companyId");
CREATE INDEX IF NOT EXISTS "idx_movement_variant" ON "StockMovement"("variantId");
CREATE INDEX IF NOT EXISTS "idx_movement_warehouse" ON "StockMovement"("warehouseId");
CREATE INDEX IF NOT EXISTS "idx_fulfillment_company" ON "OrderFulfillment"("companyId");
CREATE INDEX IF NOT EXISTS "idx_fulfillment_warehouse" ON "OrderFulfillment"("warehouseId");
CREATE INDEX IF NOT EXISTS "idx_abandoned_company" ON "AbandonedCheckout"("companyId");
CREATE INDEX IF NOT EXISTS "idx_transfer_company" ON "StockTransfer"("companyId");
CREATE INDEX IF NOT EXISTS "idx_transfer_variant" ON "StockTransfer"("variantId");
CREATE INDEX IF NOT EXISTS "idx_purchase_order_company" ON "PurchaseOrder"("companyId");
CREATE INDEX IF NOT EXISTS "idx_purchase_order_warehouse" ON "PurchaseOrder"("warehouseId");
CREATE INDEX IF NOT EXISTS "idx_purchase_order_item_po" ON "PurchaseOrderItem"("purchaseOrderId");
CREATE INDEX IF NOT EXISTS "idx_purchase_order_item_variant" ON "PurchaseOrderItem"("variantId");

-- Create CourierPartner Enum and CourierConfig Table
CREATE TYPE "CourierPartner" AS ENUM ('SHIPROCKET', 'DELHIVERY', 'BLUEDART', 'DTDC', 'XPRESSBEES', 'INDIA_POST', 'THE_PROFESSIONAL_COURIERS');

CREATE TABLE "CourierConfig" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "courierPartner" "CourierPartner" NOT NULL,
    "apiEmail" TEXT,
    "apiPassword" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "CourierConfig_companyId_courierPartner_key" UNIQUE ("companyId", "courierPartner")
);

-- Create ManifestStatus Enum and ShippingManifest Table
CREATE TYPE "ManifestStatus" AS ENUM ('CREATED', 'HANDED_OVER', 'CANCELLED');

CREATE TABLE "ShippingManifest" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "manifestNumber" TEXT NOT NULL,
    "courierPartner" "CourierPartner" NOT NULL,
    "warehouseId" UUID NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "status" "ManifestStatus" DEFAULT 'CREATED' NOT NULL,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "ShippingManifest_companyId_manifestNumber_key" UNIQUE ("companyId", "manifestNumber")
);

-- Alter OrderFulfillment to add manifestId
ALTER TABLE "OrderFulfillment" ADD COLUMN "manifestId" UUID REFERENCES "ShippingManifest"("id") ON DELETE SET NULL;

-- Create Indexes for Shipping & Logistics
CREATE INDEX IF NOT EXISTS "idx_courier_config_company" ON "CourierConfig"("companyId");
CREATE INDEX IF NOT EXISTS "idx_manifest_company" ON "ShippingManifest"("companyId");
CREATE INDEX IF NOT EXISTS "idx_manifest_warehouse" ON "ShippingManifest"("warehouseId");
CREATE INDEX IF NOT EXISTS "idx_fulfillment_manifest" ON "OrderFulfillment"("manifestId");

-- Create BillingPlan and PaymentStatus Enums and Subscription Table
CREATE TYPE "BillingPlan" AS ENUM ('FREE_TRIAL', 'MONTHLY', 'YEARLY', 'ONETIME_AMC', 'PAY_PER_ORDER', 'ENTERPRISE_CUSTOM');
CREATE TYPE "PaymentStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'SUSPENDED');

CREATE TABLE "Subscription" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL UNIQUE REFERENCES "Company"("id") ON DELETE CASCADE,
    "planType" "BillingPlan" DEFAULT 'MONTHLY' NOT NULL,
    "amount" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "amcAmount" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "currency" TEXT DEFAULT 'INR' NOT NULL,
    "status" "PaymentStatus" DEFAULT 'ACTIVE' NOT NULL,
    "startDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "nextRenewalDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for Subscription company mapping
CREATE INDEX IF NOT EXISTS "idx_subscription_company" ON "Subscription"("companyId");

-- Create AuditStatus and AuditItemStatus Enums
CREATE TYPE "AuditStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AuditItemStatus" AS ENUM ('PENDING', 'MATCHED', 'DISCREPANCY');

-- Create InventoryAudit Table
CREATE TABLE "InventoryAudit" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "warehouseId" UUID NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "status" "AuditStatus" DEFAULT 'IN_PROGRESS' NOT NULL,
    "operatorEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create InventoryAuditItem Table
CREATE TABLE "InventoryAuditItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "auditId" UUID NOT NULL REFERENCES "InventoryAudit"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "expectedQty" INTEGER DEFAULT 0 NOT NULL,
    "actualQty" INTEGER DEFAULT 0 NOT NULL,
    "status" "AuditItemStatus" DEFAULT 'PENDING' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "InventoryAuditItem_auditId_variantId_key" UNIQUE ("auditId", "variantId")
);

-- Create Indexes for Audits
CREATE INDEX IF NOT EXISTS "idx_audit_company" ON "InventoryAudit"("companyId");
CREATE INDEX IF NOT EXISTS "idx_audit_warehouse" ON "InventoryAudit"("warehouseId");
CREATE INDEX IF NOT EXISTS "idx_audit_item_audit" ON "InventoryAuditItem"("auditId");
CREATE INDEX IF NOT EXISTS "idx_audit_item_variant" ON "InventoryAuditItem"("variantId");

-- Create UnitStatus Enum
CREATE TYPE "UnitStatus" AS ENUM ('IN_TRANSIT', 'AVAILABLE', 'ALLOCATED', 'DISPATCHED', 'RETURNED_RTO', 'DAMAGED');

-- Create SerializedUnit Table
CREATE TABLE "SerializedUnit" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "warehouseId" UUID NOT NULL REFERENCES "Warehouse"("id") ON DELETE CASCADE,
    "qrCodeString" TEXT NOT NULL UNIQUE,
    "status" "UnitStatus" DEFAULT 'AVAILABLE' NOT NULL,
    "checkInDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "checkOutDate" TIMESTAMP WITH TIME ZONE,
    "lastOperator" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes for SerializedUnit
CREATE INDEX IF NOT EXISTS "idx_serialized_unit_company" ON "SerializedUnit"("companyId");
CREATE INDEX IF NOT EXISTS "idx_serialized_unit_variant" ON "SerializedUnit"("variantId");
CREATE INDEX IF NOT EXISTS "idx_serialized_unit_warehouse" ON "SerializedUnit"("warehouseId");
CREATE INDEX IF NOT EXISTS "idx_serialized_unit_qr" ON "SerializedUnit"("qrCodeString");

-- Create Vendor Table
CREATE TABLE IF NOT EXISTS "Vendor" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "taxId" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Vendor_companyId_name_key" UNIQUE ("companyId", "name")
);

CREATE INDEX IF NOT EXISTS "idx_vendor_company" ON "Vendor"("companyId");

-- Link PurchaseOrder to Vendor
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "vendorId" UUID REFERENCES "Vendor"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "idx_purchase_order_vendor" ON "PurchaseOrder"("vendorId");

-- Idempotent adjustments for Company table
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "taxId" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "gstin" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "lowStockMode" TEXT DEFAULT 'MANUAL' NOT NULL;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Idempotent adjustments for ProductVariant table
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Top' NOT NULL;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "targetGroup" TEXT DEFAULT 'Adults' NOT NULL;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "ageRange" TEXT;



