import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("CourierConfig")
      .select("id, companyId, courierPartner, apiEmail, apiPassword, apiKey, apiSecret, isActive, createdAt, updatedAt")
      .eq("companyId", companyId);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Fetch Courier Configs Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courierPartner, apiEmail, apiPassword, apiKey, apiSecret, isActive } = body;

    if (!courierPartner) {
      return NextResponse.json({ error: "Courier partner is required" }, { status: 400 });
    }

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from("CourierConfig")
      .select("id")
      .eq("companyId", companyId)
      .eq("courierPartner", courierPartner)
      .maybeSingle();

    let result;
    if (existingConfig) {
      const { data, error } = await supabase
        .from("CourierConfig")
        .update({
          apiEmail,
          apiPassword,
          apiKey,
          apiSecret,
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date().toISOString()
        })
        .eq("id", existingConfig.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("CourierConfig")
        .insert({
          companyId: companyId,
          courierPartner,
          apiEmail,
          apiPassword,
          apiKey,
          apiSecret,
          isActive: isActive !== undefined ? isActive : true
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Save Courier Config Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
