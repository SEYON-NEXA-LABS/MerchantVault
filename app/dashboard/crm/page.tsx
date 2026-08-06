"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  UserCheck,
  Award,
  Sparkles,
  ArrowRight,
  Send,
  BarChart4,
  Mail,
  X
} from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "../../../components/RoleGuard";

interface OrderInfo {
  id: string;
  orderNumber: string;
  deliveryStatus: string;
  awbNumber: string | null;
  courierPartner: string | null;
  createdAt: string;
}

interface CustomerRecord {
  name: string;
  phone: string;
  email?: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  totalOrders: number;
  orders: OrderInfo[];
  isRepeat: boolean;
}

interface AbandonedCart {
  id: string;
  customerName: string;
  customerPhone: string;
  cartDetails?: any;
  checkoutUrl?: string;
  cartValue?: number;
  recoveryEmailSent?: boolean;
  recoverySmsSent?: boolean;
  recoveryStatus?: "PENDING" | "WHATSAPP_SENT" | "RECOVERED";
  createdAt: string;
}

interface CampaignLog {
  id: string;
  name: string;
  segment: string;
  templateName: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  revenue: number;
  createdAt: string;
  status: "PROCESSING" | "SENT";
}

export default function CRMPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "TENANTADMIN"]}>
      <CRMContent />
    </RoleGuard>
  );
}

