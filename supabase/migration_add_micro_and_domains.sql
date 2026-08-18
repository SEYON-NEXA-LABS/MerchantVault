-- Migration: Complete GST Engine Enhancements, HSN Codes, Vendor State (Tamil Nadu Default), Custom Domains & MICRO Budget Plan Add-ons

-- 1. Alter BillingPlan enum to add MICRO plan type
ALTER TYPE "BillingPlan" ADD VALUE IF NOT EXISTS 'MICRO';

-- 2. Add custom domain & white-label add-on fields to Company
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "customDomain" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "customSubdomain" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "customDomainStatus" TEXT DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS "hasWhiteLabelAddon" BOOLEAN DEFAULT FALSE NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_company_custom_domain" ON "Company"("customDomain");
CREATE INDEX IF NOT EXISTS "idx_company_custom_subdomain" ON "Company"("customSubdomain");

-- 3. Add GST HSN Code & GST Rate to ProductVariant
ALTER TABLE "ProductVariant" 
ADD COLUMN IF NOT EXISTS "hsnCode" TEXT DEFAULT '6109',
ADD COLUMN IF NOT EXISTS "gstRate" DOUBLE PRECISION DEFAULT 12.0;

-- 4. Create Vendor Table & Add State Column (Tamil Nadu Default)
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

-- 5. Add B2B GSTIN & Place of Supply fields to Order and OrderFulfillment
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "buyerGstin" TEXT,
ADD COLUMN IF NOT EXISTS "buyerCompanyName" TEXT,
ADD COLUMN IF NOT EXISTS "placeOfSupply" TEXT,
ADD COLUMN IF NOT EXISTS "taxType" TEXT DEFAULT 'INTRA_STATE',
ADD COLUMN IF NOT EXISTS "cgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "sgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "igstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "taxableAmount" DOUBLE PRECISION DEFAULT 0.0;

ALTER TABLE "OrderFulfillment" 
ADD COLUMN IF NOT EXISTS "buyerGstin" TEXT,
ADD COLUMN IF NOT EXISTS "buyerCompanyName" TEXT,
ADD COLUMN IF NOT EXISTS "placeOfSupply" TEXT,
ADD COLUMN IF NOT EXISTS "taxType" TEXT DEFAULT 'INTRA_STATE',
ADD COLUMN IF NOT EXISTS "cgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "sgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "igstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "taxableAmount" DOUBLE PRECISION DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS "idx_order_buyer_gstin" ON "Order"("buyerGstin");
CREATE INDEX IF NOT EXISTS "idx_order_place_of_supply" ON "Order"("placeOfSupply");
CREATE INDEX IF NOT EXISTS "idx_fulfillment_buyer_gstin" ON "OrderFulfillment"("buyerGstin");

-- 6. Add Add-On Feature Toggles & Tax Withholding (TDS / TCS) Columns
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "hasMarketplaceSyncAddon" BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS "hasGstEngineAddon" BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN IF NOT EXISTS "hasTdsAddon" BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS "hasMarketingAiAddon" BOOLEAN DEFAULT FALSE NOT NULL;


-- 7. Marketplace Channel Integration Table (Shopify, Amazon, Flipkart, Myntra)
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

-- 8. Multi-Marketplace Support (Make channel order & variant ID columns optional)
ALTER TABLE "ProductVariant" ALTER COLUMN "shopifyVariantId" DROP NOT NULL;
ALTER TABLE "OrderFulfillment" ALTER COLUMN "shopifyOrderId" DROP NOT NULL;


