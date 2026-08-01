import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error: any) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Build update payload from allowed fields
    const allowedFields = [
      "name", "shopifyStoreUrl", "shopifyAccessToken", "shopifyWebhookSecret",
      "whatsappNumber", "whatsappApiKey", "timezone",
      "currency", "contactEmail", "logoUrl", "taxId", "gstin", "lowStockMode"
    ];

    const updateData: { [key: string]: any } = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Company")
      .update(updateData)
      .eq("id", companyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, company: data });
  } catch (error: any) {
    console.error("Settings POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
