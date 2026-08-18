import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

// GET /api/brands - Fetch all brands/stores under current company
export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const { data: brands, error } = await supabase
      .from("Brand")
      .select("*")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, brands: brands || [] });
  } catch (error: any) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch store brands" }, { status: 500 });
  }
}

// POST /api/brands - Create or update store brand & theme
export async function POST(request: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, code, logoUrl, themeConfig } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Store Name and Store Code are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    let query;
    if (id) {
      query = supabase
        .from("Brand")
        .update({
          name: name.trim(),
          code: cleanCode,
          logoUrl: logoUrl || null,
          themeConfig: typeof themeConfig === "object" ? JSON.stringify(themeConfig) : themeConfig
        })
        .eq("id", id)
        .eq("companyId", companyId)
        .select()
        .single();
    } else {
      query = supabase
        .from("Brand")
        .insert({
          companyId,
          name: name.trim(),
          code: cleanCode,
          logoUrl: logoUrl || null,
          themeConfig: typeof themeConfig === "object" ? JSON.stringify(themeConfig) : themeConfig
        })
        .select()
        .single();
    }

    const { data: brand, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, brand });
  } catch (error: any) {
    console.error("POST /api/brands error:", error);
    return NextResponse.json({ error: error.message || "Failed to save store brand" }, { status: 500 });
  }
}

// DELETE /api/brands?id=... - Delete brand store
export async function DELETE(request: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Brand")
      .delete()
      .eq("id", id)
      .eq("companyId", companyId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Store brand deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/brands error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete store brand" }, { status: 500 });
  }
}
