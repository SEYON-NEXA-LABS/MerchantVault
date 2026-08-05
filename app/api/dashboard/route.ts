import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getContextCompanyId } from "@/lib/session";

export async function GET() {
  try {
    // Get company
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    // Parallel fetch all data we need
    const [ordersRes, variantsRes, movementsRes] = await Promise.all([
      supabase
        .from("OrderFulfillment")
        .select("id, orderNumber, customerName, customerPhone, deliveryStatus, awbNumber, courierPartner, createdAt, totalWeightKg")
        .eq("companyId", companyId)
        .order("createdAt", { ascending: false }),
      supabase
        .from("ProductVariant")
        .select("id, sku, title, size, color, currentStockLevel, safetyStockLimit")
        .eq("companyId", companyId),
      supabase
        .from("StockMovement")
        .select("id, type, quantity, createdAt")
        .eq("companyId", companyId)
        .order("createdAt", { ascending: false }),
    ]);

    const orders = ordersRes.data || [];
    const variants = variantsRes.data || [];
    const movements = movementsRes.data || [];

    // ── KPI Stats ──
    const totalOrders = orders.length;
    const processingOrders = orders.filter((o: any) => o.deliveryStatus === "PROCESSING").length;
    const shippedOrders = orders.filter((o: any) => o.deliveryStatus === "SHIPPED").length;
    const deliveredOrders = orders.filter((o: any) => o.deliveryStatus === "DELIVERED").length;
    const rtoInitiated = orders.filter((o: any) => o.deliveryStatus === "RTO_INITIATED").length;
    const rtoReceived = orders.filter((o: any) => o.deliveryStatus === "RTO_RECEIVED").length;
    const totalRto = rtoInitiated + rtoReceived;
    const rtoPercentage = totalOrders > 0 ? ((totalRto / totalOrders) * 100).toFixed(2) : "0.00";

    const totalVariants = variants.length;
    const totalStockUnits = variants.reduce((sum: number, v: any) => sum + (v.currentStockLevel || 0), 0);
    const lowStockVariants = variants.filter((v: any) => v.currentStockLevel <= v.safetyStockLimit && v.currentStockLevel > 0);
    const outOfStockVariants = variants.filter((v: any) => v.currentStockLevel === 0);
    const healthyStockVariants = variants.filter((v: any) => v.currentStockLevel > v.safetyStockLimit);

    // ── Sales Overview (orders grouped by day, last 7 days) ──
    const now = new Date();
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const dayOrders = orders.filter((o: any) => {
        const created = new Date(o.createdAt);
        return created >= dayStart && created < dayEnd;
      });

      salesData.push({
        name: dateStr,
        revenue: dayOrders.length * 1500, // approximate revenue per order
        orders: dayOrders.length,
      });
    }

    // ── Inventory Distribution ──
    const inventoryData = [
      { name: "In Stock", value: healthyStockVariants.length, fill: "#10b981" },
      { name: "Low Stock", value: lowStockVariants.length, fill: "#f59e0b" },
      { name: "Out of Stock", value: outOfStockVariants.length, fill: "#ef4444" },
    ];

    // ── RTO Distribution ──
    const rtoData = [
      { name: "RTO Initiated", value: rtoInitiated, fill: "#f43f5e" },
      { name: "RTO Received", value: rtoReceived, fill: "#fda4af" },
    ];

    // ── Top Products (grouped by product title) ──
    const productGroups: { [title: string]: { title: string; baseSku: string; variantCount: number; totalStock: number } } = {};
    variants.forEach((v: any) => {
      if (!productGroups[v.title]) {
        const parts = v.sku.split("-");
        const baseSku = parts.slice(0, Math.max(1, parts.length - 2)).join("-");
        productGroups[v.title] = { title: v.title, baseSku, variantCount: 0, totalStock: 0 };
      }
      productGroups[v.title].variantCount += 1;
      productGroups[v.title].totalStock += (v.currentStockLevel || 0);
    });
    const topProducts = Object.values(productGroups)
      .sort((a, b) => b.totalStock - a.totalStock)
      .slice(0, 5)
      .map((p, i) => ({
        id: i + 1,
        name: p.title,
        sku: p.baseSku,
        variants: p.variantCount,
        totalStock: p.totalStock,
      }));

    // ── Recent Orders (last 5) ──
    const recentOrders = orders.slice(0, 5).map((o: any) => {
      const created = new Date(o.createdAt);
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timeAgo = "";
      if (diffMins < 1) timeAgo = "Just now";
      else if (diffMins < 60) timeAgo = `${diffMins} mins ago`;
      else if (diffMins < 1440) timeAgo = `${Math.floor(diffMins / 60)} hours ago`;
      else timeAgo = `${Math.floor(diffMins / 1440)} days ago`;

      const statusMap: { [key: string]: { label: string; color: string } } = {
        PROCESSING: { label: "Processing", color: "bg-indigo-100 text-indigo-700" },
        SHIPPED: { label: "Shipped", color: "bg-emerald-100 text-emerald-700" },
        DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
        RTO_INITIATED: { label: "RTO Initiated", color: "bg-rose-100 text-rose-700" },
        RTO_RECEIVED: { label: "RTO Received", color: "bg-rose-100 text-rose-700" },
      };
      const st = statusMap[o.deliveryStatus] || { label: o.deliveryStatus, color: "bg-gray-100 text-gray-700" };

      return {
        id: o.orderNumber,
        customer: o.customerName,
        time: timeAgo,
        status: st.label,
        statusColor: st.color,
        amount: ((o.totalWeightKg || 0.35) * 3000 + 899).toLocaleString("en-IN"),
      };
    });

    // ── Low Stock Alerts ──
    const lowStockAlerts = lowStockVariants.slice(0, 4).map((v: any) => ({
      name: `${v.title} - ${v.color} / ${v.size}`,
      sku: v.sku,
      qty: v.currentStockLevel,
    }));

    return NextResponse.json({
      kpis: {
        totalOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        totalRto,
        rtoPercentage,
        totalVariants,
        totalStockUnits,
        lowStockCount: lowStockVariants.length,
        outOfStockCount: outOfStockVariants.length,
      },
      salesData,
      inventoryData,
      rtoData,
      topProducts,
      recentOrders,
      lowStockAlerts,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
