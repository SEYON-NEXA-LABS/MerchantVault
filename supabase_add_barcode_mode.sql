-- Migration: Add barcodeMode column to Company table in Supabase
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "barcodeMode" TEXT DEFAULT 'HYBRID';

ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "shopifyWebhookSecret" TEXT DEFAULT '';

ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "shopifyClientId" TEXT DEFAULT '';

ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "shopifyClientSecret" TEXT DEFAULT '';