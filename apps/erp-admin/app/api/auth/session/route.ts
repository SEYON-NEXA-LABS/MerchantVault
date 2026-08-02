import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const user = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      
      let company = null;
      let warehouses: any[] = [];

      // Query database if we have a resolved companyId
      if (user.companyId && user.companyId !== "00000000-0000-0000-0000-000000000000") {
        const { data: coData } = await supabase
          .from("Company")
          .select("*")
          .eq("id", user.companyId)
          .maybeSingle();
        
        company = coData;

        const { data: whData } = await supabase
          .from("Warehouse")
          .select("id, name, code, addressLine1, addressLine2, city, state, zip, country, isDefaultPickup")
          .eq("companyId", user.companyId)
          .order("createdAt", { ascending: false });

        warehouses = whData || [];
      } else {
        // Fallback for unseeded state: look up by companyCode
        const code = user.companyCode || "syn";
        const { data: coData } = await supabase
          .from("Company")
          .select("*")
          .eq("code", code)
          .maybeSingle();

        if (coData) {
          company = coData;
          const { data: whData } = await supabase
            .from("Warehouse")
            .select("id, name, code, addressLine1, addressLine2, city, state, zip, country, isDefaultPickup")
            .eq("companyId", coData.id)
            .order("createdAt", { ascending: false });

          warehouses = whData || [];
        }
      }

      // Sanitize company object before sending to browser client (Omit raw secret tokens)
      let safeCompany = null;
      if (company) {
        const { shopifyAccessToken, shopifyClientSecret, shopifyWebhookSecret, whatsappApiKey, ...rest } = company;
        safeCompany = {
          ...rest,
          hasShopifyAccessToken: Boolean(shopifyAccessToken),
          hasShopifySecretKey: Boolean(shopifyWebhookSecret)
        };
      }

      return NextResponse.json({ 
        authenticated: true, 
        user, 
        company: safeCompany, 
        warehouses 
      });
    } catch (e) {
      return NextResponse.json({ authenticated: false, error: "Invalid session token" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
