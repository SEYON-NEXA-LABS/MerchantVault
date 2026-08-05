import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bpxydwzrmgxfwxfbwywr.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("razorpayEnabled, razorpayKeyId, razorpayKeySecret")
      .limit(1)
      .maybeSingle();

    if (compErr || !company || !company.razorpayEnabled) {
      return NextResponse.json({ error: "Razorpay payment gateway is not enabled" }, { status: 400 });
    }

    const keyId = company.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
    const keySecret = company.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay API credentials are not configured" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create Razorpay order" }, { status: 500 });
  }
}
