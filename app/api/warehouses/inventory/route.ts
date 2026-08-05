import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
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
      .eq("warehouse.companyId", companyId);

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
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { warehouseId, operatorEmail, variantId, newStockLevel, items } = body;

    // 1. Handle batch items submission
    if (Array.isArray(items)) {
      if (!warehouseId) {
        return NextResponse.json({ error: "Warehouse ID is required for batch updates" }, { status: 400 });
      }

      for (const item of items) {
        const { variantId: itemVarId, newStockLevel: itemNewStock } = item;
        if (!itemVarId || typeof itemNewStock !== "number") continue;

        // Fetch current stock to calculate delta
        const { data: currentStock } = await supabase
          .from("WarehouseStock")
          .select("currentStockLevel")
          .eq("warehouseId", warehouseId)
          .eq("variantId", itemVarId)
          .maybeSingle();

        const oldStock = currentStock ? currentStock.currentStockLevel : 0;
        const delta = itemNewStock - oldStock;

        // Upsert WarehouseStock level
        await supabase
          .from("WarehouseStock")
          .upsert({
            warehouseId,
            variantId: itemVarId,
            currentStockLevel: itemNewStock,
            updatedAt: new Date().toISOString()
          }, {
            onConflict: "warehouseId,variantId"
          });

        // Log StockMovement
        if (delta !== 0) {
          const movementType = delta > 0 ? "INWARD" : "OUTWARD";
          await supabase
            .from("StockMovement")
            .insert({
              companyId,
              variantId: itemVarId,
              warehouseId,
              type: movementType,
              quantity: Math.abs(delta),
              operatorEmail: operatorEmail || "system@seyon.local",
              syncStatus: "SUCCESS"
            });
        }

        // Update cached aggregated stock level on ProductVariant table
        const { data: allWarehouseStocks } = await supabase
          .from("WarehouseStock")
          .select("currentStockLevel")
          .eq("variantId", itemVarId);

        const totalAggregatedStock = (allWarehouseStocks || []).reduce((sum: number, sItem: any) => sum + sItem.currentStockLevel, 0);

        await supabase
          .from("ProductVariant")
          .update({
            currentStockLevel: totalAggregatedStock,
            updatedAt: new Date().toISOString()
          })
          .eq("id", itemVarId);
      }

      return NextResponse.json({ success: true });
    }

    // 2. Fallback: Handle single item update (backward compatibility)
    if (!warehouseId || !variantId || typeof newStockLevel !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: currentStock, error: fetchErr } = await supabase
      .from("WarehouseStock")
      .select("currentStockLevel")
      .eq("warehouseId", warehouseId)
      .eq("variantId", variantId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    const oldStock = currentStock ? currentStock.currentStockLevel : 0;
    const delta = newStockLevel - oldStock;

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

    if (delta !== 0) {
      const movementType = delta > 0 ? "INWARD" : "OUTWARD";
      const { error: moveErr } = await supabase
        .from("StockMovement")
        .insert({
          companyId,
          variantId,
          warehouseId,
          type: movementType,
          quantity: Math.abs(delta),
          operatorEmail: operatorEmail || "system@seyon.local",
          syncStatus: "SUCCESS"
        });

      if (moveErr) console.error("Logged movement error:", moveErr);
    }

    const { data: allWarehouseStocks, error: allStocksErr } = await supabase
      .from("WarehouseStock")
      .select("currentStockLevel")
      .eq("variantId", variantId);

    if (allStocksErr) throw allStocksErr;

    const totalAggregatedStock = (allWarehouseStocks || []).reduce((sum: number, item: any) => sum + item.currentStockLevel, 0);

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
