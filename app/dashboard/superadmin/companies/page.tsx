"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Building2,
  Plus,
  RefreshCw,
  Search,
  Edit,
  ArrowLeft,
  DollarSign,
  Clock,
  Mail,
  Home,
  Tag,
  Trash2,
  Check
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoleGuard } from "../../../../components/RoleGuard";

interface Subscription {
  id: string;
  planType: "FREE_TRIAL" | "MONTHLY" | "YEARLY" | "ONETIME_AMC" | "PAY_PER_ORDER" | "ENTERPRISE_CUSTOM";
  amount: number;
  status: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  isDefaultPickup: boolean;
}

interface Brand {
  id: string;
  name: string;
  code: string;
  logoUrl?: string | null;
  themeConfig?: any | null;
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
  customDomain?: string | null;
  customSubdomain?: string | null;
  customDomainStatus?: string | null;
  hasWhiteLabelAddon?: boolean;
  createdAt: string;
  subscription: Subscription | null;
  Warehouse: Warehouse[];
  Brand: Brand[];
}


export default function SuperadminCompaniesPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <CompaniesContent />
    </RoleGuard>
  );
}

function CompaniesContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [modalTab, setModalTab] = useState<"profile" | "warehouses" | "brands">("profile");
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Edit company profile fields
  const [compName, setCompName] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [compIsActive, setCompIsActive] = useState(true);
  const [compTimezone, setCompTimezone] = useState("IST");
  const [compCurrency, setCompCurrency] = useState("INR");
  const [compCustomDomain, setCompCustomDomain] = useState("");
  const [compCustomSubdomain, setCompCustomSubdomain] = useState("");
  const [compHasWhiteLabel, setCompHasWhiteLabel] = useState(false);
  const [savingComp, setSavingComp] = useState(false);


  // Warehouse CRUD states
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showAddWhForm, setShowAddWhForm] = useState(false);
  const [whName, setWhName] = useState("");
  const [whCode, setWhCode] = useState("");
  const [whAddress, setWhAddress] = useState("");
  const [whCity, setWhCity] = useState("");
  const [whState, setWhState] = useState("");
  const [whZip, setWhZip] = useState("");
  const [whCountry, setWhCountry] = useState("India");
  const [whIsDefault, setWhIsDefault] = useState(false);

  // Brand CRUD states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showAddBrandForm, setShowAddBrandForm] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandCode, setBrandCode] = useState("");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [brandPrimaryColor, setBrandPrimaryColor] = useState("#0d9488");
  const [brandAccentColor, setBrandAccentColor] = useState("#fbbf24");
  const [brandRadius, setBrandRadius] = useState("0.375rem");
  const [brandBannerText, setBrandBannerText] = useState("0% Commission Native Sales Channel");
  const [brandHeroTitle, setBrandHeroTitle] = useState("Premium Products, Synced in Real-Time");
  const [brandHeroSubtitle, setBrandHeroSubtitle] = useState("Experience direct database checkout.");

  // Onboarding fields
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newPlanType, setNewPlanType] = useState<Subscription["planType"]>("FREE_TRIAL");
  const [newAmount, setNewAmount] = useState(0);
  const [onboarding, setOnboarding] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/subscriptions"); // returns companies with sub-relations
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompanies(data);
      } else {
        toast.error("Failed to load company directory.");
      }
    } catch (err) {
      toast.error("Failed to load database content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    setModalTab("profile");
    setCompName(company.name);
    setCompEmail(company.contactEmail || "");
    setCompIsActive(company.isActive);
    setCompTimezone(company.timezone || "IST");
    setCompCurrency(company.currency || "INR");
    setCompCustomDomain(company.customDomain || "");
    setCompCustomSubdomain(company.customSubdomain || "");
    setCompHasWhiteLabel(company.hasWhiteLabelAddon || false);

    setWarehouses(company.Warehouse || []);

    setBrands(company.Brand || []);

    setSelectedWarehouse(null);
    setShowAddWhForm(false);
    setSelectedBrand(null);
    setShowAddBrandForm(false);
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setSavingComp(true);
    try {
      // 1. Update Profile Metadata
      const resMeta = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_COMPANY_METADATA",
          companyId: selectedCompany.id,
          name: compName,
          contactEmail: compEmail,
          timezone: compTimezone,
          currency: compCurrency,
          customDomain: compCustomDomain ? compCustomDomain.toLowerCase().trim() : null,
          customSubdomain: compCustomSubdomain ? compCustomSubdomain.toLowerCase().trim() : null,
          hasWhiteLabelAddon: compHasWhiteLabel
        })
      });


      const dataMeta = await resMeta.json();
      if (dataMeta.error) {
        toast.error(dataMeta.error);
        setSavingComp(false);
        return;
      }

      // 2. Toggle active state if changed
      if (compIsActive !== selectedCompany.isActive) {
        const resActive = await fetch("/api/superadmin/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "TOGGLE_COMPANY_ACTIVE",
            companyId: selectedCompany.id,
            isActive: compIsActive
          })
        });
        const dataActive = await resActive.json();
        if (dataActive.error) {
          toast.error(dataActive.error);
          setSavingComp(false);
          return;
        }
      }

      toast.success(`Tenant profile updated for "${compName}"!`);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (err) {
      toast.error("Failed to update tenant profile.");
    } finally {
      setSavingComp(false);
    }
  };

  // Warehouse Actions
  const openAddWh = () => {
    setSelectedWarehouse(null);
    setWhName("");
    setWhCode("");
    setWhAddress("");
    setWhCity("");
    setWhState("");
    setWhZip("");
    setWhCountry("India");
    setWhIsDefault(false);
    setShowAddWhForm(true);
  };

  const openEditWh = (wh: Warehouse) => {
    setSelectedWarehouse(wh);
    setWhName(wh.name);
    setWhCode(wh.code);
    setWhAddress(wh.addressLine1 || "");
    setWhCity(wh.city || "");
    setWhState(wh.state || "");
    setWhCountry(wh.country || "India");
    setWhIsDefault(wh.isDefaultPickup);
    setShowAddWhForm(true);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      const action = selectedWarehouse ? "UPDATE_WAREHOUSE" : "CREATE_WAREHOUSE";
      const payload: any = {
        action,
        name: whName,
        code: whCode,
        addressLine1: whAddress,
        city: whCity,
        state: whState,
        country: whCountry,
        isDefaultPickup: whIsDefault
      };

      if (selectedWarehouse) {
        payload.warehouseId = selectedWarehouse.id;
      } else {
        payload.companyId = selectedCompany.id;
      }

      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Warehouse "${whName}" saved successfully!`);
        setShowAddWhForm(false);
        setSelectedWarehouse(null);
        
        // Refresh local view
        if (action === "CREATE_WAREHOUSE") {
          setWarehouses([...warehouses, data.warehouse]);
        } else {
          setWarehouses(warehouses.map(w => w.id === selectedWarehouse?.id ? data.warehouse : w));
        }
        fetchCompanies();
      }
    } catch (e) {
      toast.error("Failed to save warehouse.");
    }
  };

  const handleDeleteWarehouse = async (whId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete warehouse "${name}"?`)) return;

    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_WAREHOUSE",
          warehouseId: whId
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Warehouse "${name}" deleted.`);
        setWarehouses(warehouses.filter(w => w.id !== whId));
        fetchCompanies();
      }
    } catch (e) {
      toast.error("Failed to delete warehouse.");
    }
  };

  // Brand Actions
  const openAddBrand = () => {
    setSelectedBrand(null);
    setBrandName("");
    setBrandCode("");
    setBrandLogoUrl("");
    setBrandPrimaryColor("#0d9488");
    setBrandAccentColor("#fbbf24");
    setBrandRadius("0.375rem");
    setBrandBannerText("0% Commission Native Sales Channel");
    setBrandHeroTitle("Premium Products, Synced in Real-Time");
    setBrandHeroSubtitle("Experience direct database checkout.");
    setShowAddBrandForm(true);
  };

  const openEditBrand = (b: Brand) => {
    setSelectedBrand(b);
    setBrandName(b.name);
    setBrandCode(b.code);
    setBrandLogoUrl(b.logoUrl || "");

    let theme: any = {};
    if (b.themeConfig) {
      theme = typeof b.themeConfig === "string" ? JSON.parse(b.themeConfig) : b.themeConfig;
    }
    setBrandPrimaryColor(theme.primary || "#0d9488");
    setBrandAccentColor(theme.accent || "#fbbf24");
    setBrandRadius(theme.radius || "0.375rem");
    setBrandBannerText(theme.bannerText || "0% Commission Native Sales Channel");
    setBrandHeroTitle(theme.heroTitle || "Premium Products, Synced in Real-Time");
    setBrandHeroSubtitle(theme.heroSubtitle || "Experience direct database checkout.");
    setShowAddBrandForm(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      const action = selectedBrand ? "UPDATE_BRAND" : "CREATE_BRAND";
      const themeConfig = {
        primary: brandPrimaryColor,
        accent: brandAccentColor,
        radius: brandRadius,
        bannerText: brandBannerText,
        heroTitle: brandHeroTitle,
        heroSubtitle: brandHeroSubtitle
      };

      const payload: any = {
        action,
        name: brandName,
        code: brandCode,
        logoUrl: brandLogoUrl || null,
        themeConfig: themeConfig
      };

      if (selectedBrand) {
        payload.brandId = selectedBrand.id;
      } else {
        payload.companyId = selectedCompany.id;
      }

      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Brand "${brandName}" saved!`);
        setShowAddBrandForm(false);
        setSelectedBrand(null);

        if (action === "CREATE_BRAND") {
          setBrands([...brands, data.brand]);
        } else {
          setBrands(brands.map(b => b.id === selectedBrand?.id ? data.brand : b));
        }
        fetchCompanies();
      }
    } catch (e) {
      toast.error("Failed to save brand.");
    }
  };

  const handleDeleteBrand = async (bId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete brand "${name}"?`)) return;

    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_BRAND",
          brandId: bId
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Brand "${name}" deleted.`);
        setBrands(brands.filter(b => b.id !== bId));
        fetchCompanies();
      }
    } catch (e) {
      toast.error("Failed to delete brand.");
    }
  };

  // Onboard Tenant Company
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
        setNewCompanyName("");
        setNewCompanyCode("");
        setNewCompanyEmail("");
        setNewAdminUser("");
        setNewAdminPassword("");
        setNewPlanType("FREE_TRIAL");
        setNewAmount(0);
        fetchCompanies();
      }
    } catch (err) {
      toast.error("Failed to onboard tenant.");
    } finally {
      setOnboarding(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contactEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 bg-gradient-to-br from-[#f0fdfa] via-[#f5f6f3] to-[#e4eae6] min-h-screen rounded-2xl relative">
      {/* Grid background */}
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
            <Building2 className="w-5 h-5 text-teal-655" /> Tenant Workspace Manager
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Manage profile configurations, inspect fulfillment warehouses, assign retail brands, and configure activation states.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOnboardModal(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Onboard Company
          </button>
          <button
            onClick={fetchCompanies}
            className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload List
          </button>
        </div>
      </div>

      {/* Main Directory Table */}
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
              Fetching companies...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">No companies found.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Tenant Company</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Fulfillment Hubs</th>
                  <th className="p-4">Retail Brands</th>
                  <th className="p-4">Timezone</th>
                  <th className="p-4">Currency</th>
                  <th className="p-4">State</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-750">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-stone-900">{c.name}</div>
                      <div className="text-[10px] text-stone-400">{c.contactEmail || "No contact email"}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-stone-550">{c.code}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 border border-teal-100 text-teal-800">
                        <Home className="w-3 h-3" />
                        {c.Warehouse?.length || 0} Warehouses
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-800">
                        <Tag className="w-3 h-3" />
                        {c.Brand?.length || 0} Brands
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-[11px] text-stone-605">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {c.timezone || "IST"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-[11px] text-stone-605 font-mono">
                        <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                        {c.currency || "INR"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-stone-100 text-stone-500 border-stone-250"
                      }`}>
                        {c.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal(c)}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-850 border border-teal-200 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" /> Manage Workspace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Main Tenant Details / Workspace Editor Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-650" /> Workspace Inspector: {selectedCompany.name}
                </h3>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Code ID: {selectedCompany.code}</p>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="text-stone-400 hover:text-stone-600 font-bold text-sm">
                ✕
              </button>
            </div>

            {/* Sub-tabs inside modal */}
            <div className="flex border-b border-stone-150 p-0.5 bg-stone-50 rounded-lg">
              <button
                type="button"
                onClick={() => setModalTab("profile")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  modalTab === "profile" 
                    ? "bg-white shadow-xs text-teal-850" 
                    : "text-stone-500 hover:text-stone-850"
                }`}
              >
                Profile Settings
              </button>
              <button
                type="button"
                onClick={() => setModalTab("warehouses")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  modalTab === "warehouses" 
                    ? "bg-white shadow-xs text-teal-850" 
                    : "text-stone-500 hover:text-stone-850"
                }`}
              >
                Warehouses ({warehouses.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab("brands")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  modalTab === "brands" 
                    ? "bg-white shadow-xs text-teal-850" 
                    : "text-stone-500 hover:text-stone-850"
                }`}
              >
                Brands ({brands.length})
              </button>
            </div>

            {/* Profile Tab */}
            {modalTab === "profile" && (
              <form onSubmit={handleEditCompany} className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-600">Company Name</label>
                    <input
                      type="text"
                      required
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-600">Contact Email</label>
                    <input
                      type="email"
                      value={compEmail}
                      onChange={(e) => setCompEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-600">Base Currency</label>
                      <select
                        value={compCurrency}
                        onChange={(e) => setCompCurrency(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-600">Timezone</label>
                      <input
                        type="text"
                        value={compTimezone}
                        onChange={(e) => setCompTimezone(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                      />
                    </div>
                  </div>

                  {/* Domain & White Label Settings Section */}
                  <div className="border border-teal-150 bg-teal-50/40 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                      <span>🌐</span> Custom Domain & Subdomain Add-On Settings
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-600 text-[11px]">Custom Domain (TLD)</label>
                        <input
                          type="text"
                          placeholder="e.g. wolfcabin.com"
                          value={compCustomDomain}
                          onChange={(e) => setCompCustomDomain(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono focus:outline-none"
                        />
                        <span className="text-[9px] text-stone-450 block">Points via CNAME to platform</span>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-600 text-[11px]">Custom Subdomain Alias</label>
                        <input
                          type="text"
                          placeholder="e.g. wolfcabin.merchantvault.com"
                          value={compCustomSubdomain}
                          onChange={(e) => setCompCustomSubdomain(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono focus:outline-none"
                        />
                        <span className="text-[9px] text-stone-450 block">Platform subdomain alias</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-teal-100 pt-2.5 mt-2">
                      <div>
                        <span className="block font-bold text-stone-850 text-xs">White-Label Branding Add-On</span>
                        <span className="block text-[9px] text-stone-500">Remove 'Powered by Merchant Vault' storefront footer.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={compHasWhiteLabel}
                          onChange={(e) => setCompHasWhiteLabel(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-stone-50 p-3.5 border border-stone-200 rounded-xl">
                    <div>
                      <span className="block font-bold text-stone-850">Company Activation State</span>
                      <span className="block text-[10px] text-stone-450 mt-0.5">Deactivate to restrict access for all associated accounts.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompIsActive(!compIsActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        compIsActive 
                          ? "bg-emerald-50 text-emerald-805 border-emerald-200" 
                          : "bg-red-50 text-red-805 border-red-200"
                      }`}
                    >
                      {compIsActive ? "Active / Enabled" : "Suspended / Off"}
                    </button>
                  </div>

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
                    disabled={savingComp}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {savingComp && <RefreshCw className="w-3 h-3 animate-spin" />}
                    Save Profile
                  </button>
                </div>
              </form>
            )}

            {/* Warehouses Tab */}
            {modalTab === "warehouses" && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-stone-900 text-xs">Fulfillment Warehouses</h4>
                  {!showAddWhForm && (
                    <button
                      onClick={openAddWh}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Warehouse
                    </button>
                  )}
                </div>

                {showAddWhForm && (
                  <form onSubmit={handleSaveWarehouse} className="bg-stone-50 p-4 border border-stone-200 rounded-xl space-y-3">
                    <h5 className="font-bold text-stone-900 border-b border-stone-200 pb-1">
                      {selectedWarehouse ? "Edit Warehouse details" : "Add New Warehouse"}
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">Warehouse Name</label>
                        <input
                          required
                          type="text"
                          value={whName}
                          onChange={(e) => setWhName(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs"
                          placeholder="Fulfillment Center X"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">Code (Unique)</label>
                        <input
                          required
                          type="text"
                          value={whCode}
                          onChange={(e) => setWhCode(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs font-mono"
                          placeholder="WH-X"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="font-bold text-stone-605">Address line</label>
                        <input
                          type="text"
                          value={whAddress}
                          onChange={(e) => setWhAddress(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs"
                          placeholder="123 Hub road"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">City</label>
                        <input
                          type="text"
                          value={whCity}
                          onChange={(e) => setWhCity(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">State / Province</label>
                        <input
                          type="text"
                          value={whState}
                          onChange={(e) => setWhState(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-200 pt-2.5">
                      <label className="flex items-center gap-1.5 font-bold text-stone-700">
                        <input
                          type="checkbox"
                          checked={whIsDefault}
                          onChange={(e) => setWhIsDefault(e.target.checked)}
                          className="rounded border-stone-300 text-teal-600 focus:ring-teal-500/20"
                        />
                        Set as Default Pickup Location
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddWhForm(false)}
                          className="px-3 py-1.5 border border-stone-250 hover:bg-white rounded-lg font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg font-bold shadow-xs"
                        >
                          Save Warehouse
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  {warehouses.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 bg-white font-medium">
                      No warehouses registered.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[9px]">
                          <th className="p-3 pl-4">Warehouse</th>
                          <th className="p-3">Code</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Default</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium text-stone-700 bg-white">
                        {warehouses.map((wh) => (
                          <tr key={wh.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-3 pl-4 font-bold text-stone-900">{wh.name}</td>
                            <td className="p-3 font-mono font-bold text-stone-500">{wh.code}</td>
                            <td className="p-3 text-[11px] text-stone-550">
                              {wh.city ? `${wh.city}, ${wh.state || ""}` : "Not set"}
                            </td>
                            <td className="p-3">
                              {wh.isDefaultPickup ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded">
                                  <Check className="w-3 h-3" /> Pickup
                                </span>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditWh(wh)}
                                  className="text-teal-700 hover:text-teal-900 font-bold"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteWarehouse(wh.id, wh.name)}
                                  className="text-red-650 hover:text-red-800 font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Brands Tab */}
            {modalTab === "brands" && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-stone-900 text-xs">Retail Brands</h4>
                  {!showAddBrandForm && (
                    <button
                      onClick={openAddBrand}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Brand
                    </button>
                  )}
                </div>

                {showAddBrandForm && (
                  <form onSubmit={handleSaveBrand} className="bg-stone-50 p-5 border border-stone-200 rounded-xl space-y-4 max-w-lg animate-in fade-in slide-in-from-top-1.5 duration-200">
                    <h5 className="font-extrabold text-stone-900 border-b border-stone-200 pb-1.5 text-xs flex items-center gap-1.5">
                      <span>🎨</span> {selectedBrand ? "Edit Brand Aesthetics & Settings" : "Configure New Brand Storefront"}
                    </h5>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">Brand Name</label>
                        <input
                          required
                          type="text"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g. Alpha Collections"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">Brand Code (Routing ID)</label>
                        <input
                          required
                          type="text"
                          value={brandCode}
                          onChange={(e) => setBrandCode(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g. alpha"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="font-bold text-stone-605">Logo Image URL</label>
                        <input
                          type="url"
                          value={brandLogoUrl}
                          onChange={(e) => setBrandLogoUrl(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>

                      <div className="space-y-1 col-span-2 border-t border-stone-200/50 pt-2">
                        <h6 className="font-bold text-[10px] text-stone-500 uppercase tracking-wide mb-2">Color Palette (Tweakcn Inspired)</h6>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-semibold text-stone-600 text-[10px]">Primary Brand Color</label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                value={brandPrimaryColor}
                                onChange={(e) => setBrandPrimaryColor(e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 p-0"
                              />
                              <input
                                type="text"
                                value={brandPrimaryColor}
                                onChange={(e) => setBrandPrimaryColor(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-2.5 text-[10px] font-mono focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="font-semibold text-stone-600 text-[10px]">Accent Color</label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                value={brandAccentColor}
                                onChange={(e) => setBrandAccentColor(e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 p-0"
                              />
                              <input
                                type="text"
                                value={brandAccentColor}
                                onChange={(e) => setBrandAccentColor(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-2.5 text-[10px] font-mono focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">Corner Radius</label>
                        <select
                          value={brandRadius}
                          onChange={(e) => setBrandRadius(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                        >
                          <option value="0px">0px (Sharp borders)</option>
                          <option value="0.25rem">4px (Subtle curves)</option>
                          <option value="0.375rem">6px (Shadcn default)</option>
                          <option value="0.5rem">8px (Standard curves)</option>
                          <option value="0.75rem">12px (High rounded)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-605">Top Banner Text</label>
                        <input
                          type="text"
                          value={brandBannerText}
                          onChange={(e) => setBrandBannerText(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g. Free shipping on orders over ₹3000!"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="font-bold text-stone-605">Hero Welcome Title</label>
                        <input
                          type="text"
                          value={brandHeroTitle}
                          onChange={(e) => setBrandHeroTitle(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g. Handcrafted Premium Silks"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="font-bold text-stone-605">Hero Description Subtitle</label>
                        <textarea
                          value={brandHeroSubtitle}
                          onChange={(e) => setBrandHeroSubtitle(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[50px] resize-none"
                          placeholder="Brief brand story or sub-header..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-stone-200 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddBrandForm(false)}
                        className="px-3.5 py-2 border border-stone-250 hover:bg-white rounded-lg font-bold text-stone-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold shadow-xs transition-colors"
                      >
                        Save Brand Config
                      </button>
                    </div>
                  </form>
                )}

                <div className="border border-stone-200 rounded-xl overflow-hidden max-w-xl">
                  {brands.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 bg-white font-medium">
                      No brands registered.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[9px]">
                          <th className="p-3 pl-4">Brand</th>
                          <th className="p-3">Routing Code</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium text-stone-700 bg-white">
                        {brands.map((b) => (
                          <tr key={b.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-3 pl-4 font-bold text-stone-900">{b.name}</td>
                            <td className="p-3 font-mono font-bold text-stone-500">{b.code}</td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditBrand(b)}
                                  className="text-teal-700 hover:text-teal-900 font-bold"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBrand(b.id, b.name)}
                                  className="text-red-650 hover:text-red-800 font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Onboard Company Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-655" /> Onboard New Tenant Company
              </h3>
              <button onClick={() => setShowOnboardModal(false)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Company Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Acme Clothing"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Company Code (Unique ID)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. acme"
                    value={newCompanyCode}
                    onChange={(e) => setNewCompanyCode(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-bold text-stone-600">Contact Email</label>
                  <input
                    type="email"
                    placeholder="ops@acme.com"
                    value={newCompanyEmail}
                    onChange={(e) => setNewCompanyEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1 col-span-2 border-t border-b border-stone-100 py-3 my-1">
                  <h4 className="font-bold text-stone-900 mb-2">Initial Tenant Admin Credentials</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-555">Username</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. acme_admin"
                        value={newAdminUser}
                        onChange={(e) => setNewAdminUser(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-stone-555">Password</label>
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Starting Billing Plan</label>
                  <select
                    value={newPlanType}
                    onChange={(e) => setNewPlanType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
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
                  <label className="font-bold text-stone-600">Plan Amount (INR)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {onboarding && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
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
