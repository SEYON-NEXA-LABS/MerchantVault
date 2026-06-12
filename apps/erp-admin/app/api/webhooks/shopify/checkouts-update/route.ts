import { NextResponse } from "next/server";
import { supabaseAdmin } from "@repo/db";

const MOCK_NAMES = [
  "Amit Sharma",
  "Priya Patel",
  "Rajesh Kumar",
  "Sunita Rao",
  "Rahul Mehta"
];

const MOCK_PHONES = [
  "+919812345678",
  "+919823456789",
  "+919834567890",
  "+919845678901",
  "+919856789012"
];

export async function GET() {
  try {
    // Resolve company
    let { data: company, error: compErr } = await supabaseAdmin
      .from("Company")
      .select("id")
      .eq("code", "syn")
      .maybeSingle();

    if (compErr || !company) {
      const { data: newComp } = await supabaseAdmin
        .from("Company")
        .insert({ name: "SEYON", code: "syn" })
        .select("id")
        .single();
      company = newComp;
    }

    if (!company) throw new Error("Tenant company not found.");

    // Generate random checkout details
    const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    const phone = MOCK_PHONES[Math.floor(Math.random() * MOCK_PHONES.length)];
    const cartValue = Math.floor(Math.random() * 6000) + 1500;
    const shopifyCartId = `cart-${Math.floor(Math.random() * 900000) + 100000}`;

    // Upsert Customer
    let { data: customer } = await supabaseAdmin
      .from("Customer")
      .select("id")
      .eq("companyId", company.id)
      .eq("phone", phone)
      .maybeSingle();

    if (!customer) {
      const { data: newCust } = await supabaseAdmin
        .from("Customer")
        .insert({
          companyId: company.id,
          name,
          phone,
          email: `${name.toLowerCase().replace(" ", "")}@mock.com`,
          city: "Delhi",
          state: "Delhi",
          zip: "110001",
          country: "India"
        })
        .select("id")
        .single();
      customer = newCust;
    }

    // Insert AbandonedCheckout
    const { data: checkout, error: checkoutErr } = await supabaseAdmin
      .from("AbandonedCheckout")
      .insert({
        companyId: company.id,
        customerId: customer ? customer.id : null,
        shopifyCartId,
        customerPhone: phone,
        customerName: name,
        cartValue,
        recoveryStatus: "PENDING"
      })
      .select()
      .single();

    if (checkoutErr) throw checkoutErr;

    return NextResponse.json({
      success: true,
      message: "Simulated abandoned checkout ingested successfully",
      checkout
    });
  } catch (error: any) {
    console.error("Simulation Abandoned Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Shopify webhook payload structure: checkouts/update
    const shopifyCartId = body.id?.toString() || body.token || body.shopifyCartId;
    const cartValue = parseFloat(body.total_price || body.cartValue || "0.0");
    
    const customerPayload = body.customer || {};
    const customerName = `${customerPayload.first_name || ""} ${customerPayload.last_name || ""}`.trim() || body.customerName || "Shopify Customer";
    const customerPhone = customerPayload.phone || body.customerPhone || "Not Provided";
    const customerEmail = customerPayload.email || body.customerEmail || "";

    if (!shopifyCartId) {
      return NextResponse.json(
        { error: "Missing required field shopifyCartId/token" },
        { status: 400 }
      );
    }

    // Resolve company
    let { data: company } = await supabaseAdmin
      .from("Company")
      .select("id")
      .eq("code", "syn")
      .maybeSingle();

    if (!company) {
      const { data: newComp } = await supabaseAdmin
        .from("Company")
        .insert({ name: "SEYON", code: "syn" })
        .select("id")
        .single();
      company = newComp;
    }

    if (!company) {
      throw new Error("Unable to resolve company context.");
    }

    // Upsert Customer
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
      const { data: newCust } = await supabaseAdmin
        .from("Customer")
        .insert({
          companyId: company.id,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          city: body.shipping_address?.city || "",
          state: body.shipping_address?.province || "",
          zip: body.shipping_address?.zip || "",
          country: body.shipping_address?.country || ""
        })
        .select("id")
        .single();
      customer = newCust;
    }

    // Upsert AbandonedCheckout
    const { data: existingCheckout } = await supabaseAdmin
      .from("AbandonedCheckout")
      .select("id")
      .eq("companyId", company.id)
      .eq("shopifyCartId", shopifyCartId)
      .maybeSingle();

    let checkout;
    if (existingCheckout) {
      const { data, error } = await supabaseAdmin
        .from("AbandonedCheckout")
        .update({
          customerName,
          customerPhone,
          cartValue,
          customerId: customer ? customer.id : null,
          updatedAt: new Date().toISOString()
        })
        .eq("id", existingCheckout.id)
        .select()
        .single();
      if (error) throw error;
      checkout = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("AbandonedCheckout")
        .insert({
          companyId: company.id,
          shopifyCartId,
          customerPhone,
          customerName,
          cartValue,
          customerId: customer ? customer.id : null,
          recoveryStatus: "PENDING"
        })
        .select()
        .single();
      if (error) throw error;
      checkout = data;
    }

    return NextResponse.json({ success: true, checkout });
  } catch (error: any) {
    console.error("Webhook Abandoned Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
