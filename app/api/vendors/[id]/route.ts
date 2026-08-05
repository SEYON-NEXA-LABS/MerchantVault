import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("Vendor")
      .select("id, companyId, name, email, phone, address, gstin, notes, isActive, createdAt, updatedAt")
      .eq("id", id)
      .eq("companyId", companyId)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Get Vendor Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, address, gstin, notes, isActive } = body;

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (gstin !== undefined) updateData.gstin = gstin || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const { data, error } = await supabase
      .from("Vendor")
      .update(updateData)
      .eq("id", id)
      .eq("companyId", companyId)
      .select("id, name, email, phone, address, gstin, notes, isActive, createdAt, updatedAt")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Update Vendor Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
