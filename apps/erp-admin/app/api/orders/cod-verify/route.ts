import { NextResponse } from "next/server";
import { getContextCompanyId } from "@/lib/session";
import { Client } from "pg";

export async function POST(request: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "Database URL not configured" }, { status: 500 });
    }

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    let order;
    try {
      const res = await client.query(
        `UPDATE "OrderFulfillment"
         SET "codVerificationStatus" = $1
         WHERE "id" = $2 AND "companyId" = $3
         RETURNING *`,
        [status, orderId, companyId]
      );
      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      order = res.rows[0];
    } finally {
      await client.end();
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("COD Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
