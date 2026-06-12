"use client";

import React, { useState } from "react";
import { loginUser } from "./actions/auth";
import { ShieldAlert, Building2, User, Key, ArrowRight, Terminal } from "lucide-react";

export default function Home() {
  const [company, setCompany] = useState("seyon");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevMode, setShowDevMode] = useState(true);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("company", company);
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await loginUser(formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      setError("Failed to establish session. Please verify database connection.");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (c: string, u: string, p: string) => {
    setCompany(c);
    setUsername(u);
    setPassword(p);
    
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("company", c);
    formData.append("username", u);
    formData.append("password", p);

    try {
      const res = await loginUser(formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      setError("Failed to establish session. Please verify database connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6 font-sans">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 z-10 space-y-6 transition-all">
        
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-600/10">F</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FabricVault CRM + ERP</h1>
            <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-extrabold mt-0.5">Terminal Workspace</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in slide-in-from-top-1.5">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-snug">{error}</p>
          </div>
        )}

        {/* Input Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Company Code
            </label>
            <input
              required
              type="text"
              placeholder="e.g. seyon"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-mono transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Username
            </label>
            <input
              required
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Password
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-mono transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 active:scale-[0.99] mt-6"
          >
            {loading ? "Verifying Credentials..." : "Enter Workspace"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Developer Quick Login Options */}
        {showDevMode && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Developer Quick Logins
              </h3>
            </div>
            <div className="space-y-2">
              {[
                {
                  role: "Superadmin",
                  user: "superadmin",
                  pass: "super123",
                  comp: "seyon",
                  desc: "Platform panel access & billing options",
                  style: "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                },
                {
                  role: "Tenant Admin",
                  user: "admin",
                  pass: "admin123",
                  comp: "seyon",
                  desc: "Full client-level operations & staff dashboard",
                  style: "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                },
                {
                  role: "Warehouse Staff",
                  user: "operator",
                  pass: "operator123",
                  comp: "seyon",
                  desc: "Restricted daily barcode & inventory scan view",
                  style: "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                }
              ].map((profile) => (
                <button
                  key={profile.role}
                  onClick={() => handleQuickLogin(profile.comp, profile.user, profile.pass)}
                  disabled={loading}
                  className={`w-full text-left p-3 border rounded-xl flex justify-between items-center transition-all ${profile.style}`}
                >
                  <div>
                    <span className="block text-xs font-bold text-slate-900">{profile.role}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{profile.desc}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-semibold group-hover:bg-indigo-100 transition-colors">
                    {profile.user}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button 
            onClick={() => setShowDevMode(!showDevMode)}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
          >
            {showDevMode ? "Hide Quick Logins" : "Show Quick Logins"}
          </button>
        </div>
      </div>
    </div>
  );
}
