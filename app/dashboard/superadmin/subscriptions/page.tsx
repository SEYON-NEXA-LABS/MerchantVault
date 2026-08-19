"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Building2,
  Calendar,
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  KeyRound,
  Edit,
  ArrowLeft,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoleGuard } from "../../../../components/RoleGuard";

interface Subscription {
  id: string;
  planType: "FREE_TRIAL" | "MONTHLY" | "YEARLY" | "ONETIME_AMC" | "PAY_PER_ORDER" | "ENTERPRISE_CUSTOM";
  amount: number;
  amcAmount: number;
  currency: string;
  status: "ACTIVE" | "PAST_DUE" | "SUSPENDED";
  nextRenewalDate: string;
}

interface Company {
  id: string;
  name: string;
  code: string;
  contactEmail: string | null;
  logoUrl: string | null;
  timezone: string | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  subscription: Subscription | null;
}

export default function SuperadminSubscriptionsPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <SubscriptionsContent />
    </RoleGuard>
  );
}

function SubscriptionsContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modal States
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Subscription Fields
  const [planType, setPlanType] = useState<Subscription["planType"]>("MONTHLY");
  const [amount, setAmount] = useState(0);
  const [amcAmount, setAmcAmount] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState<Subscription["status"]>("ACTIVE");
  const [renewalDate, setRenewalDate] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  // Password Reset Modal States (nested inside editor)
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPwd, setResettingPwd] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/subscriptions");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompanies(data);
      } else {
        toast.error("Failed to load platform subscription directory.");
      }
    } catch (err) {
      toast.error("Database connection failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const openEditor = (company: Company) => {
    setSelectedCompany(company);
    if (company.subscription) {
      setPlanType(company.subscription.planType);
      setAmount(company.subscription.amount);
      setAmcAmount(company.subscription.amcAmount || 0);
      setCurrency(company.subscription.currency || "INR");
      setStatus(company.subscription.status);
      setRenewalDate(company.subscription.nextRenewalDate.split("T")[0]);
    } else {
      setPlanType("FREE_TRIAL");
      setAmount(0);
      setAmcAmount(0);
      setCurrency("INR");
      setStatus("ACTIVE");
      setRenewalDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    }
  };

  const saveSubscription = async (e: React.FormEvent, resetToday = false) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setSavingSub(true);
    try {
      const res = await fetch("/api/superadmin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          planType,
          amount,
          amcAmount,
          currency,
          status,
          nextRenewalDate: new Date(renewalDate).toISOString(),
          resetRenewalToday: resetToday
        })
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Subscription updated for "${selectedCompany.name}"!`);
        setSelectedCompany(null);
        fetchSubscriptions();
      }
    } catch (err) {
      toast.error("Failed to update subscription.");
    } finally {
      setSavingSub(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !newPassword) return;

    setResettingPwd(true);
    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_PASSWORD",
          companyId: selectedCompany.id,
          newPassword
        })
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Password reset successful for Admin user "${data.username}"!`);
        setShowPwdModal(false);
        setNewPassword("");
      }
    } catch (err) {
      toast.error("Failed to reset password.");
    } finally {
      setResettingPwd(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPlan = (plan: string) => {
    if (plan === "MICRO") return "Micro POS (₹499/mo)";
    if (plan === "ONETIME_AMC") return "Perpetual (₹75k + ₹15k AMC)";
    if (plan === "PAY_PER_ORDER") return "Pay Per Order";
    if (plan === "ENTERPRISE_CUSTOM") return "Enterprise Custom (₹4,999/mo)";
    if (plan === "FREE_TRIAL") return "Free Trial";
    if (plan === "MONTHLY") return "Starter Bundle (₹999/mo)";
    if (plan === "YEARLY") return "Growth Bundle (₹1,999/mo)";
    return plan;
  };


  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 bg-gradient-to-br from-[#f0fdfa] via-[#f5f6f3] to-[#e4eae6] min-h-screen rounded-2xl relative">
      {/* Loom grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl"
        style={{
          backgroundImage: "radial-gradient(#0d9488 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/70 backdrop-blur-md border border-teal-100 rounded-xl shadow-sm">
        <div className="space-y-1">
          <Link
            href="/dashboard/superadmin"
            className="text-teal-700 hover:text-teal-900 text-xs font-bold flex items-center gap-1.5 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
          </Link>
          <h1 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-650" /> Subscription & Plan Billing
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Configure platform pricing plans, base amounts, AMC rates, renewal intervals, and recovery support.
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload Plans
        </button>
      </div>

      {/* Main Billing Table */}
      <div className="relative z-10 bg-white/70 backdrop-blur-md border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search companies by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-xs text-stone-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
              Fetching billing models...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">No tenants registered.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Tenant Company</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Billing Plan</th>
                  <th className="p-4">Rate / Cost</th>
                  <th className="p-4">Next Renewal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-750">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-bold text-stone-900">{c.name}</td>
                    <td className="p-4 font-mono font-bold text-stone-500">{c.code}</td>
                    <td className="p-4">
                      {c.subscription ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-850 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                          {formatPlan(c.subscription.planType)}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Not Configured</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {c.subscription ? (
                        <>
                          ₹{c.subscription.amount.toLocaleString()}
                          {c.subscription.planType === "ONETIME_AMC" && (
                            <span className="text-[10px] text-stone-400 block mt-0.5 font-normal">
                              AMC: ₹{c.subscription.amcAmount.toLocaleString()}/yr
                            </span>
                          )}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-4 text-stone-550">
                      {c.subscription ? new Date(c.subscription.nextRenewalDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4">
                      {c.subscription ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.subscription.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                          c.subscription.status === "PAST_DUE" ? "bg-amber-50 text-amber-700 border-amber-250 animate-pulse" :
                          "bg-red-50 text-red-700 border-red-250"
                        }`}>
                          {c.subscription.status}
                        </span>
                      ) : (
                        <span className="text-stone-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditor(c)}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-850 border border-teal-200 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" /> Adjust Billing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Subscription Editor Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                  <CreditCard className="w-5 h-5 text-teal-650" /> Billing: {selectedCompany.name}
                </h3>
                <p className="text-[10px] text-stone-450 font-mono mt-0.5">Code: {selectedCompany.code}</p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => saveSubscription(e, false)} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="font-bold text-stone-600">Pricing Plan Model</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none font-bold"
                  >
                    <option value="MICRO">Micro POS ERP (₹499/mo)</option>
                    <option value="FREE_TRIAL">Free Trial (14 Days)</option>
                    <option value="MONTHLY">Starter Bundle (₹999/mo)</option>
                    <option value="YEARLY">Growth Bundle (₹1,999/mo)</option>
                    <option value="ENTERPRISE_CUSTOM">Enterprise Hub (₹4,999/mo)</option>
                    <option value="ONETIME_AMC">Perpetual License (₹75,000 + ₹15,000/yr AMC)</option>
                    <option value="PAY_PER_ORDER">Pay Per Order (Usage-Based)</option>
                  </select>

                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Base Cost Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono font-bold"
                  />
                </div>

                {planType === "ONETIME_AMC" ? (
                  <div className="space-y-1">
                    <label className="font-bold text-stone-600">Annual AMC Amount</label>
                    <input
                      type="number"
                      value={amcAmount}
                      onChange={(e) => setAmcAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono font-bold"
                      placeholder="AMC fee"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-stone-650">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Next Renewal Date</label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Subscription Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                  >
                    <option value="ACTIVE">Active / Paid</option>
                    <option value="PAST_DUE">Past Due / Overdue</option>
                    <option value="SUSPENDED">Suspended / Paused</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(e) => saveSubscription(e, true)}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg font-bold transition-all text-xs"
                >
                  Reset Cycle from Today
                </button>

                <button
                  type="button"
                  onClick={() => setShowPwdModal(true)}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-2 rounded-lg font-bold transition-all text-xs flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Recover Password
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSub}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {savingSub && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Credentials Modal */}
      {showPwdModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-xl max-w-sm w-full p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-teal-650" /> Password Recovery: {selectedCompany.name}
              </h3>
              <button onClick={() => setShowPwdModal(false)} className="text-stone-400 hover:text-stone-650">
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-[11px] text-stone-500 font-medium font-sans">
                Set a recovery password for this tenant's primary <strong>Tenant Admin</strong> account.
              </p>
              <div className="space-y-1">
                <label className="font-bold text-stone-600">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowPwdModal(false)}
                  className="px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-bold text-stone-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPwd}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-all"
                >
                  {resettingPwd ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
