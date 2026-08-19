// Centralized Inventory & Product Domain Models

import { Warehouse } from "./index";

export interface StockLevel {
  id: string;
  warehouseId: string;
  currentStockLevel: number;
}

export interface VariantStock {
  id: string;
  size: string; // Generic: fits apparel, footwear, accessories, electronics, etc.
  color: string;
  sku: string;
  qty: number;
  thumbnailConfig?: string | null;
  price: number;
  shopifyVariantId?: string | null;
  stocks: StockLevel[];
}

export interface ProductInventory {
  id: string;
  name: string;
  baseSku: string;
  category: string;
  targetGroup: string;
  ageRange?: string | null;
  totalQty: number;
  threshold: number;
  skuColor?: string;
  thumbnailConfig?: string | null;
  variants: VariantStock[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  size?: string | null;
  color?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  currentStockLevel: number;
  safetyStockLimit?: number | null;
  category?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  vendor?: string | null;
  thumbnailConfig?: string | null;
  brandId?: string | null;
  barcode?: string | null;
  companyId?: string | null;
}

export interface StockMovement {
  id: string;
  type: "INWARD" | "OUTWARD" | "TRANSFER" | "ADJUSTMENT";
  quantity: number;
  variantId: string;
  warehouseId: string;
  createdAt: string;
  referenceDocNumber?: string | null;
}

export type { Warehouse };

