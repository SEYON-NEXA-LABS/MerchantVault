-- Add orderSource column and source references to Order & OrderFulfillment tables
CREATE TYPE "OrderSource" AS ENUM ('STOREFRONT', 'SHOPIFY', 'POS', 'MANUAL');

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "orderSource" "OrderSource" DEFAULT 'STOREFRONT' NOT NULL;

ALTER TABLE "OrderFulfillment"
ADD COLUMN IF NOT EXISTS "orderSource" "OrderSource" DEFAULT 'STOREFRONT' NOT NULL,
ADD COLUMN IF NOT EXISTS "orderId" UUID REFERENCES "Order"("id") ON DELETE SET NULL;
