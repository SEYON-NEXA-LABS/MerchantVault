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
  Cpu,
  MessageSquare,
  Mail,
  Phone,
  X
} from "lucide-react";
import { SharedPricingMatrix } from "@/components/PricingMatrix";
import { HoneycombBackground } from "@/components/HoneycombBackground";





// Configurable Platform Name
const PLATFORM_NAME = "MerchantVault";
const PLATFORM_COMPANY = "Seyon Nexa Labs";

export default function PlatformLandingPage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [monthlyGmv, setMonthlyGmv] = useState<number>(500000); // ₹5 Lakhs default GMV slider
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact / Enquiry Modal State
  const [showEnquireModal, setShowEnquireModal] = useState(false);
  const [enquirePlan, setEnquirePlan] = useState("Micro Plan");
  const [enquireSubmitted, setEnquireSubmitted] = useState(false);
  const [merchantName, setMerchantName] = useState("");
  const [merchantPhone, setMerchantPhone] = useState("");
  const [merchantEmail, setMerchantEmail] = useState("");
  const [merchantCity, setMerchantCity] = useState("");

  const handleOpenEnquire = (planName: string) => {
    setEnquirePlan(planName);
    setEnquireSubmitted(false);
    setShowEnquireModal(true);
  };


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
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-sm overflow-hidden hover:scale-105 transition-transform">
              <img 
                src="/seyon-logo.png" 
                alt="Seyon Nexa Labs" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">
                  {PLATFORM_NAME}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  by {PLATFORM_COMPANY}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 block tracking-widest uppercase mt-1">Enterprise ERP & Commerce</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#calculator" className="hover:text-indigo-600 transition-colors">ROI Calculator</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#comparison" className="hover:text-indigo-600 transition-colors">Comparison</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing & Plans</a>
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
            <button 
              onClick={() => handleOpenEnquire("General Platform Demo")} 
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Enquire Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Honeycomb Background */}
      <HoneycombBackground className="pt-20 pb-24 px-6 bg-gradient-to-b from-blue-50/60 via-slate-50/80 to-slate-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-indigo-100/90 border border-indigo-200/80 text-indigo-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs backdrop-blur-md">
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
            <button 
              onClick={() => handleOpenEnquire("General Platform Consultation")} 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Us & Book Demo</span>
            </button>
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
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 0% Platform Order Fees
            </div>
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Native GSTR-1 & Tally XML
            </div>
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sub-50ms Barcode Outward Dispatch
            </div>
          </div>
        </div>
      </HoneycombBackground>

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
            <h3 className="text-lg font-bold text-slate-900">AI SEO Engine & Blog Marketing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1-Click AI Copywriter generating Google SEO title tags, meta descriptions, and long-tail blog posts (`/blog`) with Schema.org `Article` JSON-LD rich snippets.
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
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-rose-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Direct Merchant Payouts (0% Hold)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              100% of customer order payments flow directly into your own verified bank account via Razorpay. Seyon Shopping never holds, delays, or taxes your sales revenue.
            </p>
          </div>

          {/* Ultra-Fast Lightning Speed & Low Overhead (Cyan Color #0891b2) */}
          <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 hover:border-cyan-500 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sub-1s Mobile Speed & Low Server Costs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Loads in under 1 second on 4G mobile networks across India for higher sales conversion rates, requiring zero expensive server clusters.
            </p>
          </div>
        </div>
      </section>




      {/* Tier-by-Tier Shopify vs Seyon Shopping Breakdown */}
      <section id="comparison" className="py-20 px-6 max-w-7xl mx-auto space-y-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">Tier-by-Tier Shopify Comparison</h2>
          <p className="text-slate-600 text-xs font-medium">Which plan fits your business scale, and how much money do you save every year?</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-4 px-5 font-bold uppercase tracking-wider text-slate-700">Plan & Target Merchant</th>
                <th className="py-4 px-5 font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/50">{PLATFORM_NAME} Price</th>
                <th className="py-4 px-5 font-bold uppercase tracking-wider text-rose-700">Equivalent Shopify Stack</th>
                <th className="py-4 px-5 font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50/40">Net Annual Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">MICRO</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">POS ERP</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Retail stores & counter POS billing (includes 500 MB storage)</span>
                </td>
                <td className="py-4 px-5 font-black text-indigo-700 text-sm bg-indigo-50/30">₹499 <span className="text-xs font-normal text-slate-500">/ mo</span></td>
                <td className="py-4 px-5 text-slate-600">
                  Shopify POS Pro: <span className="line-through text-rose-600 font-semibold">₹7,400 / mo</span>
                </td>
                <td className="py-4 px-5 font-extrabold text-emerald-600 bg-emerald-50/30">
                  <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                    Save ₹82,812 / yr (93% less)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">BASIC</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Storefront Lite</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Early D2C brands launching standalone storefront + custom domain</span>
                </td>
                <td className="py-4 px-5 font-black text-indigo-700 text-sm bg-indigo-50/30">₹799 <span className="text-xs font-normal text-slate-500">/ mo</span></td>
                <td className="py-4 px-5 text-slate-600">
                  Shopify Basic + Apps: <span className="line-through text-rose-600 font-semibold">₹4,500 / mo</span>
                </td>
                <td className="py-4 px-5 font-extrabold text-emerald-600 bg-emerald-50/30">
                  <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                    Save ₹44,412 / yr (82% less)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">STARTER</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">GST + Tally</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Automated GSTR-1, Tally XML & e-Invoicing compliance built-in</span>
                </td>
                <td className="py-4 px-5 font-black text-indigo-700 text-sm bg-indigo-50/30">₹999 <span className="text-xs font-normal text-slate-500">/ mo</span></td>
                <td className="py-4 px-5 text-slate-600">
                  Shopify + GST App + POS: <span className="line-through text-rose-600 font-semibold">₹6,200 / mo</span>
                </td>
                <td className="py-4 px-5 font-extrabold text-emerald-600 bg-emerald-50/30">
                  <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                    Save ₹62,412 / yr (84% less)
                  </span>
                </td>
              </tr>

              <tr className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">GROWTH</span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">★ Popular</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium block mt-0.5">Multi-channel sync (Amazon/Flipkart/Shopify) + 10 GB Media Bucket</span>
                </td>
                <td className="py-4 px-5 font-black text-indigo-700 text-sm bg-indigo-50/30">₹1,999 <span className="text-xs font-normal text-slate-500">/ mo</span></td>
                <td className="py-4 px-5 text-slate-600">
                  Shopify Plan + Multi-Sync Apps: <span className="line-through text-rose-600 font-semibold">₹12,500 / mo</span>
                </td>
                <td className="py-4 px-5 font-extrabold text-emerald-600 bg-emerald-50/30">
                  <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                    Save ₹126,012 / yr (84% less)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">ENTERPRISE HUB</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Scale</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Multi-warehouse ERP, B2B TDS, AI WhatsApp & 50 GB Media Vault</span>
                </td>
                <td className="py-4 px-5 font-black text-indigo-700 text-sm bg-indigo-50/30">₹4,999 <span className="text-xs font-normal text-slate-500">/ mo</span></td>
                <td className="py-4 px-5 text-slate-600">
                  Shopify Plus / Advanced: <span className="line-through text-rose-600 font-semibold">₹25,000+ / mo</span>
                </td>
                <td className="py-4 px-5 font-extrabold text-emerald-600 bg-emerald-50/30">
                  <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                    Save ₹240,012 / yr (80% less)
                  </span>
                </td>
              </tr>

              <tr className="bg-indigo-50/60 font-bold border-t-2 border-indigo-200">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-950 text-sm">PERPETUAL LICENSE</span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">Full Ownership</span>
                  </div>
                  <span className="text-[11px] text-indigo-800 font-medium block mt-0.5">₹75,000 one-time setup (Yr 1 included) + ₹15k/yr AMC starting 2nd year</span>
                </td>
                <td className="py-4 px-5 font-black text-indigo-900 text-sm bg-indigo-100/40">₹75,000 <span className="text-xs font-normal text-indigo-700">+ ₹15k AMC</span></td>
                <td className="py-4 px-5 text-slate-700">
                  Shopify Plus 3-Yr Stack: <span className="line-through text-rose-600 font-bold">₹700,000+</span>
                </td>
                <td className="py-4 px-5 font-black text-emerald-700 bg-emerald-100/40">
                  <span className="inline-flex items-center gap-1 bg-emerald-200/80 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-300 font-black">
                    Save ₹550,000+ in 3 Years
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Head-to-Head Feature Edge Comparison Matrix */}
        <div className="pt-6 border-t border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900">Head-to-Head Platform Edge</h3>
            <p className="text-xs text-slate-500">Direct technical comparison between native Seyon Shopping architecture vs Shopify plugin bloat.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-slate-700 w-1/3">Architectural Capability</th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/50 w-1/3">{PLATFORM_NAME}</th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-slate-500 w-1/3">Shopify + App Ecosystem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">Transaction Fee / Commission</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ 0% Platform Fee Always
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-rose-600 font-medium">0.5% to 2.0% Revenue Tax per checkout</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">Mobile Page Load Speed (4G India)</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ⚡ Sub-1 Second (Static Edge Cache)
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-rose-600 font-medium">3.5s – 6.0s (Bloated by 8+ plugin scripts)</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">Media Cloud Storage & Video CDN</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                        ✓ Built-in Media Bucket (+10GB / ₹199)
                      </span>
                      <span className="text-[11px] text-slate-500 block font-normal">Auto-WebP compression, 4K video banners & lookbooks</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-rose-600 font-medium">Restricted file upload limits; requires 3rd-party CDN/Cloudinary (+$29/mo)</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">Payment Payout Settlements</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Direct to Merchant Razorpay (0% Hold)
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">Delayed T+3 to T+7 Days</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">Indian GST & Tally Export</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Native GSTR-1 + 1-Click Tally XML
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-rose-600 font-medium">Requires paid 3rd-party GST apps (+$20/mo)</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">POS & Barcode Dispatch (Offline)</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Sub-50ms USB/Bluetooth Scanner Ready
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-rose-600 font-medium">Requires Shopify POS Pro ($89/mo per register)</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">AI SEO Copywriter & Meta Generator</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ 1-Click AI Engine (₹0 Extra)
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-rose-600 font-medium">Requires 3rd-Party SEO Apps (+$25/mo)</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">Blog Engine & Article Schema</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/20">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Built-in Journal + Google Rich Snippets
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-rose-600 font-medium">Requires paid Page Builders / Shogun (+$39/mo)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-100/60 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900">Simple, Transparent Indian Pricing</h2>
          </div>

          <SharedPricingMatrix
            isPublicView={true}
            onEnquirePlan={(planCode) => handleOpenEnquire(`${planCode} Plan`)}
          />
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
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-700 p-1 flex items-center justify-center overflow-hidden shadow-sm">
              <img 
                src="/seyon-logo.png" 
                alt="Seyon Nexa Labs" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight block leading-none">{PLATFORM_NAME}</span>
              <span className="text-xs text-slate-400 font-medium block mt-1">by {PLATFORM_COMPANY}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved. Seyon Nexa Labs Private Limited.
          </p>

          <div className="flex items-center gap-6 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/blog" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Public Journal & Blog</Link>
            <Link href="/help" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Help Center & SOPs</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Merchant Desk</Link>
          </div>
        </div>
      </footer>



      {/* Contact Us / Plan Enquiry Modal Overlay */}
      {showEnquireModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowEnquireModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {enquirePlan}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Enquire & Book Platform Demo</h3>
              <p className="text-xs text-slate-500">
                Our Indian onboarding specialist will reach out within 2 hours to help set up your store and warehouse POS.
              </p>
            </div>

            {enquireSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-950">Enquiry Submitted Successfully!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you <strong>{merchantName}</strong>. Our onboarding team will call your number (<strong>{merchantPhone}</strong>) shortly.
                </p>
                <button 
                  onClick={() => setShowEnquireModal(false)}
                  className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Done
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!merchantName || !merchantPhone) return;
                  setEnquireSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Name / Brand Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ramesh Kumar / Seyon Fashions" 
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone / WhatsApp Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 98765 43210" 
                      value={merchantPhone}
                      onChange={(e) => setMerchantPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Email (Optional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="merchant@brand.in" 
                      value={merchantEmail}
                      onChange={(e) => setMerchantEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tirupur / Chennai / Mumbai" 
                    value={merchantCity}
                    onChange={(e) => setMerchantCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Submit Plan Enquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

