// Centralized Orders & Logistics Domain Models

export interface Order {
  id: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  totalWeightKg: number;
  awbNumber: string | null;
  courierPartner: string | null;
  deliveryStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" | "RTO_INITIATED" | "RTO_RECEIVED";
  warehouseId: string | null;
  createdAt: string;
  codVerificationStatus?: string | null;
  rtoRiskScore?: string | null;
  shippingCost?: number | null;
  customerShippingFee?: number | null;
  paymentStatus?: string;
  orderSource?: "STOREFRONT" | "SHOPIFY" | "POS" | "MANUAL";
  customerId?: string | null;
  customerEmail?: string;
  couponCode?: string | null;
  discountAmount?: number | null;
}




export interface RecentOrderItem {
  id: string;
  customer: string;
  time: string;
  status: string;
  statusColor: string;
  amount: string;
}

export interface RegionSalesHeatmap {
  state: string;
  city: string;
  orders: number;
  percentage: number;
  revenue: string;
  color: string;
}
