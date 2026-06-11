"use client";

import React, { createContext, useContext } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export type UserRole = "SUPERADMIN" | "TENANTADMIN" | "STAFF";

const RoleContext = createContext<{
  role: UserRole;
  setRole: (role: UserRole) => void;
}>({
  role: "SUPERADMIN",
  setRole: () => {},
});

export const RoleProvider = RoleContext.Provider;

export function useRole() {
  return useContext(RoleContext);
}

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useRole();

  const hasAccess = allowedRoles.includes(role);

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="relative max-w-md w-full bg-white/70 backdrop-blur-md border border-red-100 rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Decorative Background Glows */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Lock Icon Emblem */}
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 mb-6 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-red-600 animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-gray-950 mb-2 flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" /> Access Restricted
          </h2>
          
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Your current active role (<span className="font-bold text-gray-900">{role}</span>) does not have permission to view this section. This page requires:
          </p>

          {/* Required Roles Badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {allowedRoles.map((r) => (
              <span
                key={r}
                className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg uppercase"
              >
                {r}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <p className="text-[10px] text-gray-400">
              If you believe this is an error, please switch your active role in the profile menu or contact your workspace administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
