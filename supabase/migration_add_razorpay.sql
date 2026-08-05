-- Add Razorpay settings columns to Company table
ALTER TABLE "Company"
ADD COLUMN IF NOT EXISTS "razorpayEnabled" BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS "razorpayKeyId" TEXT,
ADD COLUMN IF NOT EXISTS "razorpayKeySecret" TEXT;
