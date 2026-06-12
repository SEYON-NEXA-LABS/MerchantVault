import { NextResponse } from "next/server";
import { supabase } from "@repo/db";

export async function GET() {
  try {
    if (!supabase) {
      console.warn("Supabase client not initialized in storefront");
      return NextResponse.json({ products: [], company: null });
    }

    const { data: company } = await supabase
      .from("Company")
      .select("id, name, code, shopifyStoreUrl, shopifyAccessToken")
      .eq("code", "syn")
      .maybeSingle();

    const { data: products, error } = await supabase
      .from("ProductVariant")
      .select("id, sku, title, size, color, price, currentStockLevel, category, safetyStockLimit, thumbnailConfig")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({
      products: products || [],
      company: company || null
    });
  } catch (error: any) {
    console.error("Fetch Storefront Products Error:", error);
    return NextResponse.json({ products: [], company: null }, { status: 500 });
  }
}
