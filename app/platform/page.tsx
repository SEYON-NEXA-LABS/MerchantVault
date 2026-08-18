"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Percent, 
  ShoppingBag, 
  Receipt, 
  Scan, 
  Truck, 
  Layers, 
  Sparkles,
  HelpCircle,
  ChevronDown,
  Building2,
  Check,
  Globe,
  ExternalLink,
  Award,
  CreditCard,
  X
} from "lucide-react";



// Configurable Platform Placeholder Name (Update in one place when revealed)
const PLATFORM_NAME = "Seyon Shopping";

export default function PlatformLandingPage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [monthlyGmv, setMonthlyGmv] = useState<number>(500000); // ₹5 Lakhs default GMV slider
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Competitor commission comparison math
  const shopifyCommissionRate = 0.02; // 2% Shopify/App transaction fee average
  const shopifyMonthlyLoss = Math.round(monthlyGmv * shopifyCommissionRate);
  const seyonSavingsPerYear = (shopifyMonthlyLoss * 12).toLocaleString("en-IN");

  const faqs = [
    {
      q: `How does ${PLATFORM_NAME} charge 0% transaction fees?`,
      a: `${PLATFORM_NAME} operates on a transparent SaaS subscription model (starting at ₹499/mo) or a one-time Perpetual License. We never take a percentage cut from your hard-earned merchant sales volume.`
    },
    {
      q: "Can I connect my existing Shopify, Amazon, or Flipkart store?",
      a: "Yes! Our Omnichannel Marketplace Hub syncs your central warehouse stock level across Shopify, Amazon, Flipkart, and Myntra in real-time, preventing overselling."
    },
    {
      q: "How does the Indian GST & TDS Tax Engine work?",
      a: `${PLATFORM_NAME} automatically normalizes state codes, calculates CGST+SGST (In-State) vs IGST (Interstate), handles Section 194C/194Q TDS withholding, and exports GSTR-1 CSV and Tally Prime XML files.`
    },
    {
      q: "What is the Perpetual Lifetime License option?",
      a: "For ₹75,000 one-time setup + ₹15,000/yr AMC, you get complete single-tenant deployment with all 5 Add-On Packs unlocked forever (Marketplace Sync, GST Engine, TDS Module, Marketing AI, and Custom Domain White-Labeling)."
    },
    {
      q: "Does payment go directly to my own Razorpay bank account?",
      a: "Yes! 100% of customer payments go straight into your own Razorpay account and linked bank account. Seyon Shopping uses your configured Razorpay API Key ID and Key Secret (`Company.razorpayKeyId`) — we never touch, hold, or delay your funds."
    },
    {
      q: "How are returns, cancellations, and customer refunds handled?",
      a: "When a customer requests a return or cancellation, you can trigger a 1-click refund from your Merchant Dashboard via your linked Razorpay gateway. The system automatically performs warehouse inward inspection scans, restores SKU stock, and generates GST Credit Notes (GSTR-1 Amendment) for Tally accounting."
    },
    {
      q: "Does it support barcode scanners for outward dispatch?",

      a: "Yes! Our sub-50ms POS and Outward Dispatch engine supports USB keyboard-emulation barcode scanners for picking, packing verification, and instant stock depletion."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Announcement Banner */}
      <div className="bg-slate-900 text-white text-xs py-2.5 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span>Disrupting Indian E-Commerce: 0% Platform Transaction Fees & Multi-Store Stock Pooling</span>
        <span className="hidden sm:inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold">New Release</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-none">
                {PLATFORM_NAME}
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-600 block tracking-widest uppercase mt-0.5">Enterprise ERP & Commerce</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#calculator" className="hover:text-indigo-600 transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
            <Link href="/help" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors flex items-center gap-1">
              <span>Help Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </nav>


          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/admin" 
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100/80 border border-indigo-200 text-indigo-800 px-4 py-1.5 rounded-full text-xs font-semibold">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Built for Indian D2C Brands & Retail Merchants</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Stop Paying Transaction Fees on Your <span className="text-indigo-600">E-Commerce Sales</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {PLATFORM_NAME} is the disruptive ERP & Omnichannel platform built for Indian retailers. Connect Shopify, Amazon, Flipkart & POS with shared warehouse inventory, 0% platform commissions, and native Indian GST/TDS filing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/admin" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>Launch Your Store Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#calculator" 
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Percent className="w-4 h-4 text-indigo-600" />
              <span>Calculate Savings</span>
            </a>
          </div>

          {/* Social Proof Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 0% Platform Order Fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Native GSTR-1 & Tally XML
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sub-50ms Barcode Outward Dispatch
            </div>
          </div>
        </div>
      </section>

      {/* ROI & Savings Calculator Section */}
      <section id="calculator" className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">How Much Money Are You Losing to Platform Fees?</h2>
            <p className="text-sm text-slate-600">Drag the slider to see how much money {PLATFORM_NAME} saves your store every year.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-xl space-y-8 max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-700">Your Monthly Store Sales (GMV):</span>
                <span className="text-2xl font-black text-indigo-600">₹{(monthlyGmv).toLocaleString("en-IN")} / mo</span>
              </div>
              <input 
                type="range" 
                min="100000" 
                max="5000000" 
                step="50000"
                value={monthlyGmv} 
                onChange={(e) => setMonthlyGmv(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] font-mono font-medium text-slate-500">
                <span>₹1 Lakh</span>
                <span>₹25 Lakhs</span>
                <span>₹50 Lakhs</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-rose-700 block uppercase">Shopify / App Commissions</span>
                <span className="text-2xl font-black text-rose-600">₹{(shopifyMonthlyLoss).toLocaleString("en-IN")} / mo</span>
                <span className="text-[11px] text-rose-600 block font-medium">Lost every month to 2% transaction cuts</span>
              </div>

              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-emerald-700 block uppercase">{PLATFORM_NAME} Annual Savings</span>
                <span className="text-3xl font-black text-emerald-600">₹{seyonSavingsPerYear} / yr</span>
                <span className="text-[11px] text-emerald-600 block font-medium">100% kept in your business bank account</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: 5 Core Pillars */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Architected for Scalable Retail Operations</h2>
          <p className="text-slate-600 text-sm">Everything you need to manage warehouses, online storefronts, and physical POS checkout desks in one single system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Storefront, Domain & SEO (Blue Color #2563eb) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-blue-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Storefront, Domain & Dynamic SEO</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect custom domain (`brand.in`), dynamic SEO tags, sitemap.xml, and WhatsApp OpenGraph preview cards for high conversion rates.
            </p>
          </div>

          {/* Pillar 2: Marketplace Sync (Amber Color #d97706) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-amber-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Omnichannel Marketplace Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect Shopify, Amazon, Flipkart, and Myntra. Central warehouse inventory updates across all online sales channels instantly.
            </p>
          </div>

          {/* Pillar 3: GST Engine & Tally (Emerald Color #059669) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-emerald-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Indian GST & Tally Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated CGST+SGST vs IGST splits, Place of Supply code matching, GSTR-1 CSV export, and 1-click Tally Prime XML files.
            </p>
          </div>

          {/* Pillar 4: B2B & TDS Compliance (Indigo Color #4f46e5) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-indigo-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">B2B & TDS Compliance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Section 194C/194Q TDS deductions, Section 206C(1H) TCS collections, B2B wholesale credit limits, and purchase ledger tracking.
            </p>
          </div>

          {/* Pillar 5: WhatsApp & AI Marketing (Purple Color #7c3aed) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-purple-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">WhatsApp & AI Marketing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated WhatsApp checkout recovery, broadcast segment targeting, and direct Meta/Instagram lead ad integration.
            </p>
          </div>

          {/* Sub-50ms Barcode Dispatch (Teal Color #0d9488) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-teal-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sub-50ms Barcode Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scan SKU barcodes using standard USB keyboard scanners for outward picking, packing verification, and stock depletion.
            </p>
          </div>

          {/* Direct Merchant Razorpay Payouts (Rose Color #e11d48) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-rose-500 hover:shadow-lg transition-all group col-span-1 md:col-span-3 lg:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Direct Razorpay Settlement (0% Hold)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              100% of customer order payments flow straight into your linked Razorpay bank account (`Company.razorpayKeyId`). Seyon Shopping never holds, delays, or taxes your sales revenue.
            </p>
          </div>
        </div>
      </section>


      {/* Tier-by-Tier Shopify vs Seyon Shopping Breakdown */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">Tier-by-Tier Shopify Comparison</h2>
          <p className="text-slate-600 text-xs font-medium">Which plan fits your business scale, and how much money do you save every year?</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-4 px-4 font-bold uppercase tracking-wider">Plan & Best Fit</th>
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-indigo-700">Seyon Shopping Price</th>
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-rose-700">Equivalent Shopify Cost</th>
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-emerald-700">Your Annual Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="hover:bg-slate-50/80">
                <td className="py-4 px-4">
                  <span className="font-bold text-slate-900 block">MICRO (POS ERP)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Best for: Retail stores & offline billing counters</span>
                </td>
                <td className="py-4 px-4 font-bold text-indigo-600">₹499 / mo</td>
                <td className="py-4 px-4 text-slate-600">
                  Shopify POS Pro: <span className="line-through text-rose-600 font-medium">₹7,400 / mo</span>
                </td>
                <td className="py-4 px-4 font-extrabold text-emerald-600">Save ₹82,812 / yr (93% cheaper)</td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="py-4 px-4">
                  <span className="font-bold text-slate-900 block">BASIC (Storefront Lite)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Best for: Instagram shops & non-GST D2C brands</span>
                </td>
                <td className="py-4 px-4 font-bold text-indigo-600">₹799 / mo</td>
                <td className="py-4 px-4 text-slate-600">
                  Basic Shopify + 2% fee: <span className="line-through text-rose-600 font-medium">₹3,500 / mo</span>
                </td>
                <td className="py-4 px-4 font-extrabold text-emerald-600">Save ₹32,412 / yr (77% cheaper)</td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="py-4 px-4">
                  <span className="font-bold text-slate-900 block">STARTER BUNDLE</span>
                  <span className="text-[10px] text-slate-500 font-medium">Best for: Registered D2C stores needing GST & Tally</span>
                </td>
                <td className="py-4 px-4 font-bold text-indigo-600">₹999 / mo</td>
                <td className="py-4 px-4 text-slate-600">
                  Shopify + GST App + POS: <span className="line-through text-rose-600 font-medium">₹6,200 / mo</span>
                </td>
                <td className="py-4 px-4 font-extrabold text-emerald-600">Save ₹62,412 / yr (84% cheaper)</td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="py-4 px-4">
                  <span className="font-bold text-slate-900 block">GROWTH BUNDLE</span>
                  <span className="text-[10px] text-slate-500 font-medium">Best for: Multi-channel sellers (Shopify/Amazon/Flipkart)</span>
                </td>
                <td className="py-4 px-4 font-bold text-indigo-600">₹1,999 / mo</td>
                <td className="py-4 px-4 text-slate-600">
                  Shopify Plan + Multi-Sync Apps: <span className="line-through text-rose-600 font-medium">₹12,500 / mo</span>
                </td>
                <td className="py-4 px-4 font-extrabold text-emerald-600">Save ₹126,012 / yr (84% cheaper)</td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="py-4 px-4">
                  <span className="font-bold text-slate-900 block">ENTERPRISE HUB</span>
                  <span className="text-[10px] text-slate-500 font-medium">Best for: High-volume retail chains & multi-warehouse brands</span>
                </td>
                <td className="py-4 px-4 font-bold text-indigo-600">₹4,999 / mo</td>
                <td className="py-4 px-4 text-slate-600">
                  Shopify Plus / Advanced: <span className="line-through text-rose-600 font-medium">₹25,000+ / mo</span>
                </td>
                <td className="py-4 px-4 font-extrabold text-emerald-600">Save ₹240,012 / yr (80% cheaper)</td>
              </tr>

              <tr className="bg-indigo-50/60 font-bold">
                <td className="py-4 px-4 text-indigo-900">
                  PERPETUAL LICENSE
                  <span className="text-[10px] text-slate-500 block font-normal">Best for: Single-tenant corporate ownership</span>
                </td>
                <td className="py-4 px-4 text-indigo-700">₹75k + ₹15k/yr</td>
                <td className="py-4 px-4 text-slate-600">
                  Shopify Plus 3-Yr License: <span className="line-through text-rose-600 font-medium">₹700,000+</span>
                </td>
                <td className="py-4 px-4 font-black text-indigo-700">Save ₹550,000+ in 3 Years</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-100/60 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900">Simple, Transparent Indian Pricing</h2>
            <p className="text-slate-600 text-sm">Choose the SaaS plan that fits your volume, or unlock all 5 Add-On Packs with Enterprise or Perpetual License.</p>

            {/* Billing Cycle Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <button 
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${billingCycle === "MONTHLY" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-600 border border-slate-200"}`}
              >
                Monthly Billing
              </button>
              <button 
                onClick={() => setBillingCycle("ANNUAL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${billingCycle === "ANNUAL" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white text-slate-600 border border-slate-200"}`}
              >
                Annual Billing (2 Months FREE)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Tier 1: Micro */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Micro (POS ERP)</span>
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === "ANNUAL" ? "4,990" : "499"}
                  </span>
                  <span className="text-xs text-slate-500"> / {billingCycle === "ANNUAL" ? "yr" : "mo"}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">Standalone POS & billing for retail stores.</p>

                <ul className="space-y-2 text-[11px] text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-1.5 font-bold text-teal-600"><Scan className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Barcode Generation & Scanning</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Up to 500 Orders / mo</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 1 Warehouse Hub</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 0% Transaction Fees</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> 🌐 Storefront, Domain & SEO (+₹499)</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> 📜 GST Engine & Tally (+₹299)</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> 🔄 Marketplace Sync (+₹699)</li>
                </ul>
              </div>

              <Link href="/admin" className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs text-center transition-colors">
                Start Micro
              </Link>
            </div>

            {/* Tier 2: Basic / Storefront Lite */}
            <div className="bg-white border border-blue-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Basic (Storefront Lite)</span>
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === "ANNUAL" ? "7,990" : "799"}
                  </span>
                  <span className="text-xs text-slate-500"> / {billingCycle === "ANNUAL" ? "yr" : "mo"}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">Online storefront for non-GST D2C & Instagram shops.</p>

                <ul className="space-y-2 text-[11px] text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-1.5 font-bold text-teal-600"><Scan className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Barcode Generation & Scanning</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Up to 1,000 Orders / mo</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 1 Warehouse Hub</li>
                  <li className="flex items-center gap-1.5 text-blue-600 font-bold"><Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> 🌐 Storefront, Domain & SEO Pack</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> 📜 GST Engine & Tally (+₹299)</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> 🔄 Marketplace Sync (+₹699)</li>
                </ul>
              </div>

              <Link href="/admin" className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs text-center transition-colors">
                Start Basic
              </Link>
            </div>

            {/* Tier 3: Starter */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Starter Plan</span>
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === "ANNUAL" ? "9,990" : "999"}
                  </span>
                  <span className="text-xs text-slate-500"> / {billingCycle === "ANNUAL" ? "yr" : "mo"}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">For growing stores & single-brand outlets.</p>

                <ul className="space-y-2 text-[11px] text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-1.5 font-bold text-teal-600"><Scan className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Barcode Generation & Scanning</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Up to 2,000 Orders / mo</li>
                  <li className="flex items-center gap-1.5 text-blue-600 font-bold"><Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> 🌐 Storefront, Domain & SEO Pack</li>
                  <li className="flex items-center gap-1.5 text-emerald-600 font-bold"><Receipt className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 📜 GST Engine & Tally Pack</li>
                  <li className="flex items-center gap-1.5 text-slate-400"><X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> 🔄 Marketplace Sync (+₹699)</li>
                </ul>
              </div>

              <Link href="/admin" className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs text-center transition-colors">
                Start Starter
              </Link>
            </div>

            {/* Tier 4: Growth (Featured) */}
            <div className="bg-gradient-to-b from-indigo-50 via-white to-white border-2 border-indigo-600 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-indigo-600/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Growth Plan</span>
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === "ANNUAL" ? "19,990" : "1,999"}
                  </span>
                  <span className="text-xs text-slate-500"> / {billingCycle === "ANNUAL" ? "yr" : "mo"}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">Full multi-channel sync & multi-warehouse stock pooling.</p>

                <ul className="space-y-2 text-[11px] text-slate-700 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5 font-bold text-teal-600"><Scan className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Barcode Generation & Scanning</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Up to 10,000 Orders / mo</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 3 Warehouse Hubs</li>
                  <li className="flex items-center gap-1.5 text-blue-600 font-bold"><Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> 🌐 Storefront, Domain & SEO Pack</li>
                  <li className="flex items-center gap-1.5 text-amber-600 font-bold"><RefreshCw className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> 🔄 Marketplace Sync Pack</li>
                  <li className="flex items-center gap-1.5 text-emerald-600 font-bold"><Receipt className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> 📜 GST Engine & Tally Pack</li>
                </ul>
              </div>

              <Link href="/admin" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs text-center shadow-md shadow-indigo-600/20 transition-all">
                Start Growth Trial
              </Link>
            </div>

            {/* Tier 5: Enterprise */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Enterprise</span>
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === "ANNUAL" ? "49,990" : "4,999"}
                  </span>
                  <span className="text-xs text-slate-500"> / {billingCycle === "ANNUAL" ? "yr" : "mo"}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">Unlimited orders & all 5 Add-On Packs pre-bundled.</p>

                <ul className="space-y-2 text-[11px] text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-1.5 font-bold text-teal-600"><Scan className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> Barcode Generation & Scanning</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Unlimited Orders / mo</li>
                  <li className="flex items-center gap-1.5 text-indigo-600 font-bold"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> All 5 Add-On Packs Unlocked</li>
                  <li className="flex items-center gap-1.5 text-indigo-600 font-bold"><ShieldCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> White-Labeling & Custom Domain</li>
                </ul>
              </div>

              <Link href="/admin" className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs text-center transition-colors">
                Contact Enterprise
              </Link>
            </div>

            {/* Tier 5: Perpetual License */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Perpetual License</span>
                <div>
                  <span className="text-2xl font-black text-white">₹75,000</span>
                  <span className="text-[11px] text-slate-400 block">+ ₹15,000/yr AMC</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">One-time setup for single-tenant ownership.</p>

                <ul className="space-y-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> 100% Single-Tenant DB</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Unlimited Warehouses</li>
                  <li className="flex items-center gap-1.5 text-purple-300 font-bold"><Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> All 5 Add-On Packs Unlocked</li>
                  <li className="flex items-center gap-1.5 text-purple-300 font-bold"><ShieldCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> Perpetual Software Ownership</li>
                </ul>
              </div>

              <Link href="/admin" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs text-center transition-colors">
                Get Perpetual
              </Link>
            </div>
          </div>

          {/* 5 Modular Add-On Bundles A La Carte Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" /> 5 Modular "A La Carte" Add-On Packs
              </h3>
              <p className="text-xs text-slate-600 mt-1">Available on Micro & Base plans, or pre-bundled in Growth & Enterprise plans.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
              {/* Pack 1: Storefront, Domain & SEO (Blue #2563eb) */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>1. Storefront, Domain & SEO</span>
                </div>
                <span className="text-sm font-black text-slate-900 block">₹499 <span className="text-[10px] text-slate-500 font-normal">/ mo</span></span>
                <p className="text-[10px] text-slate-600 leading-relaxed">Custom domain, white-labeling, dynamic SEO tags, sitemap.xml, & WhatsApp OpenGraph cards.</p>
              </div>

              {/* Pack 2: Marketplace Sync (Amber #d97706) */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>2. Marketplace Sync</span>
                </div>
                <span className="text-sm font-black text-slate-900 block">₹699 <span className="text-[10px] text-slate-500 font-normal">/ mo</span></span>
                <p className="text-[10px] text-slate-600 leading-relaxed">Automated multi-channel stock sync across Shopify, Amazon & Flipkart.</p>
              </div>

              {/* Pack 3: GST Engine & Tally (Emerald #059669) */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>3. GST Engine & Tally</span>
                </div>
                <span className="text-sm font-black text-slate-900 block">₹299 <span className="text-[10px] text-slate-500 font-normal">/ mo</span></span>
                <p className="text-[10px] text-slate-600 leading-relaxed">CGST/SGST/IGST breakdown, GSTR-1 CSV, & 1-click Tally Prime XML export.</p>
              </div>

              {/* Pack 4: B2B & TDS Compliance (Indigo #4f46e5) */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>4. B2B & TDS Compliance</span>
                </div>
                <span className="text-sm font-black text-slate-900 block">₹499 <span className="text-[10px] text-slate-500 font-normal">/ mo</span></span>
                <p className="text-[10px] text-slate-600 leading-relaxed">Section 194C/194Q TDS deductions, 206C(1H) TCS, & B2B credit limits.</p>
              </div>

              {/* Pack 5: WhatsApp & AI Marketing (Purple #7c3aed) */}
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>5. WhatsApp & AI Marketing</span>
                </div>
                <span className="text-sm font-black text-slate-900 block">₹599 <span className="text-[10px] text-slate-500 font-normal">/ mo</span></span>
                <p className="text-[10px] text-slate-600 leading-relaxed">WhatsApp abandoned cart recovery, AI broadcast segment targeting, & Meta leads sync.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-xs">Everything you need to know about migrating to {PLATFORM_NAME}.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left font-bold text-sm text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openFaq === idx ? "rotate-180 text-indigo-600" : ""}`} />
              </button>

              {openFaq === idx && (
                <div className="px-6 pb-6 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">{PLATFORM_NAME}</span>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved. Seyon Nexa Labs Private Limited.
          </p>

          <div className="flex items-center gap-6 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/help" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Help Center & SOPs</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Merchant Desk</Link>
          </div>


          <div className="text-[11px] font-mono text-slate-500">
            © 2026 {PLATFORM_NAME}. All rights reserved. 0% Transaction Fees Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
