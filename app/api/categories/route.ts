import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

// Preset default categories for Indian retail & D2C stores
const DEFAULT_PRESET_CATEGORIES = [
  { name: "Apparel & Dresses", slug: "apparel-dresses", icon: "Shirt", description: "Sarees, Kurtis, Shirts, Casual & Ethnic Wear", displayOrder: 1 },
  { name: "Cosmetics & Beauty", slug: "cosmetics-beauty", icon: "Sparkles", description: "Skincare, Lipsticks, Organic Oils, Fragrance", displayOrder: 2 },
  { name: "Baby & Kids", slug: "baby-kids", icon: "Heart", description: "Soft Bamboo Clothing, Toys, Nursery Care", displayOrder: 3 },
  { name: "Footwear & Bags", slug: "footwear-bags", icon: "Footprints", description: "Leather Shoes, Sandals, Handbags, Backpacks", displayOrder: 4 },
  { name: "Jewelry & Accessories", slug: "jewelry-accessories", icon: "Gem", description: "18K Gold Plated, 925 Silver, Watches, Sunglasses", displayOrder: 5 }
];

// GET /api/categories - Fetch categories for current company context
export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ success: true, categories: DEFAULT_PRESET_CATEGORIES });
    }

    let { data: categories, error } = await supabase
      .from("Category")
      .select("*")
      .eq("companyId", companyId)
      .order("displayOrder", { ascending: true });

    if (error) throw error;

    // Auto-seed default categories if empty
    if (!categories || categories.length === 0) {
      const payload = DEFAULT_PRESET_CATEGORIES.map(cat => ({
        companyId,
        ...cat
      }));
      const { data: seeded } = await supabase.from("Category").insert(payload).select();
      categories = seeded || DEFAULT_PRESET_CATEGORIES as any;
    }

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ success: true, categories: DEFAULT_PRESET_CATEGORIES });
  }
}

// POST /api/categories - Create/update category
export async function POST(request: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon = "Package", description, imageUrl, displayOrder = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const { data: category, error } = await supabase
      .from("Category")
      .insert({
        companyId,
        name: name.trim(),
        slug,
        icon,
        description,
        imageUrl,
        displayOrder: parseInt(displayOrder || "0")
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
