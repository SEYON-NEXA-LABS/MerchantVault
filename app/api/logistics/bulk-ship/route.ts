import { NextResponse } from "next/server";
import { getContextCompanyId } from "@/lib/session";
import { supabase } from "@/lib/supabase";


export async function POST(request: Request) {
  try {
    const companyId = await getContextCompanyId();

    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { orderIds, courierPartner } = await request.json();
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !courierPartner) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedOrders = [];

    for (const orderId of orderIds) {
      // Generate mock AWB
      const prefix = courierPartner.slice(0, 3).toUpperCase();
      const randomNum = Math.floor(100000000 + Math.random() * 900000000);
      const awbNumber = `${prefix}${randomNum}`;

      // Simulated pricing
      const shippingCost = Math.floor(Math.random() * 70) + 60; // 60 to 130
      const customerShippingFee = Math.random() > 0.5 ? 40 : 0; // 0 or 40

      const { data: updated, error: updateErr } = await supabase
        .from("OrderFulfillment")
        .update({
          awbNumber,
          courierPartner,
          deliveryStatus: "PROCESSING",
          shippingCost,
          customerShippingFee
        })
        .eq("id", orderId)
        .eq("companyId", companyId)
        .select()
        .single();

      if (updateErr) {
        console.error(`Error updating order ${orderId}:`, updateErr);
      } else if (updated) {
        updatedOrders.push(updated);
      }
    }

    return NextResponse.json({ success: true, orders: updatedOrders });
  } catch (error: any) {
    console.error("Bulk Ship Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
