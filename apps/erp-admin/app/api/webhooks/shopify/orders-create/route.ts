import { NextResponse } from "next/server";
import { supabaseAdmin } from "@repo/db";
import { getContextCompanyId } from "@/lib/session";

// Mock customer names and data for simulation
const MOCK_NAMES = [
  "Rohan Verma",
  "Karan Johar",
  "Pooja Hegde",
  "Siddharth Malhotra",
  "Aditi Rao",
  "Vikram Seth",
  "Deepika Padukone"
];

const MOCK_PHONES = [
  "+919876543210",
  "+919123456789",
  "+918888888888",
  "+919999999999",
  "+917777777777"
];

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
      let { data: comp, error: compErr } = await supabaseAdmin
        .from("Company")
        .select("id")
        .eq("code", "syn")
        .maybeSingle();

      if (compErr || !comp) {
        const { data: newComp, error: createErr } = await supabaseAdmin
          .from("Company")
          .insert({ name: "SEYON", code: "syn" })
          .select("id")
          .single();
        
        if (createErr) throw createErr;
        company = newComp;
      } else {
        company = comp;
      }
    }

    // Resolve default warehouse
    let { data: warehouse } = await supabaseAdmin
      .from("Warehouse")
      .select("id")
      .eq("companyId", company.id)
      .eq("isDefaultPickup", true)
      .maybeSingle();

    if (!warehouse) {
      // Fetch any warehouse
      const { data: anyWh } = await supabaseAdmin
        .from("Warehouse")
        .select("id")
        .eq("companyId", company.id)
        .limit(1)
        .maybeSingle();
      warehouse = anyWh;
    }

    // Generate random customer details
    const customerName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    const customerPhone = MOCK_PHONES[Math.floor(Math.random() * MOCK_PHONES.length)];
    const customerEmail = `${customerName.toLowerCase().replace(" ", "")}-${Math.floor(1000 + Math.random() * 9000)}@mock.com`;

    // Upsert Customer
    let { data: customer, error: custErr } = await supabaseAdmin
      .from("Customer")
      .select("id")
      .eq("companyId", company.id)
      .eq("phone", customerPhone)
      .maybeSingle();

    if (!customer) {
      const { data: newCust, error: createCustErr } = await supabaseAdmin
        .from("Customer")
        .insert({
          companyId: company.id,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          city: "Mumbai",
          state: "Maharashtra",
          zip: "400001",
          country: "India"
        })
        .select("id")
        .single();
      if (createCustErr) throw createCustErr;
      customer = newCust;
    }

    // Fetch a product variant to order
    let { data: variant } = await supabaseAdmin
      .from("ProductVariant")
      .select("id, price, sku, currentStockLevel")
      .eq("companyId", company.id)
      .limit(1)
      .maybeSingle();

    // Generate simulated order
    const randId = Math.floor(Math.random() * 900000) + 100000;
    const shopifyOrderId = `sh-ord-${randId}`;
    const orderNumber = `#ORD-${Math.floor(Math.random() * 9000) + 10000}`;
    const totalWeightKg = parseFloat((Math.random() * 0.8 + 0.15).toFixed(2));
    const shippingAddressLine1 = `${Math.floor(Math.random() * 900) + 100}, Park Avenue`;
    const shippingAddressLine2 = "Sector 4";
    const shippingCity = "Mumbai";
    const shippingState = "Maharashtra";
    const shippingZip = `${Math.floor(Math.random() * 90000) + 400000}`;
    const shippingCountry = "India";
    const orderPrice = variant ? variant.price : 1999;

    // 1. Create Order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("Order")
      .insert({
        companyId: company.id,
        customerId: customer.id,
        orderNumber,
        shopifyOrderId,
        paymentStatus: "PAID",
        fulfillmentStatus: "UNFULFILLED",
        totalPrice: orderPrice,
        currency: "INR",
        rawPayload: { simulated: true }
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 2. Create OrderItem
    if (variant) {
      await supabaseAdmin.from("OrderItem").insert({
        orderId: order.id,
        variantId: variant.id,
        quantity: 1,
        price: orderPrice
      });

      // Deduct stock level
      const newStock = Math.max(0, variant.currentStockLevel - 1);
      await supabaseAdmin
        .from("ProductVariant")
        .update({ currentStockLevel: newStock })
        .eq("id", variant.id);

      if (warehouse) {
        // Adjust warehouse stock level
        let { data: whStock } = await supabaseAdmin
          .from("WarehouseStock")
          .select("currentStockLevel")
          .eq("warehouseId", warehouse.id)
          .eq("variantId", variant.id)
          .maybeSingle();
        
        if (whStock) {
          await supabaseAdmin
            .from("WarehouseStock")
            .update({ currentStockLevel: Math.max(0, whStock.currentStockLevel - 1) })
            .eq("warehouseId", warehouse.id)
            .eq("variantId", variant.id);
        }

        // Add movement log
        await supabaseAdmin.from("StockMovement").insert({
          companyId: company.id,
          variantId: variant.id,
          warehouseId: warehouse.id,
          type: "OUTWARD",
          quantity: 1,
          operatorEmail: "system@sync.com",
          syncStatus: "SUCCESS"
        });
      }
    }

    // 3. Create OrderFulfillment
    const { data: fulfillment } = await supabaseAdmin
      .from("OrderFulfillment")
      .insert({
        companyId: company.id,
        orderId: order.id,
        customerId: customer.id,
        shopifyOrderId,
        orderNumber,
        customerName,
        customerPhone,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        totalWeightKg,
        deliveryStatus: "PROCESSING",
        warehouseId: warehouse ? warehouse.id : null
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      message: "Simulated order ingested successfully into all core schemas",
      order,
      fulfillment
    });
  } catch (error: any) {
    console.error("Order Simulation Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Parse incoming webhook fields (Shopify standard format)
    const shopifyOrderId = body.id?.toString() || body.shopifyOrderId;
    const orderNumber = body.name || body.order_number || body.orderNumber;
    
    // Extract customer info
    const customerPayload = body.customer || {};
    const customerName = `${customerPayload.first_name || ""} ${customerPayload.last_name || ""}`.trim() || body.customerName || "Shopify Customer";
    const customerPhone = customerPayload.phone || body.customerPhone || "Not Provided";
    const customerEmail = customerPayload.email || body.customerEmail || "";

    // Extract shipping address
    const shippingAddress = body.shipping_address || {};
    const shippingAddressLine1 = shippingAddress.address1 || body.shippingAddressLine1 || "";
    const shippingAddressLine2 = shippingAddress.address2 || body.shippingAddressLine2 || "";
    const shippingCity = shippingAddress.city || body.shippingCity || "";
    const shippingState = shippingAddress.province || body.shippingState || "";
    const shippingZip = shippingAddress.zip || body.shippingZip || "";
    const shippingCountry = shippingAddress.country || body.shippingCountry || "";

    const totalPrice = parseFloat(body.total_price || body.totalPrice || "0.0");
    const currency = body.currency || "INR";
    const lineItems = body.line_items || body.lineItems || [];

    if (!shopifyOrderId || !orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields (id, name)" },
        { status: 400 }
      );
    }

    // Resolve company by companyId, code, or fallback to 'syn'
    const companyId = body.companyId;
    let companyQuery = supabaseAdmin.from("Company").select("id");
    if (companyId) {
      companyQuery = companyQuery.eq("id", companyId);
    } else {
      companyQuery = companyQuery.eq("code", "syn");
    }
    let { data: company, error: compErr } = await companyQuery.maybeSingle();

    if (compErr || !company) {
      const { data: newComp } = await supabaseAdmin
        .from("Company")
        .insert({ name: "SEYON", code: "syn" })
        .select("id")
        .single();
      company = newComp;
    }

    if (!company) {
      throw new Error("Unable to resolve tenant company context.");
    }

    // Resolve default warehouse
    let { data: warehouse } = await supabaseAdmin
      .from("Warehouse")
      .select("id")
      .eq("companyId", company.id)
      .eq("isDefaultPickup", true)
      .maybeSingle();

    if (!warehouse) {
      const { data: anyWh } = await supabaseAdmin
        .from("Warehouse")
        .select("id")
        .eq("companyId", company.id)
        .limit(1)
        .maybeSingle();
      warehouse = anyWh;
    }

    // 1. Upsert Customer
    let { data: customer } = await supabaseAdmin
      .from("Customer")
      .select("id")
      .eq("companyId", company.id)
      .eq("phone", customerPhone)
      .maybeSingle();

    if (!customer && customerEmail) {
      const { data: matchEmail } = await supabaseAdmin
        .from("Customer")
        .select("id")
        .eq("companyId", company.id)
        .eq("email", customerEmail)
        .maybeSingle();
      customer = matchEmail;
    }

    if (!customer) {
      const { data: newCust, error: createCustErr } = await supabaseAdmin
        .from("Customer")
        .insert({
          companyId: company.id,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          city: shippingCity,
          state: shippingState,
          zip: shippingZip,
          country: shippingCountry
        })
        .select("id")
        .single();
      if (createCustErr) throw createCustErr;
      customer = newCust;
    } else {
      // Update location info
      await supabaseAdmin
        .from("Customer")
        .update({
          name: customerName,
          city: shippingCity,
          state: shippingState,
          zip: shippingZip,
          country: shippingCountry
        })
        .eq("id", customer.id);
    }

    // 2. Upsert Order
    const { data: existingOrder } = await supabaseAdmin
      .from("Order")
      .select("id")
      .eq("companyId", company.id)
      .eq("shopifyOrderId", shopifyOrderId)
      .maybeSingle();

    let order;
    if (existingOrder) {
      const { data, error } = await supabaseAdmin
        .from("Order")
        .update({
          orderNumber,
          totalPrice,
          paymentStatus: body.financial_status === "paid" ? "PAID" : "PENDING",
          rawPayload: body,
          updatedAt: new Date().toISOString()
        })
        .eq("id", existingOrder.id)
        .select()
        .single();
      if (error) throw error;
      order = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("Order")
        .insert({
          companyId: company.id,
          customerId: customer.id,
          orderNumber,
          shopifyOrderId,
          paymentStatus: body.financial_status === "paid" ? "PAID" : "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          totalPrice,
          currency,
          rawPayload: body
        })
        .select()
        .single();
      if (error) throw error;
      order = data;
    }

    // 3. Process Line Items and Adjust Inventory
    if (!existingOrder) {
      for (const item of lineItems) {
        const itemVariantId = item.variant_id?.toString() || item.variantId;
        const itemSku = item.sku;
        const itemQuantity = parseInt(item.quantity || "1");
        const itemPrice = parseFloat(item.price || "0.0");

        // Find matching ProductVariant
        let variant = null;
        if (itemVariantId) {
          const { data } = await supabaseAdmin
            .from("ProductVariant")
            .select("id, currentStockLevel")
            .eq("companyId", company.id)
            .eq("shopifyVariantId", itemVariantId)
            .maybeSingle();
          variant = data;
        }
        if (!variant && itemSku) {
          const { data } = await supabaseAdmin
            .from("ProductVariant")
            .select("id, currentStockLevel")
            .eq("companyId", company.id)
            .eq("sku", itemSku)
            .maybeSingle();
          variant = data;
        }

        if (variant) {
          // Add OrderItem
          await supabaseAdmin.from("OrderItem").insert({
            orderId: order.id,
            variantId: variant.id,
            quantity: itemQuantity,
            price: itemPrice
          });

          // Decrement stock level
          const newStock = Math.max(0, variant.currentStockLevel - itemQuantity);
          await supabaseAdmin
            .from("ProductVariant")
            .update({ currentStockLevel: newStock })
            .eq("id", variant.id);

          if (warehouse) {
            // Adjust WarehouseStock
            let { data: whStock } = await supabaseAdmin
              .from("WarehouseStock")
              .select("currentStockLevel")
              .eq("warehouseId", warehouse.id)
              .eq("variantId", variant.id)
              .maybeSingle();
            
            if (whStock) {
              await supabaseAdmin
                .from("WarehouseStock")
                .update({ currentStockLevel: Math.max(0, whStock.currentStockLevel - itemQuantity) })
                .eq("warehouseId", warehouse.id)
                .eq("variantId", variant.id);
            }

            // Log movement
            await supabaseAdmin.from("StockMovement").insert({
              companyId: company.id,
              variantId: variant.id,
              warehouseId: warehouse.id,
              type: "OUTWARD",
              quantity: itemQuantity,
              operatorEmail: "shopify-webhook@sync.com",
              syncStatus: "SUCCESS"
            });
          }
        }
      }
    }

    // 4. Upsert OrderFulfillment record
    const { data: existingFulfillment } = await supabaseAdmin
      .from("OrderFulfillment")
      .select("id")
      .eq("companyId", company.id)
      .eq("shopifyOrderId", shopifyOrderId)
      .maybeSingle();

    let fulfillment;
    if (existingFulfillment) {
      const { data } = await supabaseAdmin
        .from("OrderFulfillment")
        .update({
          orderNumber,
          customerName,
          customerPhone,
          shippingAddressLine1,
          shippingAddressLine2,
          shippingCity,
          shippingState,
          shippingZip,
          shippingCountry,
          updatedAt: new Date().toISOString()
        })
        .eq("id", existingFulfillment.id)
        .select()
        .single();
      fulfillment = data;
    } else {
      const { data } = await supabaseAdmin
        .from("OrderFulfillment")
        .insert({
          companyId: company.id,
          orderId: order.id,
          customerId: customer.id,
          shopifyOrderId,
          orderNumber,
          customerName,
          customerPhone,
          shippingAddressLine1,
          shippingAddressLine2,
          shippingCity,
          shippingState,
          shippingZip,
          shippingCountry,
          totalWeightKg: 0.35,
          deliveryStatus: "PROCESSING",
          warehouseId: warehouse ? warehouse.id : null
        })
        .select()
        .single();
      fulfillment = data;
    }

    return NextResponse.json(
      { success: true, order, fulfillment },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    );
  } catch (error: any) {
    console.error("Webhook Ingestion Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
