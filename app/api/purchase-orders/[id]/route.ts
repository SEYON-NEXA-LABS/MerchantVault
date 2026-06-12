import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data: po, error } = await supabase
      .from("PurchaseOrder")
      .select(`
        id,
        companyId,
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

    if (po.companyId !== companyId) {
      return NextResponse.json({ error: "Unauthorized access to this Purchase Order" }, { status: 401 });
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
    
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Verify PO belongs to company first
    const { data: poCheck, error: checkErr } = await supabase
      .from("PurchaseOrder")
      .select("companyId")
      .eq("id", id)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (!poCheck) {
      return NextResponse.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    if (poCheck.companyId !== companyId) {
      return NextResponse.json({ error: "Unauthorized access to this Purchase Order" }, { status: 401 });
    }

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
