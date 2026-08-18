import { generateProductOpenGraphMetadata, generateOrganizationSchema, generateProductSchema } from "@/app/utils/seo";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import type { Metadata } from "next";

import { headers } from "next/headers";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // Extract current incoming request host (e.g. wolfcabin.in or tenant.seyon.app)
  const headerList = await headers();
  const currentHost = headerList.get("host");

  try {
    // 1. Fetch ProductVariant by ID or SKU
    const { data: variant } = await supabase
      .from("ProductVariant")
      .select("id, sku, title, price, currentStockLevel, category, color, size, companyId")
      .or(`id.eq.${productId},sku.eq.${productId}`)
      .maybeSingle();

    if (!variant) {
      return {
        title: "Product Not Found — Seyon Shopping",
        description: "The requested product is no longer available."
      };
    }

    // 2. Fetch Tenant Company Details
    const { data: company } = await supabase
      .from("Company")
      .select("id, name, storeName, code, customDomain, logoUrl, gstin, contactEmail, whatsappNumber")
      .eq("id", variant.companyId)
      .maybeSingle();

    // 3. Format SEO Metadata payload
    const productSeo = {
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      price: variant.price || 0,
      currentStockLevel: variant.currentStockLevel || 0,
      category: variant.category,
      color: variant.color,
      size: variant.size
    };

    return generateProductOpenGraphMetadata(productSeo, company, currentHost);

  } catch (err) {
    console.error("Error generating product metadata:", err);
    return {
      title: "Product — Seyon Shopping",
      description: "Discover quality retail products at Seyon Shopping."
    };
  }
}

export default async function ProductLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // Render JSON-LD Structured Data script tags on server
  let jsonLdOrg = null;
  let jsonLdProduct = null;

  try {
    const { data: variant } = await supabase
      .from("ProductVariant")
      .select("id, sku, title, price, currentStockLevel, category, color, size, companyId")
      .or(`id.eq.${productId},sku.eq.${productId}`)
      .maybeSingle();

    if (variant) {
      const { data: company } = await supabase
        .from("Company")
        .select("id, name, storeName, code, customDomain, logoUrl, gstin, contactEmail, whatsappNumber")
        .eq("id", variant.companyId)
        .maybeSingle();

      const productSeo = {
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        price: variant.price || 0,
        currentStockLevel: variant.currentStockLevel || 0,
        category: variant.category,
        color: variant.color,
        size: variant.size
      };

      jsonLdOrg = generateOrganizationSchema(company);
      jsonLdProduct = generateProductSchema(productSeo, company);
    }
  } catch (e) {
    // Fail gracefully
  }

  return (
    <>
      {jsonLdOrg && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      )}
      {jsonLdProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
        />
      )}
      {children}
    </>
  );
}
