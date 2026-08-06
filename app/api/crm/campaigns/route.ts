import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ campaigns: [] });
    }

    const { data: campaigns, error } = await supabase
      .from("Campaign")
      .select("*")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (err: any) {
    console.error("Fetch Campaigns Error:", err);
    return NextResponse.json({ campaigns: [], error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, discountType, discountValue, startTime, endTime, targetSegment, bannerText, promoCode } = body;

    if (!name || !discountValue) {
      return NextResponse.json({ error: "Name and discount value are required" }, { status: 400 });
    }

    const now = new Date();
    const start = startTime ? new Date(startTime) : now;
    const end = endTime ? new Date(endTime) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isActive = now >= start && now <= end;

    const { data: campaign, error } = await supabase
      .from("Campaign")
      .insert({
        companyId,
        name,
        type: type || "FLASH_SALE",
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isActive,
        targetSegment: targetSegment || "ALL",
        bannerText: bannerText || `🔥 ${name} LIVE! Use code ${promoCode || "SALE"}`,
        promoCode: promoCode || "SALE50"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, campaign });
  } catch (err: any) {
    console.error("Create Campaign Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create campaign" }, { status: 500 });
  }
}
