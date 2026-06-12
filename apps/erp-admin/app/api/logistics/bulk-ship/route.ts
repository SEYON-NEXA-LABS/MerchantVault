import { NextResponse } from "next/server";
import { getContextCompanyId } from "@/lib/session";
import { Client } from "pg";

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

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "Database URL not configured" }, { status: 500 });
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    const updatedOrders = [];

    try {
      for (const orderId of orderIds) {
        // Generate mock AWB
        const prefix = courierPartner.slice(0, 3).toUpperCase();
        const randomNum = Math.floor(100000000 + Math.random() * 900000000);
        const awbNumber = `${prefix}${randomNum}`;

        // Simulated pricing
        const shippingCost = Math.floor(Math.random() * 70) + 60; // 60 to 130
        const customerShippingFee = Math.random() > 0.5 ? 40 : 0; // 0 or 40

        const res = await client.query(
          `UPDATE "OrderFulfillment" 
           SET "awbNumber" = $1, 
               "courierPartner" = $2, 
               "deliveryStatus" = 'PROCESSING',
               "shippingCost" = $3,
               "customerShippingFee" = $4
           WHERE "id" = $5 AND "companyId" = $6
           RETURNING *`,
          [awbNumber, courierPartner, shippingCost, customerShippingFee, orderId, companyId]
        );

        if (res.rows.length > 0) {
          updatedOrders.push(res.rows[0]);
        }
      }
    } finally {
      await client.end();
    }

    return NextResponse.json({ success: true, orders: updatedOrders });
  } catch (error: any) {
    console.error("Bulk Ship Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
