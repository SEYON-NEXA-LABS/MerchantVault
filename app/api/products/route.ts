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

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let company: any = null;
    const targetCode = slug || companyId;

    if (targetCode) {
      let companyQuery = supabase
        .from("Company")
        .select("id, name, storeName, code, logoUrl, shopifyStoreUrl, themeConfig, gstin, taxId, contactEmail, whatsappNumber");

      if (isUUID(targetCode)) {
        companyQuery = companyQuery.eq("id", targetCode);
      } else {
        companyQuery = companyQuery.or(`code.eq.${targetCode},code.ilike.${targetCode}`);
      }
      const { data } = await companyQuery.maybeSingle();
      company = data;
    }

    // Default tenant fallback: if no company matched or none specified, resolve active merchant company (non-superadmin)
    if (!company) {
      const { data } = await supabase
        .from("Company")
        .select("id, name, storeName, code, logoUrl, shopifyStoreUrl, themeConfig, gstin, taxId, contactEmail, whatsappNumber")
        .neq("code", "superadmin")
        .limit(1)
        .maybeSingle();
      company = data;
    }

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
