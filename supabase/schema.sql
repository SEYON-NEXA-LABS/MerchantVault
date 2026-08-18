-- Create Enum Types
CREATE TYPE "MovementType" AS ENUM ('INWARD', 'OUTWARD', 'ADJUSTMENT');
CREATE TYPE "OrderSource" AS ENUM ('STOREFRONT', 'SHOPIFY', 'POS', 'MANUAL');
CREATE TYPE "SyncState" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE "RecoveryState" AS ENUM ('PENDING', 'WHATSAPP_SENT', 'RECOVERED');
CREATE TYPE "ShippingStatus" AS ENUM ('PROCESSING', 'SHIPPED', 'DELIVERED', 'RTO_INITIATED', 'RTO_RECEIVED');
CREATE TYPE "ProductVelocity" AS ENUM ('FAST', 'MEDIUM', 'SLOW');
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'TENANTADMIN', 'MANAGER', 'STAFF');

-- Create Company Table
CREATE TABLE "Company" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "storeName" TEXT,
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
    "razorpayEnabled" BOOLEAN DEFAULT FALSE NOT NULL,
    "razorpayKeyId" TEXT,
    "razorpayKeySecret" TEXT,
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
    "shopifyVariantId" TEXT, -- Channel Variant ID (Shopify, Amazon ASIN, Flipkart FSN)
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
    "hsnCode" TEXT DEFAULT '6109',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
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
    "shopifyOrderId" TEXT, -- Channel Order ID (Shopify, Amazon, Flipkart, Myntra)
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
    "orderSource" "OrderSource" DEFAULT 'STOREFRONT' NOT NULL,
    "warehouseId" UUID REFERENCES "Warehouse"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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

-- Idempotent adjustments for Multi-Store / Multi-Brand Setup
-- Note: 'Brand' table represents Storefront Channels / Sub-Store Outlets (e.g. Seyon Beauty Store, Seyon Fashion)
-- Note: 'vendor' column on ProductVariant represents Manufacturer / Label Brand (e.g. L'Oréal, MAC, Nike, Zara)
CREATE TABLE IF NOT EXISTS "Brand" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Brand_companyId_code_key" UNIQUE ("companyId", "code")
);

CREATE INDEX IF NOT EXISTS "idx_brand_company" ON "Brand" ("companyId");

ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "themeConfig" TEXT;

ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "brandId" UUID REFERENCES "Brand"("id") ON DELETE SET NULL;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "vendor" TEXT;
CREATE INDEX IF NOT EXISTS "idx_product_variant_brand" ON "ProductVariant" ("brandId");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "brandId" UUID REFERENCES "Brand"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "idx_user_brand" ON "User" ("brandId");


-- Campaign, CampaignProduct, and CampaignAnalytics Tables
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT DEFAULT 'FLASH_SALE' NOT NULL, -- 'FLASH_SALE', 'FESTIVE_MEGA', 'VIP_EXCLUSIVE'
    "discountType" TEXT DEFAULT 'PERCENTAGE' NOT NULL, -- 'PERCENTAGE', 'FLAT_AMOUNT'
    "discountValue" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "isActive" BOOLEAN DEFAULT false NOT NULL,
    "targetSegment" TEXT DEFAULT 'ALL' NOT NULL, -- 'ALL', 'VIP', 'REPEAT'
    "bannerText" TEXT,
    "promoCode" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "CampaignProduct" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "campaignId" UUID NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "overridePrice" DOUBLE PRECISION,
    UNIQUE("campaignId", "variantId")
);

CREATE TABLE IF NOT EXISTS "CampaignAnalytics" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "campaignId" UUID NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE,
    "totalImpressions" INTEGER DEFAULT 0 NOT NULL,
    "totalOrders" INTEGER DEFAULT 0 NOT NULL,
    "totalRevenue" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "whatsappSentCount" INTEGER DEFAULT 0 NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_campaign_company" ON "Campaign"("companyId");
CREATE INDEX IF NOT EXISTS "idx_campaign_active" ON "Campaign"("isActive", "startTime", "endTime");
CREATE INDEX IF NOT EXISTS "idx_campaign_product" ON "CampaignProduct"("campaignId", "variantId");

-- Coupons Table
CREATE TABLE IF NOT EXISTS "Coupons" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL CHECK ("discountType" IN ('PERCENTAGE', 'FIXED')),
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minOrderValue" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "maxDiscountAmount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usedCount" INTEGER DEFAULT 0 NOT NULL,
    "startsAt" TIMESTAMP WITH TIME ZONE,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Coupons_companyId_code_key" UNIQUE ("companyId", "code")
);

