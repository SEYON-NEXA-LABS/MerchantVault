import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Fetch last 30 stock movements as staff audit logs
    const { data: movements, error: moveErr } = await supabase
      .from("StockMovement")
      .select(`
        id,
        type,
        quantity,
        operatorEmail,
        createdAt,
        warehouse:Warehouse(name, code),
        variant:ProductVariant(sku, title, size, color)
      `)
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false })
      .limit(30);

    if (moveErr) throw moveErr;

    return NextResponse.json(movements || []);
  } catch (error: any) {
    console.error("Fetch Staff Logs Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
