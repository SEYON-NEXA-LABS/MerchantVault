import { NextResponse } from "next/server";
import { supabase } from "@repo/db";

const FALLBACK_PRODUCTS = [
  {
    id: "mock-1",
    sku: "SEY-KHD-01",
    title: "Premium Mulberry Silk Shirt",
    size: "M",
    color: "Indigo Blue",
    price: 3499,
    currentStockLevel: 12,
    category: "Shirts",
    rating: 4.8,
    reviews: 24,
    description: "Crafted from fine handwoven mulberry silk, this shirt balances ethnic luxury with modern casual cuts. Features breathable texture and natural shine."
  },
  {
    id: "mock-2",
    sku: "SEY-LIN-02",
    title: "Sage Green Linen Trousers",
    size: "L",
    color: "Sage Green",
    price: 2899,
    currentStockLevel: 5,
    category: "Pants",
    rating: 4.6,
    reviews: 18,
    description: "Breathable Italian linen blend trousers featuring clean tailoring and custom adjustments. Pre-washed for maximum softness and drape."
  },
  {
    id: "mock-3",
    sku: "SEY-NEH-03",
    title: "Classic Khadi Nehru Jacket",
    size: "XL",
    color: "Khaki Gold",
    price: 4500,
    currentStockLevel: 0,
    category: "Jackets",
    rating: 4.9,
    reviews: 32,
    description: "Traditional silhouette tailored with locally sourced organic Khadi cotton. Adorned with handcrafted coconut-shell buttons."
  },
  {
    id: "mock-4",
    sku: "SEY-SLK-04",
    title: "Crimson Silk Festive Kurta",
    size: "M",
    color: "Crimson Rose",
    price: 3999,
    currentStockLevel: 18,
    category: "Ethnic",
    rating: 4.7,
    reviews: 15,
    description: "An elegant raw silk kurta designed for festive celebrations. Features minimalist gold-thread embroidery along the collar."
  },
  {
    id: "mock-5",
    sku: "SEY-DEN-05",
    title: "Raw Denim Workwear Jacket",
    size: "L",
    color: "Dark Navy",
    price: 5200,
    currentStockLevel: 8,
    category: "Jackets",
    rating: 4.9,
    reviews: 40,
    description: "Heavyweight indigo dyed raw denim jacket built for longevity. Contrast gold stitching and heavy brass hardware throughout."
  },
  {
    id: "mock-6",
    sku: "SEY-COT-06",
    title: "Pima Cotton Minimalist Tee",
    size: "S",
    color: "Off-White",
    price: 1299,
    currentStockLevel: 25,
    category: "Tees",
    rating: 4.5,
    reviews: 58,
    description: "Luxuriously soft long-staple Pima cotton t-shirt. The perfect everyday foundation featuring double-needle stitched hems."
  }
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let company = null;
    if (supabase) {
      const { data: coData } = await supabase
        .from("Company")
        .select("id, name, code, shopifyStoreUrl, shopifyAccessToken")
        .eq("code", "syn")
        .maybeSingle();
      company = coData;
    }

    // Check fallback products first
    const fallback = FALLBACK_PRODUCTS.find(p => p.id === id);
    if (fallback) {
      return NextResponse.json({
        product: fallback,
        company
      });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Product not found and database not connected" }, { status: 404 });
    }

    const { data: variant, error } = await supabase
      .from("ProductVariant")
      .select("id, sku, title, size, color, price, currentStockLevel, category, safetyStockLimit, thumbnailConfig")
      .eq("id", id)
      .maybeSingle();

    if (error || !variant) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const mappedProduct = {
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      size: variant.size || "M",
      color: variant.color || "Indigo Blue",
      price: variant.price || 1999,
      currentStockLevel: variant.currentStockLevel ?? 0,
      category: variant.category || "All",
      rating: 4.7,
      reviews: 12,
      thumbnailConfig: variant.thumbnailConfig,
      description: `Directly synced from Seyon ERP Database. Live stock tracking active with safety limit: ${variant.safetyStockLimit || 5} units.`
    };

    return NextResponse.json({
      product: mappedProduct,
      company
    });
  } catch (error: any) {
    console.error("Fetch Storefront Product Detail Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
