import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCodeString, warehouseId, operatorEmail } = body;

    if (!qrCodeString || !warehouseId || !operatorEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Validate structured QR format
    const parts = qrCodeString.split(":");
    if (parts.length !== 4) {
      return NextResponse.json({ 
        error: "Invalid QR code format. Expected format: [company]:[warehouse]:[sku]:[serial]" 
      }, { status: 400 });
    }

    const [qrCompanyCode, qrWarehouseCode, qrSku, qrSerial] = parts;

    // Validate Company code matches (flexible comparison case-insensitive)
    if (qrCompanyCode.toLowerCase() !== "seyon" && qrCompanyCode.toLowerCase() !== "vtex") {
      return NextResponse.json({ error: "QR code belongs to another tenant/company." }, { status: 400 });
    }

    // 1. Find the serialized unit
    const { data: unit, error: fetchErr } = await supabase
      .from("SerializedUnit")
      .select("id, companyId, variantId, warehouseId, status")
      .eq("qrCodeString", qrCodeString)
      .eq("companyId", companyId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!unit) {
      return NextResponse.json({ error: "Serialized unit not found with the scanned QR code." }, { status: 404 });
    }

    if (unit.status === "DISPATCHED") {
      return NextResponse.json({ error: "Unit has already been checked out (DISPATCHED)." }, { status: 400 });
    }

    if (unit.warehouseId !== warehouseId) {
      return NextResponse.json({ 
        error: `Unit is currently recorded at another warehouse location. Please check it in first.` 
      }, { status: 400 });
    }

    // 2. Checkout the unit
    const { data: updatedUnit, error: updateErr } = await supabase
      .from("SerializedUnit")
      .update({
        status: "DISPATCHED",
        checkOutDate: new Date().toISOString(),
        lastOperator: operatorEmail,
        updatedAt: new Date().toISOString()
      })
      .eq("id", unit.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Decrement stock levels
    await adjustStockCounts(unit.variantId, warehouseId, "AVAILABLE", "DISPATCHED");

    // 4. Log Stock Movement
    await logStockMovement(companyId, unit.variantId, warehouseId, "OUTWARD", 1, operatorEmail);

    return NextResponse.json({ 
      success: true, 
      message: "Unit checked out (dispatched) successfully.", 
      unit: updatedUnit 
    });
  } catch (error: any) {
    console.error("Checkout Serialized Unit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper: Adjust physical stock levels dynamically
async function adjustStockCounts(
  variantId: string, 
  warehouseId: string, 
  oldStatus: string,
  newStatus: string
) {
  // Decrement old warehouse stock (if old state was AVAILABLE)
  if (oldStatus === "AVAILABLE") {
    const { data: whStock } = await supabase
      .from("WarehouseStock")
      .select("id, currentStockLevel")
      .eq("warehouseId", warehouseId)
      .eq("variantId", variantId)
      .maybeSingle();

    if (whStock) {
      await supabase
        .from("WarehouseStock")
        .update({ currentStockLevel: Math.max(0, whStock.currentStockLevel - 1) })
        .eq("id", whStock.id);
    }
  }

  // Recalculate global ProductVariant stock level
  const { data: allStocks } = await supabase
    .from("WarehouseStock")
    .select("currentStockLevel")
    .eq("variantId", variantId);

  const totalStock = (allStocks || []).reduce((sum, s) => sum + s.currentStockLevel, 0);

  await supabase
    .from("ProductVariant")
    .update({ currentStockLevel: totalStock })
    .eq("id", variantId);
}

// Helper: Log Stock Movement history
async function logStockMovement(
  companyId: string,
  variantId: string,
  warehouseId: string,
  type: "INWARD" | "OUTWARD",
  quantity: number,
  operatorEmail: string
) {
  await supabase
    .from("StockMovement")
    .insert({
      companyId,
      variantId,
      warehouseId,
      type,
      quantity,
      operatorEmail,
      syncStatus: "SUCCESS"
    });
}
