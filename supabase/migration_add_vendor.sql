-- Migration: Store vs Brand Separation
-- Adds vendor field for Manufacturer / Brand on ProductVariant table

ALTER TABLE "ProductVariant"
ADD COLUMN IF NOT EXISTS "vendor" TEXT;

-- Comment for clarity
COMMENT ON COLUMN "ProductVariant"."vendor" IS 'Manufacturer or Label Brand (e.g. L-Oreal, MAC, Nike, Zara)';
COMMENT ON TABLE "Brand" IS 'Storefront Channels / Store Outlets (e.g. Seyon Beauty Store, Seyon Fashion Outlet)';
