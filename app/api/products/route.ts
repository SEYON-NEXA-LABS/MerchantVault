import { NextResponse } from "next/server";
import { supabase } from "@repo/db";

export async function GET(request: Request) {
  try {
    if (!supabase) {
      console.warn("Supabase client not initialized in storefront");
      return NextResponse.json({ products: [], company: null });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || searchParams.get("code") || searchParams.get("companyCode");
    const companyId = searchParams.get("companyId");
    const brandParam = searchParams.get("brand");

    let companyQuery = supabase
      .from("Company")
      .select("id, name, storeName, code, shopifyStoreUrl, themeConfig, gstin, taxId, contactEmail, whatsappNumber");

    const targetCode = slug || companyId;
    if (targetCode) {
      companyQuery = companyQuery.or(`code.eq.${targetCode},id.eq.${targetCode},code.ilike.${targetCode}`);
    } else {
      companyQuery = companyQuery.eq("code", "syn");
    }

    const { data: company } = await companyQuery.maybeSingle();

    let brands: any[] = [];
    let brandId: string | null = null;

    if (company && company.id) {
      const { data: companyBrands } = await supabase
        .from("Brand")
        .select("id, name, code, logoUrl, themeConfig")
        .eq("companyId", company.id);
      brands = companyBrands || [];

      if (brandParam) {
        const activeBrand = brands.find(b => b.code === brandParam.toLowerCase());
        if (activeBrand) {
          brandId = activeBrand.id;
        }
      }
    }

    let productsQuery = supabase
      .from("ProductVariant")
      .select("id, sku, title, size, color, price, compareAtPrice, currentStockLevel, category, categoryId, categoryName, vendor, safetyStockLimit, thumbnailConfig, brandId");

    if (company && company.id) {
      productsQuery = productsQuery.eq("companyId", company.id);
    }
    if (brandId) {
      productsQuery = productsQuery.eq("brandId", brandId);
    }

    const { data: products, error } = await productsQuery.order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({
      products: products || [],
      company: company || null,
      brands
    });
  } catch (error: any) {
    console.error("Fetch Storefront Products Error:", error);
    return NextResponse.json({ products: [], company: null, brands: [] }, { status: 500 });
  }
}
