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
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
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
      .eq("companyId", company.id)
      .order("createdAt", { ascending: false })
      .limit(30);

    if (moveErr) throw moveErr;

    return NextResponse.json(movements || []);
  } catch (error: any) {
    console.error("Fetch Staff Logs Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
