import { NextResponse } from "next/server";
import { getContextCompanyId } from "@/lib/session";
import { Client } from "pg";
import { supabase } from "@/lib/supabase";

// Run self-healing schema migrations
async function ensureSchema() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return;

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await client.query(`
      ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "codVerificationStatus" TEXT DEFAULT 'PENDING';
      ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "rtoRiskScore" TEXT DEFAULT 'LOW';
      ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "shippingCost" DOUBLE PRECISION DEFAULT 0.0;
      ALTER TABLE "OrderFulfillment" ADD COLUMN IF NOT EXISTS "customerShippingFee" DOUBLE PRECISION DEFAULT 0.0;
    `);
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await client.end();
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { orderIds, courierPartner } = await request.json();
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !courierPartner) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedOrders = [];

    for (const orderId of orderIds) {
      // Generate mock AWB
      const prefix = courierPartner.slice(0, 3).toUpperCase();
      const randomNum = Math.floor(100000000 + Math.random() * 900000000);
      const awbNumber = `${prefix}${randomNum}`;

      // Simulated pricing
      const shippingCost = Math.floor(Math.random() * 70) + 60; // 60 to 130
      const customerShippingFee = Math.random() > 0.5 ? 40 : 0; // 0 or 40

      const { data: updated, error: updateErr } = await supabase
        .from("OrderFulfillment")
        .update({
          awbNumber,
          courierPartner,
          deliveryStatus: "PROCESSING",
          shippingCost,
          customerShippingFee
        })
        .eq("id", orderId)
        .eq("companyId", companyId)
        .select()
        .single();

      if (updateErr) {
        console.error(`Error updating order ${orderId}:`, updateErr);
      } else if (updated) {
        updatedOrders.push(updated);
      }
    }

    return NextResponse.json({ success: true, orders: updatedOrders });
  } catch (error: any) {
    console.error("Bulk Ship Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
