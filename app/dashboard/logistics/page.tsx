"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, 
  Search, 
  QrCode, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin,
  RefreshCw,
  CornerUpLeft
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalWeightKg: number;
  awbNumber: string | null;
  courierPartner: string | null;
  deliveryStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" | "RTO_INITIATED" | "RTO_RECEIVED";
  createdAt: string;
}

export default function LogisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  
  // AWB Quick Status scan utility
  const [scannedAwb, setScannedAwb] = useState("");
  const [scanningStatus, setScanningStatus] = useState<"DELIVERED" | "RTO_INITIATED" | "RTO_RECEIVED">("DELIVERED");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Only show shipments that have AWB numbers assigned
        setOrders(data.filter(o => o.awbNumber !== null));
      }
    } catch (error) {
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleScanUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedAwb) {
      toast.error("Please provide an AWB code");
      return;
    }

    try {
      const res = await fetch("/api/orders/logistics-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awbNumber: scannedAwb,
          deliveryStatus: scanningStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`AWB ${scannedAwb} status updated to ${scanningStatus}!`);
        setScannedAwb("");
        fetchOrders();
      } else {
        toast.error(data.error || "Failed to update shipment status");
      }
    } catch (err) {
      toast.error("Failed to communicate with logistics API");
    }
  };

  const counts = {
    total: orders.length,
    shipped: orders.filter(o => o.deliveryStatus === "SHIPPED").length,
    delivered: orders.filter(o => o.deliveryStatus === "DELIVERED").length,
    rto: orders.filter(o => o.deliveryStatus.startsWith("RTO")).length
  };

  const filteredOrders = orders.filter(ord => {
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.awbNumber && ord.awbNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      selectedStatus === "All" || 
      (selectedStatus === "RTO" ? ord.deliveryStatus.startsWith("RTO") : ord.deliveryStatus === selectedStatus);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Truck className="w-3 h-3" /> Logistics Control
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipment & Delivery Management</h1>
          <p className="text-sm text-gray-500">
            Monitor carrier states, process returns (RTO), and update delivery milestones using simulated barcode scans.
          </p>
        </div>
        <div>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-250 text-gray-800 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Dashboard
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Shipments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts.total} Parcels</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">In Transit (Shipped)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts.shipped} Parcels</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Delivered successfully</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts.delivered} Parcels</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg">
            <CornerUpLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Returns / RTO</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts.rto} Parcels</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main List */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Table Filters */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shipments by Order, Customer, or AWB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none"
              />
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
              >
                <option value="All">All statuses</option>
                <option value="SHIPPED">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="RTO">All RTOs</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3 px-5">AWB Number</th>
                  <th className="py-3 px-5">Order details</th>
                  <th className="py-3 px-5">Customer Name</th>
                  <th className="py-3 px-5">Courier</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">No active shipments found. Fulfill pending orders first to register tracking AWBs.</td>
                  </tr>
                ) : (
                  filteredOrders.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-gray-900 flex items-center gap-2">
                        {ord.awbNumber}
                        <span 
                          onClick={() => setScannedAwb(ord.awbNumber || "")}
                          className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors uppercase font-bold"
                          title="Copy to scanner tool"
                        >
                          Scan
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-gray-800">{ord.orderNumber}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{ord.shopifyOrderId}</p>
                      </td>
                      <td className="py-3.5 px-5 text-gray-750 font-medium">{ord.customerName}</td>
                      <td className="py-3.5 px-5 font-medium text-gray-650">{ord.courierPartner}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          ord.deliveryStatus === "SHIPPED" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          ord.deliveryStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {ord.deliveryStatus === "SHIPPED" ? "In Transit" :
                           ord.deliveryStatus === "DELIVERED" ? "Delivered" :
                           ord.deliveryStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scan updates control */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                Barcode Scanner Utility
              </h3>
              <p className="text-xs text-gray-500">Scan carrier tracking barcodes to update delivery status updates.</p>
            </div>

            <form onSubmit={handleScanUpdate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Scan or Input AWB Number</label>
                <input
                  type="text"
                  placeholder="Carrier AWB code..."
                  value={scannedAwb}
                  onChange={(e) => setScannedAwb(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Action: Mark Parcel Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Delivered", value: "DELIVERED" },
                    { label: "RTO Init", value: "RTO_INITIATED" },
                    { label: "RTO Recv", value: "RTO_RECEIVED" }
                  ].map(statusOption => (
                    <button
                      key={statusOption.value}
                      type="button"
                      onClick={() => setScanningStatus(statusOption.value as any)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        scanningStatus === statusOption.value
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {statusOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Apply Scan Status
              </button>
            </form>
          </div>

          <div className="bg-amber-50/50 border border-amber-250/70 p-4 rounded-xl text-amber-900 text-xs space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Handling Returns (RTO)
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-800">
              When a parcel fails delivery, mark it as **RTO Initiated**. Once the package arrives back at the warehouse, scan it as **RTO Received** to automatically increment stock back into shelf inventory counts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
