import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

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

    if (action === "TOGGLE_COMPANY_ACTIVE") {
      const { companyId, isActive } = body;
      if (!companyId) {
        return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("Company")
        .update({ isActive: !!isActive })
        .eq("id", companyId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, company: data });
    }

    if (action === "UPDATE_COMPANY_METADATA") {
      const { companyId, name, contactEmail, logoUrl, timezone, currency, themeConfig } = body;
      if (!companyId) {
        return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (contactEmail !== undefined) updates.contactEmail = contactEmail;
      if (logoUrl !== undefined) updates.logoUrl = logoUrl;
      if (timezone) updates.timezone = timezone;
      if (currency) updates.currency = currency;
      if (themeConfig !== undefined) updates.themeConfig = themeConfig;


      const { data, error } = await supabase
        .from("Company")
        .update(updates)
        .eq("id", companyId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, company: data });
    }

    if (action === "CREATE_WAREHOUSE") {
      const { companyId, name, code, addressLine1, city, state, zip, country, isDefaultPickup } = body;
      if (!companyId || !name || !code) {
        return NextResponse.json({ error: "Company ID, name, and code are required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("Warehouse")
        .insert({
          companyId,
          name,
          code,
          addressLine1: addressLine1 || "",
          city: city || "",
          state: state || "",
          zip: zip || "",
          country: country || "",
          isDefaultPickup: !!isDefaultPickup
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, warehouse: data });
    }

    if (action === "UPDATE_WAREHOUSE") {
      const { warehouseId, name, code, addressLine1, city, state, zip, country, isDefaultPickup } = body;
      if (!warehouseId) {
        return NextResponse.json({ error: "Warehouse ID is required" }, { status: 400 });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (code) updates.code = code;
      if (addressLine1 !== undefined) updates.addressLine1 = addressLine1;
      if (city !== undefined) updates.city = city;
      if (state !== undefined) updates.state = state;
      if (zip !== undefined) updates.zip = zip;
      if (country !== undefined) updates.country = country;
      if (isDefaultPickup !== undefined) updates.isDefaultPickup = !!isDefaultPickup;

      const { data, error } = await supabase
        .from("Warehouse")
        .update(updates)
        .eq("id", warehouseId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, warehouse: data });
    }

    if (action === "DELETE_WAREHOUSE") {
      const { warehouseId } = body;
      if (!warehouseId) {
        return NextResponse.json({ error: "Warehouse ID is required" }, { status: 400 });
      }

      const { error } = await supabase
        .from("Warehouse")
        .delete()
        .eq("id", warehouseId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "CREATE_BRAND") {
      const { companyId, name, code, logoUrl, themeConfig } = body;
      if (!companyId || !name || !code) {
        return NextResponse.json({ error: "Company ID, name, and code are required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("Brand")
        .insert({
          companyId,
          name,
          code: code.toLowerCase().trim(),
          logoUrl: logoUrl || null,
          themeConfig: themeConfig || null
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, brand: data });
    }

    if (action === "UPDATE_BRAND") {
      const { brandId, name, code, logoUrl, themeConfig } = body;
      if (!brandId) {
        return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (code) updates.code = code.toLowerCase().trim();
      if (logoUrl !== undefined) updates.logoUrl = logoUrl;
      if (themeConfig !== undefined) updates.themeConfig = themeConfig;


      const { data, error } = await supabase
        .from("Brand")
        .update(updates)
        .eq("id", brandId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, brand: data });
    }

    if (action === "DELETE_BRAND") {
      const { brandId } = body;
      if (!brandId) {
        return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
      }

      const { error } = await supabase
        .from("Brand")
        .delete()
        .eq("id", brandId);

      if (error) throw error;
      return NextResponse.json({ success: true });
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

    // Validate adminUsername (only alphanumeric, no special characters/spaces)
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(adminUsername)) {
      return NextResponse.json({ error: "Username must contain only alphanumeric characters (no special characters or spaces)." }, { status: 400 });
    }

    // Verify Username is unique globally
    const { data: existingUser } = await supabase
      .from("User")
      .select("id")
      .eq("username", adminUsername.trim())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: `Username "${adminUsername}" is already taken.` }, { status: 400 });
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
        addressLine1: "Avinashi Road, Peelamedu",
        city: "Coimbatore",
        state: "Tamil Nadu",
        zip: "641004",
        country: "India",
        isDefaultPickup: true
      });

    if (whErr) console.error("Onboarding default warehouse error:", whErr);

    // 4b. Create Default Brands
    const brandsToInsert = code.toLowerCase() === "wolfcabin"
      ? [
          { companyId: company.id, name: "The Wolf Cabin", code: "wolfcabin" },
          { companyId: company.id, name: "Alpha Brand", code: "alpha" }
        ]
      : [
          { companyId: company.id, name: name, code: code.toLowerCase().trim() }
        ];

    const { error: brandErr } = await supabase
      .from("Brand")
      .insert(brandsToInsert);

    if (brandErr) console.error("Onboarding default brands error:", brandErr);

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
