import { getContextCompanyId, getSessionUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized session context" }, { status: 401 });
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const body = await req.json();
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json({ error: "Missing required field: variantId" }, { status: 400 });
    }

    // 2. Fetch Variant details
    const { data: variant, error: varErr } = await supabase
      .from("ProductVariant")
      .select("id, title, size, color, sku, price, barcodeString, shopifyVariantId")
      .eq("id", variantId)
      .eq("companyId", companyId)
      .single();

    if (varErr || !variant) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    // 3. Fetch Company Credentials
    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("shopifyStoreUrl, shopifyAccessToken")
      .eq("id", companyId)
      .single();

    if (compErr || !company) {
      return NextResponse.json({ error: "Associated company profile not found" }, { status: 404 });
    }

    const { shopifyStoreUrl, shopifyAccessToken } = company;

    if (!shopifyStoreUrl || !shopifyAccessToken) {
      return NextResponse.json({ error: "Shopify Store integration is not configured. Go to settings to set up credentials." }, { status: 400 });
    }

    const isMockToken = 
      shopifyAccessToken === "shpat_mockaccesstoken12345" || 
      shopifyAccessToken.startsWith("shpat_mock") ||
      shopifyStoreUrl.includes("myshopify.com") === false;

    // 4. Handle Mock Simulation (for local/seeding development)
    if (isMockToken) {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockShopifyId = `gid://shopify/ProductVariant/synced_${Date.now()}`;

      // Update database record
      const { error: updateErr } = await supabase
        .from("ProductVariant")
        .update({ 
          shopifyVariantId: mockShopifyId,
          updatedAt: new Date().toISOString()
        })
        .eq("id", variantId);

      if (updateErr) throw updateErr;

      return NextResponse.json({
        success: true,
        message: "Simulated successful product variant export to Shopify storefront.",
        shopifyVariantId: mockShopifyId,
        simulated: true
      });
    }

    // 5. Active Connection Execution Mode (Real Shopify Admin REST API integration)
    const shopifyDomain = shopifyStoreUrl.replace("https://", "").replace("http://", "").trim();
    
    // a. Check if Product with title already exists
    const searchRes = await fetch(
      `https://${shopifyDomain}/admin/api/2026-04/products.json?title=${encodeURIComponent(variant.title)}`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json"
        }
      }
    );

    if (!searchRes.ok) {
      const searchErr = await searchRes.text();
      return NextResponse.json({ error: `Shopify search failed: ${searchErr}` }, { status: searchRes.status });
    }

    const { products } = await searchRes.json();
    let shopifyProductId = null;
    let shopifyVariantId = null;

    if (Array.isArray(products) && products.length > 0) {
      // Product exists on Shopify
      shopifyProductId = products[0].id;
      
      // Check if variant SKU already exists on the product
      const existingVar = products[0].variants?.find((v: any) => v.sku === variant.sku);
      if (existingVar) {
        shopifyVariantId = `gid://shopify/ProductVariant/${existingVar.id}`;
      } else {
        // Create new variant on the existing product
        const createVarRes = await fetch(
          `https://${shopifyDomain}/admin/api/2026-04/products/${shopifyProductId}/variants.json`,
          {
            method: "POST",
            headers: {
              "X-Shopify-Access-Token": shopifyAccessToken,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              variant: {
                option1: variant.size,
                option2: variant.color,
                price: variant.price.toString(),
                sku: variant.sku,
                barcode: variant.barcodeString
              }
            })
          }
        );

        if (!createVarRes.ok) {
          const varErrText = await createVarRes.text();
          return NextResponse.json({ error: `Shopify variant creation failed: ${varErrText}` }, { status: createVarRes.status });
        }

        const varData = await createVarRes.json();
        shopifyVariantId = `gid://shopify/ProductVariant/${varData.variant.id}`;
      }
    } else {
      // Product does not exist on Shopify; create new product with the variant
      const createProdRes = await fetch(
        `https://${shopifyDomain}/admin/api/2026-04/products.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": shopifyAccessToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            product: {
              title: variant.title,
              options: [
                { name: "Size" },
                { name: "Color" }
              ],
              variants: [
                {
                  option1: variant.size,
                  option2: variant.color,
                  price: variant.price.toString(),
                  sku: variant.sku,
                  barcode: variant.barcodeString
                }
              ]
            }
          })
        }
      );

      if (!createProdRes.ok) {
        const prodErrText = await createProdRes.text();
        return NextResponse.json({ error: `Shopify product creation failed: ${prodErrText}` }, { status: createProdRes.status });
      }

      const prodData = await createProdRes.json();
      shopifyVariantId = `gid://shopify/ProductVariant/${prodData.product.variants[0].id}`;
    }

    if (!shopifyVariantId) {
      throw new Error("Failed to retrieve product variant identifier from Shopify response.");
    }

    // 6. Update local database mapping record
    const { error: dbUpdateErr } = await supabase
      .from("ProductVariant")
      .update({
        shopifyVariantId,
        updatedAt: new Date().toISOString()
      })
      .eq("id", variantId);

    if (dbUpdateErr) throw dbUpdateErr;

    return NextResponse.json({
      success: true,
      message: "Successfully exported product variant to Shopify storefront.",
      shopifyVariantId,
      simulated: false
    });

  } catch (error: any) {
    console.error("Shopify product export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
