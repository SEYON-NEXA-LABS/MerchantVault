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

    const { data: transfers, error: tfErr } = await supabase
      .from("StockTransfer")
      .select(`
        id,
        fromWarehouseId,
        toWarehouseId,
        variantId,
        quantity,
        status,
        operatorEmail,
        createdAt,
        updatedAt,
        variant:ProductVariant(sku, title, size, color),
        fromWarehouse:Warehouse!StockTransfer_fromWarehouseId_fkey(name, code),
        toWarehouse:Warehouse!StockTransfer_toWarehouseId_fkey(name, code)
      `)
      .eq("companyId", company.id)
      .order("createdAt", { ascending: false });

    if (tfErr) throw tfErr;

    return NextResponse.json(transfers || []);
  } catch (error: any) {
    console.error("Fetch Transfers Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, fromWarehouseId, toWarehouseId, variantId, quantity, status, operatorEmail } = body;

    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "vtex")
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 1. Create a new Stock Transfer request
    if (!id) {
      if (!fromWarehouseId || !toWarehouseId || !variantId || !quantity) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { data: transfer, error } = await supabase
        .from("StockTransfer")
        .insert({
          companyId: company.id,
          fromWarehouseId,
          toWarehouseId,
          variantId,
          quantity,
          status: "PENDING",
          operatorEmail: operatorEmail || "dispatcher@vtex.local"
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(transfer);
    }

    // 2. Update status of an existing transfer
    const { data: existingTransfer, error: fetchErr } = await supabase
      .from("StockTransfer")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existingTransfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    if (existingTransfer.status === "COMPLETED" || existingTransfer.status === "CANCELLED") {
      return NextResponse.json({ error: "Transfer is already finalized" }, { status: 400 });
    }

    // Process Stock changes if status becomes COMPLETED
    if (status === "COMPLETED") {
      // A. Decrement from source warehouse
      const { data: fromStock } = await supabase
        .from("WarehouseStock")
        .select("currentStockLevel")
        .eq("warehouseId", existingTransfer.fromWarehouseId)
        .eq("variantId", existingTransfer.variantId)
        .maybeSingle();

      const newFromStock = Math.max(0, (fromStock ? fromStock.currentStockLevel : 0) - existingTransfer.quantity);

      await supabase
        .from("WarehouseStock")
        .upsert({
          warehouseId: existingTransfer.fromWarehouseId,
          variantId: existingTransfer.variantId,
          currentStockLevel: newFromStock,
          updatedAt: new Date().toISOString()
        }, {
          onConflict: "warehouseId,variantId"
        });

      // B. Increment at destination warehouse
      const { data: toStock } = await supabase
        .from("WarehouseStock")
        .select("currentStockLevel")
        .eq("warehouseId", existingTransfer.toWarehouseId)
        .eq("variantId", existingTransfer.variantId)
        .maybeSingle();

      const newToStock = (toStock ? toStock.currentStockLevel : 0) + existingTransfer.quantity;

      await supabase
        .from("WarehouseStock")
        .upsert({
          warehouseId: existingTransfer.toWarehouseId,
          variantId: existingTransfer.variantId,
          currentStockLevel: newToStock,
          updatedAt: new Date().toISOString()
        }, {
          onConflict: "warehouseId,variantId"
        });

      // C. Record movement logs
      await supabase
        .from("StockMovement")
        .insert([
          {
            companyId: company.id,
            variantId: existingTransfer.variantId,
            warehouseId: existingTransfer.fromWarehouseId,
            type: "OUTWARD",
            quantity: existingTransfer.quantity,
            operatorEmail: operatorEmail || "system@vtex.local",
            syncStatus: "SUCCESS"
          },
          {
            companyId: company.id,
            variantId: existingTransfer.variantId,
            warehouseId: existingTransfer.toWarehouseId,
            type: "INWARD",
            quantity: existingTransfer.quantity,
            operatorEmail: operatorEmail || "system@vtex.local",
            syncStatus: "SUCCESS"
          }
        ]);
    }

    // D. Update Status
    const { data: updatedTransfer, error: updateErr } = await supabase
      .from("StockTransfer")
      .update({
        status,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json(updatedTransfer);
  } catch (error: any) {
    console.error("Update Transfer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
