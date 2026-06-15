"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Building2,
  Users,
  Plus,
  RefreshCw,
  Search,
  KeyRound,
  Edit,
  Trash2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RoleGuard } from "../../../../components/RoleGuard";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface UserType {
  id: string;
  companyId: string | null;
  email: string;
  username: string;
  isActive: boolean;
  role: "SUPERADMIN" | "TENANTADMIN" | "STAFF";
  createdAt: string;
  Company: { name: string } | null;
}

export default function SuperadminUsersPage() {
  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <UsersContent />
    </RoleGuard>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modals State
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserType["role"]>("STAFF");
  const [isActive, setIsActive] = useState(true);
  const [companyId, setCompanyId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resCompanies] = await Promise.all([
        fetch("/api/superadmin/users"),
        fetch("/api/superadmin/subscriptions") // returns companies with subs
      ]);

      const dataUsers = await resUsers.json();
      const dataCompanies = await resCompanies.json();

      if (Array.isArray(dataUsers)) setUsers(dataUsers);
      if (Array.isArray(dataCompanies)) setCompanies(dataCompanies);
    } catch (e) {
      toast.error("Failed to load user management details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setUsername("");
    setEmail("");
    setRole("STAFF");
    setIsActive(true);
    setCompanyId("");
    setPassword("");
    setShowAddModal(true);
  };

  const openEditModal = (user: UserType) => {
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.isActive);
    setCompanyId(user.companyId || "");
    setPassword("");
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all required credentials.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_USER",
          username,
          email,
          role,
          password,
          isActive,
          companyId: companyId || null
        })
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`User "${username}" created successfully!`);
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaving(true);
    try {
      // 1. Update basic fields & password if provided
      const resUpdate = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_USER",
          userId: selectedUser.id,
          username,
          email,
          role,
          password: password || undefined
        })
      });

      const dataUpdate = await resUpdate.json();
      if (dataUpdate.error) {
        toast.error(dataUpdate.error);
        setSaving(false);
        return;
      }

      // 2. Update active state if changed
      if (isActive !== selectedUser.isActive) {
        const resActive = await fetch("/api/superadmin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "TOGGLE_ACTIVE",
            userId: selectedUser.id,
            isActive
          })
        });
        const dataActive = await resActive.json();
        if (dataActive.error) {
          toast.error(dataActive.error);
          setSaving(false);
          return;
        }
      }

      toast.success(`User "${username}" updated successfully!`);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: UserType) => {
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_ACTIVE",
          userId: user.id,
          isActive: !user.isActive
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`User "${user.username}" status toggled.`);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (userId: string, uname: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${uname}"?`)) return;

    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_USER",
          userId
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`User "${uname}" has been deleted.`);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.Company?.name || "Global").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group users by company
  const groupedUsers: { [companyName: string]: { code: string | null; users: UserType[] } } = {};
  filteredUsers.forEach((u) => {
    const companyName = u.Company?.name || "Global / Platform Superadmin";
    if (!groupedUsers[companyName]) {
      const c = companies.find((comp) => comp.id === u.companyId);
      groupedUsers[companyName] = {
        code: c ? c.code : null,
        users: []
      };
    }
    groupedUsers[companyName].users.push(u);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 bg-gradient-to-br from-[#f0fdfa] via-[#f5f6f3] to-[#e4eae6] min-h-screen rounded-2xl relative">
      {/* Mesh Loom Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl"
        style={{
          backgroundImage: "radial-gradient(#0d9488 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/70 backdrop-blur-md border border-teal-100 rounded-xl shadow-sm">
        <div className="space-y-1">
          <Link
            href="/dashboard/superadmin"
            className="text-teal-700 hover:text-teal-900 text-xs font-bold flex items-center gap-1.5 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
          </Link>
          <h1 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> User Directory Manager
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Granular console to search, create, suspend, and configure authorization levels for all platform members.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Create New User
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Directory
          </button>
        </div>
      </div>

      {/* Main Directory Area */}
      <div className="relative z-10 bg-white/70 backdrop-blur-md border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search users by name, email or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-xs text-stone-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
              Fetching user data...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">No users found.</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedUsers).map(([companyName, group]) => (
                <div key={companyName} className="border border-stone-200 rounded-xl overflow-hidden bg-white/50 shadow-sm">
                  {/* Group Header */}
                  <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-stone-900 text-xs">{companyName}</span>
                      {group.code && (
                        <span className="text-[9px] text-stone-400 font-mono">({group.code})</span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-550 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                      {group.users.length} {group.users.length === 1 ? "User" : "Users"}
                    </span>
                  </div>

                  {/* Group Members List */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-50/20 text-stone-500 font-bold border-b border-stone-150 uppercase tracking-wider text-[9px]">
                          <th className="p-3 pl-4">User Details</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Registered</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium text-stone-750">
                        {group.users.map((u) => (
                          <tr key={u.id} className="hover:bg-stone-50/20 transition-colors">
                            <td className="p-3 pl-4">
                              <div className="font-bold text-stone-900">{u.username}</div>
                              <div className="text-[10px] text-stone-400 font-mono">{u.email}</div>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                                u.role === "SUPERADMIN" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                u.role === "TENANTADMIN" ? "bg-teal-50 text-teal-700 border-teal-100" :
                                "bg-stone-100 text-stone-700 border-stone-250"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleActive(u)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all hover:scale-95 ${
                                  u.isActive 
                                    ? "bg-emerald-50 text-emerald-755 border-emerald-150" 
                                    : "bg-red-50 text-red-755 border-red-150"
                                }`}
                              >
                                {u.isActive ? "Active" : "Suspended"}
                              </button>
                            </td>
                            <td className="p-3 text-stone-550">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="bg-teal-50 hover:bg-teal-100 text-teal-850 border border-teal-200 font-bold px-2.5 py-1 rounded-lg transition-colors text-[11px]"
                                >
                                  <Edit className="w-3 h-3 inline mr-1" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2.5 py-1 rounded-lg transition-colors text-[11px]"
                                >
                                  <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-650" /> Add New User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                    placeholder="e.g. janesmith"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono"
                    placeholder="jane@company.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Assign Company Scope</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                  >
                    <option value="">Global / Platform Superadmin Scope</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Account Role / Authority</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                  >
                    <option value="SUPERADMIN">Platform Superadmin</option>
                    <option value="TENANTADMIN">Tenant Administrator</option>
                    <option value="STAFF">Regular Staff</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-stone-50 p-3.5 border border-stone-200 rounded-xl">
                  <div>
                    <span className="block font-bold text-stone-850">Initial Account State</span>
                    <span className="block text-[10px] text-stone-450 mt-0.5">Activate account immediately upon creation.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                        : "bg-red-50 text-red-800 border-red-250"
                    }`}
                  >
                    {isActive ? "Active / Enabled" : "Suspended"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-650" /> Edit User Account
                </h3>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                  Tenant: {selectedUser.Company?.name || "Global"}
                </p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-stone-400 hover:text-stone-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Role / Authority</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs"
                  >
                    <option value="SUPERADMIN">Platform Superadmin</option>
                    <option value="TENANTADMIN">Tenant Administrator</option>
                    <option value="STAFF">Regular Staff</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-600">Update Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep existing"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between bg-stone-50 p-3.5 border border-stone-200 rounded-xl">
                  <div>
                    <span className="block font-bold text-stone-855">User Account State</span>
                    <span className="block text-[10px] text-stone-450 mt-0.5">Deactivate to suspend platform access immediately.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-805 border-emerald-200" 
                        : "bg-red-50 text-red-805 border-red-200"
                    }`}
                  >
                    {isActive ? "Active" : "Suspended"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
