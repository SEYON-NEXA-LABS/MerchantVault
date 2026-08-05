import { NextResponse } from "next/server";
import { supabase } from "@repo/db";

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 500 });
    }

    const body = await request.json();
    const {
      companyId,
      warehouseId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      paymentMethod,
      discountAmount = 0,
      notes = ""
    } = body;

    if (!companyId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required POS parameters: companyId, warehouseId, and items array" },
        { status: 400 }
      );
    }

    // 1. Calculate subtotals and check inventory balances
    let subtotal = 0;
    const lineItemsToInsert: any[] = [];
    const stockDecrements: { variantId: string; qty: number }[] = [];

    for (const item of items) {
      const { variantId, quantity, unitPrice } = item;
      if (!variantId || !quantity || quantity <= 0) continue;

      // Verify stock in ProductVariant
      const { data: variant, error: varError } = await supabase
        .from("ProductVariant")
        .select("id, sku, color, size, currentStockLevel, productId, Product(title)")
        .eq("id", variantId)
        .single();

      if (varError || !variant) {
        return NextResponse.json({ error: `Product variant not found (ID: ${variantId})` }, { status: 404 });
      }

      if (variant.currentStockLevel < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${variant.Product?.title || "Item"} (${variant.size || ""} ${variant.color || ""}). Available: ${variant.currentStockLevel}, Requested: ${quantity}` },
          { status: 400 }
        );
      }

      const itemPrice = Number(unitPrice || 0);
      const lineTotal = itemPrice * quantity;
      subtotal += lineTotal;

      lineItemsToInsert.push({
        variantId,
        sku: variant.sku,
        title: `${variant.Product?.title || "Item"} (${variant.size || ""} / ${variant.color || ""})`,
        quantity,
        price: itemPrice
      });

      stockDecrements.push({ variantId, qty: quantity });
    }

    const grandTotal = Math.max(0, subtotal - Number(discountAmount || 0));

    // 2. Generate POS Order Number & Tracking
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    const posOrderName = `#POS-${randomNum}`;
    const generatedOrderId = `pos-${Date.now()}-${randomNum}`;

    // 3. Insert Order with orderSource: "POS"
    const { data: newOrder, error: orderError } = await supabase
      .from("Order")
      .insert({
        companyId,
        shopifyOrderId: generatedOrderId,
        name: posOrderName,
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
        totalPrice: grandTotal,
        subtotalPrice: subtotal,
        totalTax: 0,
        currency: "INR",
        financialStatus: "paid",
        fulfillmentStatus: "fulfilled",
        orderSource: "POS",
        notes: notes || "Counter Billing Sale"
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error("Failed to insert POS order", orderError);
      return NextResponse.json({ error: "Failed to record POS order in database" }, { status: 500 });
    }

    // 4. Create OrderFulfillment linked to warehouseId
    const { error: fulError } = await supabase.from("OrderFulfillment").insert({
      orderId: newOrder.id,
      companyId,
      warehouseId,
      orderSource: "POS",
      orderName: posOrderName,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      financialStatus: "PAID",
      fulfillmentStatus: "FULFILLED"
    });

    if (fulError) {
      console.warn("Failed to create OrderFulfillment record for POS order", fulError);
    }

    // 5. Decrement inventory stock levels per variant
    for (const dec of stockDecrements) {
      const { data: currentVar } = await supabase
        .from("ProductVariant")
        .select("currentStockLevel")
        .eq("id", dec.variantId)
        .single();

      if (currentVar) {
        const newStock = Math.max(0, currentVar.currentStockLevel - dec.qty);
        await supabase
          .from("ProductVariant")
          .update({ currentStockLevel: newStock })
          .eq("id", dec.variantId);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderName: posOrderName,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        totalPrice: grandTotal,
        paymentMethod: paymentMethod || "CASH",
        items: lineItemsToInsert,
        createdAt: newOrder.createdAt || new Date().toISOString()
      }
    });
  } catch (e: any) {
    console.error("Error processing POS checkout transaction:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
