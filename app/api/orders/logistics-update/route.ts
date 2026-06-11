import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { awbNumber, deliveryStatus } = await request.json();

    if (!awbNumber || !deliveryStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from("OrderFulfillment")
      .update({ deliveryStatus })
      .eq("awbNumber", awbNumber)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!order) {
      return NextResponse.json(
        { error: "No shipment found with this AWB number" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Logistics Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
