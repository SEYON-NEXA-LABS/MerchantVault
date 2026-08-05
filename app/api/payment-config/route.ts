import { NextResponse } from "next/server";
import { supabase } from "@repo/db";

export async function GET() {
  try {
    const { data: company, error } = await supabase
      .from("Company")
      .select("razorpayEnabled, razorpayKeyId")
      .limit(1)
      .maybeSingle();

    if (error || !company) {
      return NextResponse.json({ enabled: false, keyId: "" });
    }

    return NextResponse.json({
      enabled: Boolean(company.razorpayEnabled),
      keyId: company.razorpayKeyId || ""
    });
  } catch (error: any) {
    return NextResponse.json({ enabled: false, keyId: "" }, { status: 500 });
  }
}
