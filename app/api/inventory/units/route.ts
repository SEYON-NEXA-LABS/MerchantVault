import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");

    if (!warehouseId) {
      return NextResponse.json({ error: "Warehouse ID is required" }, { status: 400 });
    }

    const { companyId } = await getContextSession();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data: units, error: unitErr } = await supabase
      .from("SerializedUnit")
      .select(`
        id,
        companyId,
        variantId,
        warehouseId,
        qrCodeString,
        status,
        checkInDate,
        lastOperator,
        createdAt,
        updatedAt,
        variant:ProductVariant(id, sku, title, size, color, barcodeString, price)
      `)
      .eq("companyId", companyId)
      .eq("warehouseId", warehouseId)
      .order("updatedAt", { ascending: false });

    if (unitErr) throw unitErr;

    return NextResponse.json(units || []);
  } catch (error: any) {
    console.error("Fetch Serialized Units Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCodeString, warehouseId, variantId, operatorEmail } = body;

    if (!qrCodeString || !warehouseId || !operatorEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { companyId, companyCode } = await getContextSession();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const activeCompanyCode = companyCode || "syn";

    // 1. Validate structured QR format
    const parts = qrCodeString.split(":");
    if (parts.length !== 4) {
      return NextResponse.json({ 
        error: "Invalid QR code format. Expected format: [company]:[warehouse]:[sku]:[serial]" 
      }, { status: 400 });
    }

    const [qrCompanyCode, qrWarehouseCode, qrSku, qrSerial] = parts;

    // Validate Company code matches dynamically from session context
    if (!activeCompanyCode || qrCompanyCode.toLowerCase() !== activeCompanyCode.toLowerCase()) {
      return NextResponse.json({ error: "QR code belongs to another tenant/company." }, { status: 400 });
    }

    // Lookup variant dynamically from SKU in QR code if variantId not passed in body
    let targetVariantId = variantId;
    if (!targetVariantId) {
      const { data: dbVariant, error: varErr } = await supabase
        .from("ProductVariant")
        .select("id")
        .eq("companyId", companyId)
        .eq("sku", qrSku)
        .maybeSingle();

      if (varErr || !dbVariant) {
        return NextResponse.json({ error: `Product variant with SKU "${qrSku}" not found in system.` }, { status: 400 });
      }
      targetVariantId = dbVariant.id;
    }

    // 2. Check if this QR code already exists in the system
    const { data: existingUnit, error: fetchErr } = await supabase
      .from("SerializedUnit")
      .select("id, companyId, variantId, warehouseId, qrCodeString, status, checkInDate, lastOperator, createdAt, updatedAt")
      .eq("qrCodeString", qrCodeString)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    let oldWarehouseId = null;
    let oldStatus = null;

    if (existingUnit) {
      targetVariantId = existingUnit.variantId;
      oldWarehouseId = existingUnit.warehouseId;
      oldStatus = existingUnit.status;

      if (existingUnit.status === "AVAILABLE" && existingUnit.warehouseId === warehouseId) {
        return NextResponse.json({ 
          success: true, 
          message: "Unit is already available in this warehouse.", 
          unit: existingUnit 
        });
      }

      // Check-in existing unit
      const { data: updatedUnit, error: updateErr } = await supabase
        .from("SerializedUnit")
        .update({
          status: "AVAILABLE",
          warehouseId,
          checkInDate: new Date().toISOString(),
          lastOperator: operatorEmail,
          updatedAt: new Date().toISOString()
        })
        .eq("id", existingUnit.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Handle stock counts changes
      await adjustStockCounts(targetVariantId, warehouseId, oldWarehouseId, oldStatus, "AVAILABLE");

      // Log Stock Movement
      await logStockMovement(companyId, targetVariantId, warehouseId, "INWARD", 1, operatorEmail);

      return NextResponse.json({ 
        success: true, 
        message: "Unit checked in successfully.", 
        unit: updatedUnit 
      });
    } else {
      // Create new unit. Must specify variantId
      if (!targetVariantId) {
        return NextResponse.json({ error: "Variant ID is required for registering new QR codes." }, { status: 400 });
      }

      const { data: newUnit, error: createErr } = await supabase
        .from("SerializedUnit")
        .insert({
          companyId,
          variantId: targetVariantId,
          warehouseId,
          qrCodeString,
          status: "AVAILABLE",
          lastOperator: operatorEmail
        })
        .select()
        .single();

      if (createErr) throw createErr;

      // Handle stock counts changes
      await adjustStockCounts(targetVariantId, warehouseId, null, null, "AVAILABLE");

      // Log Stock Movement
      await logStockMovement(companyId, targetVariantId, warehouseId, "INWARD", 1, operatorEmail);

      return NextResponse.json({ 
        success: true, 
        message: "New unit registered and checked in successfully.", 
        unit: newUnit 
      });
    }
  } catch (error: any) {
    console.error("Checkin Serialized Unit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper: Adjust physical stock levels dynamically
async function adjustStockCounts(
  variantId: string, 
  newWarehouseId: string, 
  oldWarehouseId: string | null, 
  oldStatus: string | null,
  newStatus: string
) {
  // 1. Increment target warehouse stock (if changing to AVAILABLE)
  if (newStatus === "AVAILABLE") {
    const { data: newWhStock } = await supabase
      .from("WarehouseStock")
      .select("id, currentStockLevel")
      .eq("warehouseId", newWarehouseId)
      .eq("variantId", variantId)
      .maybeSingle();

    if (newWhStock) {
      await supabase
        .from("WarehouseStock")
        .update({ currentStockLevel: newWhStock.currentStockLevel + 1 })
        .eq("id", newWhStock.id);
    } else {
      await supabase
        .from("WarehouseStock")
        .insert({ warehouseId: newWarehouseId, variantId, currentStockLevel: 1 });
    }
  }

  // 2. Decrement old warehouse stock (if old state was AVAILABLE)
  if (oldStatus === "AVAILABLE" && oldWarehouseId) {
    const { data: oldWhStock } = await supabase
      .from("WarehouseStock")
      .select("id, currentStockLevel")
      .eq("warehouseId", oldWarehouseId)
      .eq("variantId", variantId)
      .maybeSingle();

    if (oldWhStock) {
      await supabase
        .from("WarehouseStock")
        .update({ currentStockLevel: Math.max(0, oldWhStock.currentStockLevel - 1) })
        .eq("id", oldWhStock.id);
    }
  }

  // 3. Recalculate global ProductVariant stock level
  const { data: allStocks } = await supabase
    .from("WarehouseStock")
    .select("currentStockLevel")
    .eq("variantId", variantId);

  const totalStock = (allStocks || []).reduce((sum: number, s: any) => sum + s.currentStockLevel, 0);

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
