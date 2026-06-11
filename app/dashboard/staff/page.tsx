"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  UserPlus,
  UserCheck,
  AlertCircle,
  Trash2,
  Lock,
  RefreshCw,
  Power,
  KeyRound,
  CheckCircle2,
  X
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  role: "SUPERADMIN" | "TENANTADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
}

export default function StaffPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("STAFF");
  const [submitting, setSubmitting] = useState(false);

  // Reset Password Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter out Platform Admins (SUPERADMIN) from Tenant/Staff view
        setMembers(data.filter(u => u.role !== "SUPERADMIN"));
      } else {
        toast.error("Failed to load team directory.");
      }
    } catch (err) {
      toast.error("Failed to connect to directory servers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role
        })
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`User account "${username}" created successfully!`);
        setUsername("");
        setPassword("");
        setRole("STAFF");
        fetchUsers();
      }
    } catch (err) {
      toast.error("Error creating user account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`User "${user.username}" is now ${!user.isActive ? "Enabled" : "Disabled"}.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to toggle user status.");
    }
  };

  const handleOpenResetModal = (user: User) => {
    setResetTargetUser(user);
    setNewPassword("");
    setShowResetModal(true);
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword) return;

    setSavingPassword(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resetTargetUser.id,
          password: newPassword
        })
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Password updated successfully for "${resetTargetUser.username}"!`);
        setShowResetModal(false);
      }
    } catch (err) {
      toast.error("Failed to reset password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRemoveUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for user "${name}"? This deletes the account.`)) return;

    try {
      const res = await fetch(`/api/staff?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Access revoked for "${name}".`);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to remove user.");
      }
    } catch (err) {
      toast.error("Failed to connect to delete endpoint.");
    }
  };

  const formatRole = (role: string) => {
    if (role === "SUPERADMIN") return "Platform Admin";
    if (role === "TENANTADMIN") return "Tenant Admin";
    return "Staff Operator";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-950" /> Staff Accounts & Security
          </h1>
          <p className="text-sm text-gray-500">
            Create user credentials (no email needed), reset passwords, toggle access states (enable/disable), and manage roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create User Form Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5 h-fit">
          <div>
            <h3 className="font-bold text-gray-950 text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-gray-500" /> Create User Credentials
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Create a local account using only a username and password. An internal login handle will be created.
            </p>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label htmlFor="username" className="font-semibold text-gray-600">Username</label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                placeholder="e.g. johndoe"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="font-semibold text-gray-600">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="role" className="font-semibold text-gray-600">System Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as User["role"])}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="STAFF">Staff Operator (Scanner/Warehouse)</option>
                <option value="TENANTADMIN">Tenant Admin (Full Tenant Access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Create Credentials
            </button>
          </form>
        </div>

        {/* Members Directory Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Directory Registry</h2>
              <p className="text-xs text-gray-500">Currently configured staff accounts and connection settings.</p>
            </div>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {members.length} Users Total
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-xs text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                Loading directory...
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-16 text-xs text-gray-400">No user credentials found.</div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">
                    <th className="py-3 px-6">Staff Member</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr key={member.id} className={`hover:bg-gray-50/50 transition-colors ${!member.isActive ? "opacity-60 bg-gray-50/20" : ""}`}>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-gray-900 font-mono text-xs">{member.username}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{member.email}</div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                          member.role === "SUPERADMIN" ? "bg-red-50 text-red-700 border border-red-100" :
                          member.role === "TENANTADMIN" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                          "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {formatRole(member.role)}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-150 text-gray-500"
                        }`}>
                          <span className={`w-1.2 h-1.2 rounded-full ${
                            member.isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}></span>
                          {member.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                              member.isActive ? "text-gray-400 hover:text-amber-600" : "text-amber-600 hover:text-emerald-600"
                            }`}
                            title={member.isActive ? "Disable User" : "Enable User"}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleOpenResetModal(member)}
                            className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {member.username === "vetrivel" ? (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold pr-2 select-none">
                              <Lock className="w-3.5 h-3.5" /> Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemoveUser(member.id, member.username)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-150 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Reset Password Modal */}
      {showResetModal && resetTargetUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" /> Reset Password: {resetTargetUser.username}
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-650">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-55 rounded-lg font-semibold text-gray-755"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {savingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Roles & Permission Scopes</h3>
          <p className="text-xs text-gray-500">Security scopes mapping system modules to roles for this tenant.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[
            {
              role: "Platform Admin",
              color: "border-red-200 bg-red-50/20",
              desc: "Global administrative access to platform control panels, system performance logs, synchronizations, tenant invoicing profiles."
            },
            {
              role: "Tenant Admin",
              color: "border-purple-200 bg-purple-50/20",
              desc: "Full operational access inside the tenant context, tenant branding configuration, integrations settings, and staff personnel management."
            },
            {
              role: "Staff Operator",
              color: "border-slate-200 bg-slate-50/20",
              desc: "Warehouse operations access. Scan barcodes for stock Inward/Outward, view current stock, print labels, conduct audits."
            }
          ].map((scope) => (
            <div key={scope.role} className={`p-4 border rounded-xl ${scope.color} space-y-2`}>
              <h4 className="font-bold text-gray-900">{scope.role}</h4>
              <p className="text-gray-600 leading-relaxed text-[11px]">{scope.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
