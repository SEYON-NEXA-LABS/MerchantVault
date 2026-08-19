"use client";

import React, { useState, useEffect } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Lock,
  Globe,
  RefreshCw,
  Receipt,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Building,
  Layers,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

import { SharedPricingMatrix, AddonPack } from "@/components/PricingMatrix";

export default function SubscriptionBillingPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "TENANTADMIN"]}>
      <BillingContent />
    </RoleGuard>
  );
}

export function BillingContent() {
  const [company, setCompany] = useState<any>(null);
  const [currentPlanCode, setCurrentPlanCode] = useState<string>("GROWTH");
  const [addonsState, setAddonsState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setCompany(data);
        if (data.subscriptionPlanCode) {
          setCurrentPlanCode(data.subscriptionPlanCode);
        }
        setAddonsState({
          STOREFRONT: !!data.hasWhiteLabelAddon,
          GST_ENGINE: !!data.hasGstEngineAddon,
          MARKETPLACE_SYNC: !!data.hasMarketplaceSyncAddon,
          B2B_TDS: !!data.hasTdsAddon,
          WHATSAPP_AI: !!data.hasMarketingAiAddon
        });
      }
    } catch (err) {
      console.error("Failed to fetch subscription settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleAddon = async (addon: AddonPack) => {
    const nextVal = !addonsState[addon.code];
    setAddonsState(prev => ({ ...prev, [addon.code]: nextVal }));

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [addon.flagKey]: nextVal
        })
      });

      if (res.ok) {
        toast.success(`${addon.name} ${nextVal ? "activated" : "deactivated"} successfully!`);
        fetchSettings();
      } else {
        toast.error("Failed to update add-on subscription state.");
        setAddonsState(prev => ({ ...prev, [addon.code]: !nextVal }));
      }
    } catch (err) {
      toast.error("Failed to connect to billing server.");
      setAddonsState(prev => ({ ...prev, [addon.code]: !nextVal }));
    }
  };

  const handleSelectPlan = async (planCode: string) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionPlanCode: planCode,
          hasWhiteLabelAddon: planCode === "STARTER" || planCode === "GROWTH" || planCode === "ENTERPRISE" || planCode === "PERPETUAL",
          hasGstEngineAddon: planCode === "STARTER" || planCode === "GROWTH" || planCode === "ENTERPRISE" || planCode === "PERPETUAL",
          hasMarketplaceSyncAddon: planCode === "GROWTH" || planCode === "ENTERPRISE" || planCode === "PERPETUAL",
          hasTdsAddon: planCode === "ENTERPRISE" || planCode === "PERPETUAL",
          hasMarketingAiAddon: planCode === "ENTERPRISE" || planCode === "PERPETUAL"
        })
      });

      if (res.ok) {
        toast.success(`Plan updated to ${planCode}!`);
        setCurrentPlanCode(planCode);
        fetchSettings();
      } else {
        toast.error("Failed to switch subscription plan tier.");
      }
    } catch (err) {
      toast.error("Subscription update failed.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5" /> 0% Platform Transaction Fees Guaranteed
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">SaaS Subscription & Modular Add-Ons</h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Choose the SaaS plan that fits your volume, or unlock all 5 Add-On Packs with Enterprise or Perpetual License.
          </p>
        </div>
      </div>

      {/* Shared Pricing Matrix Component */}
      <SharedPricingMatrix
        currentPlanCode={currentPlanCode}
        addonsState={addonsState}
        onSelectPlan={handleSelectPlan}
        onToggleAddon={handleToggleAddon}
      />

      {/* Dual-Razorpay Architecture & Compliance Disclaimer Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
              Dual-Razorpay Integration Compliance
            </span>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Platform Billing vs. Merchant Storefront Payments
            </h3>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Platform Gateway: <span className="text-emerald-400 font-bold">Razorpay Live</span> (0% Commission Model)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
            <span className="font-bold text-indigo-300 block">1. Platform SaaS Billing Gateway</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Platform subscription fees (Starter ₹999, Growth ₹1,999, Enterprise ₹4,999) are processed via Seyon Shopping's secure billing engine with official tax invoices generated automatically.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
            <span className="font-bold text-emerald-300 block">2. Merchant Storefront Gateway (Your Store)</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Your store payment credentials configured under <strong>Settings → Payment Gateways</strong> process buyer orders directly into your account with <strong>0% platform commission fees</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
