"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Zap,
  Globe,
  RefreshCw,
  Receipt,
  ShieldCheck,
  MessageSquare,
  Scan,
  Layers,
  Sparkles,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";

export interface SubscriptionPlan {
  code: "MICRO" | "BASIC" | "STARTER" | "GROWTH" | "ENTERPRISE" | "PERPETUAL";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  desc: string;
  popular?: boolean;
  includedAddons: string[];
  savingsTip: string;
}

export const PLAN_DEFINITIONS: SubscriptionPlan[] = [
  {
    code: "MICRO",
    name: "Micro (POS ERP)",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    desc: "Single-store POS & Inventory ERP. Add modular add-ons a la carte as you scale.",
    includedAddons: [],
    savingsTip: "Base billing ERP. Upgrade to Basic for Storefront or Starter for full GST bundle!"
  },
  {
    code: "BASIC",
    name: "Basic (Storefront Lite)",
    monthlyPrice: 799,
    yearlyPrice: 7990,
    desc: "E-commerce storefront foundation with single warehouse inventory & custom domains.",
    includedAddons: ["STOREFRONT"],
    savingsTip: "Saves ₹199/month (₹2,388/year) by bundling Storefront (₹499) with Base ERP!"
  },
  {
    code: "STARTER",
    name: "Starter Bundle",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    desc: "All-in-one storefront foundation with automated GST & Tally compliance.",
    includedAddons: ["STOREFRONT", "GST_ENGINE"],
    savingsTip: "Saves ₹798/month (₹9,576/year) by bundling Storefront (₹499) & GST Engine (₹299) for free!"
  },
  {
    code: "GROWTH",
    name: "Growth Bundle",
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    popular: true,
    desc: "Multi-channel automation across Shopify, Amazon India, and Flipkart Hub.",
    includedAddons: ["STOREFRONT", "GST_ENGINE", "MARKETPLACE_SYNC"],
    savingsTip: "Saves ₹1,497/month (₹17,964/year) by bundling Storefront + GST Engine + Marketplace Sync!"
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise Hub",
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    desc: "Unlimited multi-warehouse ERP, B2B TDS compliance, and AI WhatsApp CRM.",
    includedAddons: ["STOREFRONT", "GST_ENGINE", "MARKETPLACE_SYNC", "B2B_TDS", "WHATSAPP_AI"],
    savingsTip: "Saves ₹2,595/month (₹31,140/year) by bundling ALL 5 Add-On Packs ($0.00) with unlimited orders!"
  },
  {
    code: "PERPETUAL",
    name: "Perpetual License",
    monthlyPrice: 15000, // Annual AMC
    yearlyPrice: 15000,
    desc: "₹75,000 one-time setup (Yr 1 included) + ₹15,000/yr AMC starting 2nd year. Full white-label ownership.",
    includedAddons: ["STOREFRONT", "GST_ENGINE", "MARKETPLACE_SYNC", "B2B_TDS", "WHATSAPP_AI"],
    savingsTip: "MAXIMUM SAVINGS: Saves ₹74,964 in 3 Years vs Enterprise SaaS, and saves over ₹5,50,000 vs Shopify Plus!"
  }
];

export interface AddonPack {
  id: string;
  code: string;
  name: string;
  monthlyPrice: number;
  desc: string;
  icon: any;
  flagKey: string;
}

export const ADDON_DEFINITIONS: AddonPack[] = [
  {
    id: "STOREFRONT",
    code: "STOREFRONT",
    name: "Storefront & Custom Domain Pack",
    monthlyPrice: 499,
    desc: "Custom domain (brand.com), subdomains (brand.seyon.app), and white-labeling.",
    icon: Globe,
    flagKey: "hasWhiteLabelAddon"
  },
  {
    id: "GST_ENGINE",
    code: "GST_ENGINE",
    name: "GST Engine & Tally Pack",
    monthlyPrice: 299,
    desc: "Automated CGST/SGST/IGST splits, GSTR-1 CSV exports, and 1-click Tally XML.",
    icon: Receipt,
    flagKey: "hasGstEngineAddon"
  },
  {
    id: "MARKETPLACE_SYNC",
    code: "MARKETPLACE_SYNC",
    name: "Marketplace Sync Pack",
    monthlyPrice: 699,
    desc: "Real-time automated inventory sync across Shopify, Amazon SP-API, and Flipkart.",
    icon: RefreshCw,
    flagKey: "hasMarketplaceSyncAddon"
  },
  {
    id: "B2B_TDS",
    code: "B2B_TDS",
    name: "B2B & TDS Compliance Pack",
    monthlyPrice: 499,
    desc: "Section 194C/194Q TDS deductions, Section 206C(1H) TCS, and B2B credit limits.",
    icon: ShieldCheck,
    flagKey: "hasTdsAddon"
  },
  {
    id: "WHATSAPP_AI",
    code: "WHATSAPP_AI",
    name: "WhatsApp & AI Marketing Pack",
    monthlyPrice: 599,
    desc: "Automated abandoned cart recovery, AI audience targeting, and Meta Lead ads sync.",
    icon: MessageSquare,
    flagKey: "hasMarketingAiAddon"
  }
];

