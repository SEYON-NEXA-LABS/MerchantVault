-- Migration: Extended GST Billing, HSN Code, Tax Rate, and Granular CGST/SGST/IGST breakdown fields

-- 1. ProductVariant Schema Enhancements (HSN Code & GST Rate)
ALTER TABLE "ProductVariant"
ADD COLUMN IF NOT EXISTS "hsnCode" TEXT DEFAULT '6204',
ADD COLUMN IF NOT EXISTS "gstRate" DOUBLE PRECISION DEFAULT 12.0;

-- 2. Order Schema Enhancements
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "buyerGstin" TEXT,
ADD COLUMN IF NOT EXISTS "buyerCompanyName" TEXT,
ADD COLUMN IF NOT EXISTS "placeOfSupply" TEXT,
ADD COLUMN IF NOT EXISTS "taxType" TEXT DEFAULT 'INTRA_STATE',
ADD COLUMN IF NOT EXISTS "cgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "sgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "igstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "taxableAmount" DOUBLE PRECISION DEFAULT 0.0;

-- 3. OrderFulfillment Schema Enhancements
ALTER TABLE "OrderFulfillment"
ADD COLUMN IF NOT EXISTS "buyerGstin" TEXT,
ADD COLUMN IF NOT EXISTS "buyerCompanyName" TEXT,
ADD COLUMN IF NOT EXISTS "placeOfSupply" TEXT,
ADD COLUMN IF NOT EXISTS "taxType" TEXT DEFAULT 'INTRA_STATE',
ADD COLUMN IF NOT EXISTS "cgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "sgstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "igstAmount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "taxableAmount" DOUBLE PRECISION DEFAULT 0.0;

-- 4. Create Indexes for GST Queries and Tax Filing Audits
CREATE INDEX IF NOT EXISTS "idx_order_buyer_gstin" ON "Order"("buyerGstin");
CREATE INDEX IF NOT EXISTS "idx_order_place_of_supply" ON "Order"("placeOfSupply");
CREATE INDEX IF NOT EXISTS "idx_fulfillment_buyer_gstin" ON "OrderFulfillment"("buyerGstin");
