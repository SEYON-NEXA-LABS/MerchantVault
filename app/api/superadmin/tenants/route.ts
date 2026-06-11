import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Action switch: Onboard vs Reset Password
    const { action } = body;

    if (action === "RESET_PASSWORD") {
      const { companyId, newPassword } = body;
      if (!companyId || !newPassword) {
        return NextResponse.json({ error: "Company ID and new password are required" }, { status: 400 });
      }

      // Fetch the Tenant Admin user for this company
      const { data: adminUser, error: fetchErr } = await supabase
        .from("User")
        .select("id, username")
        .eq("companyId", companyId)
        .eq("role", "TENANTADMIN")
        .maybeSingle();

      if (fetchErr || !adminUser) {
        return NextResponse.json({ error: "Tenant Administrator account not found" }, { status: 404 });
      }

      // Update password
      const { error: updateErr } = await supabase
        .from("User")
        .update({ password: newPassword })
        .eq("id", adminUser.id);

      if (updateErr) throw updateErr;

      return NextResponse.json({ success: true, username: adminUser.username });
    }

    // Default: Onboarding Flow
    const { 
      name, 
      code, 
      contactEmail, 
      adminUsername, 
      adminPassword,
      planType,
      amount,
      currency
    } = body;

    if (!name || !code || !adminUsername || !adminPassword) {
      return NextResponse.json({ error: "Missing required onboarding fields" }, { status: 400 });
    }

    // 1. Verify Company code is unique
    const { data: existingComp } = await supabase
      .from("Company")
      .select("id")
      .eq("code", code.toLowerCase())
      .maybeSingle();

    if (existingComp) {
      return NextResponse.json({ error: `Company code "${code}" already exists.` }, { status: 400 });
    }

    // 2. Create the Company
    const { data: company, error: compErr } = await supabase
      .from("Company")
      .insert({
        name,
        code: code.toLowerCase().trim(),
        contactEmail,
        currency: currency || "INR",
        timezone: "IST",
        onboardingCompleted: true
      })
      .select()
      .single();

    if (compErr || !company) throw compErr || new Error("Failed to create company");

    // 3. Create the Tenant Admin account
    const email = `${adminUsername.toLowerCase()}@${code.toLowerCase()}.local`;
    const { error: userErr } = await supabase
      .from("User")
      .insert({
        companyId: company.id,
        username: adminUsername.trim(),
        password: adminPassword,
        email,
        role: "TENANTADMIN",
        isActive: true
      });

    if (userErr) {
      // Rollback Company
      await supabase.from("Company").delete().eq("id", company.id);
      throw userErr;
    }

    // 4. Create the Default Warehouse
    const { error: whErr } = await supabase
      .from("Warehouse")
      .insert({
        companyId: company.id,
        name: "Primary Fulfillment Hub",
        code: "WH-01",
        addressLine1: "100 Operational Boulevard",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
        country: "India",
        isDefaultPickup: true
      });

    if (whErr) console.error("Onboarding default warehouse error:", whErr);

    // 5. Create the initial Subscription config
    const nextRenewalDate = new Date();
    if (planType === "MONTHLY") {
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
    } else if (planType === "YEARLY" || planType === "ONETIME_AMC") {
      nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
    } else {
      nextRenewalDate.setDate(nextRenewalDate.getDate() + 14); // 14 days trial
    }

    const { error: subErr } = await supabase
      .from("Subscription")
      .insert({
        companyId: company.id,
        planType: planType || "FREE_TRIAL",
        amount: parseFloat(amount) || 0,
        currency: currency || "INR",
        status: "ACTIVE",
        nextRenewalDate: nextRenewalDate.toISOString()
      });

    if (subErr) console.error("Onboarding subscription error:", subErr);

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error("Superadmin Onboarding Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
