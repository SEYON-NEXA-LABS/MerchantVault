"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  AlertTriangle,
  ChevronRight,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
  Check,
  Edit2,
  Barcode,
  RefreshCw,
  MapPin
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProductThumbnail from "@/components/ProductThumbnail";


interface VariantStock {
  id: string;
  size: "S" | "M" | "L" | "XL" | "XXL";
  color: string;
  sku: string;
  qty: number;
  thumbnailConfig?: string | null;
  price: number;

  stocks: Array<{
    id: string;
    warehouseId: string;
    currentStockLevel: number;
  }>;
}

interface ProductInventory {
  id: string;
  name: string;
  baseSku: string;
  category: string;
  targetGroup: string;
  ageRange?: string | null;
  totalQty: number;
  threshold: number;
  skuColor?: string;
  thumbnailConfig?: string | null;
  variants: VariantStock[];
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

export default function StockInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [selectedColor, setSelectedColor] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  
  // Dynamic API states
  const [rawVariants, setRawVariants] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Stock Quick Edit states
  const [editVariantSku, setEditVariantSku] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);

  // Price Edit states
  const [editPriceSku, setEditPriceSku] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [savingPrice, setSavingPrice] = useState(false);

  // Fetch all necessary data
  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, whRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/warehouses")
      ]);
      const invData = await invRes.json();
      const whData = await whRes.json();

      if (Array.isArray(whData)) {
        setWarehouses(whData);
        // Default to default pickup warehouse if available, else "All"
        const defaultWh = whData.find((w: any) => w.isDefaultPickup);
        if (defaultWh) {
          setSelectedWarehouseId(defaultWh.id);
        }
      }

      if (Array.isArray(invData)) {
        setRawVariants(invData);
      }
    } catch (err) {
      toast.error("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Process variants to grouped products list based on selectedWarehouseId
  useEffect(() => {
    if (rawVariants.length === 0) {
      setProducts([]);
      return;
    }

    const grouped: { [key: string]: ProductInventory } = {};

    rawVariants.forEach((v) => {
      // Grouping logic based on title & base SKU prefix
      const parts = v.sku.split("-");
      const baseSku = parts.slice(0, Math.max(1, parts.length - 2)).join("-");
      const productName = v.title;

      // Determine stock level based on selected warehouse context
      let qty = 0;
      if (selectedWarehouseId === "All") {
        qty = v.currentStockLevel; // aggregate sum
      } else {
        const whStock = v.stocks?.find((s: any) => s.warehouseId === selectedWarehouseId);
        qty = whStock ? whStock.currentStockLevel : 0;
      }

      if (!grouped[productName]) {
        grouped[productName] = {
          id: v.id,
          name: productName,
          baseSku: baseSku || v.sku,
          category: v.category || "Top",
          targetGroup: v.targetGroup || "Adults",
          ageRange: v.ageRange,
          totalQty: 0,
          threshold: v.safetyStockLimit || 10,
          skuColor: v.color,
          thumbnailConfig: v.thumbnailConfig,
          variants: []
        };
      }

      grouped[productName].variants.push({
        id: v.id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        qty: qty,
        thumbnailConfig: v.thumbnailConfig,
        price: v.price || 0,
        stocks: v.stocks || []
      });
    });

    // Calculate totalQty sums for each product group
    const processed = Object.values(grouped).map((prod) => {
      const totalQty = prod.variants.reduce((sum, vr) => sum + vr.qty, 0);
      return { ...prod, totalQty };
    });

    setProducts(processed);

    // Keep selected product details pane in sync
    if (selectedProduct) {
      const updatedSelected = processed.find(p => p.name === selectedProduct.name);
      if (updatedSelected) {
        setSelectedProduct(updatedSelected);
      }
    }
  }, [rawVariants, selectedWarehouseId]);

  // Reset page on filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSize, selectedColor, selectedStatus, selectedCategory, selectedTargetGroup, selectedWarehouseId]);

  // Save modified variant stock to DB
  const saveVariantStock = async (variantId: string, sku: string) => {
    if (selectedWarehouseId === "All") {
      toast.error("Please select a specific warehouse facility to adjust stock levels.");
      return;
    }

    setSavingStock(true);
    try {
      const res = await fetch("/api/warehouses/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId: selectedWarehouseId,
          variantId,
          newStockLevel: editQty,
          operatorEmail: "admin@seyon.co"
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Updated stock for ${sku} to ${editQty} units.`);
        setEditVariantSku(null);
        // Refresh catalog list
        await loadData();
      } else {
        toast.error(data.error || "Failed to update stock.");
      }
    } catch (err) {
      toast.error("Failed to connect to stock update endpoint.");
    } finally {
      setSavingStock(false);
    }
  };

  // Save modified variant price to DB
  const saveVariantPrice = async (variantId: string, sku: string) => {
    setSavingPrice(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          price: editPrice
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Updated price for ${sku} to $${editPrice.toFixed(2)}.`);
        setEditPriceSku(null);
        // Refresh catalog list
        await loadData();
      } else {
        toast.error(data.error || "Failed to update price.");
      }
    } catch (err) {
      toast.error("Failed to connect to price update endpoint.");
    } finally {
      setSavingPrice(false);
    }
  };

  // Filtering Logic
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.baseSku.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSize = selectedSize === "All" || prod.variants.some(v => v.size === selectedSize);
    const matchesColor = selectedColor === "All" || prod.variants.some(v => v.color.toLowerCase().includes(selectedColor.toLowerCase()));
    
    const isLowStock = prod.totalQty <= prod.threshold;
    const isOutOfStock = prod.totalQty === 0;
    
    const matchesStatus = 
      selectedStatus === "All" ||
      (selectedStatus === "Low Stock" && isLowStock && !isOutOfStock) ||
      (selectedStatus === "Out of Stock" && isOutOfStock) ||
      (selectedStatus === "Healthy" && !isLowStock);

    const matchesCategory = 
      selectedCategory === "All" ||
      prod.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesTargetGroup = 
      selectedTargetGroup === "All" ||
      prod.targetGroup.toLowerCase() === selectedTargetGroup.toLowerCase();

    return matchesSearch && matchesSize && matchesColor && matchesStatus && matchesCategory && matchesTargetGroup;
  });

  const lowStockCount = products.filter(p => p.totalQty <= p.threshold).length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.totalQty, 0);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-950" /> Multi-Warehouse Stock Catalog
          </h1>
          <p className="text-sm text-gray-500">
            Real-time tracking of shelf inventory across all store locations, warehouse facilities, and default fulfillment points.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Stock
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Catalog SKUs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {products.reduce((acc, p) => acc + p.variants.length, 0)} Variants
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Low Stock Products</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">{lowStockCount} Products</span>
              {lowStockCount > 0 && (
                <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">Alert active</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Stock Quantity</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalStockUnits.toLocaleString()} units</p>
          </div>
        </div>
      </div>

      {/* Main Stock Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inventory Catalog List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          
          {/* Warehouse Selector & Filters Bar */}
          <div className="p-5 border-b border-gray-100 space-y-4 bg-slate-50/30">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Warehouse Context:</span>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Warehouses (Aggregate Sum)</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Product Name or Base SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label htmlFor="category-filter" className="sr-only">Filter Category</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Top">Tops</option>
                  <option value="Bottom">Bottoms</option>
                  <option value="Set">Sets</option>
                </select>
              </div>

              <div>
                <label htmlFor="demographic-filter" className="sr-only">Filter Age Group</label>
                <select
                  id="demographic-filter"
                  value={selectedTargetGroup}
                  onChange={(e) => setSelectedTargetGroup(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Age Groups</option>
                  <option value="Newborn">Newborn (0-12M)</option>
                  <option value="Infants">Infants (1-3Y)</option>
                  <option value="Kids">Kids (4-12Y)</option>
                  <option value="Teens">Teens (13-19Y)</option>
                  <option value="Adults">Adults (20Y+)</option>
                </select>
              </div>

              <div>
                <label htmlFor="size-filter" className="sr-only">Filter Size</label>
                <select
                  id="size-filter"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Sizes</option>
                  <option value="S">Size S</option>
                  <option value="M">Size M</option>
                  <option value="L">Size L</option>
                  <option value="XL">Size XL</option>
                  <option value="XXL">Size XXL</option>
                </select>
              </div>

              <div>
                <label htmlFor="color-filter" className="sr-only">Filter Color</label>
                <select
                  id="color-filter"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Colors</option>
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Blue">Blue</option>
                  <option value="Beige">Beige</option>
                  <option value="Indigo">Indigo</option>
                  <option value="Green">Green</option>
                </select>
              </div>

              <div>
                <label htmlFor="status-filter" className="sr-only">Filter Status</label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Healthy">Healthy Stock</option>
                  <option value="Low Stock">Low Stock Alerts</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs">Loading shelf inventories...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs">No catalog matches found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">
                    <TableHead className="py-3 px-5 text-gray-500">Product Details</TableHead>
                    <TableHead className="py-3 px-5 text-gray-500">Base SKU</TableHead>
                    <TableHead className="py-3 px-5 text-center text-gray-500">Variants Count</TableHead>
                    <TableHead className="py-3 px-5 text-gray-500">Total Qty</TableHead>
                    <TableHead className="py-3 px-5 text-gray-500">Status</TableHead>
                    <TableHead className="py-3 px-5 text-right text-gray-500">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {paginatedProducts.map((prod) => {
                    const isLow = prod.totalQty <= prod.threshold;
                    return (
                      <TableRow 
                        key={prod.id} 
                        onClick={() => setSelectedProduct(prod)}
                        className={`hover:bg-slate-50/60 cursor-pointer transition-colors border-b border-gray-100 ${
                          selectedProduct?.id === prod.id ? "bg-indigo-50/40 hover:bg-indigo-50/40" : ""
                        }`}
                      >
                        <TableCell className="py-3.5 px-5 flex items-center gap-3">
                          <ProductThumbnail
                            skuTitle={prod.name}
                            skuColor={prod.skuColor || "indigo"}
                            thumbnailConfig={prod.thumbnailConfig}
                            size="sm"
                            className="border border-gray-100"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 leading-snug">{prod.name}</p>
                            <p className="text-[11px] text-gray-400">{prod.category}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 font-mono text-xs text-gray-500">{prod.baseSku}</TableCell>
                        <TableCell className="py-3.5 px-5 text-center text-gray-700">{prod.variants.length} SKU codes</TableCell>
                        <TableCell className="py-3.5 px-5">
                          <span className="font-bold text-gray-900">{prod.totalQty}</span>
                          <span className="text-gray-400 text-xs font-normal"> / {prod.threshold} limit</span>
                        </TableCell>
                        <TableCell className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            prod.totalQty === 0 ? "bg-red-50 text-red-700" :
                            isLow ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {prod.totalQty === 0 ? "Out of Stock" :
                             isLow ? "Low Stock" : "Healthy"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedProduct(prod)}
                            className="text-gray-400 hover:text-indigo-950 rounded-lg transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          
          {/* Pagination Footer */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between text-xs text-gray-500 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <span>
                Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
                {filteredProducts.length} entries
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={3}>3</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`} 
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pg = i + 1;
                  return (
                    <PaginationItem key={pg}>
                      <PaginationLink 
                        isActive={currentPage === pg} 
                        onClick={() => setCurrentPage(pg)}
                        className="cursor-pointer"
                      >
                        {pg}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={`cursor-pointer ${currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""}`} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* Selected Product Detail Panel & Size-wise Breakdowns */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-6 h-fit">
          {selectedProduct ? (
            <div className="space-y-6">
              {/* Product Card Info */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-950 text-sm">{selectedProduct.name}</h3>
                  <p className="text-xs text-gray-400">Category: {selectedProduct.category} | Age Group: {selectedProduct.targetGroup}{selectedProduct.ageRange ? ` (${selectedProduct.ageRange})` : ""} | SKU: {selectedProduct.baseSku} | Limit: {selectedProduct.threshold}</p>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-650 p-1 rounded-full hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Warning Banner */}
              {selectedProduct.totalQty <= selectedProduct.threshold && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Low Stock Alert:</span> Level is below the minimum threshold ({selectedProduct.threshold} units). Propose replenishing stock counts.
                  </div>
                </div>
              )}

              {/* Size-wise & Color-wise breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">SKU Code & Size Breakdown</h4>
                  {selectedWarehouseId === "All" && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 font-semibold px-2 py-0.5 rounded">
                      Read Only (Select WH to Edit)
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {selectedProduct.variants.map((variant) => {
                    const isEditing = editVariantSku === variant.sku;

                    return (
                      <div 
                        key={variant.sku} 
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900 bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">
                              Size {variant.size}
                            </span>
                            <span className="font-medium text-gray-700">{variant.color}</span>
                            {editPriceSku === variant.sku ? (
                              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1 py-0.5">
                                <span className="text-gray-400 font-semibold text-[10px]">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                  className="w-14 py-0 border-0 focus:outline-none focus:ring-0 text-[10px] font-mono font-bold text-indigo-950 p-0"
                                />
                                <button
                                  onClick={() => saveVariantPrice(variant.id, variant.sku)}
                                  disabled={savingPrice}
                                  className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50 p-0.5"
                                  title="Save Price"
                                >
                                  {savingPrice ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Check className="w-2.5 h-2.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setEditPriceSku(null)}
                                  className="text-gray-400 hover:text-gray-600 p-0.5"
                                  title="Cancel"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-indigo-950 font-bold bg-indigo-50/50 px-1.5 py-0.5 rounded text-[10px] border border-indigo-100/80">
                                  ${variant.price.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditPriceSku(variant.sku);
                                    setEditPrice(variant.price);
                                  }}
                                  className="text-gray-400 hover:text-indigo-950 p-0.5 rounded hover:bg-gray-150 transition-colors"
                                  title="Edit Price"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Barcode className="w-3.5 h-3.5" /> {variant.sku}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => setEditQty(Math.max(0, editQty - 1))}
                                className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-100"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                value={editQty}
                                onChange={(e) => setEditQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-12 text-center py-1 border border-gray-200 rounded bg-white focus:outline-none"
                              />
                              <button 
                                onClick={() => setEditQty(editQty + 1)}
                                className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-100"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => saveVariantStock(variant.id, variant.sku)}
                                disabled={savingStock}
                                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                                title="Save"
                              >
                                {savingStock ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className={`font-bold text-sm ${variant.qty <= 15 ? "text-amber-600" : "text-gray-900"}`}>
                                {variant.qty} <span className="text-[10px] text-gray-400 font-normal">units</span>
                              </span>
                              {selectedWarehouseId !== "All" && (
                                <button 
                                  onClick={() => {
                                    setEditVariantSku(variant.sku);
                                    setEditQty(variant.qty);
                                  }}
                                  className="text-gray-400 hover:text-indigo-950 p-1"
                                  title="Quick Adjust Stock"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 space-y-3">
              <Package className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
              <div>
                <p className="text-sm font-semibold text-gray-500">No Product Selected</p>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto mt-1">
                  Click any product in the inventory ledger to display its full size & color breakdown.
                </p>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
