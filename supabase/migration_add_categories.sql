-- Migration: Add Category table and update ProductVariant table

-- 1. Create Category Table
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

-- Index for lookup
CREATE INDEX IF NOT EXISTS "idx_category_company_slug" ON "Category" ("companyId", "slug");

-- 2. Add Category reference fields to ProductVariant
ALTER TABLE "ProductVariant"
ADD COLUMN IF NOT EXISTS "categoryId" UUID REFERENCES "Category"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "categoryName" TEXT,
ADD COLUMN IF NOT EXISTS "targetGroup" TEXT;

-- Index on ProductVariant categoryId
CREATE INDEX IF NOT EXISTS "idx_product_variant_category" ON "ProductVariant" ("categoryId");
