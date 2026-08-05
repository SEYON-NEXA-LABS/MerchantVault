import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Fetch all fulfillments to aggregate customer records
    const { data: fulfillments, error: fillErr } = await supabase
      .from("OrderFulfillment")
      .select("id, orderNumber, customerName, customerPhone, shippingCity, shippingState, shippingZip, shippingCountry, deliveryStatus, awbNumber, courierPartner, createdAt")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (fillErr) throw fillErr;

    // Fetch all abandoned checkouts
    const { data: abandoneds, error: abanErr } = await supabase
      .from("AbandonedCheckout")
      .select("id, customerName, customerPhone, cartValue, recoveryStatus, createdAt, updatedAt")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (abanErr) throw abanErr;

    // Aggregate by phone number
    const customerMap: Record<string, any> = {};

    (fulfillments || []).forEach((f: any) => {
      const phone = f.customerPhone || "UNKNOWN";
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: f.customerName,
          phone: f.customerPhone,
          city: f.shippingCity,
          state: f.shippingState,
          zip: f.shippingZip,
          country: f.shippingCountry,
          totalOrders: 0,
          orders: []
        };
      }
      customerMap[phone].totalOrders += 1;
      customerMap[phone].orders.push({
        id: f.id,
        orderNumber: f.orderNumber,
        deliveryStatus: f.deliveryStatus,
        awbNumber: f.awbNumber,
        courierPartner: f.courierPartner,
        createdAt: f.createdAt
      });
    });

    const customers = Object.values(customerMap).map((c: any) => ({
      ...c,
      isRepeat: c.totalOrders > 1
    }));

    return NextResponse.json({
      customers,
      abandonedCheckouts: abandoneds || []
    });
  } catch (error: any) {
    console.error("Fetch CRM Customers Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
