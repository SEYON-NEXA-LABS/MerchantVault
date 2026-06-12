import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");

    if (!warehouseId) {
      return NextResponse.json({ error: "Warehouse ID is required" }, { status: 400 });
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data: audits, error: auditErr } = await supabase
      .from("InventoryAudit")
      .select(`
        *,
        items:InventoryAuditItem(
          id,
          expectedQty,
          actualQty,
          status,
          variant:ProductVariant(id, sku, title, size, color, barcodeString)
        )
      `)
      .eq("companyId", companyId)
      .eq("warehouseId", warehouseId)
      .order("createdAt", { ascending: false });

    if (auditErr) throw auditErr;

    return NextResponse.json(audits || []);
  } catch (error: any) {
    console.error("Fetch Audits Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouseId, operatorEmail, selectedVariantIds } = body;

    if (!warehouseId || !operatorEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // 1. Create the parent InventoryAudit record
    const { data: audit, error: auditErr } = await supabase
      .from("InventoryAudit")
      .insert({
        companyId: companyId,
        warehouseId,
        operatorEmail,
        status: "IN_PROGRESS"
      })
      .select()
      .single();

    if (auditErr) throw auditErr;

    // 2. Fetch the current stock levels for the items to include
    let stockQuery = supabase
      .from("WarehouseStock")
      .select("variantId, currentStockLevel")
      .eq("warehouseId", warehouseId);

    if (Array.isArray(selectedVariantIds) && selectedVariantIds.length > 0) {
      stockQuery = stockQuery.in("variantId", selectedVariantIds);
    }

    const { data: stocks, error: stockErr } = await stockQuery;
    if (stockErr) throw stockErr;

    // If we're doing a selective audit but some items don't have stock records yet, 
    // fetch their variant IDs to populate them with 0 expected stock.
    let finalItems = (stocks || []).map((s: any) => ({
      auditId: audit.id,
      variantId: s.variantId,
      expectedQty: s.currentStockLevel,
      actualQty: 0,
      status: "PENDING"
    }));

    if (Array.isArray(selectedVariantIds) && selectedVariantIds.length > 0) {
      const missingVariantIds = selectedVariantIds.filter((vid: any) => !finalItems.some((item: any) => item.variantId === vid));
      for (const vid of missingVariantIds) {
        finalItems.push({
          auditId: audit.id,
          variantId: vid,
          expectedQty: 0,
          actualQty: 0,
          status: "PENDING"
        });
      }
    }

    // 3. Insert the audit items in bulk
    if (finalItems.length > 0) {
      const { error: insertErr } = await supabase
        .from("InventoryAuditItem")
        .insert(finalItems);

      if (insertErr) throw insertErr;
    }

    // Return the created audit session
    return NextResponse.json(audit);
  } catch (error: any) {
    console.error("Create Audit Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
