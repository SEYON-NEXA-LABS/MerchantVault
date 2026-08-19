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
import { RoleProvider, UserRole } from "../../components/RoleGuard";
import { Sidebar } from "../../components/Sidebar";
import React from "react";

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
  MANAGER: [
    { id: 1, action: "Approved purchase order #PO-2026-089", time: "15 mins ago", type: "orders" },
    { id: 2, action: "Completed warehouse inventory audit for MUM-01", time: "2 hours ago", type: "audit" },
    { id: 3, action: "Triggered bulk barcode printing batch", time: "4 hours ago", type: "scan" }
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
  const [userRole, setUserRole] = useState<UserRole>("SUPERADMIN");
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

    // 1. Custom Domain Priority (e.g., https://wolfcabin.in)
    if (company?.customDomain) {
      return company.customDomain.startsWith("http") ? company.customDomain : `https://${company.customDomain}`;
    }

    // 2. Custom Subdomain Priority (e.g., https://wolfcabin.seyon.app)
    if (company?.customSubdomain && !isLocal) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://merchantvault.vercel.app";
      let host = "merchantvault.vercel.app";
      try { host = new URL(appUrl).hostname; } catch (e) {}
      return `https://${company.customSubdomain}.${host}`;
    }

    // 3. Fallback for Local Dev or Unconfigured Domains (?companyCode=syn)
    const base = typeof window !== "undefined" 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || (isLocal ? "http://localhost:3000" : "https://merchantvault.vercel.app"));

    if (company?.code) {
      return `${base}/?companyCode=${company.code}`;
    }
    if (company?.id) {
      return `${base}/?companyId=${company.id}`;
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
      href: "/dashboard/marketplaces",
 
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
    MANAGER: {
      name: "Marcus Vance",
      email: "marcus.vance@seyon.local",
      roleLabel: "Warehouse Manager"
    },
    STAFF: {
      name: "Alex Rivera",
      email: "alex.rivera@seyon.local",
      roleLabel: "Warehouse Operator"
    }
  };

  // Generate initials from user name for avatar
  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const roleThemes: Record<string, {
    headerBorder: string;
    searchFocus: string;
    scannerBg: string;
    scannerText: string;
    scannerBorder: string;
    whBg: string;
    whText: string;
    whBorder: string;
    avatarBg: string;
    roleBadgeBg: string;
    roleBadgeText: string;
    roleBadgeBorder: string;
    mainBg: string;
    footerBg: string;
  }> = {
    SUPERADMIN: {
      headerBorder: "border-rose-100/80 bg-rose-50/20 backdrop-blur-xl",
      searchFocus: "focus:ring-rose-500/20 focus:border-rose-500",
      scannerBg: "bg-rose-50/80",
      scannerText: "text-rose-900",
      scannerBorder: "border-rose-200/80",
      whBg: "bg-rose-50/60 hover:bg-rose-100/70",
      whText: "text-rose-950",
      whBorder: "border-rose-200/80",
      avatarBg: "bg-rose-600 text-white shadow-rose-500/20",
      roleBadgeBg: "bg-rose-50",
      roleBadgeText: "text-rose-800",
      roleBadgeBorder: "border-rose-200",
      mainBg: "bg-gradient-to-br from-rose-50/30 via-slate-50 to-slate-50",
      footerBg: "bg-rose-900/5 text-rose-950 border-rose-200/60"
    },
    TENANTADMIN: {
      headerBorder: "border-purple-100/80 bg-purple-50/20 backdrop-blur-xl",
      searchFocus: "focus:ring-purple-500/20 focus:border-purple-500",
      scannerBg: "bg-purple-50/80",
      scannerText: "text-purple-900",
      scannerBorder: "border-purple-200/80",
      whBg: "bg-purple-50/60 hover:bg-purple-100/70",
      whText: "text-purple-950",
      whBorder: "border-purple-200/80",
      avatarBg: "bg-purple-600 text-white shadow-purple-500/20",
      roleBadgeBg: "bg-purple-50",
      roleBadgeText: "text-purple-800",
      roleBadgeBorder: "border-purple-200",
      mainBg: "bg-gradient-to-br from-purple-50/30 via-slate-50 to-slate-50",
      footerBg: "bg-purple-900/5 text-purple-950 border-purple-200/60"
    },
    MANAGER: {
      headerBorder: "border-emerald-100/80 bg-emerald-50/20 backdrop-blur-xl",
      searchFocus: "focus:ring-emerald-500/20 focus:border-emerald-500",
      scannerBg: "bg-emerald-50/80",
      scannerText: "text-emerald-900",
      scannerBorder: "border-emerald-200/80",
      whBg: "bg-emerald-50/60 hover:bg-emerald-100/70",
      whText: "text-emerald-950",
      whBorder: "border-emerald-200/80",
      avatarBg: "bg-emerald-600 text-white shadow-emerald-500/20",
      roleBadgeBg: "bg-emerald-50",
      roleBadgeText: "text-emerald-800",
      roleBadgeBorder: "border-emerald-200",
      mainBg: "bg-gradient-to-br from-emerald-50/30 via-slate-50 to-slate-50",
      footerBg: "bg-emerald-900/5 text-emerald-950 border-emerald-200/60"
    },
    STAFF: {
      headerBorder: "border-indigo-100/80 bg-indigo-50/20 backdrop-blur-xl",
      searchFocus: "focus:ring-indigo-500/20 focus:border-indigo-500",
      scannerBg: "bg-indigo-50/80",
      scannerText: "text-indigo-900",
      scannerBorder: "border-indigo-200/80",
      whBg: "bg-indigo-50/60 hover:bg-indigo-100/70",
      whText: "text-indigo-950",
      whBorder: "border-indigo-200/80",
      avatarBg: "bg-indigo-600 text-white shadow-indigo-500/20",
      roleBadgeBg: "bg-indigo-50",
      roleBadgeText: "text-indigo-800",
      roleBadgeBorder: "border-indigo-200",
      mainBg: "bg-gradient-to-br from-indigo-50/30 via-slate-50 to-slate-50",
      footerBg: "bg-indigo-900/5 text-indigo-950 border-indigo-200/60"
    }
  };

  const currentTheme = roleThemes[userRole] || roleThemes.STAFF;
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
        className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans"
        onClickCapture={handleGlobalClick}
      >
        {/* Modular Lifecycle-Ordered Sidebar */}
        <React.Suspense fallback={<aside className="w-72 bg-white border-r border-slate-200" />}>
          <Sidebar
            userRole={userRole}
            company={company}
            lowStockAlertsCount={lowStockAlerts.length}
            devEnvironmentMode={devEnvironmentMode}
            setDevEnvironmentMode={setDevEnvironmentMode}
            getStorefrontUrl={getStorefrontUrl}
          />
        </React.Suspense>

        {/* Main Content Area with Dynamic Role Canvas */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${currentTheme.mainBg} transition-colors duration-300`}>
          {/* Top Navbar with Glassmorphism */}
          <header className={`relative z-50 min-h-16 py-2 border-b flex items-center justify-between px-4 sm:px-6 flex-shrink-0 transition-colors duration-300 ${currentTheme.headerBorder}`}>

            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-max">

              <div className="relative w-48 sm:w-72 md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className={`w-full bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl py-1.5 pl-9 pr-12 text-xs sm:text-sm focus:outline-none focus:ring-2 ${currentTheme.searchFocus} transition-all shadow-xs`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-400 font-mono shadow-xs">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-400 font-mono shadow-xs">K</kbd>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 min-w-max">
              {/* Scanner Connectivity Status */}
              <div 
                title="USB Keyboard-Emulation scanner ready. Place cursor in any scan field to begin."
                className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-bold ${currentTheme.scannerText} ${currentTheme.scannerBg} border ${currentTheme.scannerBorder} px-2.5 sm:px-3 py-1.5 rounded-xl select-none cursor-help shadow-xs backdrop-blur-md`}
              >
                <Scan className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden xs:inline">Scanner: Ready</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>

              {/* Active Warehouse Indicator & Switcher */}
              <button 
                onClick={() => setShowWhModal(true)}
                className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-bold ${currentTheme.whText} ${currentTheme.whBg} border ${currentTheme.whBorder} px-2.5 sm:px-3 py-1.5 rounded-xl transition-all shadow-xs backdrop-blur-md select-none`}
              >
                <span>📍 {activeWarehouseName}</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-full hover:bg-emerald-100/90 transition-colors backdrop-blur-xs">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp
              </button>

              <Link href="/dashboard/help" target="_blank" className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200/80 px-3 py-1.5 rounded-full hover:bg-indigo-100/90 transition-colors backdrop-blur-xs">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Help Center
              </Link>

              
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative text-slate-500 hover:text-slate-900 transition-colors focus:outline-none p-1.5 rounded-xl hover:bg-white/50"
                >
                  <Bell className="w-5 h-5" />
                  {lowStockAlerts.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {lowStockAlerts.length}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Notifications
                      </h4>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
                        {lowStockAlerts.length} Alerts
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 space-y-2">
                      {lowStockAlerts.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-4">All stock levels healthy.</p>
                      ) : (
                        lowStockAlerts.map((item) => (
                          <div key={item.id} className="pt-2 text-xs">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-slate-950 leading-tight block">{item.title}</span>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                {item.currentStockLevel} left
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-450 font-mono mt-0.5">
                              SKU: {item.sku} | Size: {item.size} | Color: {item.color}
                            </div>
                            <div className="mt-1 flex justify-between items-center text-[10px] pt-1">
                              <span className="text-slate-400">Limit: {item.safetyStockLimit} units</span>
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
                  className="flex items-center gap-3 border-l border-slate-200/80 pl-5 focus:outline-none group select-none"
                >
                  <div className="text-right hidden md:block">
                    <span className="block text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${currentTheme.roleBadgeBg} ${currentTheme.roleBadgeText} border ${currentTheme.roleBadgeBorder} mt-0.5`}>
                      {userRole}
                    </span>
                  </div>
                  <div className={`relative w-9 h-9 ${currentTheme.avatarBg} rounded-xl flex items-center justify-center font-black overflow-hidden border border-white/40 transition-all shadow-md text-xs`}>
                    {getInitials(currentUser.name)}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                {/* Profile Flyout Dropdown Menu (Glassmorphism & Role Active Color Theme) */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">

                    {/* User Profile Header Segment */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-150/80">
                      <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/60 shadow-md ${currentTheme.avatarBg} flex items-center justify-center font-black text-sm`}>
                        {getInitials(currentUser.name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-950 leading-snug">{currentUser.name}</h4>
                        <p className="text-xs text-slate-500 leading-tight font-medium">{currentUser.email}</p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase rounded ${currentTheme.roleBadgeBg} ${currentTheme.roleBadgeText} border ${currentTheme.roleBadgeBorder}`}>
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
                          <div key={act.id} className="p-2 rounded-xl bg-slate-50/80 border border-slate-200/60 text-[11px] leading-snug">
                            <p className="text-slate-800 font-medium">{act.action}</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">🕒 {act.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Segment */}
                    <div className="pt-2 border-t border-slate-150/80 space-y-1">
                      {hasAccess(["SUPERADMIN", "TENANTADMIN"]) && (
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowWhModal(true);
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-slate-400" /> Switch Warehouse
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>

          {/* Global Operational Status Bar */}
          <footer className={`h-8 border-t flex items-center justify-between px-6 text-[10px] font-mono select-none flex-shrink-0 transition-colors duration-300 ${currentTheme.footerBg}`}>
            <div className="flex items-center gap-3">
              {/* Online / Offline Connectivity Pill */}
              <span className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded ${isOffline ? "bg-rose-100 text-rose-800" : "bg-emerald-100/70 text-emerald-800"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-rose-500 animate-bounce" : "bg-emerald-500 animate-pulse"}`}></span>
                {isOffline ? "OFFLINE MODE" : "ONLINE"}
              </span>
              <span className="opacity-30">|</span>

              {/* Tenant & Active Warehouse */}
              <span className="flex items-center gap-1 font-bold">
                TENANT: {company?.name ? company.name.toUpperCase() : "SEYON"} ({company?.code || "syn"})
              </span>
              <span className="opacity-30">|</span>
              <span className="flex items-center gap-1">
                📍 WH: <strong className="uppercase text-slate-900">{activeWarehouse?.code || "NONE"}</strong>
              </span>
              <span className="opacity-30">|</span>
              <a 
                href={getStorefrontUrl()} 
                target="_blank" 
                rel="noreferrer"
                className="font-bold hover:underline flex items-center gap-1 text-indigo-700"
              >
                <span>Storefront:</span> {process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : (typeof window !== "undefined" ? window.location.host : "Live Store")} ↗
              </a>

            </div>

            <div className="flex items-center gap-3">
              <span>Role: <strong className="uppercase">{userRole}</strong></span>
              <span className="opacity-30">|</span>
              <span>Sync Health: {(company?.shopifyStoreUrl || company?.shopifyShopDomain) ? <span className="text-purple-700 font-bold">Shopify Hybrid (99.8%)</span> : <span className="text-emerald-700 font-bold">Native ERP Direct (100%)</span>}</span>
              <span className="opacity-30">|</span>
              <span>Payment Gateway: {(company?.razorpayEnabled && company?.razorpayKeyId) ? <span className="text-emerald-700 font-bold">Merchant Razorpay Live</span> : <span className="text-amber-600 font-bold">COD / Pending</span>}</span>
              <span className="opacity-30">|</span>
              <span className="flex items-center gap-1">
                <span>BUILD:</span>
                <code className="bg-slate-200/80 text-slate-800 px-1 py-0.5 rounded font-mono text-[9px] font-bold">
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
