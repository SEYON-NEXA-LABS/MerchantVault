import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json([]);
    }

    const { data: orders, error: ordersErr } = await supabase
      .from("OrderFulfillment")
      .select("id, orderNumber, customerName, customerPhone, shippingAddressLine1, shippingAddressLine2, shippingCity, shippingState, shippingZip, shippingCountry, awbNumber, courierPartner, deliveryStatus, createdAt, totalWeightKg, codVerificationStatus, rtoRiskScore, shippingCost, customerShippingFee")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (ordersErr) throw ordersErr;

    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
