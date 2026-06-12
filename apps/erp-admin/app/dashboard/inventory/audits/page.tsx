"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Play, 
  Volume2, 
  VolumeX, 
  Save, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RotateCcw,
  Barcode,
  ArrowLeft,
  ChevronRight,
  Filter,
  TrendingDown,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

interface AuditItem {
  id: string;
  variantId: string;
  expectedQty: number;
  actualQty: number;
  status: "PENDING" | "MATCHED" | "DISCREPANCY";
  readyToDispatch: number;
  returnedQty: number;
  inTransit: number;
  incomingPO: number;
  variant: {
    id: string;
    sku: string;
    title: string;
    size: string;
    color: string;
    barcodeString: string;
  };
}

interface AuditSession {
  id: string;
  warehouseId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  operatorEmail: string;
  createdAt: string;
  updatedAt: string;
  items?: AuditItem[];
}

export default function InventoryAuditsPage() {
  const [activeWhId, setActiveWhId] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("operator@seyon.local");
  const [audits, setAudits] = useState<AuditSession[]>([]);
  const [activeAudit, setActiveAudit] = useState<AuditSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Selector for Starting Audits
  const [isStartingAudit, setIsStartingAudit] = useState(false);
  const [auditType, setAuditType] = useState<"FULL" | "PARTIAL">("FULL");
  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [variantSearch, setVariantSearch] = useState("");

  // Scan & Edit View State
  const [barcodeInput, setBarcodeInput] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [filterMode, setFilterMode] = useState<"ALL" | "DISCREPANCY" | "MATCHED">("ALL");
  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");
  const [scanMessage, setScanMessage] = useState({ text: "", type: "" }); // type: success | error

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync Active Warehouse from layout / localStorage
  useEffect(() => {
    const fetchWhId = () => {
      const id = localStorage.getItem("activeWarehouseId");
      if (id) setActiveWhId(id);
    };
    fetchWhId();

    window.addEventListener("storage", fetchWhId);
    return () => window.removeEventListener("storage", fetchWhId);
  }, []);

  // Fetch audits & catalog variants
  useEffect(() => {
    if (!activeWhId) return;
    loadAudits();
    loadVariants();
  }, [activeWhId]);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/audits?warehouseId=${activeWhId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAudits(data);
        const inProgress = data.find(a => a.status === "IN_PROGRESS");
        if (inProgress) {
          // Fetch complete enriched detail
          loadAuditDetail(inProgress.id);
        } else {
          setActiveAudit(null);
        }
      }
    } catch (err) {
      console.error("Failed to load audits", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/audits/${id}`);
      const data = await res.json();
      if (data && !data.error) {
        // Look up localStorage for session recovery
        const savedCounts = localStorage.getItem(`audit_counts_${id}`);
        if (savedCounts) {
          try {
            const parsed = JSON.parse(savedCounts) as Record<string, number>;
            const restoredItems = (data.items || []).map((item: AuditItem) => {
              if (typeof parsed[item.id] === "number") {
                const actual = parsed[item.id];
                return {
                  ...item,
                  actualQty: actual,
                  status: (actual === item.expectedQty ? "MATCHED" : "DISCREPANCY") as "PENDING" | "MATCHED" | "DISCREPANCY"
                };
              }
              return item;
            });
            data.items = restoredItems;
          } catch (e) {
            console.error("Failed to parse saved counts", e);
          }
        }
        setActiveAudit(data);
      }
    } catch (err) {
      console.error("Failed to load audit details", err);
    }
  };

  const loadVariants = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllVariants(data);
      }
    } catch (err) {
      console.error("Failed to load variants list", err);
    }
  };

  // Sound Feedback Generator (Web Audio API synthesis)
  const playBeep = (type: "SUCCESS" | "ERROR") => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "SUCCESS") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch beep
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, ctx.currentTime); // Low warning buzz
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.error("Audio Web API error", e);
    }
  };

  // Start Audit
  const handleStartAudit = async () => {
    if (!activeWhId) return;
    try {
      setLoading(true);
      const payload = {
        warehouseId: activeWhId,
        operatorEmail,
        selectedVariantIds: auditType === "PARTIAL" ? selectedVariantIds : null
      };

      const res = await fetch("/api/inventory/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setIsStartingAudit(false);
      setSelectedVariantIds([]);
      // Load details of the newly created audit
      await loadAuditDetail(data.id);
      loadAudits();
    } catch (err: any) {
      alert("Failed to start audit: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Scan input handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAudit || !barcodeInput.trim()) return;

    const code = barcodeInput.trim();
    setBarcodeInput("");

    // Find the item matching this barcode inside the audit list
    const matchedItemIndex = activeAudit.items?.findIndex(
      item => item.variant.barcodeString === code || item.variant.sku.toLowerCase() === code.toLowerCase()
    );

    if (matchedItemIndex !== undefined && matchedItemIndex !== -1 && activeAudit.items) {
      const updatedItems = [...activeAudit.items];
      const targetItem = updatedItems[matchedItemIndex];
      const newQty = targetItem.actualQty + 1;
      
      updatedItems[matchedItemIndex] = {
        ...targetItem,
        actualQty: newQty,
        status: (newQty === targetItem.expectedQty ? "MATCHED" : "DISCREPANCY") as "PENDING" | "MATCHED" | "DISCREPANCY"
      };

      const newAudit = { ...activeAudit, items: updatedItems };
      setActiveAudit(newAudit);
      playBeep("SUCCESS");
      setScanMessage({ text: `Matched: ${targetItem.variant.title} (+1 count)`, type: "success" });

      // Save count to local storage for recovery
      saveToLocalRecovery(newAudit);
    } else {
      playBeep("ERROR");
      setScanMessage({ text: `No item matching barcode "${code}" found in this audit session.`, type: "error" });
    }

    setTimeout(() => setScanMessage({ text: "", type: "" }), 3000);
  };

  // Local storage auto-save helper
  const saveToLocalRecovery = (audit: AuditSession) => {
    const counts: Record<string, number> = {};
    (audit.items || []).forEach(item => {
      counts[item.id] = item.actualQty;
    });
    localStorage.setItem(`audit_counts_${audit.id}`, JSON.stringify(counts));
  };

  // Manual input edit
  const handleManualQtyChange = (itemId: string, val: number) => {
    if (!activeAudit || !activeAudit.items) return;

    const updatedItems = activeAudit.items.map(item => {
      if (item.id === itemId) {
        const actual = Math.max(0, val);
        return {
          ...item,
          actualQty: actual,
          status: (actual === item.expectedQty ? "MATCHED" : "DISCREPANCY") as "PENDING" | "MATCHED" | "DISCREPANCY"
        };
      }
      return item;
    });

    const newAudit = { ...activeAudit, items: updatedItems };
    setActiveAudit(newAudit);
    saveToLocalRecovery(newAudit);
  };

  // Save Progress (PUT)
  const handleSaveProgress = async () => {
    if (!activeAudit || !activeAudit.items) return;
    try {
      setSaveStatus("SAVING");
      const payload = {
        items: activeAudit.items.map(i => ({ id: i.id, actualQty: i.actualQty }))
      };

      const res = await fetch(`/api/inventory/audits/${activeAudit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSaveStatus("SAVED");
      setTimeout(() => setSaveStatus("IDLE"), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus("ERROR");
    }
  };

  // Finalize (Submit / Cancel)
  const handleFinalizeAudit = async (action: "COMPLETED" | "CANCELLED") => {
    if (!activeAudit) return;
    const confirmMsg = action === "COMPLETED" 
      ? "Are you sure you want to finalize this audit? Stock levels will be reconciled to match scanned counts, and adjustments will be logged." 
      : "Are you sure you want to cancel this audit session? Scanned progress will be discarded.";
    
    if (!confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/audits/${activeAudit.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Clean up local recovery cache
      localStorage.removeItem(`audit_counts_${activeAudit.id}`);

      setActiveAudit(null);
      loadAudits();
    } catch (err: any) {
      alert("Error finalizing audit: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Computations
  const auditItems = activeAudit?.items || [];
  
  const filteredItems = auditItems.filter(item => {
    if (filterMode === "DISCREPANCY") return item.status === "DISCREPANCY";
    if (filterMode === "MATCHED") return item.status === "MATCHED";
    return true;
  });

  // Financial shrinkage tracking: 
  // Let's assume a default unit cost price of 350 INR for valuation changes.
  const costPerUnit = 350;

  let totalExpected = 0;
  let totalScanned = 0;
  let netVariance = 0;
  let itemsCount = auditItems.length;
  let discrepanciesCount = 0;

  auditItems.forEach(item => {
    totalExpected += item.expectedQty;
    totalScanned += item.actualQty;
    const diff = item.actualQty - item.expectedQty;
    netVariance += diff * costPerUnit;
    if (diff !== 0) discrepanciesCount++;
  });

  const filteredVariantsForPartial = allVariants.filter(v => 
    v.title.toLowerCase().includes(variantSearch.toLowerCase()) ||
    v.sku.toLowerCase().includes(variantSearch.toLowerCase()) ||
    v.barcodeString.includes(variantSearch)
  );

  const toggleSelectVariant = (vid: string) => {
    setSelectedVariantIds(prev => 
      prev.includes(vid) ? prev.filter(id => id !== vid) : [...prev, vid]
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" /> Inventory Auditing & Reconciliation
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Perform cycle counts, capture floor barcode scans, audit transit stocks, and automatically reconcile warehouse stock.
          </p>
        </div>
        <Link 
          href="/dashboard/help" 
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
        >
          <HelpCircle className="w-4 h-4" /> Help Guides
        </Link>
      </div>

      {loading && (
        <div className="text-center py-12 text-sm text-gray-500">
          Loading audits and operational data...
        </div>
      )}

      {/* NO ACTIVE AUDIT - Show Dashboard and Start Session form */}
      {!loading && !activeAudit && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Start Audit panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Start New Audit Session
            </h2>
            
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Operator Email</label>
                <input 
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Audit Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setAuditType("FULL"); setIsStartingAudit(false); }}
                    className={`p-2 border rounded-lg text-xs font-semibold ${
                      auditType === "FULL" 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    Full Warehouse
                  </button>
                  <button 
                    onClick={() => { setAuditType("PARTIAL"); setIsStartingAudit(true); }}
                    className={`p-2 border rounded-lg text-xs font-semibold ${
                      auditType === "PARTIAL" 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    Selective Cycle Count
                  </button>
                </div>
              </div>

              {auditType === "PARTIAL" && isStartingAudit && (
                <div className="border border-gray-150 rounded-lg p-3 bg-slate-50/50 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">Select SKUs to Audit:</span>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search SKU/Title..."
                      value={variantSearch}
                      onChange={(e) => setVariantSearch(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-md py-1 pl-7 pr-3 text-[11px] outline-none"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-200 bg-white border border-gray-200 rounded-md p-1">
                    {filteredVariantsForPartial.map((v) => {
                      const selected = selectedVariantIds.includes(v.id);
                      return (
                        <div 
                          key={v.id} 
                          onClick={() => toggleSelectVariant(v.id)}
                          className={`p-2 text-xs flex justify-between items-center cursor-pointer transition-colors ${
                            selected ? "bg-indigo-50/65" : "hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <span className="font-bold text-gray-950 block">{v.title}</span>
                            <span className="text-[10px] text-gray-450 font-mono">SKU: {v.sku} | Barcode: {v.barcodeString}</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={selected}
                            onChange={() => {}} // handled by div click
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {selectedVariantIds.length} items selected for audit count.
                  </span>
                </div>
              )}

              <button
                onClick={handleStartAudit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <Play className="w-4 h-4 fill-white" /> Launch Audit Session
              </button>
            </div>
          </div>

          {/* Audit History list */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Audit History Log</h2>
            
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-gray-400 tracking-wider pb-3 border-b">
                    <th className="pb-2">Audit Date</th>
                    <th className="pb-2">Operator</th>
                    <th className="pb-2">Audited SKUs</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {audits.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-gray-900">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 text-gray-600">{a.operatorEmail}</td>
                      <td className="py-3 text-slate-700 font-semibold">
                        {a.items?.length || 0} variants
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                          a.status === "COMPLETED" 
                            ? "bg-emerald-100 text-emerald-800"
                            : a.status === "CANCELLED"
                            ? "bg-gray-150 text-gray-650"
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {audits.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400 font-medium">
                        No warehouse audits recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE AUDIT SCANNING INTERFACE */}
      {!loading && activeAudit && (
        <div className="space-y-6">
          {/* Active Session Info & Barcode Scanner Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Box: Scanner input */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <span className="text-[9px] font-extrabold uppercase bg-indigo-150 text-indigo-700 px-2 py-0.5 rounded">
                    Active Session
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 mt-1">
                    Auditor: <span className="font-medium text-slate-600">{activeAudit.operatorEmail}</span>
                  </h2>
                </div>
                
                {/* Audio controls */}
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    audioEnabled 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {audioEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" /> Beep Enabled
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" /> Audio Muted
                    </>
                  )}
                </button>
              </div>

              {/* Barcode scanner mockup input */}
              <form onSubmit={handleBarcodeSubmit} className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  Scan Barcode or Type SKU Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Place cursor here and scan, or enter SKU manually..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-300 rounded-lg py-2.5 pl-11 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono tracking-widest uppercase transition-all"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow transition-colors"
                  >
                    Match SKU
                  </button>
                </div>

                {scanMessage.text && (
                  <div className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 animate-fadeIn ${
                    scanMessage.type === "success" 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}>
                    {scanMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    {scanMessage.text}
                  </div>
                )}
              </form>
            </div>

            {/* Right Box: Totals & Value Discrepancy Shrinkage */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Audit Inventory Summary</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Total SKUs</span>
                    <span className="text-xl font-extrabold text-slate-900">{itemsCount}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Discrepancies</span>
                    <span className={`text-xl font-extrabold ${discrepanciesCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {discrepanciesCount}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 border rounded-xl flex items-center justify-between bg-slate-50/50">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Shrinkage Value (Cost)</span>
                    <span className="text-xs text-slate-500 mt-0.5">Est. @ {costPerUnit} INR/unit</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-extrabold flex items-center justify-end gap-1 ${
                      netVariance < 0 
                        ? "text-red-600" 
                        : netVariance > 0 
                        ? "text-emerald-600" 
                        : "text-slate-900"
                    }`}>
                      {netVariance < 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4" /> {netVariance.toLocaleString()} INR
                        </>
                      ) : netVariance > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4" /> +{netVariance.toLocaleString()} INR
                        </>
                      ) : (
                        "0.00 INR"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveProgress}
                  disabled={saveStatus === "SAVING"}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-slate-50 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4 text-gray-500" />
                  {saveStatus === "SAVING" ? "Saving..." : saveStatus === "SAVED" ? "Saved!" : "Save Draft"}
                </button>
                <button
                  onClick={() => handleFinalizeAudit("COMPLETED")}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-200" /> Reconcile & Close
                </button>
              </div>
            </div>
          </div>

          {/* Items Grid & Quick-Filters */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-900">Items Reconciliation Table</h3>
              
              {/* Filter Toggles */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 text-xs font-bold shadow-sm">
                <button
                  onClick={() => setFilterMode("ALL")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterMode === "ALL" 
                      ? "bg-slate-100 text-slate-800" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  All Items ({itemsCount})
                </button>
                <button
                  onClick={() => setFilterMode("DISCREPANCY")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterMode === "DISCREPANCY" 
                      ? "bg-amber-100 text-amber-700" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Discrepancies ({discrepanciesCount})
                </button>
                <button
                  onClick={() => setFilterMode("MATCHED")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterMode === "MATCHED" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Matched
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left divide-y divide-gray-150">
                <thead className="bg-slate-100/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">SKU Details</th>
                    <th className="px-6 py-3.5">Barcode</th>
                    <th className="px-4 py-3.5 text-center">Expected Stock</th>
                    <th className="px-4 py-3.5 text-center">Ready to Dispatch</th>
                    <th className="px-4 py-3.5 text-center">Returned (RTO)</th>
                    <th className="px-4 py-3.5 text-center">In-Transit</th>
                    <th className="px-4 py-3.5 text-center">Incoming PO</th>
                    <th className="px-6 py-3.5 text-center">Scanned Actual</th>
                    <th className="px-6 py-3.5 text-center">Net Variance</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredItems.map((item) => {
                    const diff = item.actualQty - item.expectedQty;
                    const valDiff = diff * costPerUnit;
                    const isMismatched = diff !== 0;

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/40 ${isMismatched ? "bg-amber-50/20" : ""}`}>
                        {/* Variant info */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-950 block">{item.variant.title}</span>
                          <span className="text-[10px] text-gray-500 font-semibold">
                            SKU: {item.variant.sku} | Size: {item.variant.size} | Color: {item.variant.color}
                          </span>
                        </td>
                        
                        {/* Barcode String */}
                        <td className="px-6 py-4 font-mono text-gray-600 text-[10px]">
                          {item.variant.barcodeString}
                        </td>
                        
                        {/* Expected system stock */}
                        <td className="px-4 py-4 text-center font-bold text-gray-900">
                          {item.expectedQty}
                        </td>

                        {/* Staged / Dispatch */}
                        <td className="px-4 py-4 text-center text-gray-500">
                          {item.readyToDispatch > 0 ? (
                            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                              {item.readyToDispatch} pkg
                            </span>
                          ) : "0"}
                        </td>

                        {/* Returns */}
                        <td className="px-4 py-4 text-center text-gray-500">
                          {item.returnedQty > 0 ? (
                            <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                              {item.returnedQty} ret
                            </span>
                          ) : "0"}
                        </td>

                        {/* In-Transit transfers */}
                        <td className="px-4 py-4 text-center text-gray-500">
                          {item.inTransit > 0 ? (
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              {item.inTransit} trf
                            </span>
                          ) : "0"}
                        </td>

                        {/* Incoming POs */}
                        <td className="px-4 py-4 text-center text-gray-500">
                          {item.incomingPO > 0 ? (
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              {item.incomingPO} PO
                            </span>
                          ) : "0"}
                        </td>

                        {/* Scanned Actual (Editable input) */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleManualQtyChange(item.id, item.actualQty - 1)}
                              className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.actualQty}
                              onChange={(e) => handleManualQtyChange(item.id, parseInt(e.target.value) || 0)}
                              className="w-12 text-center bg-slate-50 border border-gray-250 rounded py-0.5 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                            <button
                              onClick={() => handleManualQtyChange(item.id, item.actualQty + 1)}
                              className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Financial Net Variance */}
                        <td className="px-6 py-4 text-center font-bold">
                          {valDiff < 0 ? (
                            <span className="text-red-600">{valDiff.toLocaleString()} INR</span>
                          ) : valDiff > 0 ? (
                            <span className="text-emerald-600">+{valDiff.toLocaleString()} INR</span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>

                        {/* Badge Status */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                            isMismatched 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isMismatched ? `${diff > 0 ? "+" : ""}${diff} units` : "Matched"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-gray-450">
                        No audited items found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-gray-200 flex justify-between items-center text-xs">
              <button
                onClick={() => handleFinalizeAudit("CANCELLED")}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Cancel Session
              </button>
              <span className="text-gray-500 font-medium">
                Counts are automatically cached. You can safely close or reload this tab.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
