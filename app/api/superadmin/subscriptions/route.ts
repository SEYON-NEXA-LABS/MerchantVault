import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Fetch all companies
    const { data: companies, error: compErr } = await supabase
      .from("Company")
      .select("id, name, code, contactEmail, logoUrl, timezone, currency, onboardingCompleted, onboardingStep, isActive, createdAt")
      .order("name", { ascending: true });

    if (compErr) throw compErr;

    // 2. Fetch all subscriptions
    const { data: subscriptions, error: subErr } = await supabase
      .from("Subscription")
      .select("id, companyId, planType, amount, amcAmount, currency, status, nextRenewalDate, createdAt, updatedAt");

    if (subErr) throw subErr;

    // 3. Map subscriptions to companies
    const mapped = (companies || []).map(comp => {
      const sub = (subscriptions || []).find(s => s.companyId === comp.id);
      return {
        ...comp,
        subscription: sub || null
      };
    });

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Superadmin Fetch Subscriptions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      companyId, 
      planType, 
      amount, 
      amcAmount, 
      currency, 
      status, 
      nextRenewalDate,
      resetRenewalToday
    } = body;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Determine final next renewal date if resetRenewalToday is true
    let renewalDateStr = nextRenewalDate;
    if (resetRenewalToday) {
      const today = new Date();
      if (planType === "MONTHLY") {
        today.setMonth(today.getMonth() + 1);
      } else if (planType === "YEARLY" || planType === "ONETIME_AMC") {
        today.setFullYear(today.getFullYear() + 1);
      } else {
        today.setDate(today.getDate() + 14); // Default 14 days for trials/others
      }
      renewalDateStr = today.toISOString();
    }

    // Check if subscription exists
    const { data: existingSub } = await supabase
      .from("Subscription")
      .select("id")
      .eq("companyId", companyId)
      .maybeSingle();

    let result;
    if (existingSub) {
      const { data, error } = await supabase
        .from("Subscription")
        .update({
          planType,
          amount: parseFloat(amount) || 0,
          amcAmount: parseFloat(amcAmount) || 0,
          currency: currency || "INR",
          status: status || "ACTIVE",
          nextRenewalDate: renewalDateStr,
          updatedAt: new Date().toISOString()
        })
        .eq("id", existingSub.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("Subscription")
        .insert({
          companyId,
          planType,
          amount: parseFloat(amount) || 0,
          amcAmount: parseFloat(amcAmount) || 0,
          currency: currency || "INR",
          status: status || "ACTIVE",
          nextRenewalDate: renewalDateStr || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Superadmin Save Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
