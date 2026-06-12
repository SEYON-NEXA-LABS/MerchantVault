import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  "+91 9876543210",
  "+91 9123456789",
  "+91 8888888888",
  "+91 9999999999",
  "+91 7777777777"
];

export async function GET() {
  try {
    // Upsert company using supabase
    let { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "syn")
      .maybeSingle();

    if (compErr || !company) {
      const { data: newComp, error: createErr } = await supabase
        .from("Company")
        .insert({ name: "SEYON", code: "syn" })
        .select("id")
        .single();
      
      if (createErr) throw createErr;
      company = newComp;
    }

    // Generate simulated order
    const randId = Math.floor(Math.random() * 900000) + 100000;
    const shopifyOrderId = `sh-ord-${randId}`;
    const orderNumber = `#ORD-${Math.floor(Math.random() * 9000) + 10000}`;
    const customerName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    const customerPhone = MOCK_PHONES[Math.floor(Math.random() * MOCK_PHONES.length)];
    const totalWeightKg = parseFloat((Math.random() * 0.8 + 0.15).toFixed(2));
    const shippingAddressLine1 = `${Math.floor(Math.random() * 900) + 100}, Park Avenue`;
    const shippingAddressLine2 = "Sector 4";
    const shippingCity = "Mumbai";
    const shippingState = "Maharashtra";
    const shippingZip = `${Math.floor(Math.random() * 90000) + 400000}`;
    const shippingCountry = "India";

    const { data: order, error: orderErr } = await supabase
      .from("OrderFulfillment")
      .insert({
        companyId: company.id,
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
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    return NextResponse.json({
      success: true,
      message: "Simulated order ingested successfully",
      order
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
    
    // Upsert company
    let { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "syn")
      .maybeSingle();

    if (compErr || !company) {
      const { data: newComp, error: createErr } = await supabase
        .from("Company")
        .insert({ name: "SEYON", code: "syn" })
        .select("id")
        .single();
      
      if (createErr) throw createErr;
      company = newComp;
    }

    const { 
      shopifyOrderId, 
      orderNumber, 
      customerName, 
      customerPhone, 
      totalWeightKg,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry
    } = body;

    if (!shopifyOrderId || !orderNumber || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert order
    const { data: existingOrder } = await supabase
      .from("OrderFulfillment")
      .select("id")
      .eq("companyId", company.id)
      .eq("shopifyOrderId", shopifyOrderId)
      .maybeSingle();

    let order;
    if (existingOrder) {
      const { data, error } = await supabase
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
          totalWeightKg: totalWeightKg || 0.35,
        })
        .eq("id", existingOrder.id)
        .select()
        .single();
      if (error) throw error;
      order = data;
    } else {
      const { data, error } = await supabase
        .from("OrderFulfillment")
        .insert({
          companyId: company.id,
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
          totalWeightKg: totalWeightKg || 0.35,
          deliveryStatus: "PROCESSING",
        })
        .select()
        .single();
      if (error) throw error;
      order = data;
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Webhook Ingestion Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
