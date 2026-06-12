import { NextResponse } from "next/server";
import { supabase } from "@repo/db";

export async function GET(request: Request) {
  try {
    if (!supabase) {
      console.warn("Supabase client not initialized in storefront");
      return NextResponse.json({ products: [], company: null });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    let companyQuery = supabase
      .from("Company")
      .select("id, name, code, shopifyStoreUrl, shopifyAccessToken");

    if (companyId) {
      companyQuery = companyQuery.eq("id", companyId);
    } else {
      companyQuery = companyQuery.eq("code", "syn");
    }

    const { data: company } = await companyQuery.maybeSingle();

    let productsQuery = supabase
      .from("ProductVariant")
      .select("id, sku, title, size, color, price, currentStockLevel, category, safetyStockLimit, thumbnailConfig");

    if (company && company.id) {
      productsQuery = productsQuery.eq("companyId", company.id);
    }

    const { data: products, error } = await productsQuery.order("createdAt", { ascending: false });

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
