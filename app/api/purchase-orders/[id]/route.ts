import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: po, error } = await supabase
      .from("PurchaseOrder")
      .select(`
        id,
        poNumber,
        vendorName,
        vendorEmail,
        status,
        warehouseId,
        createdAt,
        updatedAt,
        warehouse:Warehouse(id, name, code),
        items:PurchaseOrderItem(
          id,
          variantId,
          quantityOrdered,
          quantityReceived,
          costPrice,
          variant:ProductVariant(id, sku, title, size, color)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!po) {
      return NextResponse.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    return NextResponse.json(po);
  } catch (error: any) {
    console.error("Get Purchase Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, vendorName, vendorEmail, warehouseId } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (vendorName) updateData.vendorName = vendorName;
    if (vendorEmail) updateData.vendorEmail = vendorEmail;
    if (warehouseId) updateData.warehouseId = warehouseId;

    const { data: po, error } = await supabase
      .from("PurchaseOrder")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(po);
  } catch (error: any) {
    console.error("Update Purchase Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
