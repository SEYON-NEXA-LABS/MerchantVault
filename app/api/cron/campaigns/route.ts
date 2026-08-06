import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@repo/db";

// Cron endpoint to run every minute / 5 minutes via Vercel Cron or Hostinger crontab
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Optional CRON_SECRET security check
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const now = new Date().toISOString();

    // 1. Auto-activate pending campaigns whose startTime has arrived
    const { data: activated, error: actErr } = await supabaseAdmin
      .from("Campaign")
      .update({ isActive: true, updatedAt: now })
      .lte("startTime", now)
      .gte("endTime", now)
      .eq("isActive", false)
      .select("id, name, companyId");

    if (actErr) console.error("Cron Activation Error:", actErr);

    // 2. Auto-deactivate expired campaigns whose endTime has passed
    const { data: expired, error: expErr } = await supabaseAdmin
      .from("Campaign")
      .update({ isActive: false, updatedAt: now })
      .lt("endTime", now)
      .eq("isActive", true)
      .select("id, name, companyId");

    if (expErr) console.error("Cron Expiration Error:", expErr);

    return NextResponse.json({
      success: true,
      timestamp: now,
      activatedCampaigns: activated || [],
      expiredCampaigns: expired || []
    });
  } catch (err: any) {
    console.error("Cron Engine Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
