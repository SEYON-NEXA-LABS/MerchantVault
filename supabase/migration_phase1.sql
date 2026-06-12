-- Migration Script: Phase 1 Bridge Sync & Core Database Schema

-- Create Customer Table
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Customer_companyId_phone_key" UNIQUE ("companyId", "phone"),
    CONSTRAINT "Customer_companyId_email_key" UNIQUE ("companyId", "email")
);

-- Create Order Table
CREATE TABLE IF NOT EXISTS "Order" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "customerId" UUID NOT NULL REFERENCES "Customer"("id") ON DELETE RESTRICT,
    "orderNumber" TEXT NOT NULL,
    "shopifyOrderId" TEXT,
    "paymentStatus" TEXT DEFAULT 'PENDING' NOT NULL,
    "fulfillmentStatus" TEXT DEFAULT 'UNFULFILLED' NOT NULL,
    "totalPrice" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "currency" TEXT DEFAULT 'INR' NOT NULL,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "Order_companyId_orderNumber_key" UNIQUE ("companyId", "orderNumber")
);

-- Create OrderItem Table
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "variantId" UUID NOT NULL REFERENCES "ProductVariant"("id") ON DELETE RESTRICT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter AbandonedCheckout to link to Customer
ALTER TABLE "AbandonedCheckout" ADD COLUMN IF NOT EXISTS "customerId" UUID REFERENCES "Customer"("id") ON DELETE SET NULL;

-- Alter OrderFulfillment to link to Customer and Order
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "customerId" UUID REFERENCES "Customer"("id") ON DELETE SET NULL;
ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "orderId" UUID REFERENCES "Order"("id") ON DELETE SET NULL;

-- Create Indexes to Optimize Query Performance
CREATE INDEX IF NOT EXISTS "idx_customer_company" ON "Customer"("companyId");
CREATE INDEX IF NOT EXISTS "idx_customer_phone" ON "Customer"("phone");
CREATE INDEX IF NOT EXISTS "idx_customer_email" ON "Customer"("email");
CREATE INDEX IF NOT EXISTS "idx_order_company" ON "Order"("companyId");
CREATE INDEX IF NOT EXISTS "idx_order_customer" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "idx_order_number" ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS "idx_order_item_order" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "idx_order_item_variant" ON "OrderItem"("variantId");
