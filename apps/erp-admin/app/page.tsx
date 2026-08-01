"use client";

import React, { useState } from "react";
import { loginUser } from "./actions/auth";
import { ShieldAlert, User, Key, ArrowRight, Terminal, Eye, EyeOff, Scissors, HelpCircle } from "lucide-react";

export default function Home() {
  const [company, setCompany] = useState("syn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDevMode, setShowDevMode] = useState(process.env.NODE_ENV === "development");
  const [showDevModeToggle, setShowDevModeToggle] = useState(false);

  // Safely check dev mode after client mount to prevent hydration mismatch
  React.useEffect(() => {
    setShowDevModeToggle(process.env.NODE_ENV === "development");
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("company", company);
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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f0fdfa] via-[#f5f6f3] to-[#e4eae6] relative overflow-hidden font-sans">
      
      {/* BACKGROUND GRAPHICS (Shared) */}
      {/* Clean Subtle Grid Mesh representing Woven Fabric Loom Structure */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(#0d9488 1.5px, transparent 1.5px)
          `,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Decorative ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#f59e0b]/5 blur-[130px] pointer-events-none" />

      {/* LEFT PANEL: Brand Identity (Visible on lg+ screens) */}
      <div className="hidden lg:flex lg:w-7/12 p-16 flex-col justify-between relative border-r border-teal-100/50 bg-white/40 backdrop-blur-sm">
        
        {/* Top Header - Mini Logo */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 bg-stone-950 text-white rounded-xl flex items-center justify-center shadow-md">
            <Scissors className="w-5 h-5 text-[#fbbf24]" />
          </div>
          <div>
            <span className="text-sm font-black text-stone-950 tracking-tight">SEYON OS</span>
            <span className="block text-[9px] text-teal-700 tracking-wider font-extrabold uppercase mt-0.5">Apparel Enterprise</span>
          </div>
        </div>

        {/* Center Content: Product Presentation */}
        <div className="max-w-xl space-y-8 my-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200/60 bg-white text-xs font-semibold text-teal-800 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            Active Platform Release v1.2.0
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl font-black text-stone-950 tracking-tight leading-[1.1] font-serif">
              The operating system for modern <span className="underline decoration-[#fbbf24] decoration-wavy decoration-2">apparel brands</span>.
            </h2>
            <p className="text-stone-600 text-base leading-relaxed">
              Seyon coordinates your entire retail workflow into a single unified fabric—linking inventory, vendor procurement, carrier logistics, and 0% commission Shopify storefronts seamlessly.
            </p>
          </div>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-3 gap-6 pt-6">
            <div className="space-y-3 p-5 rounded-2xl border border-teal-100 bg-white/70 hover:bg-white transition-all shadow-md flex flex-col justify-between min-h-[170px]">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-950 flex items-center justify-center text-[#fbbf24] text-xs font-black shadow-inner">01</div>
                <h4 className="text-sm font-extrabold text-stone-950 tracking-tight">Direct Bridge Sync</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Real-time webhook pipeline syncing order states and product edits under 500ms. Guarantees absolute inventory parity with Shopify without transaction fees.
                </p>
              </div>
            </div>
            <div className="space-y-3 p-5 rounded-2xl border border-teal-100 bg-white/70 hover:bg-white transition-all shadow-md flex flex-col justify-between min-h-[170px]">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-950 flex items-center justify-center text-[#fbbf24] text-xs font-black shadow-inner">02</div>
                <h4 className="text-sm font-extrabold text-stone-950 tracking-tight">Logistics Hub</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Generate courier manifests, verify COD orders, and ship via Shiprocket or Delhivery. Automate AWB assignment and client tracking updates.
                </p>
              </div>
            </div>
            <div className="space-y-3 p-5 rounded-2xl border border-teal-100 bg-white/70 hover:bg-white transition-all shadow-md flex flex-col justify-between min-h-[170px]">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-950 flex items-center justify-center text-[#fbbf24] text-xs font-black shadow-inner">03</div>
                <h4 className="text-sm font-extrabold text-stone-950 tracking-tight">Custom Storefronts</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  White-labeled storefronts dynamically matching layout, colors, and collections to client catalogs. Configurable via environment variables.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex justify-between items-center text-[10px] text-teal-700/60 font-bold uppercase tracking-wider z-10">
          <span>© 2026 Seyon Nexa Labs</span>
          <span>LATITUDE: 13.0827° N / LONGITUDE: 80.2707° E</span>
        </div>

        {/* Blueprint loom vector lines with Peacock colored gradients */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.25]" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="0" x2="10%" y2="100%" stroke="url(#peacock-grad-1)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="url(#peacock-grad-2)" strokeWidth="1" />
          <circle cx="10%" cy="80%" r="6" fill="#d97706" />
          <path d="M 50 150 Q 250 80 450 150 T 850 150" fill="none" stroke="url(#peacock-grad-1)" strokeWidth="1.5" />
          <path d="M 100 200 Q 300 130 500 200 T 900 200" fill="none" stroke="url(#peacock-grad-2)" strokeWidth="0.75" strokeDasharray="3 3" />
          <defs>
            <linearGradient id="peacock-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="peacock-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 z-10">
        
        {/* Main Card - Light glassmorphic teal card */}
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-stone-200 rounded-2xl shadow-xl p-8 space-y-6 transition-all hover:shadow-stone-900/5 relative">
          
          {/* Logo & Header for Mobile/Centered view */}
          <div className="text-center space-y-3 lg:text-left">
            <div className="mx-auto lg:mx-0 w-14 h-14 bg-stone-950 text-white rounded-2xl flex items-center justify-center shadow-lg relative group">
              <Scissors className="w-6 h-6 text-[#fbbf24] transform group-hover:rotate-45 transition-transform duration-300" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-stone-950 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">✓</div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-950 tracking-tight">Seyon ERP</h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-extrabold mt-0.5">Apparel ERP & Logistics OS</p>
            </div>
            <div className="h-0.5 w-12 bg-stone-300 mx-auto lg:mx-0 rounded-full" />
            <p className="text-xs text-stone-600 font-medium leading-relaxed max-w-xs mx-auto lg:mx-0">
              Enter operator portal to adjust warehouse parameters, manage tenant listings, and audit stocks.
            </p>
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
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-600" /> Operator Username or Email
              </label>
              <input
                required
                type="text"
                placeholder="Username or email address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-stone-500/10 rounded-xl py-2 px-3.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-stone-600" /> Vault Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-stone-500/10 rounded-xl py-2 pl-3.5 pr-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs select-none">
              <label className="flex items-center gap-2 text-stone-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-stone-950 focus:ring-stone-500/10 cursor-pointer accent-stone-950 bg-stone-50"
                />
                <span>Remember me?</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-950 hover:bg-stone-900 disabled:bg-stone-950/50 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-stone-950/15 flex items-center justify-center gap-1.5 active:scale-[0.99] mt-6"
            >
              {loading ? "Aligning Threads..." : "Enter Fabric Workspace"}
              {!loading && <ArrowRight className="w-4 h-4 text-white" />}
            </button>
          </form>

          {/* Developer Quick Login Options */}
          {process.env.NODE_ENV === "development" && showDevMode && (
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Demo Quick Logins</span>
                <span className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded border border-stone-200">Dev Mode</span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    role: "Super Admin (Owner)",
                    user: "owner",
                    pass: "owner123",
                    comp: "syn",
                    desc: "Full access across all modules",
                    style: "border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                  },
                  {
                    role: "Store Manager",
                    user: "admin",
                    pass: "admin123",
                    comp: "syn",
                    desc: "Textile settings & catalog sync",
                    style: "border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                  },
                  {
                    role: "Warehouse Staff (Weaver)",
                    user: "operator",
                    pass: "operator123",
                    comp: "syn",
                    desc: "Restricted barcode & stock scan workflows",
                    style: "border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                  }
                ].map((profile) => (
                  <button
                    key={profile.role}
                    onClick={() => handleQuickLogin(profile.comp, profile.user, profile.pass)}
                    disabled={loading}
                    className={`w-full text-left p-3 border rounded-xl flex justify-between items-center transition-all ${profile.style}`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-stone-950">{profile.role}</span>
                      <span className="block text-[10px] text-stone-500 mt-0.5">{profile.desc}</span>
                    </div>
                    <span className="text-[10px] bg-stone-100 border border-stone-200 text-stone-700 font-mono px-2 py-0.5 rounded font-bold">
                      {profile.user}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {process.env.NODE_ENV === "development" && showDevModeToggle && (
            <div className="text-center pt-2">
              <button 
                onClick={() => setShowDevMode(!showDevMode)}
                className="text-[10px] font-bold text-stone-500 hover:text-stone-950 transition-colors uppercase tracking-wider"
              >
                {showDevMode ? "Hide Quick Logins" : "Show Quick Logins"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
