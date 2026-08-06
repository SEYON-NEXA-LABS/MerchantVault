-- Migration: Add storeName column to Company table in Supabase
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "storeName" TEXT;
