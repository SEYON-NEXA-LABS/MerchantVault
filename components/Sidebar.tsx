"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  Building2,
  FileText,
  Printer,
  ArrowDownLeft,
  Package,
  ClipboardList,
  Scan,
  ShoppingBag as OrderIcon,
  ArrowUpRight,
  Truck,
  RotateCcw,
  Users,
  Shield,
  Settings,
  Workflow,
  ExternalLink,
  ChevronLeft,
  PieChart,
  Star,
  Receipt,
  BookOpen,
  MessageSquare,
  Clock,
  Share2,
  Store,
  CreditCard
} from "lucide-react";
import { UserRole } from "@/components/RoleGuard";
import { NAVIGATION_SECTION_THEMES } from "@/lib/navigationThemes";

interface SidebarProps {
  userRole: UserRole;
  company: any;
  lowStockAlertsCount: number;
  devEnvironmentMode: "DEV" | "PROD";
  setDevEnvironmentMode: (mode: "DEV" | "PROD") => void;
  getStorefrontUrl: () => string;
}

export function Sidebar({
  userRole,
  company,
  lowStockAlertsCount,
  devEnvironmentMode,
  setDevEnvironmentMode,
  getStorefrontUrl,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string) => {
    if (!href || href === "#") return false;
    
    // Check query params if specified (e.g. /dashboard/crm?tab=whatsapp)
    if (href.includes("?")) {
      const [basePath, queryString] = href.split("?");
      if (pathname !== basePath) return false;
      const urlParams = new URLSearchParams(queryString);
      const tabParam = urlParams.get("tab");
      const currentTab = searchParams.get("tab") || "directory";
      return tabParam === currentTab;
    }

    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/dashboard/inventory") {
      return pathname === "/dashboard/inventory";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const hasAccess = (allowedRoles: UserRole[]) => allowedRoles.includes(userRole);

  // Subtle Glassmorphism & Refined Pastel Role Themes
  const roleThemes: Record<UserRole, {
    bgActive: string;
    textActive: string;
    iconActive: string;
    borderActive: string;
    hoverBg: string;
    badgeBg: string;
    badgeText: string;
    avatarBg: string;
    sidebarBg: string;
    headerGlow: string;
    roleDot: string;
  }> = {
    SUPERADMIN: {
      bgActive: "bg-rose-500/10 text-rose-950 font-bold backdrop-blur-md border border-rose-500/20 shadow-xs",
      textActive: "text-rose-950 font-bold",
      iconActive: "text-rose-600",
      borderActive: "border-l-4 border-rose-500",
      hoverBg: "hover:bg-rose-50/60 hover:text-rose-900",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200/60",
      badgeText: "text-rose-700",
      avatarBg: "bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-rose-500/20",
      sidebarBg: "bg-slate-50/80 backdrop-blur-md",
      headerGlow: "from-rose-500/10 via-rose-500/5 to-transparent",
      roleDot: "bg-rose-500"
    },
    TENANTADMIN: {
      bgActive: "bg-purple-500/10 text-purple-950 font-bold backdrop-blur-md border border-purple-500/20 shadow-xs",
      textActive: "text-purple-950 font-bold",
      iconActive: "text-purple-600",
      borderActive: "border-l-4 border-purple-500",
      hoverBg: "hover:bg-purple-50/60 hover:text-purple-900",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60",
      badgeText: "text-purple-700",
      avatarBg: "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-purple-500/20",
      sidebarBg: "bg-slate-50/80 backdrop-blur-md",
      headerGlow: "from-purple-500/10 via-purple-500/5 to-transparent",
      roleDot: "bg-purple-500"
    },
    MANAGER: {
      bgActive: "bg-emerald-500/10 text-emerald-950 font-bold backdrop-blur-md border border-emerald-500/20 shadow-xs",
      textActive: "text-emerald-950 font-bold",
      iconActive: "text-emerald-600",
      borderActive: "border-l-4 border-emerald-500",
      hoverBg: "hover:bg-emerald-50/60 hover:text-emerald-900",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      badgeText: "text-emerald-700",
      avatarBg: "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-emerald-500/20",
      sidebarBg: "bg-slate-50/80 backdrop-blur-md",
      headerGlow: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      roleDot: "bg-emerald-500"
    },
    STAFF: {
      bgActive: "bg-indigo-500/10 text-indigo-950 font-bold backdrop-blur-md border border-indigo-500/20 shadow-xs",
      textActive: "text-indigo-950 font-bold",
      iconActive: "text-indigo-600",
      borderActive: "border-l-4 border-indigo-500",
      hoverBg: "hover:bg-indigo-50/60 hover:text-indigo-900",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
      badgeText: "text-indigo-700",
      avatarBg: "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-500/20",
      sidebarBg: "bg-slate-50/80 backdrop-blur-md",
      headerGlow: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      roleDot: "bg-indigo-500"
    }
  };

  const currentTheme = roleThemes[userRole] || roleThemes.STAFF;

  const sidebarTopMenu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
    { name: "POS Counter Sales", icon: ShoppingBag, href: "/dashboard/pos", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
    {
      name: "Sales & Marketplaces",
      icon: Store,
      href: "/dashboard/marketplaces",
      roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[],
      badge: company && (!company.shopifyStoreUrl || (!company.shopifyAccessToken && !company.hasShopifyAccessToken)) ? "Alert" : null
    },
  ];

  // Lifecycle-Based Operational Menu Sections with distinct, vibrant section header color themes
  const menuSections = [
    {
      title: NAVIGATION_SECTION_THEMES["1"].title,
      roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[],
      headerStyle: NAVIGATION_SECTION_THEMES["1"].headerStyle,
      dotColor: NAVIGATION_SECTION_THEMES["1"].dotColor,
      items: [
        { code: "1.1", name: "Vendors & Suppliers", icon: Building2, href: "/dashboard/vendors", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
        { code: "1.2", name: "Purchase Orders (PO)", icon: FileText, href: "/dashboard/inventory/purchase", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
        { code: "1.3", name: "Print Barcodes", icon: Printer, href: "/dashboard/barcode", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
        { code: "1.4", name: "Inward Receiving", icon: ArrowDownLeft, href: "/dashboard/inward", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
      ]
    },
    {
      title: NAVIGATION_SECTION_THEMES["2"].title,
      roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[],
      headerStyle: NAVIGATION_SECTION_THEMES["2"].headerStyle,
      dotColor: NAVIGATION_SECTION_THEMES["2"].dotColor,
      items: [
        {
          code: "2.1",
          name: "Stock & SKU Inventory",
          icon: Package,
          href: "/dashboard/inventory",
          roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[],
          badge: lowStockAlertsCount > 0 ? `${lowStockAlertsCount} Low` : null
        },
        { code: "2.2", name: "Inventory Audits", icon: ClipboardList, href: "/dashboard/inventory/audits", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
        { code: "2.3", name: "Movement & Audit Logs", icon: Scan, href: "/dashboard/inward-outward", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
        { code: "2.4", name: "COGS & Profit Analytics", icon: PieChart, href: "#", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[], comingSoon: true },
      ]
    },
    {
      title: NAVIGATION_SECTION_THEMES["3"].title,
      roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[],
      headerStyle: NAVIGATION_SECTION_THEMES["3"].headerStyle,
      dotColor: NAVIGATION_SECTION_THEMES["3"].dotColor,
      items: [
        { code: "3.1", name: "Orders Directory", icon: OrderIcon, href: "/dashboard/orders", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
        { code: "3.2", name: "Outward Dispatch", icon: ArrowUpRight, href: "/dashboard/outward", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
      ]
    },
    {
      title: NAVIGATION_SECTION_THEMES["4"].title,
      roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[],
      headerStyle: NAVIGATION_SECTION_THEMES["4"].headerStyle,
      dotColor: NAVIGATION_SECTION_THEMES["4"].dotColor,
      items: [
        { code: "4.1", name: "Logistics & Shipping", icon: Truck, href: "/dashboard/logistics", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER", "STAFF"] as UserRole[] },
        { code: "4.2", name: "GST & Tally Export", icon: Receipt, href: "/dashboard/reports/gst", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
      ]
    },
    {
      title: NAVIGATION_SECTION_THEMES["5"].title,
      roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[],
      headerStyle: NAVIGATION_SECTION_THEMES["5"].headerStyle,
      dotColor: NAVIGATION_SECTION_THEMES["5"].dotColor,
      items: [
        { code: "5.1", name: "Customer Directory & LTV", icon: Users, href: "/dashboard/crm?tab=directory", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
        { code: "5.2", name: "Abandoned Cart Recalls", icon: Clock, href: "/dashboard/crm?tab=abandoned", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
        { code: "5.3", name: "WhatsApp Broadcasts", icon: MessageSquare, href: "/dashboard/crm?tab=whatsapp", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
        { code: "5.4", name: "Social Media & Ads Leads", icon: Share2, href: "/dashboard/crm?tab=social", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
        { code: "5.5", name: "Storefront & Layout Builder", icon: Star, href: "/dashboard/storefront", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
        { code: "5.6", name: "Coupons & Promo Codes", icon: Receipt, href: "/dashboard/crm?tab=coupons", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
        { code: "5.7", name: "Blog & Articles CMS", icon: BookOpen, href: "/dashboard/blog", roles: ["SUPERADMIN", "TENANTADMIN", "MANAGER"] as UserRole[] },
      ]
    },
    {
      title: NAVIGATION_SECTION_THEMES["6"].title,
      roles: ["SUPERADMIN", "TENANTADMIN"] as UserRole[],
      headerStyle: NAVIGATION_SECTION_THEMES["6"].headerStyle,
      dotColor: NAVIGATION_SECTION_THEMES["6"].dotColor,
      items: [
        { code: "6.1", name: "Staff & Role Access", icon: Shield, href: "/dashboard/staff", roles: ["SUPERADMIN", "TENANTADMIN"] as UserRole[] },
        { code: "6.2", name: "Tenant Settings & Billing", icon: Settings, href: "/dashboard/settings", roles: ["SUPERADMIN", "TENANTADMIN"] as UserRole[] },
      ]
    },
    {
      title: NAVIGATION_SECTION_THEMES["7"].title,
      roles: ["SUPERADMIN"] as UserRole[],
      headerStyle: NAVIGATION_SECTION_THEMES["7"].headerStyle,
      dotColor: NAVIGATION_SECTION_THEMES["7"].dotColor,
      items: [
        { code: "7.1", name: "Superadmin Control Center", icon: Workflow, href: "/dashboard/superadmin", roles: ["SUPERADMIN"] as UserRole[] },
        { code: "7.2", name: "Multi-Tenant Directory", icon: Building2, href: "/dashboard/superadmin/companies", roles: ["SUPERADMIN"] as UserRole[] },
        { code: "7.3", name: "Platform SaaS Billing Ledgers", icon: CreditCard, href: "/dashboard/superadmin/subscriptions", roles: ["SUPERADMIN"] as UserRole[] },
        { code: "7.4", name: "Global User Management", icon: Users, href: "/dashboard/superadmin/users", roles: ["SUPERADMIN"] as UserRole[] },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/70 flex flex-col h-full overflow-y-auto hidden md:flex flex-shrink-0 select-none transition-all duration-300">
      {/* Brand Header & Ambient Glassmorphism Glow */}
      <div className={`p-4 border-b border-slate-100/80 space-y-2.5 bg-gradient-to-b ${currentTheme.headerGlow}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${currentTheme.avatarBg} rounded-xl flex items-center justify-center font-black text-lg shadow-md transition-all duration-300 flex-shrink-0`}>
            {(company?.name || "ERP").charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm uppercase tracking-wide text-slate-900 truncate max-w-[170px]">
              {company?.name || "MerchantVault"}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">MerchantVault ERP</p>
          </div>
        </div>

        {/* Glassmorphic Role Badge Indicator */}
        <div className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${currentTheme.badgeBg} border shadow-2xs`}>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.roleDot} animate-pulse`} />
            Role Scope:
          </span>
          <span className="font-mono">{userRole}</span>
        </div>
      </div>

      {/* Quick Launch Top Links */}
      <div className="p-3 space-y-1">
        {sidebarTopMenu
          .filter((item) => hasAccess(item.roles))
          .map((item) => {
            const active = isActive(item.href);
            const isPos = item.href === "/dashboard/pos";
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  isPos
                    ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-950 border-emerald-300 shadow-2xs hover:border-emerald-400"
                    : active
                    ? `${currentTheme.bgActive} border-indigo-200 shadow-2xs`
                    : `text-slate-800 border-transparent hover:border-slate-200 ${currentTheme.hoverBg}`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black border flex-shrink-0 ${
                    isPos
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-200/80 text-slate-700 border-slate-300"
                  }`}>
                    {isPos ? "POS" : "HOME"}
                  </span>
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isPos ? "text-emerald-700 font-bold" : active ? currentTheme.iconActive : "text-slate-500 group-hover:text-slate-800"}`} />
                  <span className="text-[13px] tracking-tight">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 shadow-xs">
                    <AlertTriangle className="w-3 h-3" />
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
      </div>

      {/* Lifecycle Flow Ordered Navigation with Multicolored Submenu Headings */}
      <nav className="flex-1 px-3 py-2 space-y-5">
        {menuSections
          .filter((section) => hasAccess(section.roles))
          .map((section) => {
            const visibleItems = section.items.filter((item) => hasAccess(item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                {/* High-Legibility Section Heading Badge */}
                <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg mb-2.5 border ${section.headerStyle} backdrop-blur-xs shadow-2xs`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${section.dotColor} ring-2 ring-white shadow-xs`} />
                    <span className="text-xs font-black tracking-wide uppercase">{section.title}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold opacity-75">SEC {section.title.split('.')[0]}</span>
                </div>
                
                <ul className="space-y-1.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2.5 text-xs rounded-xl group transition-all duration-200 border ${
                            active
                              ? `${currentTheme.bgActive} ${currentTheme.borderActive} shadow-xs`
                              : `border-transparent text-slate-800 font-semibold ${currentTheme.hoverBg} hover:border-slate-200/60`
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Prominent High-Contrast Step/Code Badge */}
                            <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black tracking-tight border flex-shrink-0 shadow-2xs ${
                              active
                                ? "bg-white text-slate-900 border-slate-300"
                                : "bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors"
                            }`}>
                              {item.code}
                            </span>

                            <item.icon
                              className={`w-4 h-4 transition-colors flex-shrink-0 ${
                                active ? currentTheme.iconActive : "text-slate-500 group-hover:text-slate-900"
                              }`}
                            />
                            
                            <span className="text-[13px] tracking-tight text-slate-850">
                              {item.name}
                            </span>
                          </div>
                          {item.badge && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              active ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700 animate-pulse"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {(item as any).comingSoon && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              Soon
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

        {/* Public Channels Section */}
        <div>
          <h2 className="text-[10px] font-extrabold text-slate-400/90 mb-1.5 px-3 uppercase tracking-wider">
            External Store Channels
          </h2>
          <ul className="space-y-1">
            <li>
              <a
                href={getStorefrontUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 ${currentTheme.hoverBg} transition-colors`}
              >
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
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
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 ${currentTheme.hoverBg} transition-colors`}
              >
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                Shopify Admin
              </a>
            </li>
          </ul>
        </div>

        {/* Dev Environment Mode Switcher */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 px-1">
            <div className="flex items-center justify-between bg-slate-100/80 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${devEnvironmentMode === "DEV" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                Env Mode:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDevEnvironmentMode("DEV")}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                    devEnvironmentMode === "DEV"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  DEV
                </button>
                <button
                  onClick={() => setDevEnvironmentMode("PROD")}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                    devEnvironmentMode === "PROD"
                      ? "bg-emerald-600 text-white shadow-xs"
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

      {/* Platform Attribution & Collapse Footer */}
      <div className="p-3 border-t border-slate-100/80 space-y-2 bg-slate-50/50">
        <Link
          href="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200/70 hover:bg-indigo-100/90 transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Help Center &amp; SOPs</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-700 transition-colors" />
        </Link>

        <div className="flex items-center justify-between text-xs text-slate-500 hover:text-slate-900 cursor-pointer">
          <div className="flex items-center font-semibold">
            <ChevronLeft className="w-4 h-4 mr-1" /> Collapse Sidebar
          </div>
          {process.env.NODE_ENV === "development" && (
            <span className="text-[10px] font-mono font-bold bg-amber-100/80 text-amber-800 border border-amber-200/60 px-1.5 py-0.5 rounded-md">
              {devEnvironmentMode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
          <div className="w-5 h-5 rounded-md bg-white border border-slate-200 p-0.5 flex items-center justify-center flex-shrink-0">
            <img 
              src="/seyon-logo.png" 
              alt="Seyon Nexa Labs" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[10px] font-medium text-slate-500 truncate">
            MerchantVault by <strong className="text-slate-700">Seyon Nexa Labs</strong>
          </span>
        </div>
      </div>
    </aside>
  );
}
