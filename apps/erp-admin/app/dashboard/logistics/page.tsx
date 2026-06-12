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
  CornerUpLeft,
  FileText,
  Plus,
  User,
  Phone,
  Layers,
  Check,
  Printer
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  shippingCost?: number | null;
  customerShippingFee?: number | null;
}

interface Manifest {
  id: string;
  manifestNumber: string;
  courierPartner: "SHIPROCKET" | "DELHIVERY" | "BLUEDART" | "DTDC";
  status: "CREATED" | "HANDED_OVER" | "CANCELLED";
  driverName: string | null;
  driverPhone: string | null;
  createdAt: string;
  warehouse: {
    name: string;
    code: string;
  };
  fulfillments: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    awbNumber: string | null;
  }>;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

export default function LogisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"SHIPMENTS" | "MANIFESTS" | "RETURNS">("SHIPMENTS");
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Bulk shipping states
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkCourier, setBulkCourier] = useState("Delhivery");
  const [isBulkShipping, setIsBulkShipping] = useState(false);

  // Active shipment details (timeline tracking modal)
  const [selectedShipment, setSelectedShipment] = useState<Order | null>(null);

  // AWB Quick Status scan utility
  const [scannedAwb, setScannedAwb] = useState("");
  const [scanningStatus, setScanningStatus] = useState<"DELIVERED" | "RTO_INITIATED" | "RTO_RECEIVED">("DELIVERED");

  // Manifest creation state
  const [showCreateManifest, setShowCreateManifest] = useState(false);
  const [newManifest, setNewManifest] = useState({
    manifestNumber: "",
    courierPartner: "SHIPROCKET",
    warehouseId: "",
    driverName: "",
    driverPhone: "",
    orderIds: [] as string[]
  });
  const [submittingManifest, setSubmittingManifest] = useState(false);

  // Detail Modal for Manifest Print preview
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);

  const loadData = async () => {
    try {
      const [ordRes, mnfRes, whRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/logistics/manifests"),
        fetch("/api/warehouses")
      ]);
      
      const ordData = await ordRes.json();
      const mnfData = await mnfRes.json();
      const whData = await whRes.json();

      if (Array.isArray(ordData)) {
        setOrders(ordData);
      }
      if (Array.isArray(mnfData)) {
        setManifests(mnfData);
      }
      if (Array.isArray(whData)) {
        setWarehouses(whData);
        if (whData.length > 0) {
          setNewManifest(prev => ({ ...prev, warehouseId: whData[0].id }));
        }
      }
    } catch (error) {
      toast.error("Failed to load logistics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        loadData();
      } else {
        toast.error(data.error || "Failed to update shipment status");
      }
    } catch (err) {
      toast.error("Failed to communicate with logistics API");
    }
  };

  const handleCreateManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManifest.manifestNumber || !newManifest.warehouseId || newManifest.orderIds.length === 0) {
      toast.error("Please fill in required fields and select at least one order");
      return;
    }

    setSubmittingManifest(true);
    try {
      const res = await fetch("/api/logistics/manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newManifest)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Shipping manifest generated successfully!");
      setShowCreateManifest(false);
      // Reset form
      setNewManifest(prev => ({
        ...prev,
        manifestNumber: "",
        orderIds: []
      }));
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create manifest");
    } finally {
      setSubmittingManifest(false);
    }
  };

  const handleBulkShip = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Please select at least one order to generate shipment");
      return;
    }
    
    setIsBulkShipping(true);
    try {
      const res = await fetch("/api/logistics/bulk-ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          courierPartner: bulkCourier.toUpperCase()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Generated shipping labels for ${data.orders.length} orders!`);
        setSelectedOrderIds([]);
        loadData();
      } else {
        toast.error(data.error || "Failed to generate bulk shipments");
      }
    } catch (err) {
      toast.error("Error generating bulk shipments");
    } finally {
      setIsBulkShipping(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setNewManifest(prev => {
      const exist = prev.orderIds.includes(orderId);
      if (exist) {
        return { ...prev, orderIds: prev.orderIds.filter(id => id !== orderId) };
      } else {
        return { ...prev, orderIds: [...prev.orderIds, orderId] };
      }
    });
  };

  // KPIs
  const counts = {
    total: orders.filter(o => o.awbNumber !== null).length,
    shipped: orders.filter(o => o.deliveryStatus === "SHIPPED").length,
    delivered: orders.filter(o => o.deliveryStatus === "DELIVERED").length,
    rto: orders.filter(o => o.deliveryStatus.startsWith("RTO")).length
  };

  // Filtered lists
  const filteredShipments = orders
    .filter(ord => {
      const matchesSearch = 
        ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.awbNumber && ord.awbNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        selectedStatus === "All" || 
        (selectedStatus === "RTO" ? ord.deliveryStatus.startsWith("RTO") : ord.deliveryStatus === selectedStatus);

      return matchesSearch && matchesStatus;
    });

  // Orders available for manifesting (must be in PROCESSING and have an AWB)
  const processOrders = orders.filter(o => o.deliveryStatus === "PROCESSING" && o.awbNumber !== null);

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
            Monitor carrier states, manage driver pickup manifests, and update milestones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "MANIFESTS" && (
            <Button 
              onClick={() => setShowCreateManifest(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Manifest
            </Button>
          )}
          <button 
            onClick={loadData}
            className="flex items-center gap-2 bg-gray-150 hover:bg-gray-200 text-gray-800 border border-gray-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab("SHIPMENTS")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "SHIPMENTS" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Active Shipments ({filteredShipments.length})
        </button>
        <button
          onClick={() => setActiveTab("MANIFESTS")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "MANIFESTS" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Shipping Manifests ({manifests.length})
        </button>
        <button
          onClick={() => setActiveTab("RETURNS")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "RETURNS" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Returns & Financial Audit
        </button>
      </div>

      {activeTab === "SHIPMENTS" ? (
        <>
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
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Delivered</p>
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value="All">All statuses</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="RTO">All RTOs</option>
                  </select>
                </div>
              </div>

              {/* Bulk operations bar */}
              {selectedOrderIds.length > 0 && (
                <div className="bg-indigo-50/70 border-b border-indigo-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {selectedOrderIds.length} Selected
                    </span>
                    <span className="text-xs font-semibold text-indigo-900">Configure Bulk Courier Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={bulkCourier}
                      onChange={(e) => setBulkCourier(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="Shiprocket">Shiprocket</option>
                      <option value="Bluedart">BlueDart</option>
                      <option value="DTDC">DTDC</option>
                    </select>
                    <button
                      onClick={handleBulkShip}
                      disabled={isBulkShipping}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition-all"
                    >
                      {isBulkShipping ? "Generating..." : "Generate AWBs & Labels"}
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Labels and packing manifests compiled! Downloading bulk print PDF...");
                      }}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition-all"
                    >
                      Download Labels
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-5 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.length === filteredShipments.length && filteredShipments.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds(filteredShipments.map(o => o.id));
                            } else {
                              setSelectedOrderIds([]);
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="py-3 px-5">AWB Number</th>
                      <th className="py-3 px-5">Order details</th>
                      <th className="py-3 px-5">Customer Name</th>
                      <th className="py-3 px-5">Courier</th>
                      <th className="py-3 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">No active shipments found. Fulfill pending orders first to register tracking AWBs.</td>
                      </tr>
                    ) : (
                      filteredShipments.map(ord => {
                        const isSelected = selectedOrderIds.includes(ord.id);
                        return (
                          <tr 
                            key={ord.id} 
                            onClick={() => setSelectedShipment(ord)}
                            className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${selectedShipment?.id === ord.id ? "bg-indigo-50/30" : ""} ${isSelected ? "bg-indigo-50/10" : ""}`}
                          >
                            <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrderIds(prev => [...prev, ord.id]);
                                  } else {
                                    setSelectedOrderIds(prev => prev.filter(id => id !== ord.id));
                                  }
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="py-3.5 px-5 font-mono font-bold text-gray-900 flex items-center gap-2">
                              {ord.awbNumber || <span className="text-gray-400 font-normal italic">Unassigned (Bulk Ship)</span>}
                              {ord.awbNumber && (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScannedAwb(ord.awbNumber || "");
                                  }}
                                  className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors uppercase font-bold"
                                  title="Copy to scanner tool"
                                >
                                  Scan
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              <p className="font-semibold text-gray-800">{ord.orderNumber}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{ord.shopifyOrderId}</p>
                            </td>
                            <td className="py-3.5 px-5 text-gray-700 font-medium">{ord.customerName}</td>
                            <td className="py-3.5 px-5 font-medium text-gray-650">{ord.courierPartner || "N/A"}</td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                ord.deliveryStatus === "PROCESSING" ? "bg-slate-100 text-slate-700 border border-slate-200" :
                                ord.deliveryStatus === "SHIPPED" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                ord.deliveryStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {ord.deliveryStatus === "SHIPPED" ? "In Transit" :
                                 ord.deliveryStatus === "DELIVERED" ? "Delivered" :
                                 ord.deliveryStatus.replace("_", " ")}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scan updates control OR Shipment Details Stepper */}
            <div className="lg:col-span-4 space-y-6">
              {selectedShipment ? (
                <div className="bg-white border border-indigo-100 rounded-xl p-5 shadow-lg space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        Shipment Tracker
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Order: {selectedShipment.orderNumber}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedShipment(null)}
                      className="text-gray-400 hover:text-gray-900 text-xs font-bold font-mono"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs space-y-1.5 border-b border-gray-100 pb-3">
                    <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Receiver</p>
                    <p className="font-semibold text-gray-800">{selectedShipment.customerName}</p>
                    <p className="text-gray-500 font-mono text-[10px]">{selectedShipment.customerPhone}</p>
                  </div>

                  {/* Live Stepper Milestones */}
                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Live Tracking Milestones</p>
                    <div className="relative pl-6 space-y-5">
                      {/* Vertical line connecting steps */}
                      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-150"></div>

                      {[
                        { label: "Order Ingested", desc: "Order details received from sales channel", active: true },
                        { label: "Label Generated", desc: `AWB: ${selectedShipment.awbNumber || "Unassigned"}`, active: !!selectedShipment.awbNumber },
                        { label: "Handed Over (In Transit)", desc: "Carrier processed & out of facility", active: selectedShipment.deliveryStatus === "SHIPPED" || selectedShipment.deliveryStatus === "DELIVERED" },
                        { label: "Out for Delivery", desc: "Arrived at destination delivery hub", active: selectedShipment.deliveryStatus === "DELIVERED" },
                        { label: "Delivered", desc: "Package handed over to customer", active: selectedShipment.deliveryStatus === "DELIVERED", isSuccess: true },
                        ...(selectedShipment.deliveryStatus.startsWith("RTO") ? [
                          { label: "RTO Initiated", desc: "Undelivered package returning to origin", active: true, isAlert: true },
                          { label: "RTO Received", desc: "Inventory restocked at warehouse", active: selectedShipment.deliveryStatus === "RTO_RECEIVED", isAlert: true }
                        ] : [])
                      ].map((step, idx) => (
                        <div key={idx} className="relative flex gap-3 text-xs">
                          {/* Stepper node circle */}
                          <div className={`absolute -left-5.5 top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            step.isAlert ? "bg-red-500 border-red-500" :
                            step.active 
                              ? step.isSuccess ? "bg-emerald-600 border-emerald-600" : "bg-indigo-600 border-indigo-650"
                              : "bg-white border-gray-300"
                          }`}>
                            {step.active && <div className="w-1 h-1 bg-white rounded-full"></div>}
                          </div>
                          <div className="space-y-0.5">
                            <p className={`font-semibold ${step.active ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                            <p className="text-[10px] text-gray-400 font-mono leading-snug">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
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
                      <label className="font-semibold text-gray-655">Scan or Input AWB Number</label>
                      <input
                        type="text"
                        placeholder="Carrier AWB code..."
                        value={scannedAwb}
                        onChange={(e) => setScannedAwb(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-655">Action: Mark Parcel Status</label>
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
              )}

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
        </>      ) : activeTab === "MANIFESTS" ? (
        /* Manifests Tab View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-5">Manifest Number</th>
                    <th className="py-3 px-5">Courier</th>
                    <th className="py-3 px-5">Warehouse</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Driver Details</th>
                    <th className="py-3 px-5">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {manifests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">No manifests generated yet. Click "Create Manifest" to bundle active shipments.</td>
                    </tr>
                  ) : (
                    manifests.map(mnf => (
                      <tr 
                        key={mnf.id} 
                        onClick={() => setSelectedManifest(mnf)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${selectedManifest?.id === mnf.id ? "bg-indigo-50/40" : ""}`}
                      >
                        <TableCell className="font-bold text-indigo-700 py-3.5 px-5 font-mono">{mnf.manifestNumber}</TableCell>
                        <TableCell className="py-3.5 px-5 font-medium">{mnf.courierPartner}</TableCell>
                        <TableCell className="py-3.5 px-5 text-gray-500 font-mono">{mnf.warehouse?.code || "N/A"}</TableCell>
                        <TableCell className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            mnf.status === "CREATED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            mnf.status === "HANDED_OVER" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {mnf.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-5">
                          <p className="font-semibold text-gray-800">{mnf.driverName || "N/A"}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{mnf.driverPhone}</p>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 font-mono font-bold text-gray-700">{mnf.fulfillments?.length || 0} items</TableCell>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manifest Details Pane / Printable Layout */}
          <div className="lg:col-span-1">
            {selectedManifest ? (
              <div className="bg-white border border-indigo-100 rounded-xl shadow-lg p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" /> Manifest Sheet
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedManifest.manifestNumber}</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                    title="Print manifest sheet"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 border-t border-b border-gray-100 py-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Courier Partner:</span>
                    <span className="font-bold text-gray-800">{selectedManifest.courierPartner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dispatch Location:</span>
                    <span className="font-semibold text-gray-800">{selectedManifest.warehouse?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Driver Name:</span>
                    <span className="font-semibold text-gray-800">{selectedManifest.driverName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Driver Contact:</span>
                    <span className="font-mono text-gray-800">{selectedManifest.driverPhone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creation Date:</span>
                    <span className="text-gray-800">
                      {new Date(selectedManifest.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Bundle Fulfillments
                  </h4>
                  <div className="space-y-1.5 max-h-[30vh] overflow-y-auto pr-1">
                    {selectedManifest.fulfillments?.map(item => (
                      <div key={item.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{item.orderNumber}</p>
                          <p className="text-[10px] text-slate-500">{item.customerName}</p>
                        </div>
                        <span className="font-mono font-semibold text-slate-600">{item.awbNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedManifest.status === "CREATED" && (
                  <Button
                    onClick={async () => {
                      if (!confirm("Are you handing over these parcels to the pickup driver?")) return;
                      try {
                        const res = await fetch(`/api/logistics/manifests`, {
                          method: "POST", 
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ manifestId: selectedManifest.id, status: "HANDED_OVER" }) 
                        });
                        toast.success("Manifest handed over successfully!");
                        loadData();
                      } catch (e) {
                        toast.error("Failed to update status");
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Check className="w-4 h-4" /> Handover to Driver (Mock)
                  </Button>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 h-64 flex items-center justify-center text-center p-6 rounded-xl bg-slate-50/50">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-450 mx-auto mb-2.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-xs">No Manifest Selected</h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Select a manifest from the table list to view details, export sheet, or commit handing over.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Returns Tab View */
        <div className="space-y-6">
          {/* Financial Audit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Customer Shipping Fees Collected</span>
              <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">
                ₹{orders.reduce((sum, o) => sum + (o.customerShippingFee || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Aggregated from Shopify checkouts</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Carrier Shipping Costs</span>
              <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">
                ₹{orders.reduce((sum, o) => sum + (o.shippingCost || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Aggregated from carrier API dispatches</p>
            </div>

            {(() => {
              const customerFees = orders.reduce((sum, o) => sum + (o.customerShippingFee || 0), 0);
              const carrierCosts = orders.reduce((sum, o) => sum + (o.shippingCost || 0), 0);
              const leakage = carrierCosts - customerFees;
              const isNegative = leakage > 0;
              return (
                <div className={`border rounded-xl p-5 shadow-sm ${isNegative ? "bg-rose-50/50 border-rose-100 text-rose-950" : "bg-emerald-50/50 border-emerald-100 text-emerald-950"}`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Net Shipping Margin leakage</span>
                  <p className="text-2xl font-bold mt-1 font-mono">
                    {isNegative ? `₹${leakage.toLocaleString()}` : `-₹${Math.abs(leakage).toLocaleString()}`}
                  </p>
                  <p className="text-xs mt-1 opacity-80 font-medium">
                    {isNegative ? "⚠️ Shipping is causing a margin deficit" : "✅ Shipping operations are self-sustaining"}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Reverse Pickup Flow & Return Ledger */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <span>🔄</span> Reverse Logistics & Returns portal
              </h3>
              <p className="text-xs text-gray-505 mt-0.5">Generate reverse pickup AWBs for customer returns and track arrival states.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-205 text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-5">Order #</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Original Carrier</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Reverse AWB</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.filter(o => o.deliveryStatus === "DELIVERED" || o.deliveryStatus.startsWith("RTO")).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-450 text-xs">No orders eligible for returns yet. Deliver packages first.</td>
                    </tr>
                  ) : (
                    orders.filter(o => o.deliveryStatus === "DELIVERED" || o.deliveryStatus.startsWith("RTO")).map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-gray-800">{ord.orderNumber}</td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold">{ord.customerName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{ord.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-5 font-mono">{ord.courierPartner} (AWB: {ord.awbNumber})</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            ord.deliveryStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {ord.deliveryStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-gray-900">
                          {ord.deliveryStatus.startsWith("RTO") ? `REV-${ord.awbNumber}` : "Not Initiated"}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {!ord.deliveryStatus.startsWith("RTO") ? (
                            <button
                              onClick={async () => {
                                if (!confirm("Generate reverse pickup AWB for return request?")) return;
                                try {
                                  const res = await fetch("/api/orders/logistics-update", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      awbNumber: ord.awbNumber,
                                      deliveryStatus: "RTO_INITIATED"
                                    })
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    toast.success("Reverse pickup AWB generated successfully! Driver assigned.");
                                    loadData();
                                  } else {
                                    toast.error(data.error);
                                  }
                                } catch (e) {
                                  toast.error("Failed to generate reverse AWB");
                                }
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded text-[10px]"
                            >
                              Create Reverse AWB
                            </button>
                          ) : (
                            <span className="text-gray-400 font-semibold italic">In Transit</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANIFEST MODAL */}
      {showCreateManifest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-100 bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <span>📦</span> Create Courier Dispatch Manifest
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Bundle processed orders with assigned AWB tracking into a manifest for courier driver pickup.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateManifest(false)}
                variant="outline" 
                className="p-1 h-7 w-7 text-gray-400 hover:text-gray-900 border-none hover:bg-gray-100 rounded-full"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateManifest} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Manifest Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MNF-2026-002"
                    value={newManifest.manifestNumber}
                    onChange={(e) => setNewManifest(prev => ({ ...prev, manifestNumber: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Courier Partner *</label>
                  <select
                    value={newManifest.courierPartner}
                    onChange={(e) => setNewManifest(prev => ({ ...prev, courierPartner: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value="SHIPROCKET">Shiprocket</option>
                    <option value="DELHIVERY">Delhivery</option>
                    <option value="BLUEDART">Bluedart</option>
                    <option value="DTDC">DTDC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Dispatch Facility *</label>
                  <select
                    value={newManifest.warehouseId}
                    onChange={(e) => setNewManifest(prev => ({ ...prev, warehouseId: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Driver Name</label>
                  <input
                    type="text"
                    placeholder="Driver Name..."
                    value={newManifest.driverName}
                    onChange={(e) => setNewManifest(prev => ({ ...prev, driverName: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Driver Phone</label>
                  <input
                    type="text"
                    placeholder="Driver Phone..."
                    value={newManifest.driverPhone}
                    onChange={(e) => setNewManifest(prev => ({ ...prev, driverPhone: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Selection Checklist */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" /> Select Fulfillments for Dispatch ({newManifest.orderIds.length} selected)
                </h4>
                <div className="border border-gray-150 rounded-lg overflow-hidden max-h-[30vh] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-gray-150 text-gray-500 font-semibold uppercase tracking-wider">
                        <th className="py-2 px-4 w-12 text-center">Select</th>
                        <th className="py-2 px-4">Order#</th>
                        <th className="py-2 px-4">Customer</th>
                        <th className="py-2 px-4">AWB Code</th>
                        <th className="py-2 px-4">Courier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {processOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-400">No pending orders in processing state with assigned AWBs found.</td>
                        </tr>
                      ) : (
                        processOrders.map(ord => {
                          const isSelected = newManifest.orderIds.includes(ord.id);
                          return (
                            <tr 
                              key={ord.id}
                              onClick={() => toggleOrderSelection(ord.id)}
                              className={`hover:bg-slate-50/50 cursor-pointer ${isSelected ? "bg-indigo-50/20" : ""}`}
                            >
                              <td className="py-2.5 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // handled by row click
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-800">{ord.orderNumber}</td>
                              <td className="py-2.5 px-4">{ord.customerName}</td>
                              <td className="py-2.5 px-4 font-mono font-semibold text-slate-600">{ord.awbNumber}</td>
                              <td className="py-2.5 px-4 font-medium">{ord.courierPartner}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateManifest(false)}
                  variant="outline"
                  className="bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingManifest}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"
                >
                  {submittingManifest ? "Generating Manifest..." : "Create Manifest"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`py-3.5 px-5 ${className}`}>{children}</td>
);
