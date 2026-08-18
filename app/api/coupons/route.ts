import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

// GET /api/coupons - List all coupons for current company
export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const { data: coupons, error } = await supabase
      .from("Coupons")
      .select("*")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, coupons: coupons || [] });
  } catch (error: any) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST /api/coupons - Create a new coupon
export async function POST(request: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      discountType = "PERCENTAGE",
      discountValue,
      minOrderValue = 0,
      maxDiscountAmount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive = true
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Code and discount value are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Upsert or Insert
    const { data: coupon, error } = await supabase
      .from("Coupons")
      .insert({
        companyId,
        code: cleanCode,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || "0"),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startsAt: startsAt || null,
        expiresAt: expiresAt || null,
        isActive
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        return NextResponse.json({ error: `Coupon code '${cleanCode}' already exists` }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

// DELETE /api/coupons?id=... - Toggle status or delete coupon
export async function DELETE(request: Request) {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context missing" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Coupons")
      .delete()
      .eq("id", id)
      .eq("companyId", companyId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/coupons error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}
