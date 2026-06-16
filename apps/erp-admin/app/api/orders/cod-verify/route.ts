import { NextResponse } from "next/server";
import { getContextCompanyId } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: order, error: updateErr } = await supabase
      .from("OrderFulfillment")
      .update({ codVerificationStatus: status })
      .eq("id", orderId)
      .eq("companyId", companyId)
      .select()
      .single();

    if (updateErr) {
      throw updateErr;
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("COD Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
