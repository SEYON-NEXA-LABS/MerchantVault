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
  UserCheck
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
  cartValue: number;
  recoveryStatus: "PENDING" | "WHATSAPP_SENT" | "RECOVERED";
  createdAt: string;
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
  const [activeTab, setActiveTab] = useState<"directory" | "abandoned">("directory");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/customers");
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
      if (data.abandonedCheckouts) {
        setAbandonedCarts(data.abandonedCheckouts);
      }
    } catch (err) {
      toast.error("Failed to load CRM data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const triggerMockRecovery = async (cartId: string, phone: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Connecting to WhatsApp template API for ${phone}...`,
        success: () => {
          setAbandonedCarts(prev => prev.map(c => c.id === cartId ? { ...c, recoveryStatus: "WHATSAPP_SENT" as const } : c));
          return `Mock Recovery template sent successfully to ${phone}! (API ready to connect)`;
        },
        error: "Failed to send template."
      }
    );
  };

  // Stats
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter(c => c.isRepeat).length;
  const repeatRate = totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : "0.0";
  const pendingCarts = abandonedCarts.filter(c => c.recoveryStatus === "PENDING").length;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-950" /> Customer Directory & CRM
          </h1>
          <p className="text-sm text-gray-500">
            Track repeat purchase histories, customer metrics, and handle manual abandoned cart recovery templates.
          </p>
        </div>
        <button
          onClick={fetchCRMData}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-150 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh CRM
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Unique Customers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{totalCustomers}</span>
            <span className="text-xs text-gray-400 font-medium">from order history</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repeat Buyers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-900">{repeatCustomers}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <UserCheck className="w-3.5 h-3.5" /> {repeatRate}% Rate
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Abandoned Carts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-950">{abandonedCarts.length}</span>
            <span className="text-xs text-amber-600 font-medium">{pendingCarts} pending recovery</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp Recovery Mode</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">Mock Setup (API Ready)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "directory" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Customer Directory ({totalCustomers})
        </button>
        <button
          onClick={() => setActiveTab("abandoned")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "abandoned" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Abandoned Carts ({abandonedCarts.length})
        </button>
      </div>

      {/* Search and Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 bg-white border border-gray-200 rounded-xl shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Querying customer database...</p>
        </div>
      ) : activeTab === "directory" ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, phone, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Primary Location</th>
                  <th className="p-4 text-center">Fulfillments</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 font-normal">
                      No customer records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/55 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{c.name}</td>
                      <td className="p-4 font-mono text-gray-600">{c.phone}</td>
                      <td className="p-4 flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {c.city ? `${c.city}, ${c.state || ""}` : "Not provided"}
                      </td>
                      <td className="p-4 text-center font-bold text-gray-900">{c.totalOrders}</td>
                      <td className="p-4">
                        {c.isRepeat ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" /> Repeat Buyer
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            First Order
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-semibold px-3 py-1 rounded text-xs transition-colors"
                        >
                          View Purchase History
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Abandoned Carts Pane */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm">Shopify Abandoned Checkouts</h3>
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
                      <td className="p-4 font-mono font-bold text-gray-900">₹{cart.cartValue}</td>
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
                            onClick={() => triggerMockRecovery(cart.id, cart.customerPhone)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ml-auto"
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

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-indigo-950" /> {selectedCustomer.name}
                </h3>
                <p className="text-[10px] font-mono text-gray-500 mt-0.5">{selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-650"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">Purchase History Ledger</h4>
              <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100 text-xs">
                {selectedCustomer.orders.map((o) => (
                  <div key={o.id} className="p-3 hover:bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2 font-medium">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{o.orderNumber}</span>
                        <span className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedCustomer.city ? `${selectedCustomer.city}, ${selectedCustomer.state || ""}` : "Default Delivery Address"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Status</p>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          o.deliveryStatus === "DELIVERED" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : o.deliveryStatus === "SHIPPED"
                            ? "bg-indigo-50 text-indigo-750"
                            : o.deliveryStatus === "PROCESSING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {o.deliveryStatus}
                        </span>
                      </div>

                      {o.awbNumber && (
                        <div className="text-right border-l border-gray-100 pl-4">
                          <p className="text-[10px] text-gray-400">{o.courierPartner || "Courier"}</p>
                          <p className="font-mono text-[10px] text-gray-700 font-bold">{o.awbNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg font-semibold text-gray-700 text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
