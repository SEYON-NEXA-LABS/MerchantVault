import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "vtex")
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("ShippingManifest")
      .select(`
        id,
        manifestNumber,
        courierPartner,
        status,
        driverName,
        driverPhone,
        createdAt,
        warehouseId,
        warehouse:Warehouse(id, name, code),
        fulfillments:OrderFulfillment(id, orderNumber, customerName, customerPhone, deliveryStatus, awbNumber)
      `)
      .eq("companyId", company.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Fetch Manifests Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { manifestNumber, courierPartner, warehouseId, driverName, driverPhone, orderIds } = body;

    if (!manifestNumber || !courierPartner || !warehouseId || !orderIds || orderIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields or order list" }, { status: 400 });
    }

    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "vtex")
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 1. Create manifest
    const { data: manifest, error: manifestErr } = await supabase
      .from("ShippingManifest")
      .insert({
        companyId: company.id,
        manifestNumber,
        courierPartner,
        warehouseId,
        driverName,
        driverPhone,
        status: "CREATED"
      })
      .select()
      .single();

    if (manifestErr) throw manifestErr;

    // 2. Link fulfillments to this manifest and update status to SHIPPED
    for (const orderId of orderIds) {
      const { error: updateOrderErr } = await supabase
        .from("OrderFulfillment")
        .update({ 
          manifestId: manifest.id,
          deliveryStatus: "SHIPPED"
        })
        .eq("id", orderId);

      if (updateOrderErr) throw updateOrderErr;
    }

    return NextResponse.json({ success: true, id: manifest.id });
  } catch (error: any) {
    console.error("Create Manifest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
