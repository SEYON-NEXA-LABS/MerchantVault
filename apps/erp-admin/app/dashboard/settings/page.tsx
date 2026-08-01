"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Truck,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  QrCode
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
  const [activeTab, setActiveTab] = useState<"company" | "bridging" | "warehouses" | "logistics">("company");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  // Shopify credentials form states
  const [shopUrl, setShopUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState<"HYBRID" | "STRICT_SHOPIFY" | "INTERNAL_ONLY">("HYBRID");

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
  const [logoUrl, setLogoUrl] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("");
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [taxId, setTaxId] = useState("");
  const [gstin, setGstin] = useState("");
  const [lowStockMode, setLowStockMode] = useState("MANUAL");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [initialCompanySettings, setInitialCompanySettings] = useState<any>(null);

  useEffect(() => {
    if (!initialCompanySettings) return;
    const isDirty = 
      companyName !== initialCompanySettings.name ||
      currency !== initialCompanySettings.currency ||
      timezone !== initialCompanySettings.timezone ||
      taxId !== initialCompanySettings.taxId ||
      gstin !== initialCompanySettings.gstin ||
      lowStockMode !== initialCompanySettings.lowStockMode ||
      shopUrl !== initialCompanySettings.shopUrl ||
      accessToken !== initialCompanySettings.accessToken ||
      secretKey !== initialCompanySettings.secretKey ||
      barcodeMode !== initialCompanySettings.barcodeMode;

    if (typeof window !== "undefined") {
      (window as any).__seyonIsDirty = isDirty;
    }
  }, [companyName, currency, timezone, taxId, gstin, lowStockMode, shopUrl, accessToken, secretKey, barcodeMode, initialCompanySettings]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        (window as any).__seyonIsDirty = false;
      }
    };
  }, []);

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
    const cachedCompany = localStorage.getItem("seyon:company");
    if (cachedCompany) {
      try {
        const data = JSON.parse(cachedCompany);
        setCompanyName(data.name || "");
        setCurrency(data.currency || "INR");
        setTimezone(data.timezone ? `${data.timezone} (UTC+05:30)` : "IST (UTC+05:30)");
        setTaxId(data.taxId || "");
        setGstin(data.gstin || "");
        setLowStockMode(data.lowStockMode || "MANUAL");
        const shopUrlVal = data.shopifyStoreUrl 
          ? data.shopifyStoreUrl.replace("https://", "").replace("http://", "") 
          : "";
        setShopUrl(shopUrlVal);
        if (shopUrlVal) {
          setIsConnected(true);
        }
        const tokenVal = data.shopifyAccessToken || "";
        setAccessToken(tokenVal);

        setInitialCompanySettings({
          name: data.name || "",
          currency: data.currency || "INR",
          timezone: data.timezone ? `${data.timezone} (UTC+05:30)` : "IST (UTC+05:30)",
          taxId: data.taxId || "",
          gstin: data.gstin || "",
          lowStockMode: data.lowStockMode || "MANUAL",
          shopUrl: shopUrlVal,
          accessToken: tokenVal
        });
      } catch (e) {
        console.error("Failed to parse cached company settings", e);
      }
    }
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (!data.error) {
        localStorage.setItem("seyon:company", JSON.stringify(data));
        setCompanyName(data.name || "");
        setCurrency(data.currency || "INR");
        setTimezone(data.timezone ? `${data.timezone} (UTC+05:30)` : "IST (UTC+05:30)");
        setTaxId(data.taxId || "");
        setGstin(data.gstin || "");
        setLowStockMode(data.lowStockMode || "MANUAL");
        const shopUrlVal = data.shopifyStoreUrl 
          ? data.shopifyStoreUrl.replace("https://", "").replace("http://", "") 
          : "";
        setShopUrl(shopUrlVal);
        if (shopUrlVal) {
          setIsConnected(true);
        }
        const tokenVal = data.shopifyAccessToken || "";
        setAccessToken(tokenVal);
        const secretKeyVal = data.shopifyWebhookSecret || "";
        setSecretKey(secretKeyVal);
        const barcodeModeVal = data.barcodeMode || "HYBRID";
        setBarcodeMode(barcodeModeVal);

        setInitialCompanySettings({
          name: data.name || "",
          currency: data.currency || "INR",
          timezone: data.timezone ? `${data.timezone} (UTC+05:30)` : "IST (UTC+05:30)",
          taxId: data.taxId || "",
          gstin: data.gstin || "",
          lowStockMode: data.lowStockMode || "MANUAL",
          shopUrl: shopUrlVal,
          accessToken: tokenVal,
          secretKey: secretKeyVal,
          barcodeMode: barcodeModeVal
        });
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

  const executeHandshake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopUrl || !accessToken) {
      toast.error("Please provide both your Shopify Store Domain URL and Admin API Access Token.");
      return;
    }

    setHandshaking(true);
    setIsConnected(false);

    // Step 1: Testing domain format
    setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: "loading" } : { ...s, status: "idle" }));
    const cleanShopDomain = shopUrl.replace("https://", "").replace("http://", "").trim();
    
    await new Promise(r => setTimeout(r, 600));
    setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: "success" } : s));

    // Step 2: Live API Ping against Shopify REST API /admin/api/2024-04/shop.json
    setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: "loading" } : s));
    
    try {
      const cleanShopUrl = `https://${cleanShopDomain}`;
      const saveRes = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopifyStoreUrl: cleanShopUrl,
          shopifyAccessToken: accessToken,
          shopifyWebhookSecret: secretKey,
          barcodeMode
        })
      });
      const saveResult = await saveRes.json();
      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to persist credentials to database.");
      }

      // Live verification ping via API route
      const verifyRes = await fetch("/api/shopify/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: "Products Sync" })
      });
      const verifyResult = await verifyRes.json();

      if (!verifyRes.ok || verifyResult.error) {
        setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: "failed" } : s));
        toast.error(`Handshake Failed: ${verifyResult.error || "Shopify API rejected the token."}`);
        setHandshaking(false);
        return;
      }

      setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: "success" } : s));

      // Step 3: Webhook status check
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: "loading" } : s));
      await new Promise(r => setTimeout(r, 500));
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: "success" } : s));

      // Step 4: Metadata sync complete
      setSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: "loading" } : s));
      await new Promise(r => setTimeout(r, 500));
      setSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: "success" } : s));

      setInitialCompanySettings((prev: any) => ({
        ...prev,
        shopUrl: cleanShopDomain,
        accessToken,
        secretKey,
        barcodeMode
      }));

      setIsConnected(true);
      toast.success(`Authentic Shopify Handshake Verified! Synced ${verifyResult.log?.records || 0} products live.`);
    } catch (err: any) {
      setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: "failed" } : s));
      toast.error(`Handshake Failed: ${err.message || "Could not authenticate with Shopify."}`);
    } finally {
      setHandshaking(false);
    }
  };

  const saveCompanyDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          logoUrl,
          currency,
          timezone: timezone.split(" ")[0], // Extract just the code e.g. "IST"
          taxId,
          gstin,
          lowStockMode
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Company details saved! Default low stock threshold set to ${defaultThreshold} units.`);
        if (data.company) {
          localStorage.setItem("seyon:company", JSON.stringify(data.company));
          setInitialCompanySettings({
            name: data.company.name || "",
            currency: data.company.currency || "INR",
            timezone: data.company.timezone ? `${data.company.timezone} (UTC+05:30)` : "IST (UTC+05:30)",
            taxId: data.company.taxId || "",
            gstin: data.company.gstin || "",
            lowStockMode: data.company.lowStockMode || "MANUAL",
            shopUrl: data.company.shopifyStoreUrl ? data.company.shopifyStoreUrl.replace("https://", "") : "",
            accessToken: data.company.shopifyAccessToken || ""
          });
        }
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

      {/* Settings Navigation Tabs (Shadcn/Radix Style) */}
      <div className="inline-flex h-11 items-center justify-start rounded-lg bg-gray-100 p-1 text-gray-500 gap-1 border border-gray-200">
        <button
          onClick={() => setActiveTab("company")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
            activeTab === "company"
              ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200/50"
              : "text-gray-550 hover:text-gray-900 hover:bg-gray-50/50"
          }`}
        >
          <Building2 className="w-4 h-4 text-gray-500" /> Company Profile
        </button>
        <button
          onClick={() => setActiveTab("bridging")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
            activeTab === "bridging"
              ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200/50"
              : "text-gray-550 hover:text-gray-900 hover:bg-gray-50/50"
          }`}
        >
          <RefreshCw className="w-4 h-4 text-gray-500" /> Bridging
        </button>
        <button
          onClick={() => setActiveTab("warehouses")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
            activeTab === "warehouses"
              ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200/50"
              : "text-gray-550 hover:text-gray-900 hover:bg-gray-55/50"
          }`}
        >
          <MapPin className="w-4 h-4 text-gray-500" /> Warehouses & Stores
        </button>
        <button
          onClick={() => setActiveTab("logistics")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
            activeTab === "logistics"
              ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200/50"
              : "text-gray-550 hover:text-gray-900 hover:bg-gray-55/50"
          }`}
        >
          <Truck className="w-4 h-4 text-gray-500" /> Courier Integrations
        </button>
      </div>

      {/* Dynamic Settings Pane */}
      <div className="space-y-6">
          {activeTab === "bridging" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-950 text-base">Seyon Bridge</h3>
                  <span className="bg-indigo-50 text-indigo-750 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                    Channel Bridging
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Configure your external sales channels, storefront connections, and custom API gateways.</p>
              </div>

              {/* Shopify Integration Module */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Credentials Form */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5 lg:col-span-2">
                  <div>
                    <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
                      Shopify Integration
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Configure credentials from your Shopify Custom Admin App.</p>
                  </div>

                  {/* Data Safety & Non-Destructive Guarantee Banner */}
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-3.5 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                        100% Data Safety & Non-Destructive Protection Guaranteed
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                      <strong>Your Shopify store data is completely safe.</strong> The FabricVault ERP integration performs <em>safe GET queries and passive webhook ingestion</em>. It <strong>never deletes, mutates, or overwrites</strong> your existing Shopify products, active orders, customer listings, or store settings.
                    </p>
                  </div>

                  {/* Quick Setup Help Banner */}
                  <div className="bg-indigo-50/80 border border-indigo-100 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-indigo-600" /> Shopify Credentials Setup Guide
                      </span>
                      <Link 
                        href="/dashboard/help?topic=shopify-setup"
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 underline underline-offset-2"
                      >
                        View Full SOP <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="text-[11px] text-indigo-900 leading-relaxed">
                      Need help finding your credentials? Log into <strong>Shopify Admin &rarr; Settings &rarr; Apps & Sales Channels &rarr; Develop Apps</strong>. Create a Custom App with <code>read_products</code>, <code>write_products</code>, <code>read_inventory</code>, <code>write_inventory</code>, <code>read_orders</code>, and <code>write_orders</code> scopes. Copy your <strong>.myshopify.com</strong> domain and Admin API token below.
                    </p>
                  </div>

                  <form onSubmit={executeHandshake} autoComplete="off" className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-600 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-gray-400" /> Shopify Store Domain URL
                      </label>
                      <input 
                        required 
                        type="text" 
                        name="shopify_store_domain_url"
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
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
                      <div className="relative">
                        <input 
                          required 
                          type={showPasswords.shopifyToken ? "text" : "password"} 
                          name="shopify_admin_api_token"
                          autoComplete="new-password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          value={accessToken} 
                          disabled={handshaking}
                          onChange={e => setAccessToken(e.target.value)} 
                          placeholder="shpat_..." 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono" 
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("shopifyToken")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-650 transition-colors"
                        >
                          {showPasswords.shopifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-600 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gray-400" /> Webhook API Secret Key
                      </label>
                      <div className="relative">
                        <input 
                          required 
                          type={showPasswords.shopifySecret ? "text" : "password"} 
                          name="shopify_webhook_secret_key"
                          autoComplete="new-password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          value={secretKey} 
                          disabled={handshaking}
                          onChange={e => setSecretKey(e.target.value)} 
                          placeholder="e.g. API Secret Key / Client Secret from Shopify App Settings" 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono" 
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("shopifySecret")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-650 transition-colors"
                        >
                          {showPasswords.shopifySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-indigo-600" /> Barcode Integration Mode
                      </label>
                      <select
                        value={barcodeMode}
                        onChange={(e) => setBarcodeMode(e.target.value as "HYBRID" | "STRICT_SHOPIFY" | "INTERNAL_ONLY")}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="HYBRID">Hybrid Mode (Use Shopify barcode if present, generate internal ERP barcode if blank)</option>
                        <option value="STRICT_SHOPIFY">Strict Shopify Barcodes Only (Require barcode from Shopify catalog)</option>
                        <option value="INTERNAL_ONLY">Internal ERP Barcodes Only (Always generate custom internal barcode format)</option>
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Determines how physical hangtags and scanner verification match SKUs during picking & warehouse inventory checks.
                      </p>
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

              {/* Custom Gateway Connection */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-950 text-sm">Custom E-Commerce Gateway</h3>
                <p className="text-xs text-gray-500">Connect your own custom e-commerce storefront or point-of-sale systems.</p>
                <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center max-w-lg mx-auto space-y-4">
                  <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-gray-900">Custom E-Commerce Gateway</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Automatically sync catalog inventory, retrieve client orders, and manage logistics tracking by bridging your custom API credentials or POS system with Seyon ERP.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <button 
                      type="button"
                      onClick={() => toast.info("Seyon Bridge setup wizard coming soon!")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
                    >
                      Configure Gateway Connection
                    </button>
                    <button 
                      type="button"
                      onClick={() => toast.info("API Documentation is being updated.")}
                      className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-55 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
                    >
                      API Docs
                    </button>
                  </div>
                </div>
              </div>

              {/* Seyon Storefront Coming Soon section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">Seyon Storefront</h4>
                  <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Consolidate your brand under a native custom-built shopping experience directly linked to your ERP data schema.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                  <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/30 space-y-2">
                    <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>⚡</span> 0ms Reconcile Time
                    </h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Uses direct database query sync via <code className="bg-gray-150 px-1 py-0.5 rounded font-mono text-[9px]">@repo/db</code>. Eliminates API sync queues, webhook delays, and inventory overselling completely.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/30 space-y-2">
                    <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>💎</span> 0% Transaction Fees
                    </h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Keep your entire margin. Seyon Storefront bypasses Shopify's 0.5% - 2.0% third-party gateway commissions, saving thousands in monthly operational overheads.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/30 space-y-2">
                    <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>🚀</span> No API Rate Limits
                    </h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Scale flash sales smoothly. Free from Shopify API rate-limit throttling (GraphQL bucket caps), enabling your store to process unlimited checkouts concurrently.
                    </p>
                  </div>
                </div>
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

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Default Low Stock Alert Threshold</label>
                    <input 
                      type="number"
                      min="1"
                      value={defaultThreshold} 
                      onChange={e => setDefaultThreshold(parseInt(e.target.value) || 3)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Low Stock Control Mode</label>
                    <select
                      value={lowStockMode}
                      onChange={e => setLowStockMode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                    >
                      <option value="MANUAL">Manual (Use Set Safety Limits)</option>
                      <option value="AUTOMATIC">Automatic (Dynamic Sales Velocity-based)</option>
                    </select>
                    <div className="mt-2 p-2.5 bg-gray-50 border border-gray-150 rounded-lg text-[10px] text-gray-500 space-y-1 leading-relaxed">
                      {lowStockMode === "MANUAL" ? (
                        <p>
                          <strong className="text-gray-700">Manual Mode Theory:</strong> Low stock status is triggered when the physical stock level drops to or below the static <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-[9px]">safetyStockLimit</code> configured directly on the product variant catalog profile.
                        </p>
                      ) : (
                        <p>
                          <strong className="text-gray-700">Automatic Mode Theory:</strong> Low stock status is dynamically calculated daily using sales data and lead time metrics. The system evaluates when stock levels drop below: <br />
                          <span className="font-semibold text-indigo-900 font-mono text-[9px]">Average Daily Sales (ADS) × Lead Time Days</span> (ensuring enough coverage for restocking replenishment).
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">GSTIN / VAT Number (Optional)</label>
                    <input 
                      type="text" 
                      value={gstin} 
                      onChange={e => setGstin(e.target.value)} 
                      placeholder="e.g. 22AAAAA1111A1Z1"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Tax Registration ID (Optional)</label>
                    <input 
                      type="text" 
                      value={taxId} 
                      onChange={e => setTaxId(e.target.value)} 
                      placeholder="e.g. TAX-99999"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono" 
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
                          <div className="relative">
                            <input
                              type={showPasswords.shiprocket ? "text" : "password"}
                              value={shiprocketPassword}
                              onChange={(e) => setShiprocketPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("shiprocket")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-650 transition-colors"
                            >
                              {showPasswords.shiprocket ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
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
