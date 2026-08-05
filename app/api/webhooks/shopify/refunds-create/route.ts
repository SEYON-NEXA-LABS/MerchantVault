import { NextResponse } from "next/server";
import { supabaseAdmin } from "@repo/db";
import { getContextCompanyId } from "@/lib/session";

// Internal business logic to process refund updates and restock inventory
async function processRefund(orderId: string, refundLineItems: any[]) {
  // 1. Find the local order fulfillment record
  const { data: fulfillment, error: fErr } = await supabaseAdmin
    .from("OrderFulfillment")
    .select("id, companyId, orderId, orderNumber, warehouseId")
    .eq("shopifyOrderId", orderId)
    .maybeSingle();

  if (fErr || !fulfillment) {
    throw new Error(`Order fulfillment record not found for Shopify order ID: ${orderId}`);
  }

  // 2. Update OrderFulfillment status
  const { error: updErr } = await supabaseAdmin
    .from("OrderFulfillment")
    .update({ deliveryStatus: "RTO_RECEIVED" })
    .eq("id", fulfillment.id);

  if (updErr) throw updErr;

  // 3. Update Order status
  if (fulfillment.orderId) {
    const { error: ordErr } = await supabaseAdmin
      .from("Order")
      .update({ paymentStatus: "REFUNDED", fulfillmentStatus: "RESTOCKED" })
      .eq("id", fulfillment.orderId);

    if (ordErr) throw ordErr;
  }

  // 4. Restock inventory for each refunded item
  for (const item of refundLineItems) {
    const shopifyVariantId = item.line_item?.variant_id?.toString() || item.variant_id?.toString();
    const quantity = item.quantity || 1;

    if (!shopifyVariantId) continue;

    // Find ProductVariant
    const { data: variant } = await supabaseAdmin
      .from("ProductVariant")
      .select("id, currentStockLevel")
      .eq("companyId", fulfillment.companyId)
      .eq("shopifyVariantId", shopifyVariantId)
      .maybeSingle();

    if (variant) {
      // Increment variant level stock
      const newStockLevel = variant.currentStockLevel + quantity;
      await supabaseAdmin
        .from("ProductVariant")
        .update({ currentStockLevel: newStockLevel })
        .eq("id", variant.id);

      // Increment warehouse level stock if warehouse context exists
      if (fulfillment.warehouseId) {
        const { data: whStock } = await supabaseAdmin
          .from("WarehouseStock")
          .select("id, currentStockLevel")
          .eq("warehouseId", fulfillment.warehouseId)
          .eq("variantId", variant.id)
          .maybeSingle();

        if (whStock) {
          await supabaseAdmin
            .from("WarehouseStock")
            .update({ currentStockLevel: whStock.currentStockLevel + quantity })
            .eq("id", whStock.id);
        } else {
          await supabaseAdmin
            .from("WarehouseStock")
            .insert({
              warehouseId: fulfillment.warehouseId,
              variantId: variant.id,
              currentStockLevel: quantity
            });
        }

        // Write StockMovement ledger entry
        await supabaseAdmin.from("StockMovement").insert({
          companyId: fulfillment.companyId,
          variantId: variant.id,
          warehouseId: fulfillment.warehouseId,
          type: "INWARD",
          quantity: quantity,
          operatorEmail: "shopify-refund-webhook@sync.com",
          syncStatus: "SUCCESS",
          errorMessage: `Restocked via Shopify refund webhook for order ${fulfillment.orderNumber}`
        });
      }
    }
  }

  return fulfillment;
}

// GET Simulator endpoint to test refunds flow instantly
export async function GET() {
  try {
    let companyId = null;
    try {
      companyId = await getContextCompanyId();
    } catch (_) {}

    let company = null;
    if (companyId) {
      const { data: comp } = await supabaseAdmin
        .from("Company")
        .select("id")
        .eq("id", companyId)
        .maybeSingle();
      company = comp;
    }

    if (!company) {
      // Fallback to 'syn'
      const { data: comp } = await supabaseAdmin
        .from("Company")
        .select("id")
        .eq("code", "syn")
        .maybeSingle();
      company = comp;
    }

    if (!company) {
      return NextResponse.json({ error: "No company context found" }, { status: 400 });
    }

    // Find the most recent dispatched or delivered order to simulate returning
    const { data: fulfillment, error: fErr } = await supabaseAdmin
      .from("OrderFulfillment")
      .select("id, shopifyOrderId, orderNumber, warehouseId, orderId")
      .eq("companyId", company.id)
      .in("deliveryStatus", ["SHIPPED", "DELIVERED"])
      .order("createdAt", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fErr || !fulfillment) {
      return NextResponse.json(
        { error: "No eligible shipped or delivered orders found to simulate return. Please dispatch an order first." },
        { status: 404 }
      );
    }

    // Find OrderItems to simulate lines
    const { data: items } = await supabaseAdmin
      .from("OrderItem")
      .select("variantId, quantity, price")
      .eq("orderId", fulfillment.orderId);

    const refundedItems = [];
    if (items) {
      for (const it of items) {
        const { data: pv } = await supabaseAdmin
          .from("ProductVariant")
          .select("shopifyVariantId, sku")
          .eq("id", it.variantId)
          .maybeSingle();

        if (pv) {
          refundedItems.push({
            id: Math.floor(Math.random() * 900000) + 100000,
            quantity: it.quantity,
            line_item: {
              variant_id: pv.shopifyVariantId,
              sku: pv.sku,
              price: it.price
            }
          });
        }
      }
    }

    // Execute internal business logic
    const orderObj = await processRefund(fulfillment.shopifyOrderId, refundedItems);

    return NextResponse.json({
      success: true,
      message: `Simulated Shopify refund processed for order ${orderObj.orderNumber}`,
      shopifyOrderId: fulfillment.shopifyOrderId,
      refundedItems
    });
  } catch (error: any) {
    console.error("Refund Simulation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST Production Shopify webhook receiver
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.order_id?.toString();
    const refundLineItems = body.refund_line_items || [];

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const orderObj = await processRefund(orderId, refundLineItems);

    return NextResponse.json({
      success: true,
      message: `Shopify refund webhook processed successfully for order ${orderObj.orderNumber}`
    });
  } catch (error: any) {
    console.error("Refund Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
}
