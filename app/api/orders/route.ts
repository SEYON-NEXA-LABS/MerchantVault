import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "vtex")
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json([]);
    }

    const { data: orders, error: ordersErr } = await supabase
      .from("OrderFulfillment")
      .select("*")
      .eq("companyId", company.id)
      .order("createdAt", { ascending: false });

    if (ordersErr) throw ordersErr;

    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
