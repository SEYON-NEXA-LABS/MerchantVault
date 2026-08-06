"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Search,
  MessageCircle,
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  Megaphone,
  MessageSquare,
  PieChart,
  Star,
  ShoppingCart,
  Undo2,
  FileText,
  Package,
  Layers,
  Home,
  ArrowRightLeft,
  AlertTriangle,
  Truck,
  ClipboardList,
  FileCheck,
  BarChart3,
  CreditCard,
  Wallet,
  Receipt,
  Settings,
  Shield,
  ChevronLeft,
  Ruler,
  Palette,
  RotateCcw,
  QrCode,
  Printer,
  Scan,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Mail,
  ShoppingBag,
  Clock,
  Workflow,
  RefreshCw,
  BookOpen,
  ChevronDown,
  LogOut,
  User,
  Activity,
  Check,
  X,
  Building2,
  ExternalLink,
  WifiOff
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { RoleProvider } from "../../components/RoleGuard";

// Simulated Activities per User Role
const simulatedActivities = {
  SUPERADMIN: [
    { id: 1, action: "Approved monthly subscription plan for Seyon Tenant", time: "2 hours ago", type: "system" },
    { id: 2, action: "Created database schema index for SerializedUnit table", time: "5 hours ago", type: "db" },
    { id: 3, action: "Adjusted global webhook rate limiting threshold", time: "1 day ago", type: "settings" }
  ],
  TENANTADMIN: [
    { id: 1, action: "Added staff profile user operator@seyon.local", time: "12 mins ago", type: "staff" },
    { id: 2, action: "Re-connected Shopify sync channel credentials", time: "1 hour ago", type: "sync" },
    { id: 3, action: "Updated Delhivery Courier API keys in configurations", time: "3 hours ago", type: "logistics" }
  ],
  STAFF: [
    { id: 1, action: "Consolidated inward receipt of 24 units for MUM-01", time: "8 mins ago", type: "scan" },
    { id: 2, action: "Dispatched 5 serialized items for Shopify order #1004", time: "45 mins ago", type: "orders" },
    { id: 3, action: "Initiated cycle count session for SKU: TWCT001-BLK-M", time: "2 hours ago", type: "audit" }
  ]
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<"SUPERADMIN" | "TENANTADMIN" | "STAFF">("SUPERADMIN");
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [activeWhId, setActiveWhId] = useState("");
  const [showWhModal, setShowWhModal] = useState(false);
  const [whSearchQuery, setWhSearchQuery] = useState("");
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [devEnvironmentMode, setDevEnvironmentMode] = useState<"DEV" | "PROD">("DEV");
  
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const getStorefrontUrl = () => {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const base = typeof window !== "undefined" 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || (isLocal ? "http://localhost:3000" : "https://merchantvault.vercel.app"));
    if (company?.id) {
      return `${base}/?companyId=${company.id}`;
    }
    if (company?.code) {
      return `${base}/?companyCode=${company.code}`;
    }
    return base;
  };

  useEffect(() => {
    setMounted(true);
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (typeof window !== "undefined" && (window as any).__seyonIsDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const bootstrapContext = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserRole(data.user.role);
            setSessionUser({
              name: data.user.username,
              email: data.user.email || `${data.user.username}@seyon.local`,
              roleLabel: data.user.role === "SUPERADMIN" ? "Platform Administrator" : data.user.role === "TENANTADMIN" ? "Tenant Administrator" : "Warehouse Operator"
            });
            localStorage.setItem("seyon:user", JSON.stringify(data.user));

            if (data.company) {
              setCompany(data.company);
              localStorage.setItem("seyon:company", JSON.stringify(data.company));
              if (typeof window !== "undefined" && data.company.name) {
                document.title = `${data.company.name} | MerchantVault ERP`;
              }
            }

            if (Array.isArray(data.warehouses)) {
              setWarehouses(data.warehouses);
              localStorage.setItem("seyon:warehouses", JSON.stringify(data.warehouses));
              const savedWh = localStorage.getItem("activeWarehouseId");
              if (savedWh && data.warehouses.some((w: any) => w.id === savedWh)) {
                setActiveWhId(savedWh);
              } else {
                const defaultWh = data.warehouses.find((w: any) => w.isDefaultPickup) || data.warehouses[0];
                if (defaultWh) {
                  setActiveWhId(defaultWh.id);
                  localStorage.setItem("activeWarehouseId", defaultWh.id);
                }
                if (data.warehouses.length > 1 && !savedWh) {
                  setShowWhModal(true);
                }
              }
            }
          } else {
            router.push("/admin");
          }
        } else {
          router.push("/admin");
        }
      } catch (err) {
        console.error("Failed to bootstrap user context", err);
        router.push("/admin");
      } finally {
        setIsBootstrapping(false);
      }
    };
    bootstrapContext();

    const handleStorageChange = () => {
      const savedWh = localStorage.getItem("activeWarehouseId");
      if (savedWh) setActiveWhId(savedWh);
      const savedCo = localStorage.getItem("seyon:company");
      if (savedCo) {
        try { setCompany(JSON.parse(savedCo)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Close dropdowns on outside clicks
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key to close warehouse selection modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showWhModal) {
        setShowWhModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWhModal]);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();
        if (Array.isArray(data)) {
          const alerts = data.filter((v: any) => v.currentStockLevel <= v.safetyStockLimit);
          setLowStockAlerts(alerts);
        }
      } catch (err) {
        console.error("Failed to fetch low stock alerts", err);
      }
    };
    fetchLowStock();
  }, [pathname]);

  const handleWhChange = (val: string) => {
    setActiveWhId(val);
    localStorage.setItem("activeWarehouseId", val);
    window.dispatchEvent(new Event("storage"));
    setShowWhModal(false);
  };

  const handleLogout = () => {
    // Clear cookie and redirect
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("activeWarehouseId");
    localStorage.removeItem("seyon:warehouses");
    localStorage.removeItem("seyon:company");
    localStorage.removeItem("seyon:user");
    router.push("/admin");
  };

  const activeWarehouse = warehouses.find(w => w.id === activeWhId);
  const activeWarehouseName = activeWarehouse ? `${activeWarehouse.name} (${activeWarehouse.code})` : "Select Warehouse";

  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(whSearchQuery.toLowerCase()) ||
    w.code.toLowerCase().includes(whSearchQuery.toLowerCase()) ||
    w.city.toLowerCase().includes(whSearchQuery.toLowerCase())
  );

  const isActive = (href: string) => {
    if (!href || href === "#") return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/dashboard/inventory") {
      return pathname === "/dashboard/inventory";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleGlobalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a") as HTMLAnchorElement | null;
    if (anchor) {
      const href = anchor.getAttribute("href");
      if (href && !href.startsWith("#") && href !== pathname) {
        if (typeof window !== "undefined" && (window as any).__seyonIsDirty) {
          if (!window.confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
            e.preventDefault();
            e.stopPropagation();
          } else {
            (window as any).__seyonIsDirty = false;
          }
        }
      }
    }
  };

  const sidebarTopMenu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["SUPERADMIN", "TENANTADMIN", "STAFF"] },
    { name: "POS Counter Sales", icon: ShoppingBag, href: "/dashboard/pos", roles: ["SUPERADMIN", "TENANTADMIN", "STAFF"] },
    { 
      name: "Shopify Integration", 
      icon: RefreshCw, 
      href: "/dashboard/shopify-sync", 
      roles: ["SUPERADMIN", "TENANTADMIN"],
      badge: company && (!company.shopifyStoreUrl || (!company.shopifyAccessToken && !company.hasShopifyAccessToken)) ? "Alert" : null
    },
  ];

  // Helper function to check role access
  const hasAccess = (allowedRoles: string[]) => !isBootstrapping && allowedRoles.includes(userRole);

  const userProfileInfo = {
    SUPERADMIN: {
      name: "David Miller",
      email: "seyonnexalabs@gmail.com",
      roleLabel: "Platform Administrator"
    },
    TENANTADMIN: {
      name: "Sarah Jenkins",
      email: "sarah.jenkins@seyon.com",
      roleLabel: "Tenant Administrator"
    },
    STAFF: {
      name: "Alex Rivera",
      email: "alex.rivera@seyon.local",
      roleLabel: "Warehouse Operator"
    }
  };

  // Generate initials from user name for avatar
  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const currentUser = sessionUser || userProfileInfo[userRole];

  if (!mounted || isBootstrapping) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-gray-500 font-sans">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleProvider value={{ role: userRole, setRole: setUserRole }}>
      <div 
        className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans"
        onClickCapture={handleGlobalClick}
      >
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto hidden md:flex flex-shrink-0">
          <div className="p-4 flex items-center gap-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center font-bold text-lg shadow-sm">
              {(company?.name || "ERP").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm uppercase tracking-wide text-slate-900 truncate max-w-[130px]">
                  {company?.name || "MerchantVault ERP"}
                </h1>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">CRM + ERP</p>
            </div>
          </div>

          <div className="p-3 space-y-1">
            {sidebarTopMenu
              .filter((item) => hasAccess(item.roles))
              .map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-800 hover:text-indigo-900 hover:bg-indigo-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-500"}`} />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>

          <nav className="flex-1 px-3 py-2 space-y-6">
            {/* CRM (Customer Relationship Management) - Visible to Admins */}
            {hasAccess(["SUPERADMIN", "TENANTADMIN"]) && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">CRM</h2>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      href="/dashboard/crm"
                      className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-md group font-medium transition-colors ${
                        isActive("/dashboard/crm")
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:text-indigo-900 hover:bg-indigo-50"
                      }`}
                    >
                      <Users
                        className={`w-4 h-4 transition-colors ${
                          isActive("/dashboard/crm") ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600"
                        }`}
                      />
                      Customer Directory
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Inventory Management Section - Visible to All Roles */}
            {hasAccess(["SUPERADMIN", "TENANTADMIN", "STAFF"]) && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Inventory (ERP)</h2>
                <ul className="space-y-0.5">
                  {[
                    { 
                      name: "Stock & SKU Inventory", 
                      icon: Package, 
                      href: "/dashboard/inventory",
                      badge: lowStockAlerts.length > 0 ? `${lowStockAlerts.length} Low` : null
                    },
                    { name: "Purchase Orders", icon: FileText, href: "/dashboard/inventory/purchase" },
                    { name: "Vendors", icon: Building2, href: "/dashboard/vendors" },
                  ].map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md group font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-slate-700 hover:text-indigo-900 hover:bg-indigo-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={`w-4 h-4 transition-colors ${
                                active ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600"
                              }`}
                            />
                            {item.name}
                          </div>
                          {item.badge && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Barcode Operations Section - Visible to All Roles */}
            {hasAccess(["SUPERADMIN", "TENANTADMIN", "STAFF"]) && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Barcode Operations</h2>
                <ul className="space-y-0.5">
                  {[
                    { name: "Inward Receiving", icon: ArrowDownLeft, href: "/dashboard/inward" },
                    { name: "Outward Dispatch", icon: ArrowUpRight, href: "/dashboard/outward" },
                    { name: "Print & Generate Barcodes", icon: Printer, href: "/dashboard/barcode" },
                    { name: "Combined Movement Log", icon: Scan, href: "/dashboard/inward-outward" },
                    { name: "Inventory Audits", icon: ClipboardList, href: "/dashboard/inventory/audits" },
                  ].map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-md group font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-slate-700 hover:text-indigo-900 hover:bg-indigo-50"
                          }`}
                        >
                          <item.icon
                            className={`w-4 h-4 transition-colors ${
                              active ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600"
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Order Management Section - Visible to All Roles */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Orders & Shipping</h2>
              <ul className="space-y-0.5">
                {[
                  { name: "Orders Directory", icon: ShoppingBag, href: "/dashboard/orders", roles: ["SUPERADMIN", "TENANTADMIN", "STAFF"] },
                  { name: "Logistics & Returns", icon: Truck, href: "/dashboard/logistics", roles: ["SUPERADMIN", "TENANTADMIN", "STAFF"] },
                ]
                  .filter((item) => hasAccess(item.roles))
                  .map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-md group font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-slate-700 hover:text-indigo-900 hover:bg-indigo-50"
                          }`}
                        >
                          <item.icon
                            className={`w-4 h-4 transition-colors ${
                              active ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600"
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>

            {/* Admin Settings Section - Admins Only */}
            {hasAccess(["SUPERADMIN", "TENANTADMIN"]) && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Admin Settings</h2>
                <ul className="space-y-0.5">
                  {[
                    { name: "Staff & Roles", icon: Shield, href: "/dashboard/staff" },
                    { name: "Tenant Settings", icon: Settings, href: "/dashboard/settings" },
                  ].map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-md group font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-slate-700 hover:text-indigo-900 hover:bg-indigo-50"
                          }`}
                        >
                          <item.icon
                            className={`w-4 h-4 transition-colors ${
                              active ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600"
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Platform Admin Section - Superadmin Only */}
            {hasAccess(["SUPERADMIN"]) && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Platform Admin</h2>
                <ul className="space-y-0.5">
                  {[
                    { name: "Superadmin Panel", icon: Workflow, href: "/dashboard/superadmin" },
                  ].map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-md group font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-slate-700 hover:text-indigo-900 hover:bg-indigo-50"
                          }`}
                        >
                          <item.icon
                            className={`w-4 h-4 transition-colors ${
                              active ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600"
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Public Channels Section - Visible to All Users */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Public Channels</h2>
              <ul className="space-y-0.5">
                <li>
                  <a
                    href={getStorefrontUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-md group font-medium text-slate-700 hover:text-indigo-900 hover:bg-indigo-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    Visit Storefront
                  </a>
                </li>
                <li>
                  <a
                    href={
                      company?.shopifyStoreUrl || company?.shopifyShopDomain
                        ? ((company.shopifyStoreUrl || company.shopifyShopDomain).startsWith("http")
                            ? `${company.shopifyStoreUrl || company.shopifyShopDomain}/admin`
                            : `https://${company.shopifyStoreUrl || company.shopifyShopDomain}/admin`)
                        : "https://myshopify.com/admin"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-md group font-medium text-slate-700 hover:text-indigo-900 hover:bg-indigo-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    Shopify Admin
                  </a>
                </li>
              </ul>
            </div>

            {/* Development Environment Mode Switcher - Dev Only */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 pt-4 border-t border-slate-200/80 px-1">
                <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${devEnvironmentMode === "DEV" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                    Env Mode:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDevEnvironmentMode("DEV")}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
                        devEnvironmentMode === "DEV"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      DEV
                    </button>
                    <button
                      onClick={() => setDevEnvironmentMode("PROD")}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
                        devEnvironmentMode === "PROD"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      PROD
                    </button>
                  </div>
                </div>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 hover:text-gray-900 cursor-pointer">
            <div className="flex items-center">
              <ChevronLeft className="w-4 h-4 mr-1" /> Collapse
            </div>
            {process.env.NODE_ENV === "development" && (
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                {devEnvironmentMode}
              </span>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Navbar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-9 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-mono shadow-sm">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-mono shadow-sm">K</kbd>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Scanner Connectivity Status */}
              <div 
                title="USB Keyboard-Emulation scanner ready. Place cursor in any scan field to begin."
                className="flex items-center gap-2 text-xs font-semibold text-indigo-750 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-lg select-none cursor-help shadow-sm"
              >
                <Scan className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>Scanner: Ready</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>

              {/* Active Warehouse Indicator & Switcher */}
              <button 
                onClick={() => setShowWhModal(true)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm select-none"
              >
                <span>📍 {activeWarehouseName}</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </button>

              <Link href="/dashboard/help" target="_blank" className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                <BookOpen className="w-4 h-4" />
                Help Center
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
                >
                  <Bell className="w-5 h-5" />
                  {lowStockAlerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {lowStockAlerts.length}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Notifications
                      </h4>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
                        {lowStockAlerts.length} Alerts
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 space-y-2">
                      {lowStockAlerts.length === 0 ? (
                        <p className="text-[11px] text-gray-400 text-center py-4">All stock levels healthy.</p>
                      ) : (
                        lowStockAlerts.map((item) => (
                          <div key={item.id} className="pt-2 text-xs">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-gray-950 leading-tight block">{item.title}</span>
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                {item.currentStockLevel} left
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-450 font-mono mt-0.5">
                              SKU: {item.sku} | Size: {item.size} | Color: {item.color}
                            </div>
                            <div className="mt-1 flex justify-between items-center text-[10px] pt-1">
                              <span className="text-gray-400">Limit: {item.safetyStockLimit} units</span>
                              <Link 
                                href="/dashboard/inventory/purchase" 
                                onClick={() => setShowNotificationDropdown(false)}
                                className="text-indigo-600 hover:underline font-bold"
                              >
                                Restock Item →
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Premium Profile Interactive Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 border-l border-gray-200 pl-6 focus:outline-none group select-none"
                >
                  <div className="text-right hidden md:block">
                    <span className="block text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className="block text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 font-bold">
                      {userRole}
                    </span>
                  </div>
                  <div className="relative w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-200 group-hover:border-indigo-500 transition-all shadow-sm text-xs">
                    {getInitials(currentUser.name)}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>

                {/* Profile Flyout Dropdown Menu (Glassmorphism & Harmonious Layout) */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl z-55 p-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
                    {/* User Profile Header Segment */}
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-150/80">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/20 shadow-inner bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {getInitials(currentUser.name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-950 leading-snug">{currentUser.name}</h4>
                        <p className="text-xs text-gray-500 leading-tight font-medium">{currentUser.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[9px] font-extrabold uppercase rounded">
                          {currentUser.roleLabel}
                        </span>
                      </div>
                    </div>



                    {/* Role Specific Activity Logs Section */}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" /> Recent Activities ({userRole})
                      </div>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {simulatedActivities[userRole].map((act) => (
                          <div key={act.id} className="p-2 rounded-lg bg-indigo-50/30 border border-indigo-100/10 text-[11px] leading-snug">
                            <p className="text-gray-800 font-medium">{act.action}</p>
                            <span className="text-[9px] text-gray-400 block mt-0.5 font-sans">🕒 {act.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Segment */}
                    <div className="pt-2 border-t border-gray-150/80 space-y-1">
                      {hasAccess(["SUPERADMIN", "TENANTADMIN"]) && (
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-950 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" /> Account Settings
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowWhModal(true);
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-950 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-gray-400" /> Switch Warehouse
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {children}
          </main>

          {/* Global Operational Status Bar */}
          <footer className="h-8 bg-stone-100 text-stone-600 border-t border-stone-200 flex items-center justify-between px-6 text-[10px] font-mono select-none flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-stone-900 font-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> TENANT: {company?.name ? company.name.toUpperCase() : "SEYON"} ({company?.code || "syn"})
              </span>
              <span className="text-stone-300">|</span>
              <span>
                Shopify: {(company?.shopifyStoreUrl || company?.shopifyShopDomain) && company?.shopifyAccessToken 
                  ? (company.shopifyStoreUrl || company.shopifyShopDomain).replace("https://", "").replace("http://", "") 
                  : "Unconfigured"}
              </span>
              <span className="text-stone-300">|</span>
              <span className="flex items-center gap-1">
                <span>📍 WH:</span>
                <span className="font-bold uppercase">{activeWarehouse?.code || "NONE"}</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Webhook: {(company?.shopifyStoreUrl || company?.shopifyShopDomain) && company?.shopifyAccessToken ? "Listening (Active)" : "Inactive (Handshake Required)"}</span>
              <span className="text-stone-300">|</span>
              <span>Sync Health: {company?.shopifyStoreUrl && company.shopifyAccessToken ? "99.8%" : "0.0%"}</span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-900 font-semibold flex items-center gap-1">
                <span>BUILD:</span>
                <code className="bg-stone-200 text-stone-800 px-1 py-0.5 rounded font-mono text-[9px] font-bold">
                  {process.env.NEXT_PUBLIC_GIT_COMMIT_HASH || "f80b57b"}
                </code>
              </span>
            </div>
          </footer>
        </div>

        {/* Warehouse Selection Modal (Glassmorphism backdrop) */}
        {showWhModal && (
          <div 
            onClick={() => setShowWhModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] relative"
            >
              <div className="p-5 border-b border-gray-100 bg-slate-50/80 relative">
                <button
                  onClick={() => setShowWhModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <span>📍</span> Select Active Warehouse Location
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the terminal for scanning, order dispatching, and stock management.
                </p>
              </div>

              <div className="p-4 bg-white border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, code, or city..."
                    value={whSearchQuery}
                    onChange={(e) => setWhSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
                {filteredWarehouses.length > 0 ? (
                  filteredWarehouses.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => handleWhChange(w.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between hover:bg-white hover:shadow-sm ${
                        activeWhId === w.id
                          ? "bg-indigo-50/80 border-indigo-200 ring-1 ring-indigo-500/10"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-gray-950 text-xs flex items-center gap-1.5">
                            {w.name}
                            {w.isDefaultPickup && (
                              <span className="bg-indigo-100 text-indigo-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                Default
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wide">
                            Code: {w.code}
                          </p>
                        </div>
                        {activeWhId === w.id && (
                          <span className="text-indigo-600 text-xs font-bold bg-indigo-100/50 px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 mt-2 pt-1.5 text-[10px] text-gray-400 flex items-center gap-1 font-sans">
                        <span>📍 {w.addressLine1}, {w.city}, {w.state}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-450 space-y-2">
                    <p>No warehouses found matching search.</p>
                    {warehouses.length === 0 && hasAccess(["SUPERADMIN", "TENANTADMIN"]) && (
                      <p className="text-[11px] text-gray-500">
                        This tenant company has no warehouses configured yet.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center">
                {warehouses.length === 0 && hasAccess(["SUPERADMIN", "TENANTADMIN"]) && (
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowWhModal(false)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-850 hover:underline flex items-center gap-1"
                  >
                    ⚙️ Setup Warehouse
                  </Link>
                )}
                <button
                  onClick={() => setShowWhModal(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Offline Overlay Modal */}
        {isOffline && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-white border border-gray-150 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 animate-pulse">
                <WifiOff className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-950 text-lg">No Internet Connection</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-sans">
                  Your connection to Seyon ERP was lost. Please check your network cables or Wi-Fi router. We will reconnect automatically once your connection is restored.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50/50 border border-rose-100/50 py-2 rounded-lg font-sans">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>Attempting to reconnect...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleProvider>
  );
}
