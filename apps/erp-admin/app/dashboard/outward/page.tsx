"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Scan, 
  MapPin, 
  Minus, 
  Plus, 
  Search, 
  History, 
  RefreshCw,
  X,
  FileCheck,
  Trash2,
  ListPlus,
  ArrowUpRight,
  Truck,
  PackageCheck
} from "lucide-react";
import { toast } from "sonner";

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Variant {
  id: string;
  sku: string;
  title: string;
  size: string;
  color: string;
  currentStockLevel: number;
}

interface ScanLog {
  id: string;
  timestamp: string;
  sku: string;
  title: string;
  warehouseName: string;
  type: "OUTWARD";
  quantity: number;
}

interface ScannedQueueItem {
  variant: Variant;
  quantity: number;
}

export default function OutwardDispatchPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Batch dispatch queue
  const [scannedQueue, setScannedQueue] = useState<ScannedQueueItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__seyonIsDirty = scannedQueue.length > 0;
    }
    return () => {
      if (typeof window !== "undefined") {
        (window as any).__seyonIsDirty = false;
      }
    };
  }, [scannedQueue]);

  // Catalog browser modal
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Scan ledger history log
  const [scanHistory, setScanHistory] = useState<ScanLog[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load configuration
  const loadData = async () => {
    setLoading(true);
    try {
      let whs = [];
      const cachedWhs = localStorage.getItem("seyon:warehouses");
      if (cachedWhs) {
        whs = JSON.parse(cachedWhs);
      } else {
        const whRes = await fetch("/api/warehouses");
        whs = await whRes.json();
        if (Array.isArray(whs)) {
          localStorage.setItem("seyon:warehouses", JSON.stringify(whs));
        }
      }

      const invRes = await fetch("/api/inventory");
      const inv = await invRes.json();

      if (Array.isArray(whs)) {
        setWarehouses(whs);
        const savedWh = localStorage.getItem("activeWarehouseId");
        if (savedWh && whs.some((w: any) => w.id === savedWh)) {
          setSelectedWarehouseId(savedWh);
        } else if (whs.length > 0) {
          const defaultWh = whs.find(w => w.isDefaultPickup) || whs[0];
          setSelectedWarehouseId(defaultWh.id);
          localStorage.setItem("activeWarehouseId", defaultWh.id);
        }
      }

      if (Array.isArray(inv)) {
        setVariants(inv);
      }
    } catch (err) {
      toast.error("Failed to load inventory configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setTimeout(() => inputRef.current?.focus(), 500);

    const handleStorageChange = () => {
      const savedWh = localStorage.getItem("activeWarehouseId");
      if (savedWh) setSelectedWarehouseId(savedWh);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleWhSelectChange = (id: string) => {
    setSelectedWarehouseId(id);
    localStorage.setItem("activeWarehouseId", id);
    window.dispatchEvent(new Event("storage"));
  };

  // Find matching SKU
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim().toLowerCase();
    const match = variants.find(
      v => v.sku.toLowerCase() === query || v.title.toLowerCase().includes(query)
    );

    if (match) {
      if (match.currentStockLevel < quantity) {
        toast.warning(`Warning: SKU ${match.sku} only has ${match.currentStockLevel} units in stock.`);
      }
      addToBatchQueue(match, quantity);
      setBarcodeInput("");
      setQuantity(1);
    } else {
      toast.error(`No matching SKU found for code: "${barcodeInput}"`);
    }
  };

  const addToBatchQueue = (variant: Variant, qty: number) => {
    setScannedQueue(prev => {
      const existingIdx = prev.findIndex(item => item.variant.id === variant.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      }
      return [...prev, { variant, quantity: qty }];
    });
    toast.success(`Queued ${qty}x ${variant.sku} for Outward Dispatch`);
  };

  const updateQueueQty = (index: number, delta: number) => {
    setScannedQueue(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeFromQueue = (index: number) => {
    setScannedQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Post batch outward dispatch to inventory API
  const handleCommitBatch = async () => {
    if (scannedQueue.length === 0) return;
    if (!selectedWarehouseId) {
      toast.error("Please select a dispatching warehouse.");
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    const targetWh = warehouses.find(w => w.id === selectedWarehouseId);

    try {
      for (const item of scannedQueue) {
        const res = await fetch("/api/inventory/adjust", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variantId: item.variant.id,
            warehouseId: selectedWarehouseId,
            adjustmentType: "OUTWARD",
            quantity: item.quantity,
            notes: orderNumber ? `Order: ${orderNumber}${carrierName ? ` via ${carrierName}` : ""}` : "Outward Fulfillment Dispatch"
          })
        });

        if (res.ok) {
          successCount++;
          const newLog: ScanLog = {
            id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            sku: item.variant.sku,
            title: item.variant.title,
            warehouseName: targetWh?.name || "Warehouse",
            type: "OUTWARD",
            quantity: item.quantity
          };
          setScanHistory(prev => [newLog, ...prev]);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully posted Outward Dispatch for ${successCount} item(s)!`);
        setScannedQueue([]);
        setOrderNumber("");
        setCarrierName("");
        await loadData();
      }
    } catch (err) {
      toast.error("An error occurred while posting stock outward transactions.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCatalog = variants.filter(v => 
    v.sku.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    v.title.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-950">Outward Dispatch & Fulfillment</h1>
          </div>
          <p className="text-xs text-gray-500">
            Process customer orders, picklist packing verification, and carrier dispatch handover.
          </p>
        </div>

        {/* Dispatch Warehouse Selector */}
        <div className="flex items-center gap-2 bg-indigo-50/60 border border-indigo-200/80 p-2.5 rounded-lg">
          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Dispatch WH:</span>
          <select
            value={selectedWarehouseId}
            onChange={(e) => handleWhSelectChange(e.target.value)}
            className="bg-white border border-indigo-200 rounded-md py-1 px-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Barcode Scanner & Order Meta */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" /> Order & Shipping Ref
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Customer Order # (Optional)
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. #SF-10492 / ORD-9921"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Logistics / Courier Name (Optional)
                </label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="e.g. BlueDart / Delhivery / Bluedart Express"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="space-y-3 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Scan Barcode or Enter SKU for Dispatch
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan picking barcode..."
                    className="w-full bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2.5 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Scan className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Dispatch Qty
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-2 hover:bg-gray-100 text-gray-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center text-xs font-bold py-2 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-2 hover:bg-gray-100 text-gray-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="w-1/2 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ListPlus className="w-4 h-4" /> Add to Queue
                  </button>
                </div>
              </div>
            </form>

            <button
              type="button"
              onClick={() => setShowCatalogModal(true)}
              className="w-full text-xs text-gray-600 hover:text-indigo-700 border border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1.5 hover:bg-indigo-50/50 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Select SKU from Catalog
            </button>
          </div>
        </div>

        {/* Right Column: Outward Dispatch Queue & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Dispatch Queue */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                  <span>📦</span> Pending Dispatch Queue ({scannedQueue.length} items)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Verify order items before confirming stock depletion & dispatch.</p>
              </div>

              {scannedQueue.length > 0 && (
                <button
                  onClick={handleCommitBatch}
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PackageCheck className="w-4 h-4" />
                  )}
                  Confirm Outward Dispatch
                </button>
              )}
            </div>

            {scannedQueue.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <Scan className="w-8 h-8 mx-auto text-gray-300 stroke-[1.5] mb-2" />
                <p className="text-xs font-semibold text-gray-500">Dispatch Queue Empty</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Scan picking barcodes to queue items for order shipment.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                {scannedQueue.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-bold text-gray-900">{item.variant.sku}</span>
                      <p className="text-gray-500 text-[11px]">{item.variant.title} ({item.variant.size} / {item.variant.color})</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded bg-white">
                        <button onClick={() => updateQueueQty(idx, -1)} className="p-1 hover:bg-gray-100">
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="px-2 font-bold text-xs">{item.quantity}</span>
                        <button onClick={() => updateQueueQty(idx, 1)} className="p-1 hover:bg-gray-100">
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>

                      <button onClick={() => removeFromQueue(idx)} className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Outward Dispatch History */}
          {scanHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" /> Recent Outward Dispatch Log
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                {scanHistory.slice(0, 5).map(log => (
                  <div key={log.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-gray-800">{log.sku}</span>
                      <p className="text-[11px] text-gray-400">{log.title} • {log.warehouseName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                        -{log.quantity} Dispatched
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Select Product SKU from Catalog</h3>
              <button onClick={() => setShowCatalogModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search catalog by SKU or title..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {filteredCatalog.map(v => (
                <div
                  key={v.id}
                  onClick={() => {
                    addToBatchQueue(v, quantity);
                    setShowCatalogModal(false);
                  }}
                  className="p-3 flex items-center justify-between hover:bg-indigo-50/50 cursor-pointer transition-colors text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-gray-900 block">{v.sku}</span>
                    <span className="text-gray-500 text-[11px]">{v.title} ({v.size} / {v.color})</span>
                  </div>
                  <span className="text-indigo-700 bg-indigo-50 font-bold px-2 py-1 rounded text-[10px]">
                    Available Stock: {v.currentStockLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
