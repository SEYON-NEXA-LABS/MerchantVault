import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {

  try {
    const { searchParams } = new URL(req.url);
    const host = req.headers.get("host") || "";
    const brandParam = searchParams.get("brand");
    const slugParam = searchParams.get("slug");

    let company: any = null;

    if (slugParam) {
      const { data } = await supabase.from("Company").select("id, name, code, customDomain").eq("code", slugParam.toLowerCase()).maybeSingle();
      company = data;
    } else if (brandParam) {
      const { data: b } = await supabase.from("Brand").select("companyId").eq("code", brandParam.toLowerCase()).maybeSingle();
      if (b) {
        const { data } = await supabase.from("Company").select("id, name, code, customDomain").eq("id", b.companyId).maybeSingle();
        company = data;
      }
    } else if (host && !host.includes("localhost") && !host.includes("vercel.app")) {
      const cleanHost = host.split(":")[0].toLowerCase();
      const { data } = await supabase.from("Company").select("id, name, code, customDomain").eq("customDomain", cleanHost).maybeSingle();
      company = data;
    }

    if (!company) {
      const { data } = await supabase.from("Company").select("id, name, code, customDomain").limit(1).maybeSingle();
      company = data;
    }

    const domain = company?.customDomain ? `https://${company.customDomain}` : `https://${company?.code || "store"}.merchantvault.com`;

    let products: any[] = [];
    if (company?.id) {
      const { data } = await supabase.from("ProductVariant").select("sku, updatedAt").eq("companyId", company.id).limit(100);
      products = data || [];
    }

    const lastmod = new Date().toISOString().split("T")[0];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${products.map(p => `
  <url>
    <loc>${domain}/?sku=${p.sku}</loc>
    <lastmod>${p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join("")}
</urlset>`;

    return new NextResponse(sitemapXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch (error: any) {
    console.error("Dynamic sitemap generation error:", error);
    return new NextResponse("<urlset></urlset>", { headers: { "Content-Type": "application/xml" } });
  }
}
