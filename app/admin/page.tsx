"use client";

import React, { useState } from "react";
import { loginUser } from "../actions/auth";
import { ShieldAlert, User, Key, ArrowRight, Terminal, Eye, EyeOff, Store } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDevMode, setShowDevMode] = useState(process.env.NODE_ENV === "development");
  const [showDevModeToggle, setShowDevModeToggle] = useState(false);

  React.useEffect(() => {
    setShowDevModeToggle(process.env.NODE_ENV === "development");
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("rememberMe", rememberMe ? "true" : "false");

    try {
      const res = await loginUser(formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res && res.success) {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError("Failed to establish session. Please verify database connection.");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("username", u);
    formData.append("password", p);
    formData.append("rememberMe", rememberMe ? "true" : "false");

    try {
      const res = await loginUser(formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res && res.success) {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError("Failed to establish session.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.1),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_40%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <Store className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Seyon Shopping
          </span>
        </div>
        <h2 className="mt-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Merchant & Staff Access Portal
        </h2>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-xl dark:shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-4 flex items-start gap-3 text-red-700 dark:text-red-200 text-sm animate-shake">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="font-medium">{error}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin / admin / operator"
                  className="block w-full rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 pl-10 pr-10 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500/20"
                />
                Remember session
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-indigo-600/30 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Session <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {showDevModeToggle && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowDevMode(!showDevMode)}
                className="flex items-center justify-between w-full text-xs font-mono text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Dev Preset Accounts
                </span>
                <span>{showDevMode ? "Hide" : "Show"}</span>
              </button>

              {showDevMode && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("superadmin", "super123")}
                    className="py-2 px-2 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <span className="font-bold">SuperAdmin</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Platform Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin", "admin123")}
                    className="py-2 px-2 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <span className="font-bold font-mono">TenantAdmin</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Seyon Merchant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("operator", "operator123")}
                    className="py-2 px-2 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-sky-700 dark:text-sky-300 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <span className="font-bold font-mono">Staff</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Counter Operator</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
