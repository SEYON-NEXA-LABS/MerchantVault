-- Migration: Add Coupons table and discount fields to Order / OrderFulfillment tables

-- 1. Create Coupons Table
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

-- Index for fast lookup by code & companyId
CREATE INDEX IF NOT EXISTS "idx_coupons_company_code" ON "Coupons" ("companyId", "code");

-- 2. Add discount fields to Order
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0.0 NOT NULL;

-- 3. Add coupon & discount fields to OrderFulfillment
ALTER TABLE "OrderFulfillment"
ADD COLUMN IF NOT EXISTS "couponId" UUID REFERENCES "Coupons"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "couponCode" TEXT,
ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0.0 NOT NULL;
