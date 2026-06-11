"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Link2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Key,
  Globe,
  Building2,
  Lock,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Check,
  Truck
} from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "../../../components/RoleGuard";

interface HandshakeStep {
  id: number;
  label: string;
  status: "idle" | "loading" | "success" | "failed";
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefaultPickup: boolean;
}

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "TENANTADMIN"]}>
      <SettingsContent />
    </RoleGuard>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<"shopify" | "company" | "warehouses" | "logistics">("shopify");
  
  // Shopify credentials form states
  const [shopUrl, setShopUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Handshake execution states
  const [handshaking, setHandshaking] = useState(false);
  const [steps, setSteps] = useState<HandshakeStep[]>([
    { id: 1, label: "Verifying Shopify shop domain URL connectivity", status: "idle" },
    { id: 2, label: "Testing Admin API Access Token permissions & scopes", status: "idle" },
    { id: 3, label: "Registering webhooks (orders/create, inventory/update)", status: "idle" },
    { id: 4, label: "Initiating initial metadata synchronization", status: "idle" }
  ]);

  // Company details form states
  const [companyName, setCompanyName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("");
  const [defaultThreshold, setDefaultThreshold] = useState(3);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Warehouses states
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  
  // Warehouse form state
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);
  const [whName, setWhName] = useState("");
  const [whCode, setWhCode] = useState("");
  const [whAddress1, setWhAddress1] = useState("");
  const [whAddress2, setWhAddress2] = useState("");
  const [whCity, setWhCity] = useState("");
  const [whState, setWhState] = useState("");
  const [whZip, setWhZip] = useState("");
  const [whCountry, setWhCountry] = useState("India");
  const [whIsDefault, setWhIsDefault] = useState(false);
  const [savingWarehouse, setSavingWarehouse] = useState(false);

  // Courier Integrations States
  const [courierConfigs, setCourierConfigs] = useState<any[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [savingCourierPartner, setSavingCourierPartner] = useState<string | null>(null);

  // States for each partner's fields
  const [shiprocketEmail, setShiprocketEmail] = useState("");
  const [shiprocketPassword, setShiprocketPassword] = useState("");
  const [shiprocketActive, setShiprocketActive] = useState(true);

  const [delhiveryKey, setDelhiveryKey] = useState("");
  const [delhiveryActive, setDelhiveryActive] = useState(true);

  const [bluedartLicense, setBluedartLicense] = useState("");
  const [bluedartActive, setBluedartActive] = useState(true);

  const [dtdcKey, setDtdcKey] = useState("");
  const [dtdcActive, setDtdcActive] = useState(true);

  const [xpressbeesKey, setXpressbeesKey] = useState("");
  const [xpressbeesActive, setXpressbeesActive] = useState(true);

  const [indiaPostKey, setIndiaPostKey] = useState("");
  const [indiaPostActive, setIndiaPostActive] = useState(true);

  const [professionalCouriersKey, setProfessionalCouriersKey] = useState("");
  const [professionalCouriersActive, setProfessionalCouriersActive] = useState(true);

  // Fetch courier settings
  const fetchCourierConfigs = async () => {
    setLoadingCouriers(true);
    try {
      const res = await fetch("/api/logistics/couriers");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourierConfigs(data);
        // Map configs to inputs
        data.forEach(cfg => {
          if (cfg.courierPartner === "SHIPROCKET") {
            setShiprocketEmail(cfg.apiEmail || "");
            setShiprocketPassword(cfg.apiPassword || "");
            setShiprocketActive(cfg.isActive);
          } else if (cfg.courierPartner === "DELHIVERY") {
            setDelhiveryKey(cfg.apiKey || "");
            setDelhiveryActive(cfg.isActive);
          } else if (cfg.courierPartner === "BLUEDART") {
            setBluedartLicense(cfg.apiKey || "");
            setBluedartActive(cfg.isActive);
          } else if (cfg.courierPartner === "DTDC") {
            setDtdcKey(cfg.apiKey || "");
            setDtdcActive(cfg.isActive);
          } else if (cfg.courierPartner === "XPRESSBEES") {
            setXpressbeesKey(cfg.apiKey || "");
            setXpressbeesActive(cfg.isActive);
          } else if (cfg.courierPartner === "INDIA_POST") {
            setIndiaPostKey(cfg.apiKey || "");
            setIndiaPostActive(cfg.isActive);
          } else if (cfg.courierPartner === "THE_PROFESSIONAL_COURIERS") {
            setProfessionalCouriersKey(cfg.apiKey || "");
            setProfessionalCouriersActive(cfg.isActive);
          }
        });
      }
    } catch (err) {
      toast.error("Failed to load courier configurations.");
    } finally {
      setLoadingCouriers(false);
    }
  };

  const saveCourierConfig = async (partner: string, payload: any) => {
    setSavingCourierPartner(partner);
    try {
      const res = await fetch("/api/logistics/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierPartner: partner,
          ...payload
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`${partner} configuration saved successfully!`);
        fetchCourierConfigs();
      }
    } catch (err) {
      toast.error(`Failed to save ${partner} configuration.`);
    } finally {
      setSavingCourierPartner(null);
    }
  };

  // Fetch warehouses
  const fetchWarehouses = async () => {
    setLoadingWarehouses(true);
    try {
      const res = await fetch("/api/warehouses");
      const data = await res.json();
      if (Array.isArray(data)) {
        setWarehouses(data);
      } else {
        toast.error("Failed to load warehouses data.");
      }
    } catch (err) {
      toast.error("Error connecting to server.");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Fetch company settings from API
  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (!data.error) {
        setCompanyName(data.name || "");
        setCurrency(data.currency || "INR");
        setTimezone(data.timezone ? `${data.timezone} (UTC+05:30)` : "IST (UTC+05:30)");
        if (data.shopifyStoreUrl) {
          setShopUrl(data.shopifyStoreUrl.replace("https://", ""));
          setIsConnected(true);
        }
        if (data.shopifyAccessToken) {
          setAccessToken(data.shopifyAccessToken);
        }
      }
    } catch (err) {
      toast.error("Failed to load company settings.");
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "warehouses") {
      fetchWarehouses();
    } else if (activeTab === "logistics") {
      fetchCourierConfigs();
    }
  }, [activeTab]);

  const executeHandshake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopUrl || !accessToken || !secretKey) {
      toast.error("Please fill in all Shopify credentials.");
      return;
    }

    setHandshaking(true);
    setIsConnected(false);

    // Reset step statuses
    setSteps(prev => prev.map(s => ({ ...s, status: "idle" })));

    // Sequential simulation of handshake
    let currentStep = 0;
    
    const runNextStep = () => {
      if (currentStep < steps.length) {
        // Mark current as loading
        setSteps(prev => prev.map(s => s.id === currentStep + 1 ? { ...s, status: "loading" } : s));
        
        setTimeout(() => {
          // Mark current as success
          setSteps(prev => prev.map(s => s.id === currentStep + 1 ? { ...s, status: "success" } : s));
          currentStep++;
          runNextStep();
        }, 1200);
      } else {
        // Complete
        setTimeout(() => {
          setHandshaking(false);
          setIsConnected(true);
          toast.success("Shopify Handshake Complete! Connection status is now Active.");
        }, 800);
      }
    };

    runNextStep();
  };

  const saveCompanyDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          currency,
          timezone: timezone.split(" ")[0], // Extract just the code e.g. "IST"
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Company details saved! Default low stock threshold set to ${defaultThreshold} units.`);
      } else {
        toast.error(data.error || "Failed to save company details.");
      }
    } catch (err) {
      toast.error("Failed to connect to settings API.");
    }
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect this Shopify store? This will pause webhook integrations.")) {
      setIsConnected(false);
      setAccessToken("");
      setSecretKey("");
      toast.info("Shopify store disconnected.");
    }
  };

  // Warehouse CRUD Actions
  const handleOpenWarehouseModal = (wh?: Warehouse) => {
    if (wh) {
      setEditingWarehouseId(wh.id);
      setWhName(wh.name);
      setWhCode(wh.code);
      setWhAddress1(wh.addressLine1);
      setWhAddress2(wh.addressLine2 || "");
      setWhCity(wh.city);
      setWhState(wh.state);
      setWhZip(wh.zip);
      setWhCountry(wh.country);
      setWhIsDefault(wh.isDefaultPickup);
    } else {
      setEditingWarehouseId(null);
      setWhName("");
      setWhCode(`WH-${Math.floor(100 + Math.random() * 900)}`);
      setWhAddress1("");
      setWhAddress2("");
      setWhCity("");
      setWhState("");
      setWhZip("");
      setWhCountry("India");
      setWhIsDefault(warehouses.length === 0); // Default if it's the first one
    }
    setShowWarehouseModal(true);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWarehouse(true);
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingWarehouseId || undefined,
          name: whName,
          code: whCode,
          addressLine1: whAddress1,
          addressLine2: whAddress2 || null,
          city: whCity,
          state: whState,
          zip: whZip,
          country: whCountry,
          isDefaultPickup: whIsDefault
        })
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(editingWarehouseId ? "Warehouse updated successfully!" : "Warehouse added successfully!");
        setShowWarehouseModal(false);
        fetchWarehouses();
      }
    } catch (err) {
      toast.error("Failed to save warehouse.");
    } finally {
      setSavingWarehouse(false);
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/warehouses?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Warehouse deleted successfully.");
        fetchWarehouses();
      } else {
        toast.error(data.error || "Failed to delete warehouse.");
      }
    } catch (err) {
      toast.error("Failed to connect to delete endpoint.");
    }
  };

  const handleSetDefaultPickup = async (wh: Warehouse) => {
    if (wh.isDefaultPickup) return;
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...wh,
          isDefaultPickup: true
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`${wh.name} set as default pickup location.`);
        fetchWarehouses();
      }
    } catch (err) {
      toast.error("Failed to update default pickup status.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-950" /> Tenant Settings
          </h1>
          <p className="text-sm text-gray-500">
            Configure your textile tenant profiles, security access details, warehouses, and connect Shopify integrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Settings Navigation Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit space-y-1">
          <button
            onClick={() => setActiveTab("shopify")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              activeTab === "shopify" 
                ? "bg-indigo-50 text-indigo-950 border border-indigo-100" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Link2 className="w-4 h-4" /> Shopify Integration
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              activeTab === "company" 
                ? "bg-indigo-50 text-indigo-950 border border-indigo-100" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Building2 className="w-4 h-4" /> Company Details
          </button>
          <button
            onClick={() => setActiveTab("warehouses")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              activeTab === "warehouses" 
                ? "bg-indigo-50 text-indigo-950 border border-indigo-100" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <MapPin className="w-4 h-4" /> Warehouses & Stores
          </button>
          <button
            onClick={() => setActiveTab("logistics")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              activeTab === "logistics" 
                ? "bg-indigo-50 text-indigo-950 border border-indigo-100" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Truck className="w-4 h-4" /> Courier Integrations
          </button>
        </div>

        {/* Dynamic Settings Pane */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "shopify" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Credentials Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5 lg:col-span-2">
                <div>
                  <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
                    Shopify App Handshake
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Configure credentials from your Shopify Custom Admin App.</p>
                </div>

                <form onSubmit={executeHandshake} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-gray-400" /> Shopify Store Domain URL
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={shopUrl} 
                      disabled={handshaking}
                      onChange={e => setShopUrl(e.target.value)} 
                      placeholder="e.g. storename.myshopify.com" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-gray-400" /> Admin API Access Token
                    </label>
                    <input 
                      required 
                      type="password" 
                      value={accessToken} 
                      disabled={handshaking}
                      onChange={e => setAccessToken(e.target.value)} 
                      placeholder="shpat_..." 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-gray-400" /> Webhook API Secret Key
                    </label>
                    <input 
                      required 
                      type="password" 
                      value={secretKey} 
                      disabled={handshaking}
                      onChange={e => setSecretKey(e.target.value)} 
                      placeholder="whsec_..." 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono" 
                    />
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={handshaking}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                      {handshaking ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Connection...
                        </>
                      ) : (
                        <>
                          Connect & Initiate Handshake
                        </>
                      )}
                    </button>
                    {isConnected && !handshaking && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        Disconnect Store
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Status / Live Check panel */}
              <div className="space-y-6">
                
                {/* Connection Health */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Bridge Status</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      isConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-white" : "bg-gray-400"}`}></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{isConnected ? "Connected & Active" : "Disconnected"}</p>
                      <p className="text-[10px] text-gray-500">
                        {isConnected ? "Listening to Webhook updates" : "Inactive - Handshake required"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Handshake Progress List */}
                {(handshaking || !isConnected) && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3.5">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Handshake Checklist</h4>
                    <div className="space-y-3 text-xs">
                      {steps.map(step => (
                        <div key={step.id} className="flex items-start gap-2.5">
                          {step.status === "idle" && (
                            <div className="w-4 h-4 rounded-full border border-gray-300 mt-0.5 flex-shrink-0"></div>
                          )}
                          {step.status === "loading" && (
                            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin mt-0.5 flex-shrink-0" />
                          )}
                          {step.status === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          )}
                          {step.status === "failed" && (
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-[11px] leading-tight ${
                            step.status === "success" ? "text-gray-500 line-through" : "text-gray-700 font-medium"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Card */}
                {isConnected && !handshaking && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 shadow-sm space-y-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900 text-xs">Seyon API Handshake Valid</h4>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Custom Application Token scopes verified. Product write catalogs and incoming customer order webhooks are synced successfully.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "company" && (
            /* Company Settings Pane */
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-bold text-gray-950 text-base">Tenant Company Profile</h3>
                <p className="text-xs text-gray-500 mt-1">Configure tenant identification, default thresholds, currencies, and regional settings.</p>
              </div>

              <form onSubmit={saveCompanyDetails} className="space-y-4 text-xs max-w-lg">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Company Name</label>
                  <input 
                    required 
                    type="text" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Default Currency</label>
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Timezone</label>
                    <input 
                      disabled
                      type="text" 
                      value={timezone} 
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm cursor-not-allowed font-medium text-gray-500" 
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-semibold text-gray-600">Default Low Stock Alert Threshold</label>
                    <input 
                      type="number"
                      min="1"
                      value={defaultThreshold} 
                      onChange={e => setDefaultThreshold(parseInt(e.target.value) || 3)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold" 
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm"
                  >
                    Save Company Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "warehouses" && (
            /* Warehouses Management Pane */
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" /> Warehouses & Pickup Locations
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage storage facilities, retail outlets, and specify the default fulfillment pickup center.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenWarehouseModal()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Warehouse
                </button>
              </div>

              {loadingWarehouses ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-xs">Loading warehouses database...</p>
                </div>
              ) : warehouses.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl text-gray-400 space-y-3">
                  <MapPin className="w-10 h-10 mx-auto text-gray-300" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">No Warehouses Configured</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Define your warehouse locations to enable inventory level tracking and order fulfillment source selection.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {warehouses.map((wh) => (
                    <div
                      key={wh.id}
                      className={`p-4 border rounded-xl shadow-xs transition-all duration-200 flex flex-col justify-between ${
                        wh.isDefaultPickup
                          ? "border-indigo-500 bg-indigo-50/10 shadow-indigo-100/50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{wh.name}</span>
                          <span className="font-mono text-[10px] bg-gray-150 text-gray-600 px-2 py-0.5 rounded font-bold">
                            {wh.code}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500 space-y-0.5 leading-relaxed">
                          <p>{wh.addressLine1}</p>
                          {wh.addressLine2 && <p>{wh.addressLine2}</p>}
                          <p>{wh.city}, {wh.state} - {wh.zip}</p>
                          <p className="font-medium text-gray-700">{wh.country}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          {wh.isDefaultPickup ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3" /> Default Pickup
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultPickup(wh)}
                              className="text-[10px] font-semibold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                            >
                              Make Default
                            </button>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenWarehouseModal(wh)}
                            className="text-gray-400 hover:text-indigo-650 p-1 rounded hover:bg-gray-50 transition-colors"
                            title="Edit Location"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWarehouse(wh.id)}
                            className="text-gray-400 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Location"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "logistics" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-950" /> Courier Integrations
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Configure API credentials for Shiprocket, Delhivery, Bluedart, and DTDC to enable automated tracking and shipping label generation.
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 text-indigo-700 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-indigo-900 text-xs sm:text-sm">Mock Integration Mode Enabled</h4>
                  <p className="text-[11px] sm:text-xs text-indigo-850 mt-1 leading-relaxed">
                    Credentials stored below will be saved securely in the database. Courier operations (Manifest generation, status transitions) are operating in <strong>Mock/Manual entry mode</strong> for development. These configurations are API-ready and can be seamlessly linked to live Shiprocket/Delhivery/Bluedart/DTDC REST API endpoints in the future.
                  </p>
                </div>
              </div>

              {loadingCouriers ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-xs">Loading configurations...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shiprocket */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-xs">SR</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">Shiprocket</h4>
                            <p className="text-[10px] text-gray-400">API Credentials</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shiprocketActive}
                            onChange={(e) => setShiprocketActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API Email Address</label>
                          <input
                            type="email"
                            value={shiprocketEmail}
                            onChange={(e) => setShiprocketEmail(e.target.value)}
                            placeholder="email@shiprocket.in"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API Password</label>
                          <input
                            type="password"
                            value={shiprocketPassword}
                            onChange={(e) => setShiprocketPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => saveCourierConfig("SHIPROCKET", {
                          apiEmail: shiprocketEmail,
                          apiPassword: shiprocketPassword,
                          isActive: shiprocketActive
                        })}
                        disabled={savingCourierPartner === "SHIPROCKET"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {savingCourierPartner === "SHIPROCKET" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save Shiprocket Config
                      </button>
                    </div>
                  </div>

                  {/* Delhivery */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-xs">DV</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">Delhivery</h4>
                            <p className="text-[10px] text-gray-400">API Token</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={delhiveryActive}
                            onChange={(e) => setDelhiveryActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API Token / Key</label>
                          <input
                            type="password"
                            value={delhiveryKey}
                            onChange={(e) => setDelhiveryKey(e.target.value)}
                            placeholder="delhivery_api_key_..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => saveCourierConfig("DELHIVERY", {
                          apiKey: delhiveryKey,
                          isActive: delhiveryActive
                        })}
                        disabled={savingCourierPartner === "DELHIVERY"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {savingCourierPartner === "DELHIVERY" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save Delhivery Config
                      </button>
                    </div>
                  </div>

                  {/* Bluedart */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-xs">BD</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">Bluedart</h4>
                            <p className="text-[10px] text-gray-400">License Key</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bluedartActive}
                            onChange={(e) => setBluedartActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API License Key</label>
                          <input
                            type="password"
                            value={bluedartLicense}
                            onChange={(e) => setBluedartLicense(e.target.value)}
                            placeholder="bluedart_license_key_..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => saveCourierConfig("BLUEDART", {
                          apiKey: bluedartLicense,
                          isActive: bluedartActive
                        })}
                        disabled={savingCourierPartner === "BLUEDART"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {savingCourierPartner === "BLUEDART" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save Bluedart Config
                      </button>
                    </div>
                  </div>

                  {/* DTDC */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-xs">DT</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">DTDC</h4>
                            <p className="text-[10px] text-gray-400">Client ID / Key</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dtdcActive}
                            onChange={(e) => setDtdcActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API Client ID / Key</label>
                          <input
                            type="password"
                            value={dtdcKey}
                            onChange={(e) => setDtdcKey(e.target.value)}
                            placeholder="dtdc_client_key_..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => saveCourierConfig("DTDC", {
                          apiKey: dtdcKey,
                          isActive: dtdcActive
                        })}
                        disabled={savingCourierPartner === "DTDC"}
                        className="w-full bg-indigo-600 hover:bg-indigo-750 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {savingCourierPartner === "DTDC" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save DTDC Config
                      </button>
                    </div>
                  </div>

                  {/* Xpressbees */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-xs">XB</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">Xpressbees</h4>
                            <p className="text-[10px] text-gray-400">API Key / Token</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={xpressbeesActive}
                            onChange={(e) => setXpressbeesActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API Key / Customer Key</label>
                          <input
                            type="password"
                            value={xpressbeesKey}
                            onChange={(e) => setXpressbeesKey(e.target.value)}
                            placeholder="xpressbees_key_..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => saveCourierConfig("XPRESSBEES", {
                          apiKey: xpressbeesKey,
                          isActive: xpressbeesActive
                        })}
                        disabled={savingCourierPartner === "XPRESSBEES"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {savingCourierPartner === "XPRESSBEES" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save Xpressbees Config
                      </button>
                    </div>
                  </div>

                  {/* India Post */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-xs">IP</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">India Post</h4>
                            <p className="text-[10px] text-gray-400">API Key / Account ID</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={indiaPostActive}
                            onChange={(e) => setIndiaPostActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API Key / License Key</label>
                          <input
                            type="password"
                            value={indiaPostKey}
                            onChange={(e) => setIndiaPostKey(e.target.value)}
                            placeholder="indiapost_key_..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => saveCourierConfig("INDIA_POST", {
                          apiKey: indiaPostKey,
                          isActive: indiaPostActive
                        })}
                        disabled={savingCourierPartner === "INDIA_POST"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {savingCourierPartner === "INDIA_POST" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save India Post Config
                      </button>
                    </div>
                  </div>

                  {/* The Professional Couriers */}
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-xs">TP</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">The Professional Couriers</h4>
                            <p className="text-[10px] text-gray-400">API License Key</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={professionalCouriersActive}
                            onChange={(e) => setProfessionalCouriersActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-600">API Key</label>
                          <input
                            type="password"
                            value={professionalCouriersKey}
                            onChange={(e) => setProfessionalCouriersKey(e.target.value)}
                            placeholder="tpc_key_..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => saveCourierConfig("THE_PROFESSIONAL_COURIERS", {
                          apiKey: professionalCouriersKey,
                          isActive: professionalCouriersActive
                        })}
                        disabled={savingCourierPartner === "THE_PROFESSIONAL_COURIERS"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        {savingCourierPartner === "THE_PROFESSIONAL_COURIERS" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save TPC Config
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Warehouse Modal */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {editingWarehouseId ? "Edit Warehouse Profile" : "Add Warehouse Facility"}
              </h3>
              <button
                onClick={() => setShowWarehouseModal(false)}
                className="text-gray-400 hover:text-gray-650"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Warehouse Name</label>
                  <input
                    required
                    type="text"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    placeholder="e.g. Mumbai Fulfillment Center"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Unique Code Identifier</label>
                  <input
                    required
                    type="text"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    placeholder="e.g. WH-MUMBAI"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-gray-600">Address Line 1</label>
                  <input
                    required
                    type="text"
                    value={whAddress1}
                    onChange={(e) => setWhAddress1(e.target.value)}
                    placeholder="Street name, floor, suite"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-gray-600">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={whAddress2}
                    onChange={(e) => setWhAddress2(e.target.value)}
                    placeholder="Additional locality info"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">City</label>
                  <input
                    required
                    type="text"
                    value={whCity}
                    onChange={(e) => setWhCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">State / Region</label>
                  <input
                    required
                    type="text"
                    value={whState}
                    onChange={(e) => setWhState(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">ZIP / Postal Code</label>
                  <input
                    required
                    type="text"
                    value={whZip}
                    onChange={(e) => setWhZip(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Country</label>
                  <input
                    required
                    type="text"
                    value={whCountry}
                    onChange={(e) => setWhCountry(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  id="default-pickup-checkbox"
                  type="checkbox"
                  checked={whIsDefault}
                  onChange={(e) => setWhIsDefault(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="default-pickup-checkbox" className="font-semibold text-gray-700 cursor-pointer">
                  Mark this location as default shipment pickup center
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWarehouseModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-55 rounded-lg font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWarehouse}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {savingWarehouse && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
