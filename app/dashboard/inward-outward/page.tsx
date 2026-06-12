"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Scan, 
  MapPin, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search, 
  History, 
  SearchCode,
  Sparkles,
  RefreshCw,
  X,
  FileCheck
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
  type: "INWARD" | "OUTWARD";
  quantity: number;
}

export default function InwardOutwardPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  
  const [operationMode, setOperationMode] = useState<"INWARD" | "OUTWARD">("INWARD");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Damaged code visual browser modal
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Scan ledger history log
  const [scanHistory, setScanHistory] = useState<ScanLog[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load configuration
  const loadData = async () => {
    setLoading(true);
    try {
      const [whRes, invRes] = await Promise.all([
        fetch("/api/warehouses"),
        fetch("/api/inventory")
      ]);
      const whs = await whRes.json();
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
    // Auto-focus barcode input
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

  // Match scanned or entered code
  useEffect(() => {
    if (!barcodeInput) {
      setSelectedVariant(null);
      return;
    }

    const matched = variants.find(
      (v) => v.sku.toUpperCase() === barcodeInput.trim().toUpperCase()
    );

    if (matched) {
      setSelectedVariant(matched);
    } else {
      setSelectedVariant(null);
    }
  }, [barcodeInput, variants]);

  const handleSubmitScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId) {
      toast.error("Please select a warehouse location first.");
      return;
    }
    if (!selectedVariant) {
      toast.error("No valid product variant matched.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero.");
      return;
    }

    // Calculate new stock level
    const currentWhStock = selectedVariant.currentStockLevel; 
    let newStockLevel = currentWhStock;
    if (operationMode === "INWARD") {
      newStockLevel += quantity;
    } else {
      if (currentWhStock < quantity) {
        toast.warning(`Insufficient stock level. Dispatching ${quantity} but warehouse only has ${currentWhStock}.`);
      }
      newStockLevel = Math.max(0, currentWhStock - quantity);
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/warehouses/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId: selectedWarehouseId,
          variantId: selectedVariant.id,
          newStockLevel,
          operatorEmail: "operator@seyon-clothing.co"
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully registered ${operationMode} scan entry!`);
        
        // Add log entry
        const whName = warehouses.find(w => w.id === selectedWarehouseId)?.name || "Warehouse";
        const newLog: ScanLog = {
          id: `SCAN-${Math.floor(Math.random() * 9000) + 1000}`,
          timestamp: new Date().toLocaleTimeString(),
          sku: selectedVariant.sku,
          title: `${selectedVariant.title} (${selectedVariant.color}/${selectedVariant.size})`,
          warehouseName: whName,
          type: operationMode,
          quantity
        };
        setScanHistory(prev => [newLog, ...prev]);

        // Reset scanning field & reload inventory catalog
        setBarcodeInput("");
        setQuantity(1);
        setSelectedVariant(null);
        await loadData();
        inputRef.current?.focus();
      } else {
        toast.error(data.error || "Failed to submit scan entry.");
      }
    } catch (err) {
      toast.error("Failed to connect to stock management endpoints.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCatalogSelect = (sku: string) => {
    setBarcodeInput(sku);
    setShowCatalogModal(false);
    toast.info(`Manually resolved SKU code: ${sku}`);
  };

  // Filter products inside the catalog selector
  const filteredCatalog = variants.filter(v => 
    v.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    v.sku.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Scan className="w-3 h-3" /> WMS Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Barcode Inward & Outward</h1>
          <p className="text-sm text-gray-500">
            Scan physical barcodes to log inward stock arrivals or outward customer order dispatches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Setup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Scan Station Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            
            {/* Header / Active Context */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-650" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Active Scanning Node:</span>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => handleWhSelectChange(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg py-1 px-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode toggler */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOperationMode("INWARD")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    operationMode === "INWARD" 
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Inward (+)
                </button>
                <button
                  type="button"
                  onClick={() => setOperationMode("OUTWARD")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    operationMode === "OUTWARD" 
                      ? "bg-rose-600 text-white shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Outward (-)
                </button>
              </div>
            </div>

            {/* Scanning Form */}
            <form onSubmit={handleSubmitScan} className="space-y-5 text-xs">
              
              {/* Scan Barcode Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-gray-700">Scan Barcode / QR Code</label>
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <SearchCode className="w-3.5 h-3.5" /> Code Damaged?
                  </button>
                </div>
                
                <div className="relative">
                  <Scan className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={inputRef}
                    required
                    type="text"
                    placeholder="Place cursor here and scan, or enter SKU..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-250 rounded-lg py-2.5 pl-9 pr-24 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 no-print">
                    <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono select-none">
                      SCANNING
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched Product Preview */}
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                {selectedVariant ? (
                  <div className="w-full flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <p className="text-gray-450 uppercase font-bold tracking-wider text-[9px]">Matched Product</p>
                      <h3 className="font-bold text-gray-900 text-sm">{selectedVariant.title}</h3>
                      <p className="text-gray-500 font-mono text-[10px]">SKU: {selectedVariant.sku}</p>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Color/Size</p>
                        <p className="font-semibold text-gray-800">{selectedVariant.color} / {selectedVariant.size}</p>
                      </div>
                      <div className="text-right border-l border-gray-200 pl-4">
                        <p className="text-[10px] text-gray-400">Current Stock</p>
                        <p className="font-bold text-gray-900 text-sm">{selectedVariant.currentStockLevel} units</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 space-y-2 py-4">
                    <Scan className="w-8 h-8 mx-auto text-gray-300 stroke-[1.5]" />
                    <p className="text-[11px]">Awaiting barcode scanner input or manual selection.</p>
                  </div>
                )}
              </div>

              {/* Quantity Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Operation Quantity</label>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-150 rounded-l-lg transition-colors border-r border-gray-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-transparent font-bold text-center text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-150 rounded-r-lg transition-colors border-l border-gray-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submitting || !selectedVariant}
                    className={`w-full text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                      operationMode === "INWARD" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Confirm {operationMode === "INWARD" ? "Inward Item" : "Outward Item"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Recent Scan History Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" /> Recent Scans Ledger (Live)
            </h2>

            {scanHistory.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg text-gray-450 text-xs">
                No scan entries recorded in this session.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-2 space-y-2">
                {scanHistory.map((log) => (
                  <div 
                    key={log.id} 
                    onClick={() => {
                      setBarcodeInput(log.sku);
                      toast.info(`Loaded SKU ${log.sku} from scans ledger.`);
                    }}
                    className="pt-3 first:pt-0 flex justify-between items-center text-xs cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span>{log.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {log.sku} • {log.warehouseName} • {log.timestamp}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.type === "INWARD" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      {log.type === "INWARD" ? `+${log.quantity}` : `-${log.quantity}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Catalog Selector Modal for Damaged Codes */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" /> Manual Catalog Lookup (Damaged Code Fallback)
              </h3>
              <button 
                onClick={() => setShowCatalogModal(false)} 
                className="text-gray-400 hover:text-gray-650"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative text-xs">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog by SKU, name, color..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 text-xs">
              {filteredCatalog.map(v => (
                <div
                  key={v.id}
                  onClick={() => handleCatalogSelect(v.sku)}
                  className="flex items-center justify-between py-2.5 hover:bg-slate-50 cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{v.title}</p>
                    <p className="text-gray-400 font-mono text-[10px]">SKU: {v.sku}</p>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold font-mono">
                    {v.color} / {v.size}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100 text-xs">
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-55 rounded-lg font-semibold text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
