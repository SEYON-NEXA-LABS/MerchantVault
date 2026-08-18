import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isSimulate = searchParams.get("simulate") === "true";
    if (isSimulate) {
      const { GET: handleSimulateOrder } = await import("@/app/api/webhooks/shopify/orders-create/route");
      return handleSimulateOrder();
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json([]);
    }

    const type = searchParams.get("type"); // "active" | "delivered" | "returns"
    const source = searchParams.get("source"); // "STOREFRONT" | "SHOPIFY" | "ALL"
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : null;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    let query = supabase
      .from("OrderFulfillment")
      .select("id, orderNumber, shopifyOrderId, customerId, customerName, customerPhone, shippingAddressLine1, shippingAddressLine2, shippingCity, shippingState, shippingZip, shippingCountry, awbNumber, courierPartner, deliveryStatus, orderSource, createdAt, totalWeightKg, codVerificationStatus, rtoRiskScore, shippingCost, customerShippingFee, couponCode, discountAmount")
      .eq("companyId", companyId);

    if (source && source !== "ALL") {
      query = query.eq("orderSource", source);
    }

    if (type === "active") {
      query = query.in("deliveryStatus", ["PROCESSING", "SHIPPED"]);
    } else if (type === "delivered") {
      query = query.eq("deliveryStatus", "DELIVERED");
    } else if (type === "returns") {
      query = query.in("deliveryStatus", ["RTO_INITIATED", "RTO_RECEIVED"]);
    }

    if (limit && !isNaN(limit)) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: orders, error: ordersErr } = await query.order("createdAt", { ascending: false });

    if (ordersErr) throw ordersErr;

    // Fetch and join paymentStatus from Order table and customerEmail from Customer table
    if (orders && orders.length > 0) {
      const shopifyOrderIds = orders.map((o: any) => o.shopifyOrderId).filter(Boolean);
      const customerIds = orders.map((o: any) => o.customerId).filter(Boolean);
      
      if (shopifyOrderIds.length > 0) {
        const { data: orderPayments } = await supabase
          .from("Order")
          .select("shopifyOrderId, paymentStatus")
          .in("shopifyOrderId", shopifyOrderIds);

        if (orderPayments) {
          const paymentMap = new Map(orderPayments.map((p: any) => [p.shopifyOrderId, p.paymentStatus]));
          orders.forEach((o: any) => {
            o.paymentStatus = paymentMap.get(o.shopifyOrderId) || "PENDING";
          });
        }
      }

      if (customerIds.length > 0) {
        const { data: customers } = await supabase
          .from("Customer")
          .select("id, email")
          .in("id", customerIds);

        if (customers) {
          const emailMap = new Map(customers.map((c: any) => [c.id, c.email]));
          orders.forEach((o: any) => {
            o.customerEmail = emailMap.get(o.customerId) || "";
          });
        }
      }
    }

    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/orders -> Delegate to unified order creation handler
export async function POST(request: NextRequest) {
  const { POST: handleCreateOrder } = await import("@/app/api/webhooks/shopify/orders-create/route");
  return handleCreateOrder(request);
}


