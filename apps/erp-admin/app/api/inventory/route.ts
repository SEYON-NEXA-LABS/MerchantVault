import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Fetch product variants with nested warehouse stock levels
    const { data: variants, error: varErr } = await supabase
      .from("ProductVariant")
      .select(`
        id,
        companyId,
        shopifyVariantId,
        sku,
        title,
        size,
        color,
        barcodeString,
        safetyStockLimit,
        currentStockLevel,
        velocity,
        leadTimeDays,
        averageDailySales,
        thumbnailConfig,
        price,
        category,
        targetGroup,
        ageRange,
        createdAt,
        updatedAt,
        stocks:WarehouseStock(
          id,
          warehouseId,
          currentStockLevel
        )
      `)
      .eq("companyId", companyId)
      .order("title", { ascending: true });

    if (varErr) throw varErr;

    return NextResponse.json(variants || []);
  } catch (error: any) {
    console.error("Fetch Inventory Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const body = await req.json();
    const { variantId, price } = body;

    if (!variantId || price === undefined) {
      return NextResponse.json({ error: "Missing variantId or price" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ProductVariant")
      .update({ price: parseFloat(price) })
      .eq("id", variantId)
      .eq("companyId", companyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, variant: data });
  } catch (error: any) {
    console.error("Update Variant Price Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

