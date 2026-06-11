import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "vtex")
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { data: warehouses, error: whErr } = await supabase
      .from("Warehouse")
      .select("*")
      .eq("companyId", company.id)
      .order("createdAt", { ascending: false });

    if (whErr) throw whErr;

    return NextResponse.json(warehouses || []);
  } catch (error: any) {
    console.error("Fetch Warehouses Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, code, addressLine1, addressLine2, city, state, zip, country, isDefaultPickup } = body;

    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id")
      .eq("code", "vtex")
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!name || !code || !addressLine1 || !city || !state || !zip || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isDefaultPickup) {
      // Reset default pickup status for all other warehouses of the company
      const { error: resetErr } = await supabase
        .from("Warehouse")
        .update({ isDefaultPickup: false })
        .eq("companyId", company.id);

      if (resetErr) throw resetErr;
    }

    let result;
    if (id) {
      // Update
      const { data, error } = await supabase
        .from("Warehouse")
        .update({
          name,
          code,
          addressLine1,
          addressLine2,
          city,
          state,
          zip,
          country,
          isDefaultPickup: !!isDefaultPickup,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create
      const { data, error } = await supabase
        .from("Warehouse")
        .insert({
          companyId: company.id,
          name,
          code,
          addressLine1,
          addressLine2,
          city,
          state,
          zip,
          country,
          isDefaultPickup: !!isDefaultPickup,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Save Warehouse Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing warehouse id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Warehouse")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Warehouse Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
