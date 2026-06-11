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

    // Fetch product variants with nested warehouse stock levels
    const { data: variants, error: varErr } = await supabase
      .from("ProductVariant")
      .select(`
        id,
        companyId,
        shopifyVariantId,
        sku,
        title,
        size,
        color,
        barcodeString,
        safetyStockLimit,
        currentStockLevel,
        velocity,
        leadTimeDays,
        averageDailySales,
        createdAt,
        updatedAt,
        stocks:WarehouseStock(
          id,
          warehouseId,
          currentStockLevel
        )
      `)
      .eq("companyId", company.id)
      .order("title", { ascending: true });

    if (varErr) throw varErr;

    return NextResponse.json(variants || []);
  } catch (error: any) {
    console.error("Fetch Inventory Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
