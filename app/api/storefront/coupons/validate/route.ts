import { NextResponse } from "next/server";
import { supabaseAdmin } from "@repo/db";

// POST /api/storefront/coupons/validate - Public endpoint to validate coupon code at storefront checkout
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, cartSubtotal = 0, companyId } = body;

    if (!code) {
      return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Query active coupon for company or default
    let query = supabaseAdmin
      .from("Coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("isActive", true);

    if (companyId) {
      query = query.eq("companyId", companyId);
    }

    const { data: coupon, error } = await query.maybeSingle();

    if (error || !coupon) {
      return NextResponse.json({
        valid: false,
        error: `Invalid coupon code '${cleanCode}'`
      });
    }

    const now = new Date();

    // 1. Check start date
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return NextResponse.json({
        valid: false,
        error: `Coupon '${cleanCode}' is not active yet.`
      });
    }

    // 2. Check expiration date
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return NextResponse.json({
        valid: false,
        error: `Coupon '${cleanCode}' has expired.`
      });
    }

    // 3. Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: `Coupon '${cleanCode}' has reached its maximum usage limit.`
      });
    }

    // 4. Check minimum order value
    const subtotal = parseFloat(cartSubtotal) || 0;
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount of ₹${coupon.minOrderValue.toLocaleString()} required for code '${cleanCode}'.`
      });
    }

    // 5. Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === "FIXED") {
      discountAmount = Math.min(subtotal, coupon.discountValue);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalSubtotal: Math.max(0, subtotal - discountAmount),
      message: `Coupon '${coupon.code}' applied! Saved ₹${discountAmount.toLocaleString()}`
    });
  } catch (error: any) {
    console.error("Coupon Validate Error:", error);
    return NextResponse.json(
      { valid: false, error: error.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
