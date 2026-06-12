import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const body = await req.json();
    const { items, operatorEmail } = body; // Array of { variantId, quantityToReceive }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items specified to receive" }, { status: 400 });
    }

    // 1. Fetch Purchase Order details
    const { data: po, error: poErr } = await supabase
      .from("PurchaseOrder")
      .select("id, companyId, warehouseId, status")
      .eq("id", id)
      .maybeSingle();

    if (poErr) throw poErr;
    if (!po) {
      return NextResponse.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    if (po.companyId !== companyId) {
      return NextResponse.json({ error: "Unauthorized access to this Purchase Order" }, { status: 401 });
    }

    const { warehouseId } = po;

    // 2. Fetch current PO items to compare quantities
    const { data: poItems, error: itemsErr } = await supabase
      .from("PurchaseOrderItem")
      .select("id, variantId, quantityOrdered, quantityReceived")
      .eq("purchaseOrderId", id);

    if (itemsErr) throw itemsErr;

    // Process each item to receive
    for (const item of items) {
      const { variantId, quantityToReceive } = item;
      if (quantityToReceive <= 0) continue;

      const matchedPOItem = poItems.find((pi: any) => pi.variantId === variantId);
      if (!matchedPOItem) continue;

      const newQtyReceived = matchedPOItem.quantityReceived + quantityToReceive;

      // Update PO item received quantity
      const { error: updatePOItemErr } = await supabase
        .from("PurchaseOrderItem")
        .update({ quantityReceived: newQtyReceived })
        .eq("id", matchedPOItem.id);

      if (updatePOItemErr) throw updatePOItemErr;

      // Update Warehouse Stock Level
      const { data: stock, error: stockErr } = await supabase
        .from("WarehouseStock")
        .select("id, currentStockLevel")
        .eq("warehouseId", warehouseId)
        .eq("variantId", variantId)
        .maybeSingle();

      if (stockErr) throw stockErr;

      if (stock) {
        const { error: updateStockErr } = await supabase
          .from("WarehouseStock")
          .update({ currentStockLevel: stock.currentStockLevel + quantityToReceive })
          .eq("id", stock.id);

        if (updateStockErr) throw updateStockErr;
      } else {
        const { error: insertStockErr } = await supabase
          .from("WarehouseStock")
          .insert({
            warehouseId,
            variantId,
            currentStockLevel: quantityToReceive,
          });

        if (insertStockErr) throw insertStockErr;
      }

      // Update Product Variant Aggregate Stock Level
      const { data: allStocks } = await supabase
        .from("WarehouseStock")
        .select("currentStockLevel")
        .eq("variantId", variantId);

      const totalStock = (allStocks || []).reduce((sum: number, s: any) => sum + (s.currentStockLevel || 0), 0);

      const { error: updateVarErr } = await supabase
        .from("ProductVariant")
        .update({ currentStockLevel: totalStock })
        .eq("id", variantId);

      if (updateVarErr) throw updateVarErr;

      // Create Stock Movement record (audit trail)
      const { error: movementErr } = await supabase
        .from("StockMovement")
        .insert({
          companyId,
          variantId,
          warehouseId,
          type: "INWARD",
          quantity: quantityToReceive,
          operatorEmail: operatorEmail || "system@seyon.local",
          syncStatus: "SUCCESS",
        });

      if (movementErr) throw movementErr;
    }

    // 3. Re-evaluate PO status
    const { data: updatedPOItems, error: itemsReFetchErr } = await supabase
      .from("PurchaseOrderItem")
      .select("quantityOrdered, quantityReceived")
      .eq("purchaseOrderId", id);

    if (itemsReFetchErr) throw itemsReFetchErr;

    let allCompleted = true;
    let anyReceived = false;

    for (const pi of updatedPOItems) {
      if (pi.quantityReceived < pi.quantityOrdered) {
        allCompleted = false;
      }
      if (pi.quantityReceived > 0) {
        anyReceived = true;
      }
    }

    let newStatus = po.status;
    if (allCompleted) {
      newStatus = "COMPLETED";
    } else if (anyReceived) {
      newStatus = "PARTIALLY_RECEIVED";
    }

    if (newStatus !== po.status) {
      const { error: statusUpdateErr } = await supabase
        .from("PurchaseOrder")
        .update({ status: newStatus })
        .eq("id", id);

      if (statusUpdateErr) throw statusUpdateErr;
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error("Receive PO Items Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