interface PricingMatrixProps {
  currentPlanCode?: string;
  addonsState?: Record<string, boolean>;
  onSelectPlan?: (planCode: string) => Promise<void> | void;
  onToggleAddon?: (addon: AddonPack) => Promise<void> | void;
  onEnquirePlan?: (planName: string) => void;
  isPublicView?: boolean;
}

export function SharedPricingMatrix({
  currentPlanCode = "GROWTH",
  addonsState = {},
  onSelectPlan,
  onToggleAddon,
  onEnquirePlan,
  isPublicView = false
}: PricingMatrixProps) {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(currentPlanCode);

  useEffect(() => {
    setSelectedPlanCode(currentPlanCode);
  }, [currentPlanCode]);

  const activePlanDef = PLAN_DEFINITIONS.find(p => p.code === selectedPlanCode) || PLAN_DEFINITIONS[2];

  const isAddonIncludedInPlan = (addonCode: string) => {
    return activePlanDef.includedAddons.includes(addonCode);
  };

  const handlePlanClick = async (planCode: string) => {
    setSelectedPlanCode(planCode);

    if (isPublicView) {
      return;
    }

    if (planCode === currentPlanCode || !onSelectPlan) return;
    setUpdatingPlan(planCode);
    try {
      await onSelectPlan(planCode);
    } finally {
      setUpdatingPlan(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Subtitle & Billing Cycle Switcher */}
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Choose the SaaS plan that fits your volume, or unlock all 5 Add-On Packs with Enterprise or Perpetual License.
        </p>

        {/* Dedicated Full-Width Perpetual License Banner / Row */}
        {(() => {
          const perpetualPlan = PLAN_DEFINITIONS.find((p) => p.code === "PERPETUAL");
          if (!perpetualPlan) return null;
          const isSelected = perpetualPlan.code === selectedPlanCode;
          const isCurrentActive = perpetualPlan.code === currentPlanCode;

          return (
            <div
              onClick={() => handlePlanClick(perpetualPlan.code)}
              className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 relative transition-all duration-200 cursor-pointer shadow-md border text-left my-4 ${
                isSelected
                  ? "border-amber-400 ring-2 ring-amber-400/40 shadow-xl scale-[1.01]"
                  : "border-slate-800 hover:border-indigo-500/50"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                      Lifetime Buyout
                    </span>
                    {isSelected && (
                      <span className="bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                        {isCurrentActive && !isPublicView ? "Active Tier" : "Selected Plan"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-xl text-white flex items-center gap-2">
                    <span>{perpetualPlan.name}</span>
                    <span className="text-amber-400 text-xs font-semibold">(Self-Hosted & Full Source Ownership)</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{perpetualPlan.desc}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs font-medium text-slate-200">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All 5 Add-On Packs Bundled ($0.00)
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Single Instance License
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saves ₹74,964 in 3 Years
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                  <div className="lg:text-right">
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">One-Time License Fee</div>
                    <div className="text-3xl font-black text-amber-400">₹75,000</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">+ ₹15,000/yr AMC starting 2nd Year</div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPublicView) {
                        if (onEnquirePlan) onEnquirePlan(perpetualPlan.name);
                      } else {
                        handlePlanClick(perpetualPlan.code);
                      }
                    }}
                    disabled={!isPublicView && isSelected}
                    className={`py-2.5 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isPublicView
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md"
                        : isSelected
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                        : "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md"
                    }`}
                  >
                    {isPublicView ? (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Enquire Perpetual License</span>
                      </>
                    ) : isSelected ? (
                      "Current Plan"
                    ) : updatingPlan === perpetualPlan.code ? (
                      "Updating..."
                    ) : (
                      "Switch to Perpetual"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex justify-center">
          <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                billingCycle === "MONTHLY" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "YEARLY" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Annual Billing <span className="bg-emerald-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">2 Mo Free</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Plan Selection Savings Tip Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span>{activePlanDef.name} Advantage</span>
              <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">Bundled Savings</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">{activePlanDef.savingsTip}</p>
          </div>
        </div>

        {/* Enterprise vs Perpetual Quick ROI Tag */}
        <div className="bg-white/80 border border-indigo-200/80 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-700 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span>Enterprise (₹4,999/mo) vs Perpetual (₹75k + ₹15k/yr): <strong>Saves ₹74,964 in 3 Years</strong></span>
        </div>
      </div>

      {/* 5 SaaS Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {PLAN_DEFINITIONS.filter((p) => p.code !== "PERPETUAL").map((plan) => {
          const isSelected = plan.code === selectedPlanCode;
          const isCurrentActive = plan.code === currentPlanCode;
          const displayPrice =
            billingCycle === "MONTHLY"
              ? plan.monthlyPrice
              : Math.round(plan.yearlyPrice / 12);

          return (
            <div
              key={plan.code}
              onClick={() => handlePlanClick(plan.code)}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 relative transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-500/30 shadow-lg scale-[1.02]"
                  : plan.popular
                  ? "border-amber-400/80 shadow-xs hover:shadow-md hover:border-amber-500"
                  : "border-slate-200/80 hover:border-indigo-400 hover:shadow-sm"
              }`}
            >
              {plan.popular && !isSelected && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </span>
              )}
              {isSelected && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  {isCurrentActive && !isPublicView ? "Active Tier" : "Selected Plan"}
                </span>
              )}

              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900">{plan.name}</h3>
                <div>
                  <span className="text-2xl font-black text-slate-900">₹{displayPrice.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {billingCycle === "YEARLY" ? "/mo (billed annually)" : "/mo"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed min-h-[44px]">{plan.desc}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bundled Features:</div>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> POS ERP Terminal
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> 0% Gateway Penalty
                  </li>
                  {ADDON_DEFINITIONS.map((addon) => {
                    const isIncluded = plan.includedAddons.includes(addon.code);
                    return (
                      <li key={addon.code} className={`flex items-center gap-1.5 ${isIncluded ? "text-slate-900 font-semibold" : "text-slate-400 opacity-60"}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${isIncluded ? "text-emerald-500" : "text-slate-300"}`} />
                        <span className="truncate">{addon.name.replace(" Pack", "")}</span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPublicView) {
                      if (onEnquirePlan) onEnquirePlan(plan.name);
                    } else {
                      handlePlanClick(plan.code);
                    }
                  }}
                  disabled={!isPublicView && isSelected}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPublicView
                      ? plan.popular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                      : isSelected
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  }`}
                >
                  {isPublicView ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Enquire {plan.name.split(" ")[0]}</span>
                    </>
                  ) : isSelected ? (
                    "Current Plan"
                  ) : updatingPlan === plan.code ? (
                    "Updating..."
                  ) : (
                    "Switch Tier"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart A La Carte Add-On Module Management Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Smart "A La Carte" Add-On Bundles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add-ons included in your current subscription tier (<strong>{activePlanDef.name}</strong>) automatically display as <strong>Included ($0.00)</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADDON_DEFINITIONS.map((addon) => {
            const Icon = addon.icon;
            const isIncludedInPlan = isAddonIncludedInPlan(addon.code);
            const isManuallyActive = !!addonsState[addon.code];

            return (
              <div
                key={addon.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isIncludedInPlan
                    ? "border-emerald-200 bg-emerald-50/20 shadow-xs"
                    : isManuallyActive
                    ? "border-indigo-500/40 bg-indigo-50/10 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>

                    {isIncludedInPlan ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Included in {activePlanDef.name}
                      </span>
                    ) : isManuallyActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Add-On Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        +₹{addon.monthlyPrice}/mo
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{addon.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{addon.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    {isIncludedInPlan ? (
                      <span className="font-bold text-emerald-700">₹0 / month (Bundled)</span>
                    ) : (
                      <span className="font-semibold text-slate-700">₹{addon.monthlyPrice} / month</span>
                    )}
                  </div>

                  {!isPublicView && onToggleAddon && (
                    <button
                      type="button"
                      onClick={() => onToggleAddon(addon)}
                      disabled={isIncludedInPlan}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isIncludedInPlan
                          ? "bg-emerald-100/60 text-emerald-800 border border-emerald-200 cursor-not-allowed"
                          : isManuallyActive
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isIncludedInPlan ? "Bundled ($0)" : isManuallyActive ? "Deactivate Add-On" : "Add to Subscription"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
