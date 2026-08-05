"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Plus,
  X,
  Check,
  Edit2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gstin: "",
  notes: "",
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Selected vendor detail
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      if (Array.isArray(data)) setVendors(data);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const openCreateModal = () => {
    setEditingVendor(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name,
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      gstin: vendor.gstin || "",
      notes: vendor.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vendor name is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingVendor ? `/api/vendors/${editingVendor.id}` : "/api/vendors";
      const method = editingVendor ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(editingVendor ? "Vendor updated" : "Vendor created");
      setShowModal(false);
      setForm(emptyForm);
      setEditingVendor(null);
      loadVendors();

      // Refresh selected vendor if editing the currently selected one
      if (editingVendor && selectedVendor?.id === editingVendor.id) {
        setSelectedVendor({ ...selectedVendor, ...data });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save vendor");
    } finally {
      setSaving(false);
    }
  };

  const toggleVendorStatus = async (vendor: Vendor) => {
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !vendor.isActive }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(vendor.isActive ? "Vendor deactivated" : "Vendor activated");
      loadVendors();
      if (selectedVendor?.id === vendor.id) {
        setSelectedVendor({ ...selectedVendor, isActive: !vendor.isActive });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update vendor status");
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.gstin || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && v.isActive) ||
      (statusFilter === "INACTIVE" && !v.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading && vendors.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Loading Vendors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Vendor Directory
          </h1>
          <p className="text-sm text-slate-500">
            Manage your supplier relationships and vendor contacts.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Vendors</p>
            <p className="text-xl font-bold text-gray-900">{vendors.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active</p>
            <p className="text-xl font-bold text-gray-900">{vendors.filter((v) => v.isActive).length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Inactive</p>
            <p className="text-xl font-bold text-gray-900">{vendors.filter((v) => !v.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="space-y-4">
        {/* Vendor List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 bg-slate-50/30 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70 border-b border-gray-200">
                <TableHead className="py-3 px-4 text-gray-500 font-semibold text-xs uppercase">Vendor Name</TableHead>
                <TableHead className="py-3 px-4 text-gray-500 font-semibold text-xs uppercase">Contact</TableHead>
                <TableHead className="py-3 px-4 text-gray-500 font-semibold text-xs uppercase">GSTIN</TableHead>
                <TableHead className="py-3 px-4 text-gray-500 font-semibold text-xs uppercase">Status</TableHead>
                <TableHead className="py-3 px-4 text-gray-500 font-semibold text-xs uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <TableRow
                    key={vendor.id}
                    onClick={() => setSelectedVendor(vendor)}
                    className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${
                      selectedVendor?.id === vendor.id ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          {vendor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{vendor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="space-y-0.5">
                        {vendor.email && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" /> {vendor.email}
                          </p>
                        )}
                        {vendor.phone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {vendor.phone}
                          </p>
                        )}
                        {!vendor.email && !vendor.phone && (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 font-mono text-xs text-gray-500">
                      {vendor.gstin || "—"}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          vendor.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {vendor.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(vendor);
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVendorStatus(vendor);
                          }}
                          className={`p-1.5 rounded-md transition-colors ${
                            vendor.isActive
                              ? "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={vendor.isActive ? "Deactivate" : "Activate"}
                        >
                          {vendor.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-gray-400 text-xs">
                    No vendors found. Click &quot;Add Vendor&quot; to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* VENDOR DETAILS MODAL OVERLAY */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] relative">
            <div className="bg-slate-50/80 border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <span>🏢</span> Vendor Profile Details
              </h3>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Name & Status */}
              <div className="flex items-center justify-between bg-indigo-50/30 p-3.5 rounded-lg border border-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center">
                    {selectedVendor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{selectedVendor.name}</h4>
                    <span
                      className={`text-xs font-bold inline-block mt-0.5 ${
                        selectedVendor.isActive ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {selectedVendor.isActive ? "● Active Supplier" : "● Inactive Supplier"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const v = selectedVendor;
                    setSelectedVendor(null);
                    openEditModal(v);
                  }}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact & Business Identification</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedVendor.email && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-gray-400 block font-medium">Email Address</span>
                        <span className="font-semibold text-gray-800 truncate block">{selectedVendor.email}</span>
                      </div>
                    </div>
                  )}

                  {selectedVendor.phone && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Phone Number</span>
                        <span className="font-semibold text-gray-800 block">{selectedVendor.phone}</span>
                      </div>
                    </div>
                  )}

                  {selectedVendor.gstin && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2.5 sm:col-span-2">
                      <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">GSTIN Tax Identifier</span>
                        <span className="font-mono font-bold text-gray-800 text-xs">{selectedVendor.gstin}</span>
                      </div>
                    </div>
                  )}

                  {selectedVendor.address && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Registered Address</span>
                        <span className="font-medium text-gray-700 leading-relaxed block">{selectedVendor.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedVendor.notes && (
                <div className="border-t border-gray-100 pt-4">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Supplier Notes</h5>
                  <p className="text-xs text-gray-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100/60 leading-relaxed">
                    {selectedVendor.notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t border-gray-100 pt-3 text-[10px] text-gray-400 flex justify-between">
                <span>Created: {new Date(selectedVendor.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span>Updated: {new Date(selectedVendor.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT VENDOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  {editingVendor ? "Edit Vendor" : "Add New Vendor"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingVendor ? "Update vendor details below." : "Fill in the supplier details below."}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVendor(null);
                  setForm(emptyForm);
                }}
                className="text-gray-400 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zeta Fabrics Pvt Ltd"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="orders@vendor.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Address</label>
                <textarea
                  placeholder="Full address..."
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AABCU9603R1ZM"
                    value={form.gstin}
                    onChange={(e) => setForm((p) => ({ ...p, gstin: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Notes</label>
                  <input
                    type="text"
                    placeholder="Internal notes..."
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVendor(null);
                    setForm(emptyForm);
                  }}
                  variant="outline"
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> {editingVendor ? "Update Vendor" : "Create Vendor"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
