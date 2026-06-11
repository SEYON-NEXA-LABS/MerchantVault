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
  CheckCircle2,
  AlertCircle,
  KeyRound,
  DollarSign,
  TrendingUp,
  Clock,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "../../../components/RoleGuard";

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
  isActive: boolean;
  createdAt: string;
  subscription: Subscription | null;
}

export default function SuperadminPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <SuperadminContent />
    </RoleGuard>
  );
}

function SuperadminContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modal States
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [planType, setPlanType] = useState<Subscription["planType"]>("MONTHLY");
  const [amount, setAmount] = useState(0);
  const [amcAmount, setAmcAmount] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState<Subscription["status"]>("ACTIVE");
  const [renewalDate, setRenewalDate] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  // Password Reset Modal States
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPwd, setResettingPwd] = useState(false);

  // Onboarding Modal States
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newPlanType, setNewPlanType] = useState<Subscription["planType"]>("FREE_TRIAL");
  const [newAmount, setNewAmount] = useState(0);
  const [onboarding, setOnboarding] = useState(false);

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

  const handleOnboardTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newCompanyCode || !newAdminUser || !newAdminPassword) {
      toast.error("Please fill in all required onboarding fields.");
      return;
    }

    setOnboarding(true);
    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCompanyName,
          code: newCompanyCode.toLowerCase().replace(/\s+/g, ""),
          contactEmail: newCompanyEmail,
          adminUsername: newAdminUser,
          adminPassword: newAdminPassword,
          planType: newPlanType,
          amount: newAmount,
          currency: "INR"
        })
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`New tenant "${newCompanyName}" onboarding complete!`);
        setShowOnboardModal(false);
        // Clear inputs
        setNewCompanyName("");
        setNewCompanyCode("");
        setNewCompanyEmail("");
        setNewAdminUser("");
        setNewAdminPassword("");
        setNewPlanType("FREE_TRIAL");
        setNewAmount(0);
        fetchSubscriptions();
      }
    } catch (err) {
      toast.error("Failed to onboard tenant.");
    } finally {
      setOnboarding(false);
    }
  };

  // Calculations
  const calculateARR = () => {
    let totalArr = 0;
    companies.forEach(c => {
      if (!c.subscription || c.subscription.status !== "ACTIVE") return;
      const amount = c.subscription.amount;
      if (c.subscription.planType === "MONTHLY") {
        totalArr += amount * 12;
      } else if (c.subscription.planType === "YEARLY") {
        totalArr += amount;
      } else if (c.subscription.planType === "ONETIME_AMC") {
        totalArr += c.subscription.amcAmount; // AMC is annual recurring
      }
    });
    return totalArr;
  };

  const arr = calculateARR();
  const activeTenants = companies.filter(c => c.subscription?.status === "ACTIVE").length;
  const trialTenants = companies.filter(c => c.subscription?.planType === "FREE_TRIAL").length;
  const alertTenants = companies.filter(c => c.subscription?.status === "PAST_DUE").length;

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPlan = (plan: string) => {
    if (plan === "ONETIME_AMC") return "One-time + AMC";
    if (plan === "PAY_PER_ORDER") return "Pay Per Order";
    if (plan === "ENTERPRISE_CUSTOM") return "Enterprise Custom";
    if (plan === "FREE_TRIAL") return "Free Trial";
    if (plan === "MONTHLY") return "Monthly Sub";
    if (plan === "YEARLY") return "Yearly Sub";
    return plan;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-950" /> Platform Superadmin Control
          </h1>
          <p className="text-sm text-gray-500">
            Platform control center to onboard new tenants, configure pricing plans, track ARR metrics, and manage user recovery keys.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowOnboardModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Onboard New Tenant
          </button>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-150 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Subscriptions
          </button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Platform ARR</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-indigo-900">₹{arr.toLocaleString()}</span>
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Annual
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Customers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{activeTenants}</span>
            <span className="text-xs text-gray-400 font-medium">running tenants</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trial Accounts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-955">{trialTenants}</span>
            <span className="text-xs text-amber-600 font-medium">evaluating platform</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Past-Due Alerts</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${alertTenants > 0 ? "text-red-600" : "text-gray-900"}`}>{alertTenants}</span>
            <span className="text-xs text-gray-450 font-medium">requiring review</span>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              Loading database...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">No tenants registered.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Tenant Company</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Billing Plan</th>
                  <th className="p-4">Rate / Cost</th>
                  <th className="p-4">Next Renewal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{c.name}</td>
                    <td className="p-4 font-mono font-bold text-gray-500">{c.code}</td>
                    <td className="p-4">
                      {c.subscription ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {formatPlan(c.subscription.planType)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Configured</span>
                      )}
                    </td>
                    <td className="p-4 font-mono">
                      {c.subscription ? (
                        <>
                          ₹{c.subscription.amount.toLocaleString()}
                          {c.subscription.planType === "ONETIME_AMC" && (
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              AMC: ₹{c.subscription.amcAmount.toLocaleString()}/yr
                            </span>
                          )}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-4 text-gray-500">
                      {c.subscription ? new Date(c.subscription.nextRenewalDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4">
                      {c.subscription ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.subscription.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                          c.subscription.status === "PAST_DUE" ? "bg-amber-50 text-amber-700 animate-pulse" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {c.subscription.status}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditor(c)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs"
                      >
                        Manage Subscription
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
          <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                  <CreditCard className="w-5 h-5 text-indigo-650" /> Billing: {selectedCompany.name}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Tenant Code: {selectedCompany.code}</p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-gray-400 hover:text-gray-650"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => saveSubscription(e, false)} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-gray-600">Pricing Plan Model</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  >
                    <option value="FREE_TRIAL">Free Trial</option>
                    <option value="MONTHLY">Monthly Subscription</option>
                    <option value="YEARLY">Yearly Subscription</option>
                    <option value="ONETIME_AMC">One-time Setup + AMC</option>
                    <option value="PAY_PER_ORDER">Pay Per Order (Usage-based)</option>
                    <option value="ENTERPRISE_CUSTOM">Enterprise Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Base Cost Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono font-bold"
                  />
                </div>

                {planType === "ONETIME_AMC" ? (
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Annual AMC Amount</label>
                    <input
                      type="number"
                      value={amcAmount}
                      onChange={(e) => setAmcAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono font-bold"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-650">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Next Renewal Date</label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Subscription Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm"
                  >
                    <option value="ACTIVE">Active / Paid</option>
                    <option value="PAST_DUE">Past Due / Overdue</option>
                    <option value="SUSPENDED">Suspended / Paused</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
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
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-150 px-3 py-2 rounded-lg font-bold transition-all text-xs flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Reset Admin Pwd
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSub}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {savingSub && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPwdModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-650" /> Reset Password: {selectedCompany.name}
              </h3>
              <button onClick={() => setShowPwdModal(false)} className="text-gray-400 hover:text-gray-650">
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-[11px] text-gray-500">
                This will overwrite the credential key for the main <strong>Tenant Admin</strong> account. Provide the new password:
              </p>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPwdModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPwd}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition-all"
                >
                  {resettingPwd ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                <Building2 className="w-5 h-5 text-indigo-650" /> Onboard New Tenant Company
              </h3>
              <button onClick={() => setShowOnboardModal(false)} className="text-gray-400 hover:text-gray-650">
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Company Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Acme Clothing"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Company Code (Unique ID)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. acme"
                    value={newCompanyCode}
                    onChange={(e) => setNewCompanyCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-gray-600">Contact Email</label>
                  <input
                    type="email"
                    placeholder="ops@acme.com"
                    value={newCompanyEmail}
                    onChange={(e) => setNewCompanyEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1 col-span-2 border-t border-b border-gray-100 py-3 my-1">
                  <h4 className="font-bold text-gray-900 mb-2">Initial Tenant Admin Credentials</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-550">Username</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. acme_admin"
                        value={newAdminUser}
                        onChange={(e) => setNewAdminUser(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-550">Password</label>
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Starting Billing Plan</label>
                  <select
                    value={newPlanType}
                    onChange={(e) => setNewPlanType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  >
                    <option value="FREE_TRIAL">Free Trial</option>
                    <option value="MONTHLY">Monthly Subscription</option>
                    <option value="YEARLY">Yearly Subscription</option>
                    <option value="ONETIME_AMC">One-time Setup + AMC</option>
                    <option value="PAY_PER_ORDER">Pay Per Order</option>
                    <option value="ENTERPRISE_CUSTOM">Enterprise Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Plan Amount (INR)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {onboarding && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Register & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
