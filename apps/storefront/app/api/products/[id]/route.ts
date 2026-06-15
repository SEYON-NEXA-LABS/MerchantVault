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
  },
  {
    id: "mock-7",
    sku: "SEY-BEL-07",
    title: "Premium Leather Dress Belt",
    size: "M",
    color: "Charcoal Black",
    price: 1899,
    currentStockLevel: 15,
    category: "Accessories",
    rating: 4.7,
    reviews: 14,
    description: "Genuine top-grain leather dress belt with a clean brushed steel buckle. Perfect for both casual and formal wear."
  },
  {
    id: "mock-8",
    sku: "SEY-CAP-08",
    title: "Organic Cotton Twill Cap",
    size: "S",
    color: "Off-White",
    price: 999,
    currentStockLevel: 3,
    category: "Accessories",
    rating: 4.4,
    reviews: 9,
    description: "A classic 6-panel cap crafted from certified organic cotton twill. Features an adjustable fabric strap with brass hardware."
  },
  {
    id: "mock-9",
    sku: "SEY-CNV-09",
    title: "V-Neck Silk Blend Kurta",
    size: "XL",
    color: "Rust Orange",
    price: 3299,
    currentStockLevel: 20,
    category: "Ethnic",
    rating: 4.6,
    reviews: 22,
    description: "A lightweight linen-silk blend kurta with a modern V-neck cut. Breathable and comfortable for all-day wear."
  },
  {
    id: "mock-10",
    sku: "SEY-KHD-10",
    title: "Modern Khadi Comfort Pants",
    size: "M",
    color: "Mustard Yellow",
    price: 2499,
    currentStockLevel: 6,
    category: "Pants",
    rating: 4.5,
    reviews: 11,
    description: "Tailored khadi trousers featuring an elasticated drawstring waist. Pre-washed to prevent shrinkage."
  },
  {
    id: "mock-11",
    sku: "SEY-CAR-11",
    title: "Utility Ripstop Cargo Pants",
    size: "L",
    color: "Sage Green",
    price: 3199,
    currentStockLevel: 4,
    category: "Pants",
    rating: 4.8,
    reviews: 35,
    description: "Heavy-duty cotton ripstop cargo pants with multiple utility pockets and reinforced knees. Built for rugged daily use."
  },
  {
    id: "mock-12",
    sku: "SEY-WND-12",
    title: "Technical Lightweight Windbreaker",
    size: "M",
    color: "Dark Navy",
    price: 4899,
    currentStockLevel: 14,
    category: "Jackets",
    rating: 4.7,
    reviews: 17,
    description: "Water-resistant ripstop windbreaker featuring an adjustable hood, zippered pockets, and elasticized cuffs."
  },
  {
    id: "mock-13",
    sku: "SEY-PLS-13",
    title: "Plus Fit Chambray Shirt",
    size: "2XL",
    color: "Indigo Blue",
    price: 3199,
    currentStockLevel: 10,
    category: "Plus Size",
    rating: 4.7,
    reviews: 10,
    description: "A relaxed, generous cut chambray button-down shirt designed specifically for comfort and plus-size frames."
  },
  {
    id: "mock-14",
    sku: "SEY-PLS-14",
    title: "Comfort Fit Stretch Chinos",
    size: "3XL",
    color: "Sage Green",
    price: 2999,
    currentStockLevel: 8,
    category: "Plus Size",
    rating: 4.6,
    reviews: 8,
    description: "Premium cotton twill chinos with integrated elastane stretch and an expandable comfort waistband."
  },
  {
    id: "mock-15",
    sku: "SEY-PLS-15",
    title: "Relaxed Fit Khadi Kurta",
    size: "2XL",
    color: "Mustard Yellow",
    price: 3599,
    currentStockLevel: 12,
    category: "Plus Size",
    rating: 4.8,
    reviews: 12,
    description: "Traditional handcrafted Khadi cotton kurta styled with a loose, premium drape for maximum comfort."
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