CREATE INDEX IF NOT EXISTS "idx_coupons_company_code" ON "Coupons" ("companyId", "code");

-- Category Table
CREATE TABLE IF NOT EXISTS "Category" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'Package' NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "displayOrder" INTEGER DEFAULT 0 NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Category_companyId_slug_key" UNIQUE ("companyId", "slug")
);

CREATE INDEX IF NOT EXISTS "idx_category_company_slug" ON "Category" ("companyId", "slug");

-- Order & OrderFulfillment Discount ALTER Statements
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0.0 NOT NULL;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "couponId" UUID REFERENCES "Coupons"("id") ON DELETE SET NULL;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0.0 NOT NULL;

-- ProductVariant Category ALTER Statements
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "categoryId" UUID REFERENCES "Category"("id") ON DELETE SET NULL;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "categoryName" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "targetGroup" TEXT;
CREATE INDEX IF NOT EXISTS "idx_product_variant_category" ON "ProductVariant" ("categoryId");

-- GST Billing & Tax Engine Enhancements
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "hsnCode" TEXT DEFAULT '6204';
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "gstRate" DOUBLE PRECISION DEFAULT 12.0;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "buyerGstin" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "buyerCompanyName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "placeOfSupply" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxType" TEXT DEFAULT 'INTRA_STATE';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cgstAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "sgstAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "igstAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxableAmount" DOUBLE PRECISION DEFAULT 0.0;

ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "buyerGstin" TEXT;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "buyerCompanyName" TEXT;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "placeOfSupply" TEXT;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "taxType" TEXT DEFAULT 'INTRA_STATE';
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "cgstAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "sgstAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "igstAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "taxableAmount" DOUBLE PRECISION DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS "idx_order_buyer_gstin" ON "Order"("buyerGstin");
CREATE INDEX IF NOT EXISTS "idx_order_place_of_supply" ON "Order"("placeOfSupply");
CREATE INDEX IF NOT EXISTS "idx_fulfillment_buyer_gstin" ON "OrderFulfillment"("buyerGstin");

-- Custom Domains & MICRO Budget Plan Add-ons
ALTER TYPE "BillingPlan" ADD VALUE IF NOT EXISTS 'MICRO';

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "customDomain" TEXT UNIQUE;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "customSubdomain" TEXT UNIQUE;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "customDomainStatus" TEXT DEFAULT 'NONE';
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasWhiteLabelAddon" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasMarketplaceSyncAddon" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasGstEngineAddon" BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasTdsAddon" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasMarketingAiAddon" BOOLEAN DEFAULT FALSE NOT NULL;



-- Tax Withholding (TDS / TCS) Add-On Columns
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "tdsSection" TEXT; -- e.g., '194C', '194Q', '206C(1H)'
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "tdsRate" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "tdsAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "tcsAmount" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "PurchaseOrder" ADD COLUMN IF NOT EXISTS "netPayableAmount" DOUBLE PRECISION DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS "idx_company_custom_domain" ON "Company"("customDomain");
CREATE INDEX IF NOT EXISTS "idx_company_custom_subdomain" ON "Company"("customSubdomain");

-- Vendor Table Definition & State Column for GST Input Tax Credit (ITC)
CREATE TABLE IF NOT EXISTS "Vendor" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "state" TEXT DEFAULT 'Tamil Nadu',
    "gstin" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Vendor_companyId_name_key" UNIQUE ("companyId", "name")
);

ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "state" TEXT DEFAULT 'Tamil Nadu';
CREATE INDEX IF NOT EXISTS "idx_vendor_company" ON "Vendor"("companyId");

-- Marketplace Channel Integration Table (Shopify, Amazon, Flipkart, Myntra)
CREATE TABLE IF NOT EXISTS "MarketplaceConfig" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "channel" TEXT NOT NULL, -- 'SHOPIFY', 'AMAZON', 'FLIPKART', 'MYNTRA'
    "storeName" TEXT NOT NULL,
    "sellerId" TEXT,
    "shopUrl" TEXT,
    "accessToken" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "autoSyncInventory" BOOLEAN DEFAULT TRUE NOT NULL,
    "autoIngestOrders" BOOLEAN DEFAULT TRUE NOT NULL,
    "lastSyncedAt" TIMESTAMP WITH TIME ZONE,
    "syncStatus" TEXT DEFAULT 'IDLE', -- 'IDLE', 'SYNCING', 'SUCCESS', 'ERROR'
    "errorMessage" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "MarketplaceConfig_companyId_channel_key" UNIQUE ("companyId", "channel")
);

CREATE INDEX IF NOT EXISTS "idx_marketplace_config_company" ON "MarketplaceConfig"("companyId");








