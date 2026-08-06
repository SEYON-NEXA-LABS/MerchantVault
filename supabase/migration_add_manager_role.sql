-- Migration: Add 'MANAGER' to PostgreSQL 'UserRole' enum type
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MANAGER';
