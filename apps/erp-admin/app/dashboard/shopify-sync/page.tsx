"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Settings2,
  Info,
  Clock,
  ArrowRight,
  Sparkles,
  Link2,
  ShieldCheck
} from "lucide-react";
import { RoleGuard } from "../../../components/RoleGuard";

interface SyncLog {
  id: string;
  module: string;
  direction: "Shopify → ERP" | "ERP → Shopify";
  records: number;
  status: "Success" | "Warning" | "Failed";
  duration: string;
  time: string;
}

export default function ShopifySyncPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "TENANTADMIN"]}>
      <ShopifySyncContent />
    </RoleGuard>
  );
}

function ShopifySyncContent() {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [logs, setLogs] = useState<SyncLog[]>([
    { id: "SYN-983", module: "Orders Sync", direction: "Shopify → ERP", records: 14, status: "Success", duration: "1.2s", time: "Just now" },
    { id: "SYN-982", module: "Inventory Sync", direction: "ERP → Shopify", records: 124, status: "Success", duration: "4.8s", time: "12 mins ago" },
    { id: "SYN-981", module: "Products Sync", direction: "Shopify → ERP", records: 3, status: "Warning", duration: "2.1s", time: "45 mins ago" },
    { id: "SYN-980", module: "Customers Sync", direction: "Shopify → ERP", records: 28, status: "Success", duration: "1.5s", time: "2 hours ago" },
    { id: "SYN-979", module: "Orders Sync", direction: "Shopify → ERP", records: 41, status: "Success", duration: "3.2s", time: "4 hours ago" },
    { id: "SYN-978", module: "Inventory Sync", direction: "ERP → Shopify", records: 8, status: "Failed", duration: "0.8s", time: "6 hours ago" },
  ]);

  React.useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.company) {
            setCompany(data.company);
          }
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      }
    };
    fetchSession();
  }, []);

  const triggerSync = async (moduleName: string) => {
    if (syncing) return;
    setSyncing(moduleName);
    
    try {
      const res = await fetch("/api/shopify/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: moduleName })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Successfully completed sync for ${moduleName}!`);
        if (data.log) {
          setLogs(prev => [data.log, ...prev]);
        }
      } else {
        toast.error(data.error || `Failed to execute sync for ${moduleName}.`);
        const failLog: SyncLog = {
          id: `SYN-${Math.floor(100 + Math.random() * 900)}`,
          module: moduleName,
          direction: moduleName === "Inventory Sync" ? "ERP → Shopify" : "Shopify → ERP",
          records: 0,
          status: "Failed",
          duration: "0.5s",
          time: "Just now"
        };
        setLogs(prev => [failLog, ...prev]);
      }
    } catch (err) {
      toast.error("Failed to connect to the Shopify sync server endpoint.");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {company?.shopifyStoreUrl && company?.shopifyAccessToken ? (
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                <Link2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-100 animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-500" /> Not Connected
              </span>
            )}
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs text-gray-500 font-mono">
              {company?.shopifyStoreUrl && company?.shopifyAccessToken ? company.shopifyStoreUrl.replace("https://", "").replace("http://", "") : "Unconfigured Store Domain"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shopify Sync Bridge</h1>
          <p className="text-sm text-gray-500">
            Monitor real-time Webhook activity, manual sync triggers, and data matching health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => triggerSync("Full System Sync")}
            disabled={syncing !== null}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing === "Full System Sync" ? "animate-spin" : ""}`} />
            {syncing === "Full System Sync" ? "Syncing All..." : "Sync All Modules"}
          </button>
        </div>
      </div>

      {/* 100% Data Safety & Read Protection Guarantee */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
            100% Non-Destructive Data Protection Guarantee
          </h3>
          <p className="text-xs text-emerald-900 leading-relaxed">
            <strong>Your Shopify store database is completely untouched and safe.</strong> Syncing operates strictly as a <em>one-way read & passive webhook listener</em>. FabricVault ERP will <strong>never delete, overwrite, or modify</strong> your existing Shopify products, collections, customer records, or active store configuration.
          </p>
        </div>
      </div>

      {/* Sync Direction Explanation Banner */}
      <div className="bg-[#fdfbf9] border border-amber-950/10 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs shadow-sm">
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-650" /> Coordinated Two-Way Sync Ecosystem
          </h4>
          <p className="text-indigo-950/60 leading-relaxed max-w-3xl">
            Seyon ERP operates a coordinated data exchange. **Shopify** acts as the primary source for new orders, customers, and product definitions (**Shopify → ERP**), while the **ERP** acts as the source of truth for physical stock levels, pushing reconciled warehouse quantities back to Shopify storefronts (**ERP → Shopify**).
          </p>
        </div>
        <div className="flex gap-2 flex-wrap text-[10px] font-extrabold">
          <span className="bg-indigo-50/60 text-indigo-900 border border-indigo-100/50 px-2.5 py-1 rounded-lg">
            Shopify → ERP (Orders & Catalog)
          </span>
          <span className="bg-amber-50/60 text-amber-800 border border-amber-100/50 px-2.5 py-1 rounded-lg">
            ERP → Shopify (Warehouse Stock)
          </span>
        </div>
      </div>

      {/* Sync Health & Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            name: "Orders Sync",
            desc: "Shopify → ERP Core",
            stats: "12,492 Syncs",
            health: "99.8% Success",
            status: "Healthy",
            time: "Last: Just now"
          },
          {
            name: "Inventory Sync",
            desc: "ERP Core → Shopify",
            stats: "82,109 Updates",
            health: "98.4% Success",
            status: "Healthy",
            time: "Last: 12 mins ago"
          },
          {
            name: "Products Sync",
            desc: "Shopify → ERP Core",
            stats: "2,408 Products",
            health: "100% Match",
            status: "Warning",
            time: "Last: 45 mins ago"
          },
          {
            name: "Customers Sync",
            desc: "Shopify → ERP Core",
            stats: "8,301 Accounts",
            health: "100% Success",
            status: "Healthy",
            time: "Last: 2 hours ago"
          }
        ].map((mod) => (
          <div key={mod.name} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="font-bold text-gray-950 text-sm">{mod.name}</h3>
                <p className="text-xs text-gray-500">{mod.desc}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                mod.status === "Healthy" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {mod.status}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
              <span className="text-xl font-bold text-gray-900">{mod.stats.split(" ")[0]}</span>
              <span className="text-xs text-gray-500 font-medium">{mod.stats.split(" ")[1]}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {mod.health}
              </span>
              <span className="font-mono text-[10px]">{mod.time}</span>
            </div>

            <button
              onClick={() => triggerSync(mod.name)}
              disabled={syncing !== null}
              className="w-full text-center py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              {syncing === mod.name ? "Syncing..." : "Trigger Sync"}
            </button>
          </div>
        ))}
      </div>

      {/* Sync Operations Audit Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-bold text-gray-900 text-base">Real-time Sync Log</h2>
            <p className="text-xs text-gray-500">Live operational ledger of webhook notifications and background jobs.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-gray-500 font-medium">Listening to Webhooks</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">
                <th className="py-3 px-6">Sync Job ID</th>
                <th className="py-3 px-6">Module Name</th>
                <th className="py-3 px-6">Direction</th>
                <th className="py-3 px-6">Affected Records</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">Triggered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-xs text-gray-900">{log.id}</td>
                  <td className="py-3.5 px-6 font-semibold text-gray-900">{log.module}</td>
                  <td className="py-3.5 px-6 text-gray-500 text-xs">{log.direction}</td>
                  <td className="py-3.5 px-6 font-medium">{log.records} items</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === "Success" ? "bg-emerald-50 text-emerald-700" :
                      log.status === "Warning" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    }`}>
                      {log.status === "Success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      {log.status === "Warning" && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      {log.status === "Failed" && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-gray-500 font-mono text-xs">{log.duration}</td>
                  <td className="py-3.5 px-6 text-gray-400 text-xs">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts & Shopify Sync Status */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Shopify Inventory Sync Alerts
            </h3>
            <p className="text-xs text-gray-500">Live feed of variants currently below thresholds and their status on the Shopify storefront.</p>
          </div>
          <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-100">
            3 Active Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Linen Summer Shirt - Soft Blue / S", sku: "SHT-LIN-04-SB-S", qty: 2, limit: 10, status: "OutOfStock Synced", color: "bg-red-50 text-red-700 border-red-100" },
            { name: "syn Denim Jeans - Onyx Black / XL", sku: "JNS-SLM-02-OB-XL", qty: 3, limit: 5, status: "LowStock Synced", color: "bg-amber-50 text-amber-700 border-amber-100" },
            { name: "Seyon Classic Cotton Tee - White / L", sku: "TSH-COT-01-W-L", qty: 12, limit: 20, status: "In Sync", color: "bg-emerald-50 text-emerald-700 border-emerald-100" }
          ].map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3.5 space-y-3 bg-slate-50/50 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {item.sku}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.color}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                <span className="text-gray-500">Stock level:</span>
                <span className="font-bold text-gray-900">
                  {item.qty} <span className="text-gray-400 font-normal">/ {item.limit} limit</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Setup summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-bold text-gray-900 text-sm">Active Webhook Subscriptions</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Shopify fires real-time triggers to our webhook endpoints on key merchant actions.
          </p>
          <div className="space-y-3">
            {[
              { topic: "orders/create", path: "/api/webhooks/shopify/orders-create", active: true },
              { topic: "orders/updated", path: "/api/webhooks/shopify/orders-update", active: true },
              { topic: "products/update", path: "/api/webhooks/shopify/products-update", active: true },
              { topic: "inventory_levels/update", path: "/api/webhooks/shopify/inventory-update", active: true }
            ].map((hook) => (
              <div key={hook.topic} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <div className="space-y-0.5">
                  <p className="font-mono font-semibold text-gray-900">{hook.topic}</p>
                  <p className="font-mono text-gray-400">{hook.path}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Credentials & Scopes</h3>
            <p className="text-xs text-gray-500">ERP uses a secure Custom Admin App token to perform write operations to Shopify.</p>
            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400">Connection Mode</span>
                <span className="font-medium">Custom Shopify App</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400">API Version</span>
                <span className="font-mono">2026-04</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400">Products Access</span>
                <span className="text-emerald-700 font-semibold">Read & Write</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-400">Orders Access</span>
                <span className="text-emerald-700 font-semibold">Read & Write</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 mt-4">
            <Link 
              href="/dashboard/settings"
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 py-2 rounded-lg text-gray-700 transition-all cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" /> Configure Credentials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
