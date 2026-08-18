import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("Vendor")
      .select("id, companyId, name, email, phone, address, state, gstin, notes, isActive, createdAt, updatedAt")
      .eq("companyId", companyId)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Fetch Vendors Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, address, state, gstin, notes } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("Vendor")
      .insert({
        companyId,
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        address: address || null,
        state: state || "Tamil Nadu",
        gstin: gstin || null,

        notes: notes || null,
        isActive: true,
      })
      .select("id, name, email, phone, address, state, gstin, notes, isActive, createdAt")
      .single();


    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Create Vendor Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
