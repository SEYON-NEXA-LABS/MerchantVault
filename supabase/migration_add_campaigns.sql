-- Add Campaign, CampaignProduct, and CampaignAnalytics Tables
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

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_campaign_company" ON "Campaign"("companyId");
CREATE INDEX IF NOT EXISTS "idx_campaign_active" ON "Campaign"("isActive", "startTime", "endTime");
CREATE INDEX IF NOT EXISTS "idx_campaign_product" ON "CampaignProduct"("campaignId", "variantId");