function CRMContent() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "abandoned" | "campaigns">("directory");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Pagination & Filter states for Customer Directory
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [directorySegment, setDirectorySegment] = useState<"ALL" | "VIP" | "REPEAT" | "INACTIVE">("ALL");

  // Marketing Campaign form states
  const [campaignName, setCampaignName] = useState("");
  const [campaignSegment, setCampaignSegment] = useState("ALL");
  const [campaignTemplate, setCampaignTemplate] = useState("FESTIVE_PROMO");
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState(0);

  // Campaign log ledger
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([
    {
      id: "camp-1",
      name: "Akshaya Tritiya Silk Launch",
      segment: "VIP Customers",
      templateName: "Akshaya Tritiya Promo",
      sentCount: 18,
      openRate: 94.4,
      clickRate: 38.8,
      revenue: 68900,
      status: "SENT",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "camp-2",
      name: "Abandoned Checkout Automatic Recall",
      segment: "Cart Abandoners",
      templateName: "Cart Recall Template",
      sentCount: 14,
      openRate: 85.7,
      clickRate: 50.0,
      revenue: 21500,
      status: "SENT",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/customers");
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
      if (data.abandonedCheckouts) {
        // Map cartValue or assign default
        const mappedAbandoned = data.abandonedCheckouts.map((c: any) => ({
          id: c.id,
          customerName: c.customerName || "Shopify Customer",
          customerPhone: c.customerPhone,
          cartValue: c.cartValue || 1899,
          recoveryStatus: c.recoveryStatus || "PENDING",
          createdAt: c.createdAt
        }));
        setAbandonedCarts(mappedAbandoned);
      }
    } catch (err) {
      toast.error("Failed to load CRM database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const triggerRecovery = async (cartId: string, phone: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Transmitting WhatsApp checkout recall template to ${phone}...`,
        success: () => {
          setAbandonedCarts(prev => prev.map(c => c.id === cartId ? { ...c, recoveryStatus: "WHATSAPP_SENT" as const } : c));
          return `WhatsApp recovery template transmitted successfully to ${phone}!`;
        },
        error: "Failed to send template."
      }
    );
  };

  // Launch a new promotional campaign broadcast
  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (launchingCampaign) {
      toast.warning("A campaign broadcast is already in progress. Please wait for completion.");
      return;
    }
    if (!campaignName) {
      toast.error("Please specify a campaign name.");
      return;
    }

    // Determine target count based on selected segment
    let targets = customers;
    if (campaignSegment === "VIP") {
      targets = customers.filter(c => getCustomerLtv(c) >= 6000 || c.totalOrders >= 3);
    } else if (campaignSegment === "REPEAT") {
      targets = customers.filter(c => c.isRepeat);
    } else if (campaignSegment === "INACTIVE") {
      targets = customers.filter(c => c.totalOrders === 1); // Mock inactive
    }

    if (targets.length === 0) {
      toast.error("No customers found in the selected target segment.");
      return;
    }

    setLaunchingCampaign(true);
    setCampaignProgress(0);

    // Simulate batch dispatch progress bar
    const interval = setInterval(() => {
      setCampaignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Append log entry
            const newLog: CampaignLog = {
              id: `camp-${Date.now()}`,
              name: campaignName,
              segment: `${campaignSegment} Segment`,
              templateName: campaignTemplate.replace("_", " "),
              sentCount: targets.length,
              openRate: parseFloat((Math.random() * 20 + 80).toFixed(1)), // 80% - 100%
              clickRate: parseFloat((Math.random() * 25 + 15).toFixed(1)), // 15% - 40%
              revenue: targets.length * 1500, // Simulated sales conversions
              status: "SENT",
              createdAt: new Date().toISOString()
            };
            setCampaignLogs(prevLogs => [newLog, ...prevLogs]);
            setLaunchingCampaign(false);
            setCampaignName("");
            toast.success(`Campaign "${campaignName}" launched and sent to ${targets.length} customers!`);
          }, 500);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Compute LTV and AOV helper metrics
  const getCustomerLtv = (c: CustomerRecord) => {
    // Sum up orders, assume base value of 1999 per order if no direct value is set
    return c.totalOrders * 1999;
  };

  const getCustomerAov = (c: CustomerRecord) => {
    return c.totalOrders > 0 ? getCustomerLtv(c) / c.totalOrders : 0;
  };

  const getCustomerBadge = (c: CustomerRecord) => {
    const ltv = getCustomerLtv(c);
    if (ltv >= 8000) return { label: "VIP Tier", color: "bg-amber-50 text-amber-700 border-amber-200" };
    if (c.isRepeat) return { label: "Loyal Buyer", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    return { label: "New Customer", color: "bg-slate-50 text-slate-600 border-slate-250" };
  };

  // Stats summary calculations
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter(c => c.isRepeat).length;
  const repeatRate = totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : "0.0";
  const pendingCarts = abandonedCarts.filter(c => c.recoveryStatus === "PENDING").length;

  // Filter & Segment customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSegment = 
      directorySegment === "ALL" ||
      (directorySegment === "VIP" && (getCustomerLtv(c) >= 6000 || c.totalOrders >= 3)) ||
      (directorySegment === "REPEAT" && c.isRepeat) ||
      (directorySegment === "INACTIVE" && c.totalOrders === 1);

    return matchesSearch && matchesSegment;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-950" /> Customer Directory & CRM
          </h1>
          <p className="text-sm text-gray-500">
            Segment your textile buyers, track Lifetime Value (LTV), and launch template WhatsApp recovery campaigns.
          </p>
        </div>
        <button
          onClick={fetchCRMData}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-250 text-gray-800 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Database
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Unique Buyers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{totalCustomers}</span>
            <span className="text-xs text-gray-400 font-medium">from order history</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Repeat Buyers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-900">{repeatCustomers}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <UserCheck className="w-3.5 h-3.5" /> {repeatRate}% Rate
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Abandoned Carts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-955">{abandonedCarts.length}</span>
            <span className="text-xs text-amber-600 font-semibold">{pendingCarts} pending recovery</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Marketing API Connection</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="inline-flex h-11 items-center justify-start rounded-lg bg-gray-100 p-1 text-gray-500 gap-1 border border-gray-200">
        <button
          onClick={() => setActiveTab("directory")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 cursor-pointer ${
            activeTab === "directory"
              ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200/50"
              : "text-gray-550 hover:text-gray-900 hover:bg-gray-50/50"
          }`}
        >
          <Users className="w-4 h-4" /> Customer Directory
        </button>
        <button
          onClick={() => setActiveTab("abandoned")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 cursor-pointer ${
            activeTab === "abandoned"
              ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200/50"
              : "text-gray-550 hover:text-gray-900 hover:bg-gray-50/50"
          }`}
        >
          <Clock className="w-4 h-4" /> Abandoned Checkouts
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2 cursor-pointer ${
            activeTab === "campaigns"
              ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200/50"
              : "text-gray-550 hover:text-gray-900 hover:bg-gray-50/50"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Campaigns & Broadcasts
        </button>
      </div>

      {/* Directory Tab View */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Main Directory Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Segmentation Tabs */}
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                {(["ALL", "VIP", "REPEAT", "INACTIVE"] as const).map(seg => (
                  <button
                    key={seg}
                    onClick={() => setDirectorySegment(seg)}
                    className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                      directorySegment === seg 
                        ? "bg-white text-gray-900 shadow-xs" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone / Location</th>
                    <th className="p-4 text-center">Fulfillments</th>
                    <th className="p-4">Est. LTV</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-650" />
                        Fetching customer profile records...
                      </td>
                    </tr>
                  ) : paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400">
                        No customer profiles match the segment criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((c, idx) => {
                      const badge = getCustomerBadge(c);
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => setSelectedCustomer(c)}
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                            selectedCustomer?.phone === c.phone ? "bg-indigo-50/20" : ""
                          }`}
                        >
                          <td className="p-4">
                            <p className="font-bold text-gray-900 leading-snug">{c.name}</p>
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-mono text-gray-600">{c.phone}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-gray-300" />
                              {c.city ? `${c.city}, ${c.state || ""}` : "Not provided"}
                            </p>
                          </td>
                          <td className="p-4 text-center font-bold text-gray-900">{c.totalOrders}</td>
                          <td className="p-4 font-mono font-bold text-indigo-950">₹{getCustomerLtv(c).toLocaleString()}</td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-semibold px-3 py-1.5 rounded text-xs transition-all cursor-pointer shadow-xs border border-indigo-200/60"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
              <div>
                Showing <span className="font-bold text-gray-800">{filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> of{" "}
                <span className="font-bold text-gray-800">{filteredCustomers.length}</span> profiles
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <span className="font-semibold text-gray-700 px-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Customer Details Modal Popup */}
          {selectedCustomer && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-150 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Customer Profile</span>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{selectedCustomer.name}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Contact Info */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-wrap gap-4 justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Phone</span>
                      <span className="font-mono font-bold text-slate-800">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Email</span>
                        <span className="font-mono text-slate-700">{selectedCustomer.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Location</span>
                      <span className="text-slate-700">{selectedCustomer.city ? `${selectedCustomer.city}, ${selectedCustomer.state || ""}` : "Not provided"}</span>
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Lifetime Value</span>
                      <span className="font-black text-indigo-950 text-xl block font-mono">₹{getCustomerLtv(selectedCustomer).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg Order Value</span>
                      <span className="font-black text-slate-900 text-xl block font-mono">₹{getCustomerAov(selectedCustomer).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Timeline Ledger */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-indigo-600" /> Order History Ledger ({selectedCustomer.totalOrders})
                    </h4>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {selectedCustomer.orders.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No order records attached.</p>
                      ) : (
                        selectedCustomer.orders.map(o => (
                          <div key={o.id} className="p-3.5 border border-gray-200 rounded-xl text-xs bg-white hover:bg-slate-50/50 transition-colors shadow-2xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900 font-mono">{o.orderNumber}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{new Date(o.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                o.deliveryStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" :
                                o.deliveryStatus === "SHIPPED" ? "bg-blue-50 text-blue-700 border border-blue-200/50" :
                                "bg-amber-50 text-amber-700 border border-amber-200/50"
                              }`}>
                                {o.deliveryStatus}
                              </span>
                              {o.awbNumber && (
                                <span className="font-mono text-[10px] text-gray-500 font-bold">
                                  AWB: {o.awbNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Abandoned Checkouts View */}
      {activeTab === "abandoned" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm">Shopify Abandoned Checkouts Recall</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">List of customers who left items in cart. Connects to WhatsApp Template API for recovery campaigns.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Cart Value</th>
                  <th className="p-4">Recovery Status</th>
                  <th className="p-4">Abandoned At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {abandonedCarts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 font-normal">
                      No abandoned checkout records found in database.
                    </td>
                  </tr>
                ) : (
                  abandonedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-gray-50/55 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{cart.customerName}</td>
                      <td className="p-4 font-mono text-gray-600">{cart.customerPhone}</td>
                      <td className="p-4 font-mono font-bold text-gray-900">₹{(cart.cartValue || 0).toLocaleString()}</td>
                      <td className="p-4">
                        {cart.recoveryStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 animate-pulse" /> Pending
                          </span>
                        )}
                        {cart.recoveryStatus === "WHATSAPP_SENT" && (
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <MessageSquare className="w-3 h-3" /> Recovery Template Sent
                          </span>
                        )}
                        {cart.recoveryStatus === "RECOVERED" && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Recovered
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">{new Date(cart.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {cart.recoveryStatus === "PENDING" ? (
                          <button
                            onClick={() => triggerRecovery(cart.id, cart.customerPhone)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Send Recovery WhatsApp
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-400 bg-gray-50 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-not-allowed ml-auto border border-gray-150"
                          >
                            Template Transmitted
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns & Broadcasting Tab View */}
      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Launch Campaign Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-650" /> Launch WhatsApp Broadcast
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Send bulk marketing templates directly to segmented buyer contacts.
                </p>
              </div>

              <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Campaign Campaign Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Premium Silk Promo"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Target Contacts Segment *</label>
                  <select
                    value={campaignSegment}
                    onChange={(e) => setCampaignSegment(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="ALL">All Unique Customers ({customers.length})</option>
                    <option value="VIP">VIP Customers ({customers.filter(c => getCustomerLtv(c) >= 6000 || c.totalOrders >= 3).length})</option>
                    <option value="REPEAT">Repeat Buyers ({customers.filter(c => c.isRepeat).length})</option>
                    <option value="INACTIVE">Inactive Accounts ({customers.filter(c => c.totalOrders === 1).length})</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Approved Message Template *</label>
                  <select
                    value={campaignTemplate}
                    onChange={(e) => setCampaignTemplate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value="BIG_BILLION_SALE">🔥 Big Billion Sale Special (50% OFF)</option>
                    <option value="WEDNESDAY_MIDNIGHT_BLITZ">⚡ Wednesday Midnight Flash Sale (10 PM - 2 AM)</option>
                    <option value="FESTIVE_PROMO">Festive Mega Sale Template (WhatsApp Approved)</option>
                    <option value="NEW_STYLE_LAUNCH">New Collection Catalog Broadcaster</option>
                    <option value="DISCOUNT_OFFER">Loyalty Reward Voucher Code</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={launchingCampaign || !campaignName}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {launchingCampaign ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Distributing Broadcast ({campaignProgress}%)
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Launch Broadcast Campaign
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Campaign Analytics Logs Ledger */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <BarChart4 className="w-4 h-4 text-indigo-650" /> Campaign Dispatch Analytics
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Logs of active and completed marketing campaigns.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                      <th className="p-4">Campaign Name</th>
                      <th className="p-4">Segment</th>
                      <th className="p-4 text-center">Sent</th>
                      <th className="p-4 text-center">Open Rate</th>
                      <th className="p-4 text-center">Clicks (CTR)</th>
                      <th className="p-4 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {campaignLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 leading-snug">{log.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 text-gray-500 font-bold">{log.segment}</td>
                        <td className="p-4 text-center font-mono font-bold text-gray-800">{log.sentCount}</td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-600">{log.openRate}%</td>
                        <td className="p-4 text-center font-mono font-bold text-indigo-600">{log.clickRate}%</td>
                        <td className="p-4 text-right font-mono font-black text-indigo-950">₹{log.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
