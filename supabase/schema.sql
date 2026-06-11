-- Create Enum Types
CREATE TYPE "MovementType" AS ENUM ('INWARD', 'OUTWARD');
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
