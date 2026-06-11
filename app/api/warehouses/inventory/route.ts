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

    // Fetch all stock levels for the company's variants across warehouses
    const { data: stock, error: stockErr } = await supabase
      .from("WarehouseStock")
      .select(`
        id,
        warehouseId,
        variantId,
        currentStockLevel,
        createdAt,
        updatedAt,
        warehouse:Warehouse!inner(name, code, companyId),
        variant:ProductVariant!inner(sku, title, size, color)
      `)
      .eq("warehouse.companyId", company.id);

    if (stockErr) throw stockErr;

    return NextResponse.json(stock || []);
  } catch (error: any) {
    console.error("Fetch Warehouse Stock Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouseId, variantId, newStockLevel, operatorEmail } = body;

    if (!warehouseId || !variantId || typeof newStockLevel !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "vtex")
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 1. Fetch current stock for this variant at this warehouse
    const { data: currentStock, error: fetchErr } = await supabase
      .from("WarehouseStock")
      .select("currentStockLevel")
      .eq("warehouseId", warehouseId)
      .eq("variantId", variantId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    const oldStock = currentStock ? currentStock.currentStockLevel : 0;
    const delta = newStockLevel - oldStock;

    // 2. Upsert the warehouse stock level
    const { data: updatedStock, error: upsertErr } = await supabase
      .from("WarehouseStock")
      .upsert({
        warehouseId,
        variantId,
        currentStockLevel: newStockLevel,
        updatedAt: new Date().toISOString()
      }, {
        onConflict: "warehouseId,variantId"
      })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    // 3. Log StockMovement if there is a change
    if (delta !== 0) {
      const movementType = delta > 0 ? "INWARD" : "OUTWARD";
      const { error: moveErr } = await supabase
        .from("StockMovement")
        .insert({
          companyId: company.id,
          variantId,
          warehouseId,
          type: movementType,
          quantity: Math.abs(delta),
          operatorEmail: operatorEmail || "system@vtex.local",
          syncStatus: "SUCCESS"
        });

      if (moveErr) console.error("Logged movement error:", moveErr);
    }

    // 4. Update the cached aggregated stock level on ProductVariant table
    const { data: allWarehouseStocks, error: allStocksErr } = await supabase
      .from("WarehouseStock")
      .select("currentStockLevel")
      .eq("variantId", variantId);

    if (allStocksErr) throw allStocksErr;

    const totalAggregatedStock = (allWarehouseStocks || []).reduce((sum, item) => sum + item.currentStockLevel, 0);

    const { error: varUpdateErr } = await supabase
      .from("ProductVariant")
      .update({
        currentStockLevel: totalAggregatedStock,
        updatedAt: new Date().toISOString()
      })
      .eq("id", variantId);

    if (varUpdateErr) throw varUpdateErr;

    return NextResponse.json({ success: true, updatedStock, totalAggregatedStock });
  } catch (error: any) {
    console.error("Update Stock Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
