import { NextResponse } from "next/server";
import { supabase } from "@repo/db";

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 500 });
    }

    const body = await request.json();
    const { companyId, warehouseId, products } = body;

    if (!companyId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters: companyId and non-empty products array" },
        { status: 400 }
      );
    }

    let insertedProductsCount = 0;
    let insertedVariantsCount = 0;
    const errors: string[] = [];

    // Group items by product title to reuse Product record if multiple variants belong to same product
    const productGroups: { [title: string]: any[] } = {};
    for (const item of products) {
      const title = (item.title || item.Title || "Untitled Product").trim();
      if (!productGroups[title]) {
        productGroups[title] = [];
      }
      productGroups[title].push(item);
    }

    for (const [title, items] of Object.entries(productGroups)) {
      try {
        const firstItem = items[0];
        const description = firstItem.description || firstItem.Description || "Bulk imported product";
        const brandName = firstItem.brand || firstItem.Brand || "Default";

        // 1. Resolve or create Brand
        let brandId: string | null = null;
        if (brandName) {
          const { data: existingBrand } = await supabase
            .from("Brand")
            .select("id")
            .eq("companyId", companyId)
            .ilike("name", brandName)
            .maybeSingle();

          if (existingBrand) {
            brandId = existingBrand.id;
          } else {
            const { data: newBrand } = await supabase
              .from("Brand")
              .insert({ companyId, name: brandName })
              .select()
              .single();
            if (newBrand) brandId = newBrand.id;
          }
        }

        // 2. Resolve or create Product
        let productId: string | null = null;
        const { data: existingProd } = await supabase
          .from("Product")
          .select("id")
          .eq("companyId", companyId)
          .ilike("title", title)
          .maybeSingle();

        if (existingProd) {
          productId = existingProd.id;
        } else {
          const { data: newProd, error: prodErr } = await supabase
            .from("Product")
            .insert({
              companyId,
              title,
              description,
              brandId,
              isActive: true
            })
            .select()
            .single();

          if (prodErr || !newProd) {
            errors.push(`Failed to create product "${title}": ${prodErr?.message}`);
            continue;
          }
          productId = newProd.id;
          insertedProductsCount++;
        }

        // 3. Process ProductVariants
        for (const varItem of items) {
          const sku = (varItem.sku || varItem.SKU || `SKU-${Math.floor(Math.random() * 900000) + 100000}`).trim();
          const size = (varItem.size || varItem.Size || "M").trim();
          const color = (varItem.color || varItem.Color || "Standard").trim();
          const price = Number(varItem.price || varItem.Price || 999);
          const stock = Number(varItem.stock || varItem.Stock || varItem.qty || varItem.Qty || 10);
          const barcode = (varItem.barcode || varItem.Barcode || sku).trim();

          // Check if SKU already exists
          const { data: existingVar } = await supabase
            .from("ProductVariant")
            .select("id")
            .eq("companyId", companyId)
            .eq("sku", sku)
            .maybeSingle();

          if (existingVar) {
            // Update stock and price
            await supabase
              .from("ProductVariant")
              .update({
                price,
                currentStockLevel: stock,
                barcode
              })
              .eq("id", existingVar.id);
            insertedVariantsCount++;
          } else {
            // Insert new variant
            const { data: newVar, error: varErr } = await supabase
              .from("ProductVariant")
              .insert({
                companyId,
                productId,
                sku,
                size,
                color,
                price,
                currentStockLevel: stock,
                safetyStockLimit: 5,
                barcode
              })
              .select()
              .single();

            if (varErr) {
              errors.push(`Failed to insert SKU "${sku}": ${varErr.message}`);
            } else if (newVar) {
              insertedVariantsCount++;
            }
          }
        }
      } catch (err: any) {
        errors.push(`Error processing "${title}": ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        productsProcessed: Object.keys(productGroups).length,
        variantsSaved: insertedVariantsCount,
        errors
      }
    });
  } catch (e: any) {
    console.error("Error processing bulk product import:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
