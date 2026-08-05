"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
  CheckCircle2,
  Scan,
  RefreshCw,
  X,
  Package,
  Building2,
  Receipt,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "../../../components/RoleGuard";

interface PosItem {
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  stockAvailable: number;
}

export default function PosPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "TENANTADMIN", "STAFF"]}>
      <PosTerminalContent />
    </RoleGuard>
  );
}

function PosTerminalContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<PosItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");

  // Customer & Payment States
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "CREDIT">("CASH");

  // Active Company & Warehouse
  const [company, setCompany] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [activeWhId, setActiveWhId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Completed Order Receipt Modal
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCo = localStorage.getItem("seyon:company");
      if (savedCo) {
        try { setCompany(JSON.parse(savedCo)); } catch (e) { /* ignore */ }
      }
      const savedWhs = localStorage.getItem("seyon:warehouses");
      if (savedWhs) {
        try { setWarehouses(JSON.parse(savedWhs)); } catch (e) { /* ignore */ }
      }
      const savedWhId = localStorage.getItem("activeWarehouseId");
      if (savedWhId) setActiveWhId(savedWhId);
    }
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      toast.error("Failed to load inventory catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Auto-focus barcode scanner input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const activeWarehouse = warehouses.find(w => w.id === activeWhId) || warehouses[0] || { name: "Primary Counter" };

  // Filter products by SKU or Title
  const filteredProducts = products.filter((v: any) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const title = (v.Product?.title || "").toLowerCase();
    const sku = (v.sku || "").toLowerCase();
    const barcode = (v.barcode || "").toLowerCase();
    return title.includes(q) || sku.includes(q) || barcode.includes(q);
  });

  const addToCart = (variant: any) => {
    if (variant.currentStockLevel <= 0) {
      toast.error(`Item out of stock (${variant.sku})`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.currentStockLevel) {
          toast.error(`Cannot exceed stock limit (${variant.currentStockLevel} available)`);
          return prev;
        }
        return prev.map((item) =>
          item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const itemPrice = Number(variant.price || variant.Product?.price || 999);
        return [
          ...prev,
          {
            variantId: variant.id,
            productId: variant.productId,
            title: variant.Product?.title || "Apparel Item",
            sku: variant.sku || "",
            color: variant.color || "Standard",
            size: variant.size || "Standard",
            price: itemPrice,
            quantity: 1,
            stockAvailable: variant.currentStockLevel
          }
        ];
      }
    });

    toast.success(`Added ${variant.Product?.title || "Item"} to billing cart`);
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stockAvailable) {
              toast.error(`Stock limit reached (${item.stockAvailable} available)`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PosItem[]
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedDiscount = discountType === "PERCENT"
    ? (cartSubtotal * (discountAmount || 0)) / 100
    : (discountAmount || 0);
  const cartTotal = Math.max(0, cartSubtotal - calculatedDiscount);

  const handlePOSCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Billing cart is empty!");
      return;
    }

    if (!company?.id) {
      toast.error("Company context missing. Please refresh.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyId: company.id,
        warehouseId: activeWhId || warehouses[0]?.id || "default",
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        paymentMethod,
        discountAmount: calculatedDiscount,
        items: cart.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "POS checkout failed");
      }

      toast.success(`POS Order ${data.order.orderName} completed successfully!`);
      setReceiptOrder(data.order);

      // Reset Cart & State
      setCart([]);
      setDiscountAmount(0);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
      setCustomerEmail("");

      // Refresh inventory catalog balances
      fetchCatalog();
    } catch (err: any) {
      toast.error(err.message || "Failed to process POS sale");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col bg-gray-50/50 overflow-hidden">
      {/* Top Header Controls Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
              POS Counter Billing Terminal
              <span className="text-[10px] uppercase font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                POS
              </span>
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <span>Location:</span>
              <span className="font-semibold text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/80">
                📍 {activeWarehouse.name}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCatalog}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs">
            <Scan className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Scanner Ready</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Split Body */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Side — Catalog & Barcode Fast Search (60% width) */}
        <div className="w-7/12 flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
          {/* Search Bar & Filters */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode or search product SKU, title..."
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs font-bold text-gray-500 shrink-0">
              {filteredProducts.length} Variants
            </span>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs font-semibold">Loading catalog...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Package className="w-10 h-10 stroke-1 text-gray-300" />
                <span className="text-xs font-bold text-gray-500">No matching products found</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProducts.map((v: any) => {
                  const inStock = v.currentStockLevel > 0;
                  const itemPrice = Number(v.price || v.Product?.price || 999);

                  return (
                    <button
                      key={v.id}
                      onClick={() => addToCart(v)}
                      disabled={!inStock}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        inStock
                          ? "border-gray-200 hover:border-indigo-500 hover:shadow-md bg-white"
                          : "border-gray-100 bg-gray-50/60 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block truncate">
                            {v.sku}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {inStock ? `${v.currentStockLevel} in stock` : "Out of stock"}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-2">
                          {v.Product?.title || "Apparel Item"}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-gray-600">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">{v.size || "M"}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">{v.color || "Black"}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-black text-sm text-indigo-950">₹{itemPrice.toLocaleString()}</span>
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side — POS Register & Cart (40% width) */}
        <div className="w-5/12 flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
          {/* Customer Selection Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Customer Details
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear Cart
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number (e.g. 9876543210)"
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Cart Itemized List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <ShoppingBag className="w-10 h-10 stroke-1 text-gray-300" />
                <span className="text-xs font-bold text-gray-500">Counter Cart is Empty</span>
                <span className="text-[11px] text-gray-400">Scan barcode or pick items from left catalog</span>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variantId}
                  className="p-3 bg-gray-50/80 border border-gray-200/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{item.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 font-mono">
                      <span>SKU: {item.sku}</span>
                      <span>•</span>
                      <span>{item.size}/{item.color}</span>
                    </div>
                    <span className="font-extrabold text-xs text-indigo-950 mt-1 block">
                      ₹{item.price.toLocaleString()} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.variantId, -1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-l-lg cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-xs text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-r-lg cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method & Checkout Summary (Bottom Drawer) */}
          <div className="p-4 border-t border-gray-200 bg-white space-y-4 shrink-0 shadow-lg">
            {/* Discount & Adjustments */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-gray-600">Discount Amount:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 bg-gray-50 border border-gray-200 rounded-lg py-1 px-2 text-right font-mono font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDiscountType(prev => prev === "FLAT" ? "PERCENT" : "FLAT")}
                  className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg font-bold text-[11px] text-gray-700"
                >
                  {discountType === "FLAT" ? "₹ Flat" : "% Direct"}
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Payment Mode
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "CASH", label: "Cash", icon: DollarSign },
                  { id: "UPI", label: "UPI / QR", icon: QrCode },
                  { id: "CARD", label: "Card", icon: CreditCard },
                  { id: "CREDIT", label: "Credit", icon: Receipt }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMethod(mode.id as any)}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                      paymentMethod === mode.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    <mode.icon className="w-3.5 h-3.5 text-indigo-650" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Totals & Complete Button */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>Total Savings Discount</span>
                  <span>- ₹{calculatedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-black text-gray-900 pt-1">
                <span>Grand Total</span>
                <span className="text-xl text-indigo-950">₹{cartTotal.toLocaleString()}</span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0 || submitting}
                onClick={handlePOSCheckout}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Sale...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Complete POS Sale & Print Bill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THERMAL BILL RECEIPT MODAL */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Transaction Successful!</h3>
              <p className="text-xs text-gray-500 mt-0.5">Order {receiptOrder.orderName} recorded in database</p>
            </div>

            {/* Printable Thermal Receipt Card */}
            <div id="printable-pos-receipt" className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 text-left space-y-3 font-mono text-xs text-gray-800">
              <div className="text-center border-b border-dashed border-amber-300/80 pb-2">
                <span className="font-bold text-sm uppercase block text-amber-950">{company?.name || "FabricVault Retail"}</span>
                <span className="text-[10px] text-amber-800 block mt-0.5">📍 {activeWarehouse.name}</span>
                <span className="text-[10px] text-amber-800 block">{new Date().toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <span className="block text-[11px]"><strong>Order:</strong> {receiptOrder.orderName}</span>
                <span className="block text-[11px]"><strong>Customer:</strong> {receiptOrder.customerName}</span>
                <span className="block text-[11px]"><strong>Payment:</strong> {receiptOrder.paymentMethod}</span>
              </div>

              <div className="border-t border-b border-dashed border-amber-300/80 py-2 space-y-1">
                {receiptOrder.items?.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">{it.title} × {it.quantity}</span>
                    <span className="font-bold">₹{(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between font-bold text-sm pt-1">
                <span>TOTAL PAID</span>
                <span>₹{receiptOrder.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Thermal Bill
              </button>
              <button
                onClick={() => setReceiptOrder(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
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
