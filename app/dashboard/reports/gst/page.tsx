"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  FileCode2,
  Calendar,
  Building2,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/RoleGuard";


export default function GstReportsPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "TENANTADMIN", "MANAGER"]}>
      <GstReportsContent />
    </RoleGuard>
  );
}

function GstReportsContent() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({
    totalOrders: 0,
    totalTaxable: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    b2bOrdersCount: 0
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [companyGstin, setCompanyGstin] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchGstData = async () => {
    setLoading(true);
    try {
      let url = "/api/reports/gst?format=json";
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        setSummary(data.summary || {});
        setOrders(data.orders || []);
        setCompanyGstin(data.gstin || "");
        setCompanyName(data.company || "");
      }
    } catch (err) {
      toast.error("Failed to load GST reports data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGstData();
  }, [startDate, endDate]);

  const handleDownloadCsv = () => {
    let url = "/api/reports/gst?format=gstr1_csv";
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    window.open(url, "_blank");
    toast.success("Downloading GSTR-1 CSV Report for CA / GST Filing...");
  };

  const handleDownloadTallyXml = () => {
    let url = "/api/reports/gst?format=tally_xml";
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    window.open(url, "_blank");
    toast.success("Downloading Tally Prime XML Sales Voucher File...");
  };

  const filteredOrders = orders.filter((o: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.buyerGstin && o.buyerGstin.toLowerCase().includes(q)) ||
      (o.buyerCompanyName && o.buyerCompanyName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-xs">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" /> GST Reports & Tally Prime Export
          </h1>
          <p className="text-sm text-gray-500">
            Generate GSTR-1 CSV filings and export direct Tally XML Vouchers with auto-split CGST, SGST, and IGST ledgers.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download GSTR-1 (CSV)
          </button>
          <button
            onClick={handleDownloadTallyXml}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileCode2 className="w-4 h-4" /> Export to Tally (XML)
          </button>
        </div>
      </div>

      {/* Date Filter & Search */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-500" /> Date Range:
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by Order, Customer, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Taxable Value</span>
          <span className="text-xl font-extrabold text-gray-900">₹{summary.totalTaxable ? summary.totalTaxable.toLocaleString("en-IN") : "0"}</span>
          <span className="text-[11px] text-gray-400 block">Excluding Taxes</span>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">CGST Collected</span>
          <span className="text-xl font-extrabold text-indigo-900">₹{summary.totalCgst ? summary.totalCgst.toLocaleString("en-IN") : "0"}</span>
          <span className="text-[11px] text-indigo-400 block">Intra-State Central</span>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">SGST Collected</span>
          <span className="text-xl font-extrabold text-indigo-900">₹{summary.totalSgst ? summary.totalSgst.toLocaleString("en-IN") : "0"}</span>
          <span className="text-[11px] text-indigo-400 block">Intra-State State</span>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">IGST Collected</span>
          <span className="text-xl font-extrabold text-purple-900">₹{summary.totalIgst ? summary.totalIgst.toLocaleString("en-IN") : "0"}</span>
          <span className="text-[11px] text-purple-400 block">Inter-State Integrated</span>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">B2B GSTIN Orders</span>
          <span className="text-xl font-extrabold text-emerald-900">{summary.b2bOrdersCount || 0} / {summary.totalOrders || 0}</span>
          <span className="text-[11px] text-emerald-500 block">ITC Registered Buyers</span>
        </div>
      </div>

      {/* Orders GST Ledger Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" /> GST Tax Ledger ({filteredOrders.length} Invoices)
          </h3>
          {companyGstin && (
            <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-200">
              Merchant GSTIN: {companyGstin}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Order Ref</th>
                <th className="px-4 py-3">Customer / Business</th>
                <th className="px-4 py-3">Buyer GSTIN</th>
                <th className="px-4 py-3">Place of Supply</th>
                <th className="px-4 py-3 text-right">Taxable (₹)</th>
                <th className="px-4 py-3 text-right">CGST (₹)</th>
                <th className="px-4 py-3 text-right">SGST (₹)</th>
                <th className="px-4 py-3 text-right">IGST (₹)</th>
                <th className="px-4 py-3 text-right">Total Invoice (₹)</th>
                <th className="px-4 py-3 text-center">Tax Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading tax ledger entries...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">
                    No order transactions found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord: any) => {
                  const totalInvoice = (ord.taxableAmount || 0) + (ord.cgstAmount || 0) + (ord.sgstAmount || 0) + (ord.igstAmount || 0);

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-700">{ord.orderNumber}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900 block">{ord.buyerCompanyName || ord.customerName}</span>
                        <span className="text-[11px] text-gray-400 block">{ord.shippingCity}, {ord.shippingState}</span>
                      </td>
                      <td className="px-4 py-3">
                        {ord.buyerGstin ? (
                          <span className="font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                            {ord.buyerGstin}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">Consumer (B2C)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600">{ord.placeOfSupply || "33-Tamil Nadu"}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">₹{(ord.taxableAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right text-indigo-700 font-bold">₹{(ord.cgstAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right text-indigo-700 font-bold">₹{(ord.sgstAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right text-purple-700 font-bold">₹{(ord.igstAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700">₹{totalInvoice.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ord.taxType === "INTER_STATE"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {ord.taxType === "INTER_STATE" ? "Interstate Tax (IGST)" : "In-State Tax (CGST+SGST)"}
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
    </div>
  );
}
