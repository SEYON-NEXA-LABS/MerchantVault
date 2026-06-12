import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { getContextCompanyId, getSessionUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    // 1. Role-based authorization validation
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "TENANTADMIN")) {
      return NextResponse.json(
        { error: "Access Denied. CSV catalog imports are restricted to Administrator roles under active supervision." },
        { status: 403 }
      );
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const body = await req.json();
    const { items, warehouseId, dryRun } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array of items." }, { status: 400 });
    }

    const results: any[] = [];
    const importedCount = { variants: 0, stockRecords: 0, skipped: 0 };
    const errors: string[] = [];

    for (let index = 0; index < items.length; index++) {
      const row = items[index];
      const rowNum = index + 1;

      // Extract row data
      const title = (row.title || row.Title || "").toString().trim();
      const sku = (row.sku || row.Sku || row.SKU || "").toString().trim();
      const size = (row.size || row.Size || "").toString().trim();
      const color = (row.color || row.Color || "").toString().trim();
      const rawPrice = row.price || row.Price;
      const category = (row.category || row.Category || "Top").toString().trim();
      const targetGroup = (row.targetGroup || row.TargetGroup || "Adults").toString().trim();
      const ageRange = row.ageRange || row.AgeRange ? (row.ageRange || row.AgeRange).toString().trim() : null;
      const safetyStock = parseInt(row.safetyStockLimit || row.SafetyStockLimit) || 5;
      const barcode = (row.barcode || row.Barcode || "").toString().trim();
      const currentStock = row.currentStock !== undefined && row.currentStock !== null ? parseInt(row.currentStock) : null;
      const imageUrl = (row.imageUrl || row.ImageUrl || "").toString().trim();

      if (!title || !sku || !size || !color) {
        errors.push(`Row ${rowNum}: Title, SKU, Size, and Color are required.`);
        continue;
      }

      const price = parseFloat(rawPrice);
      if (isNaN(price) || price < 0) {
        errors.push(`Row ${rowNum} (${sku}): Price must be a valid non-negative number.`);
        continue;
      }

      // Split comma separated image URLs
      const imageUrls = imageUrl ? imageUrl.split(",").map((url: string) => url.trim()).filter(Boolean) : [];

      // Lookup existing variant with full details
      const { data: existingVariant, error: findErr } = await supabase
        .from("ProductVariant")
        .select(`
          id,
          title,
          size,
          color,
          price,
          category,
          targetGroup,
          ageRange,
          thumbnailConfig,
          stocks:WarehouseStock(currentStockLevel, warehouseId)
        `)
        .eq("companyId", companyId)
        .eq("sku", sku)
        .maybeSingle();

      if (findErr) {
        errors.push(`Row ${rowNum} (${sku}): Database lookup failed (${findErr.message})`);
        continue;
      }

      const timestamp = Date.now();
      const randomPart = Math.floor(1000 + Math.random() * 9000);

      // Parse existing imageUrl if any from existing thumbnailConfig
      let existingImgUrlStr = "";
      if (existingVariant && existingVariant.thumbnailConfig) {
        try {
          const cfg = JSON.parse(existingVariant.thumbnailConfig);
          if (cfg.images && Array.isArray(cfg.images)) {
            existingImgUrlStr = cfg.images.join(", ");
          } else {
            existingImgUrlStr = cfg.imageUrl || "";
          }
        } catch (_) {}
      }

      if (existingVariant) {
        // Find stock level in target warehouse
        const matchingStock = existingVariant.stocks?.find((s: any) => s.warehouseId === warehouseId);
        const existingStockVal = matchingStock ? matchingStock.currentStockLevel : 0;

        // Compile discrepancies
        const discrepancies: string[] = [];
        if (title !== existingVariant.title) {
          discrepancies.push(`Title: "${title}" (CSV) vs "${existingVariant.title}" (DB)`);
        }
        if (size !== existingVariant.size) {
          discrepancies.push(`Size: "${size}" (CSV) vs "${existingVariant.size}" (DB)`);
        }
        if (color !== existingVariant.color) {
          discrepancies.push(`Color: "${color}" (CSV) vs "${existingVariant.color}" (DB)`);
        }
        if (price !== existingVariant.price) {
          discrepancies.push(`Price: $${price.toFixed(2)} (CSV) vs $${existingVariant.price.toFixed(2)} (DB)`);
        }
        if (currentStock !== null && currentStock !== existingStockVal) {
          discrepancies.push(`Stock: ${currentStock} (CSV) vs ${existingStockVal} (DB)`);
        }
        if (imageUrl !== existingImgUrlStr) {
          discrepancies.push(`Image: "${imageUrl}" (CSV) vs "${existingImgUrlStr}" (DB)`);
        }

        if (dryRun) {
          results.push({
            sku,
            title,
            size,
            color,
            price,
            currentStock: currentStock ?? 0,
            imageUrl,
            status: "EXISTS",
            discrepancies
          });
        } else {
          // Execution mode: Skip existing variants
          importedCount.skipped++;
        }
      } else {
        // Variant is new
        if (dryRun) {
          results.push({
            sku,
            title,
            size,
            color,
            price,
            currentStock: currentStock ?? 0,
            imageUrl,
            status: "NEW",
            discrepancies: []
          });
        } else {
          // Execution mode: Insert new variant
          const generatedShopifyId = `gid://shopify/ProductVariant/imported_${timestamp}_${randomPart}`;
          const finalBarcode = barcode || `${sku.replace(/[^a-zA-Z0-9]/g, "")}${randomPart}`;
          
          const thumbnailConfig = imageUrls.length > 0
            ? JSON.stringify({ 
                imageUrl: imageUrls[0], 
                images: imageUrls, 
                color: color.toLowerCase() 
              })
            : JSON.stringify({ color: color.toLowerCase() });

          const { data: newVariant, error: insertErr } = await supabase
            .from("ProductVariant")
            .insert({
              companyId,
              shopifyVariantId: generatedShopifyId,
              sku,
              title,
              size,
              color,
              barcodeString: finalBarcode,
              safetyStockLimit: safetyStock,
              price,
              category,
              targetGroup,
              ageRange,
              thumbnailConfig,
              currentStockLevel: 0
            })
            .select("id")
            .single();

          if (insertErr) {
            errors.push(`Row ${rowNum} (${sku}): Failed to create variant (${insertErr.message})`);
            continue;
          }

          importedCount.variants++;

          // Upsert WarehouseStock and Log Movement for new variant if stock is defined
          if (warehouseId && currentStock !== null && !isNaN(currentStock) && currentStock >= 0) {
            const { error: stockUpsertErr } = await supabase
              .from("WarehouseStock")
              .upsert({
                warehouseId,
                variantId: newVariant.id,
                currentStockLevel: currentStock,
                updatedAt: new Date().toISOString()
              }, {
                onConflict: "warehouseId,variantId"
              });

            if (stockUpsertErr) {
              errors.push(`Row ${rowNum} (${sku}): Variant created, but stock level setup failed (${stockUpsertErr.message})`);
              continue;
            }

            importedCount.stockRecords++;

            if (currentStock > 0) {
              await supabase
                .from("StockMovement")
                .insert({
                  companyId,
                  variantId: newVariant.id,
                  warehouseId,
                  type: "INWARD",
                  quantity: currentStock,
                  operatorEmail: user.email || "admin@seyon.co",
                  syncStatus: "SUCCESS"
                });
            }

            // Sync aggregate level
            await supabase
              .from("ProductVariant")
              .update({
                currentStockLevel: currentStock,
                updatedAt: new Date().toISOString()
              })
              .eq("id", newVariant.id);
          }
        }
      }
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        items: results,
        errors
      });
    }

    return NextResponse.json({
      success: errors.length === 0 || importedCount.variants > 0,
      importedCount,
      errors
    });
  } catch (error: any) {
    console.error("CSV Import check/execution API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
