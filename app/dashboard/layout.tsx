"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  History,
  Mail,
  ShoppingBag,
  Clock,
  Workflow,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<"SUPERADMIN" | "TENANTADMIN" | "STAFF">("SUPERADMIN");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [activeWhId, setActiveWhId] = useState("");
  const [showWhModal, setShowWhModal] = useState(false);
  const [whSearchQuery, setWhSearchQuery] = useState("");

  useEffect(() => {
    const fetchWhs = async () => {
      try {
        const res = await fetch("/api/warehouses");
        const data = await res.json();
        if (Array.isArray(data)) {
          setWarehouses(data);
          const savedWh = localStorage.getItem("activeWarehouseId");
          if (savedWh && data.some(w => w.id === savedWh)) {
            setActiveWhId(savedWh);
          } else {
            const defaultWh = data.find(w => w.isDefaultPickup) || data[0];
            if (defaultWh) {
              setActiveWhId(defaultWh.id);
              localStorage.setItem("activeWarehouseId", defaultWh.id);
            }
            // If they have multiple warehouses and no selection was saved, prompt them
            if (data.length > 1 && !savedWh) {
              setShowWhModal(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load warehouses in global state", err);
      }
    };
    fetchWhs();

    // Listen for storage events (if changed on other pages)
    const handleStorageChange = () => {
      const savedWh = localStorage.getItem("activeWarehouseId");
      if (savedWh) setActiveWhId(savedWh);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleWhChange = (val: string) => {
    setActiveWhId(val);
    localStorage.setItem("activeWarehouseId", val);
    window.dispatchEvent(new Event("storage"));
    setShowWhModal(false);
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
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto hidden md:flex flex-shrink-0">
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center font-bold text-lg">S</div>
          <div>
            <h1 className="font-bold text-sm uppercase tracking-wide">SEYON</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">CRM + ERP</p>
          </div>
        </div>

        <div className="p-3 space-y-1">
          {[
            { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["SUPERADMIN", "TENANTADMIN", "STAFF"] },
            { name: "Shopify Sync Bridge", icon: RefreshCw, href: "/dashboard/shopify-sync", roles: ["SUPERADMIN", "TENANTADMIN"] },
            { name: "Customers", icon: Users, href: "#", roles: ["SUPERADMIN", "TENANTADMIN"] },
          ]
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-800 hover:text-indigo-900 hover:bg-indigo-50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-500"}`} />
                  {item.name}
                </Link>
              );
            })}
        </div>

        <nav className="flex-1 px-3 py-2 space-y-6">
          {/* Inventory Management Section */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 mb-2 px-3 uppercase tracking-wider">Inventory</h2>
            <ul className="space-y-0.5">
              {[
                { name: "Stock Inventory", icon: Package, badge: "Low Stock Alert", href: "/dashboard/inventory" },
                { name: "Purchase Orders", icon: FileText, href: "/dashboard/inventory/purchase" },
                { name: "Returns & Damage", icon: RotateCcw, href: "#" },
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
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Barcode Operations Section */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 mb-2 px-3 uppercase tracking-wider">Barcode Operations</h2>
            <ul className="space-y-0.5">
              {[
                { name: "Print & Generate", icon: Printer, href: "/dashboard/barcode" },
                { name: "Inward & Outward", icon: Scan, href: "/dashboard/inward-outward" },
                { name: "Inventory Audits", icon: ClipboardList, href: "#" },
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

          {/* Order Management Section */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 mb-2 px-3 uppercase tracking-wider">Orders</h2>
            <ul className="space-y-0.5">
              {[
                { name: "Orders Directory", icon: ShoppingBag, href: "/dashboard/orders" },
                { name: "Logistics & Returns", icon: Truck, href: "/dashboard/logistics" },
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

          {/* Admin Settings Section */}
          {(userRole === "SUPERADMIN" || userRole === "TENANTADMIN") && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 mb-2 px-3 uppercase tracking-wider">Admin Settings</h2>
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
        </nav>

        <div className="p-4 border-t border-gray-100 flex items-center text-xs text-gray-500 hover:text-gray-900 cursor-pointer">
          <ChevronLeft className="w-4 h-4 mr-1" /> Collapse
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
            
            <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                12
              </span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden md:block">
                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="bg-transparent text-sm font-semibold text-gray-900 border-none outline-none cursor-pointer focus:ring-0 text-right pr-2"
                >
                  {userRole === "SUPERADMIN" && (
                    <option value="SUPERADMIN">Platform Admin</option>
                  )}
                  <option value="TENANTADMIN">Tenant Admin</option>
                  <option value="STAFF">Staff Operator</option>
                </select>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest text-right mr-2 mt-0.5">Active Role</p>
              </div>
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-200">
                <img 
                  src={
                    userRole === "SUPERADMIN" ? "https://i.pravatar.cc/150?u=super" :
                    userRole === "TENANTADMIN" ? "https://i.pravatar.cc/150?u=admin" :
                    "https://i.pravatar.cc/150?u=staff"
                  } 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
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
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> TENANT: SEYON (vtex)
            </span>
            <span className="text-stone-300">|</span>
            <span>Shopify: vtex-clothing.myshopify.com</span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1">
              <span>📍 WH:</span>
              <span className="font-bold uppercase">{activeWarehouse?.code || "NONE"}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Webhook: Listening (Active)</span>
            <span className="text-stone-300">|</span>
            <span>Sync Health: 99.8%</span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-900 font-semibold">API v2026-04</span>
          </div>
        </footer>
      </div>

      {/* Warehouse Selection Modal (Glassmorphism backdrop) */}
      {showWhModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-100 bg-slate-50/80">
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
                <div className="text-center py-8 text-xs text-gray-400">
                  No warehouses found matching search.
                </div>
              )}
            </div>

            {/* If a warehouse is already active, allow close/cancel */}
            {activeWhId && (
              <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowWhModal(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
