import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { orderId, awbNumber, courierPartner } = await request.json();

    if (!orderId || !awbNumber || !courierPartner) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from("OrderFulfillment")
      .update({
        awbNumber,
        courierPartner,
        deliveryStatus: "SHIPPED",
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Fulfill Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
