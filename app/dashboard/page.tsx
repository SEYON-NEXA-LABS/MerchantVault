"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  IndianRupee, 
  Users, 
  CalendarClock, 
  PackageX, 
  Wallet,
  Settings2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

const salesChartConfig = {
  revenue: {
    label: "Revenue (₹)",
    color: "#6366f1",
  },
  orders: {
    label: "Orders",
    color: "#38bdf8",
  },
} satisfies ChartConfig;

const inventoryChartConfig = {
  value: {
    label: "SKUs",
  },
  inStock: {
    label: "In Stock",
    color: "#10b981",
  },
  lowStock: {
    label: "Low Stock",
    color: "#f59e0b",
  },
  outOfStock: {
    label: "Out of Stock",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const rtoChartConfig = {
  value: {
    label: "Orders",
  },
  initiated: {
    label: "RTO Initiated",
    color: "#f43f5e",
  },
  received: {
    label: "RTO Received",
    color: "#fda4af",
  },
} satisfies ChartConfig;

interface DashboardData {
  kpis: {
    totalOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    totalRto: number;
    rtoPercentage: string;
    totalVariants: number;
    totalStockUnits: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  salesData: Array<{ name: string; revenue: number; orders: number }>;
  inventoryData: Array<{ name: string; value: number; fill: string }>;
  rtoData: Array<{ name: string; value: number; fill: string }>;
  topProducts: Array<{ id: number; name: string; sku: string; variants: number; totalStock: number }>;
  recentOrders: Array<{ id: string; customer: string; time: string; status: string; statusColor: string; amount: string }>;
  lowStockAlerts: Array<{ name: string; sku: string; qty: number }>;
}

export default function DashboardPage() {
  const [startDate, setStartDate] = useState("2026-06-04");
  const [endDate, setEndDate] = useState("2026-06-11");
  const [activePreset, setActivePreset] = useState("Last 7 Days");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.error) {
        console.error("Dashboard API error:", json.error);
      } else {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatDate = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayStr = formatDate(new Date());

  const presetOptions = [
    "Today", "Yesterday", "Last 7 Days", "Last 30 Days",
    "Q1", "Q2", "Q3", "Q4",
    "Previous Year", "Previous Financial Year"
  ];

  const handlePresetSelect = (presetLabel: string) => {
    setActivePreset(presetLabel);
    const today = new Date();
    const currentYear = today.getFullYear();
    let start = new Date();
    let end = new Date();

    switch (presetLabel) {
      case "Today":
        start = new Date(today);
        end = new Date(today);
        break;
      case "Yesterday":
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(today);
        end.setDate(today.getDate() - 1);
        break;
      case "Last 7 Days":
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        end = new Date(today);
        break;
      case "Last 30 Days":
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        end = new Date(today);
        break;
      case "Q1":
        start = new Date(currentYear, 0, 1);
        end = new Date(currentYear, 2, 31);
        break;
      case "Q2":
        start = new Date(currentYear, 3, 1);
        end = new Date(currentYear, 5, 30);
        break;
      case "Q3":
        start = new Date(currentYear, 6, 1);
        end = new Date(currentYear, 8, 30);
        break;
      case "Q4":
        start = new Date(currentYear, 9, 1);
        end = new Date(currentYear, 11, 31);
        break;
      case "Previous Year":
        start = new Date(currentYear - 1, 0, 1);
        end = new Date(currentYear - 1, 11, 31);
        break;
      case "Previous Financial Year":
        const startYear = today.getMonth() >= 3 ? currentYear - 1 : currentYear - 2;
        start = new Date(startYear, 3, 1);
        end = new Date(startYear + 1, 2, 31);
        break;
      default:
        return;
    }

    // Limit to current date to avoid future entries
    const maxDate = new Date();
    if (start > maxDate) start = new Date(maxDate);
    if (end > maxDate) end = new Date(maxDate);

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Derived values from API data
  const kpis = data?.kpis;
  const salesData = data?.salesData || [];
  const inventoryData = data?.inventoryData || [];
  const rtoData = data?.rtoData || [];
  const topProducts = data?.topProducts || [];
  const recentOrders = data?.recentOrders || [];
  const lowStockAlerts = data?.lowStockAlerts || [];
  const totalInventorySKUs = inventoryData.reduce((sum, d) => sum + d.value, 0);
  const totalRtoValue = rtoData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto relative">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Hello Admin, here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-white border border-gray-200 rounded-md px-3 py-1.5 flex items-center text-sm text-gray-600 font-semibold cursor-pointer shadow-sm hover:bg-gray-50 select-none"
            >
              <CalendarClock className="w-4 h-4 mr-2 text-indigo-600" />
              <span>
                {activePreset === "Custom" 
                  ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                  : activePreset
                }
              </span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 min-w-[340px] space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Preset Ranges</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {presetOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handlePresetSelect(opt)}
                        className={`text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                          activePreset === opt
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "hover:bg-slate-50 text-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                    <button
                      onClick={() => setActivePreset("Custom")}
                      className={`text-left text-xs col-span-2 px-2.5 py-1.5 rounded transition-colors text-center ${
                        activePreset === "Custom"
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "hover:bg-slate-50 text-gray-700 border border-dashed border-gray-200"
                      }`}
                    >
                      Custom Date Range
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Custom Dates</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Start Date</label>
                      <input 
                        type="date" 
                        value={startDate}
                        max={todayStr}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val <= todayStr) {
                            setStartDate(val);
                            setActivePreset("Custom");
                          }
                        }}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1 font-semibold">End Date</label>
                      <input 
                        type="date" 
                        value={endDate}
                        max={todayStr}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val <= todayStr) {
                            setEndDate(val);
                            setActivePreset("Custom");
                          }
                        }}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-700 px-2.5 py-1"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (startDate > endDate) {
                        alert("Start date cannot be after end date.");
                        return;
                      }
                      setShowDatePicker(false);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded shadow-sm"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="bg-white border border-gray-200 rounded-md px-3 py-1.5 flex items-center text-sm text-gray-600 font-semibold shadow-sm hover:bg-gray-50 transition-colors">
            <Settings2 className="w-4 h-4 mr-2 text-gray-400" />
            Customize
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading dashboard data...</p>
        </div>
      )}

      {!loading && data && (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { title: "Total Orders", value: kpis?.totalOrders?.toString() || "0", icon: ShoppingBag, iconBg: "bg-indigo-100 text-indigo-600", trend: `${kpis?.processingOrders || 0} pending`, trendUp: true, sparklineColor: "#6366f1" },
              { title: "Delivered", value: kpis?.deliveredOrders?.toString() || "0", icon: IndianRupee, iconBg: "bg-emerald-100 text-emerald-600", trend: "completed", trendUp: true, sparklineColor: "#10b981" },
              { title: "Total SKUs", value: kpis?.totalVariants?.toString() || "0", icon: Users, iconBg: "bg-blue-100 text-blue-600", trend: `${kpis?.totalStockUnits || 0} units`, trendUp: true, sparklineColor: "#3b82f6" },
              { title: "Low Stock Alerts", value: kpis?.lowStockCount?.toString() || "0", icon: CalendarClock, iconBg: "bg-orange-100 text-orange-600", trend: "variants below threshold", trendUp: false, sparklineColor: "#f97316" },
              { title: "RTO Percentage", value: `${kpis?.rtoPercentage || "0.00"}%`, icon: PackageX, iconBg: "bg-rose-100 text-rose-600", trend: `${kpis?.totalRto || 0} returns`, trendUp: false, sparklineColor: "#f43f5e" },
              { title: "Shipped In Transit", value: kpis?.shippedOrders?.toString() || "0", icon: Wallet, iconBg: "bg-purple-100 text-purple-600", trend: "parcels en route", trendUp: true, sparklineColor: "#a855f7" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-500 mb-1">{kpi.title}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{kpi.value}</h3>
                <div className="flex items-center text-xs font-medium mt-auto">
                  <span className={`flex items-center ${kpi.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {kpi.trendUp ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
                    {kpi.trend}
                  </span>
                </div>
                {/* Sparkline SVG */}
                <svg className="absolute bottom-0 left-0 w-full h-10 opacity-30 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 30">
                   <path d="M0,30 Q10,25 20,20 T40,15 T60,25 T80,10 T100,5" fill="none" stroke={kpi.sparklineColor} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ))}
          </div>

          {/* Middle Row: Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sales Overview Chart */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-gray-900">Sales Overview</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs font-medium text-gray-600 flex items-center cursor-pointer">
                  This Week <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-4 mb-4 text-xs font-medium">
                <div className="flex items-center"><div className="w-3 h-3 bg-indigo-500 rounded-sm mr-2"></div>Revenue (₹)</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-sky-400 rounded-full mr-2"></div>Orders</div>
              </div>
              <div className="h-64 w-full">
                <ChartContainer config={salesChartConfig} className="h-full w-full aspect-auto">
                  <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: 'var(--color-orders)', strokeWidth: 2 }} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>

            {/* Top Products */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-gray-900">Top Products</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs font-medium text-gray-600 flex items-center cursor-pointer">
                  By Stock <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                </div>
              </div>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No products found.</p>
                ) : topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-3">{product.id}</span>
                      <div className="w-9 h-9 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/seed/${product.id}/40/40`} className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{product.name}</p>
                        <p className="text-[10px] text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 leading-none mb-1">{product.totalStock} units</p>
                      <p className="text-[10px] text-gray-500">{product.variants} Variants</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
                <span className="text-xs font-medium text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No orders yet.</p>
                ) : recentOrders.map((order, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{order.id}</p>
                        <p className="text-xs text-gray-500">{order.customer}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-gray-400">{order.time}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">₹ {order.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row: Donuts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Inventory Overview */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-gray-900">Inventory Overview</h3>
                <span className="text-xs font-medium text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="flex items-center h-48">
                <div className="w-1/2 h-full relative">
                  <ChartContainer config={inventoryChartConfig} className="h-full w-full aspect-auto">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie data={inventoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" dataKey="value">
                        {inventoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs text-gray-500">Total SKUs</p>
                    <p className="text-xl font-bold text-gray-900">{totalInventorySKUs}</p>
                  </div>
                </div>
                <div className="w-1/2 pl-2 space-y-3">
                  {inventoryData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-xs font-medium text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {item.value} <span className="text-gray-400 font-normal">({totalInventorySKUs > 0 ? Math.round((item.value/totalInventorySKUs)*100) : 0}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-gray-900">Low Stock Alerts</h3>
                <span className="text-xs font-medium text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="space-y-4">
                {lowStockAlerts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No low stock alerts.</p>
                ) : lowStockAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/seed/alert${i}/32/32`} className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{alert.name}</p>
                        <p className="text-[10px] text-gray-500">SKU: {alert.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-600">{alert.qty} Pcs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RTO Overview */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-gray-900">RTO Overview</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs font-medium text-gray-600 flex items-center cursor-pointer">
                  This Week <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center h-48">
                <div className="w-1/2 h-full relative">
                  <ChartContainer config={rtoChartConfig} className="h-full w-full aspect-auto">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie data={rtoData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" dataKey="value">
                        {rtoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs text-gray-500">Total RTO</p>
                    <p className="text-xl font-bold text-gray-900">{totalRtoValue}</p>
                  </div>
                </div>
                <div className="w-1/2 pl-2 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full mr-2 bg-rose-600"></div>
                      <span className="text-xs font-semibold text-gray-900">RTO Orders</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{totalRtoValue} <span className="text-gray-400 font-normal">({kpis?.rtoPercentage || "0.00"}%)</span></span>
                  </div>
                  {rtoData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-xs font-medium text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {item.value} <span className="text-gray-400 font-normal">({totalRtoValue > 0 ? Math.round((item.value/totalRtoValue)*100) : 0}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
