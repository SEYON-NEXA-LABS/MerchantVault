import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ active: 0, delivered: 0, returns: 0 });
    }

    const { data: statusList, error } = await supabase
      .from("OrderFulfillment")
      .select("deliveryStatus")
      .eq("companyId", companyId);

    if (error) throw error;

    const counts = {
      active: 0,
      delivered: 0,
      returns: 0
    };

    (statusList || []).forEach((item: any) => {
      const status = item.deliveryStatus;
      if (status === "DELIVERED") {
        counts.delivered++;
      } else if (status === "RTO_INITIATED" || status === "RTO_RECEIVED") {
        counts.returns++;
      } else {
        counts.active++;
      }
    });

    return NextResponse.json(counts);
  } catch (error: any) {
    console.error("Fetch Order Counts Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
