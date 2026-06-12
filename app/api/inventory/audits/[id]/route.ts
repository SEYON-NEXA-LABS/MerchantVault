import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params;

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // 1. Fetch the parent audit and its items
    const { data: audit, error: auditErr } = await supabase
      .from("InventoryAudit")
      .select(`
        *,
        items:InventoryAuditItem(
          id,
          variantId,
          expectedQty,
          actualQty,
          status,
          variant:ProductVariant(id, sku, title, size, color, barcodeString, safetyStockLimit, leadTimeDays)
        )
      `)
      .eq("id", auditId)
      .maybeSingle();

    if (auditErr || !audit) {
      return NextResponse.json({ error: "Audit session not found" }, { status: 404 });
    }

    if (audit.companyId !== companyId) {
      return NextResponse.json({ error: "Unauthorized access to this Audit session" }, { status: 401 });
    }

    const warehouseId = audit.warehouseId;

    // 2. Fetch Stock Transfers to calculate In-Transit stock
    const { data: transfers, error: transferErr } = await supabase
      .from("StockTransfer")
      .select("variantId, quantity, status, fromWarehouseId, toWarehouseId")
      .in("status", ["PENDING", "SENT"]);

    if (transferErr) throw transferErr;

    // 3. Fetch Purchase Orders to calculate Incoming PO stock
    const { data: poItems, error: poErr } = await supabase
      .from("PurchaseOrderItem")
      .select(`
        variantId,
        quantityOrdered,
        quantityReceived,
        purchaseOrder:PurchaseOrder(status, warehouseId)
      `);

    if (poErr) throw poErr;

    // 4. Enrich audit items with calculated context
    const enrichedItems = (audit.items || []).map((item: any) => {
      const vid = item.variantId;

      // In-Transit: sum of pending outgoing or incoming transfers for this warehouse
      const inTransit = (transfers || [])
        .filter((t: any) => t.variantId === vid && (t.fromWarehouseId === warehouseId || t.toWarehouseId === warehouseId))
        .reduce((sum: number, t: any) => sum + t.quantity, 0);

      // Incoming PO: sum of items ordered but not received for this warehouse
      const incomingPO = (poItems || [])
        .filter((poi: any) => 
          poi.variantId === vid && 
          poi.purchaseOrder?.warehouseId === warehouseId &&
          ["SENT", "PARTIALLY_RECEIVED"].includes(poi.purchaseOrder?.status)
        )
        .reduce((sum: number, poi: any) => sum + Math.max(0, poi.quantityOrdered - poi.quantityReceived), 0);

      // Ready to dispatch (Allocated) and Returned (RTO) are derived deterministically 
      // from the variant ID to keep them stable and consistent for demo purposes.
      const seed = vid.charCodeAt(0) + vid.charCodeAt(vid.length - 1);
      const readyToDispatch = (seed % 5); 
      const returnedQty = (seed % 3 === 0) ? (seed % 2) + 1 : 0;

      return {
        ...item,
        readyToDispatch,
        returnedQty,
        inTransit,
        incomingPO
      };
    });

    return NextResponse.json({
      ...audit,
      items: enrichedItems
    });
  } catch (error: any) {
    console.error("Fetch Audit Details Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params;

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data: auditCheck, error: checkErr } = await supabase
      .from("InventoryAudit")
      .select("companyId")
      .eq("id", auditId)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (!auditCheck) {
      return NextResponse.json({ error: "Audit session not found" }, { status: 404 });
    }

    if (auditCheck.companyId !== companyId) {
      return NextResponse.json({ error: "Unauthorized access to this Audit session" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body; // Array of { id: string, actualQty: number }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Update each item
    for (const item of items) {
      // First fetch the expected quantity to compute correct status
      const { data: currentItem, error: getErr } = await supabase
        .from("InventoryAuditItem")
        .select("expectedQty")
        .eq("id", item.id)
        .single();

      if (getErr || !currentItem) continue;

      const expected = currentItem.expectedQty;
      const actual = item.actualQty;
      const status = actual === expected ? "MATCHED" : "DISCREPANCY";

      const { error: updateErr } = await supabase
        .from("InventoryAuditItem")
        .update({
          actualQty: actual,
          status,
          updatedAt: new Date().toISOString()
        })
        .eq("id", item.id);

      if (updateErr) throw updateErr;
    }

    // Touch parent updated timestamp
    await supabase
      .from("InventoryAudit")
      .update({ updatedAt: new Date().toISOString() })
      .eq("id", auditId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Audit Items Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params;
    const body = await request.json();
    const { status } = body; // "COMPLETED" or "CANCELLED"

    if (!["COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // 1. Fetch parent audit details
    const { data: audit, error: auditErr } = await supabase
      .from("InventoryAudit")
      .select("*")
      .eq("id", auditId)
      .single();

    if (auditErr || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (audit.companyId !== companyId) {
      return NextResponse.json({ error: "Unauthorized access to this Audit session" }, { status: 401 });
    }

    if (audit.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Audit is already finalized" }, { status: 400 });
    }

    if (status === "CANCELLED") {
      const { error: cancelErr } = await supabase
        .from("InventoryAudit")
        .update({
          status: "CANCELLED",
          updatedAt: new Date().toISOString()
        })
        .eq("id", auditId);

      if (cancelErr) throw cancelErr;
      return NextResponse.json({ success: true, message: "Audit cancelled successfully" });
    }

    // 2. Fetch all audit items to process reconciliation
    const { data: items, error: itemsErr } = await supabase
      .from("InventoryAuditItem")
      .select("*")
      .eq("auditId", auditId);

    if (itemsErr) throw itemsErr;

    // 3. Complete reconciliation & adjust stocks
    for (const item of items) {
      const diff = item.actualQty - item.expectedQty;

      // Adjust WarehouseStock
      const { data: existingStock, error: stockFetchErr } = await supabase
        .from("WarehouseStock")
        .select("id")
        .eq("warehouseId", audit.warehouseId)
        .eq("variantId", item.variantId)
        .maybeSingle();

      if (stockFetchErr) throw stockFetchErr;

      if (existingStock) {
        const { error: stockUpdateErr } = await supabase
          .from("WarehouseStock")
          .update({
            currentStockLevel: item.actualQty,
            updatedAt: new Date().toISOString()
          })
          .eq("id", existingStock.id);

        if (stockUpdateErr) throw stockUpdateErr;
      } else {
        const { error: stockInsertErr } = await supabase
          .from("WarehouseStock")
          .insert({
            warehouseId: audit.warehouseId,
            variantId: item.variantId,
            currentStockLevel: item.actualQty
          });

        if (stockInsertErr) throw stockInsertErr;
      }

      // Recalculate global ProductVariant stock level (sum of stocks in all warehouses)
      const { data: allStocks, error: allStocksErr } = await supabase
        .from("WarehouseStock")
        .select("currentStockLevel")
        .eq("variantId", item.variantId);

      if (allStocksErr) throw allStocksErr;

      const globalStockLevel = (allStocks || []).reduce((sum: number, s: any) => sum + s.currentStockLevel, 0);

      const { error: variantUpdateErr } = await supabase
        .from("ProductVariant")
        .update({
          currentStockLevel: globalStockLevel,
          updatedAt: new Date().toISOString()
        })
        .eq("id", item.variantId);

      if (variantUpdateErr) throw variantUpdateErr;

      // If discrepancy exists, log a StockMovement of type ADJUSTMENT
      if (diff !== 0) {
        const { error: movementErr } = await supabase
          .from("StockMovement")
          .insert({
            companyId: audit.companyId,
            warehouseId: audit.warehouseId,
            variantId: item.variantId,
            type: "ADJUSTMENT",
            quantity: diff,
            operatorEmail: audit.operatorEmail,
            syncStatus: "SUCCESS"
          });

        if (movementErr) throw movementErr;
      }
    }

    // 4. Update the parent audit status to COMPLETED
    const { error: finalUpdateErr } = await supabase
      .from("InventoryAudit")
      .update({
        status: "COMPLETED",
        updatedAt: new Date().toISOString()
      })
      .eq("id", auditId);

    if (finalUpdateErr) throw finalUpdateErr;

    return NextResponse.json({ success: true, message: "Audit submitted and stocks reconciled" });
  } catch (error: any) {
    console.error("Submit Audit Reconciliation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
