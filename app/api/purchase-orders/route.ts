import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const warehouseId = searchParams.get("warehouseId");

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    let query = supabase
      .from("PurchaseOrder")
      .select(`
        id,
        poNumber,
        vendorId,
        vendorName,
        vendorEmail,
        status,
        warehouseId,
        createdAt,
        updatedAt,
        warehouse:Warehouse(id, name, code),
        vendor:Vendor(id, name, email, phone),
        items:PurchaseOrderItem(
          id,
          variantId,
          quantityOrdered,
          quantityReceived,
          costPrice,
          variant:ProductVariant(id, sku, title, size, color)
        )
      `)
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }
    if (warehouseId && warehouseId !== "ALL") {
      query = query.eq("warehouseId", warehouseId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Fetch Purchase Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { poNumber, vendorId, vendorName, vendorEmail, status, warehouseId, items } = body;

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Insert purchase order
    const { data: po, error: poErr } = await supabase
      .from("PurchaseOrder")
      .insert({
        companyId: companyId,
        poNumber,
        vendorId: vendorId || null,
        vendorName,
        vendorEmail,
        status: status || "DRAFT",
        warehouseId,
      })
      .select()
      .single();

    if (poErr) throw poErr;

    // Insert items
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        purchaseOrderId: po.id,
        variantId: item.variantId,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: 0,
        costPrice: item.costPrice || 0,
      }));

      const { error: itemsErr } = await supabase
        .from("PurchaseOrderItem")
        .insert(itemsToInsert);

      if (itemsErr) throw itemsErr;
    }

    return NextResponse.json({ success: true, id: po.id });
  } catch (error: any) {
    console.error("Create Purchase Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
