// Centralized Domain Types for Seyon Shopping / FabricVault Platform

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  state?: string | null;
  city?: string | null;
  pincode?: string | null;
  managerName?: string | null;
  phone?: string | null;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  subdomain?: string | null;
  customDomain?: string | null;
  razorpayKeyId?: string | null;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPERADMIN" | "COMPANY_ADMIN" | "WAREHOUSE_MANAGER" | "STAFF";
  companyId?: string | null;
  warehouseId?: string | null;
  createdAt?: string;
}
