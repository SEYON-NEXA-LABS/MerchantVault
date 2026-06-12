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
      }
    } catch (err: any) {
      setError("Failed to establish session. Please verify database connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fbf9f4] via-[#f5efe4] to-[#ebe1cf] relative overflow-hidden p-6 font-sans">
      {/* Abstract Flowing Textile Thread Waves */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100,300 C200,150 400,500 800,200 C1100,0 1400,250 1900,100" fill="none" stroke="url(#indigo-grad)" strokeWidth="2.5" strokeDasharray="6 4" />
        <path d="M-50,350 C250,200 450,450 850,250 C1150,50 1450,300 1850,150" fill="none" stroke="url(#amber-grad)" strokeWidth="1.5" />
        <path d="M-100,700 C400,900 600,500 1100,800 C1400,1000 1600,700 2000,850" fill="none" stroke="url(#indigo-grad)" strokeWidth="1.5" />
        <path d="M-50,750 C450,850 550,550 1050,750 C1350,950 1550,750 1950,800" fill="none" stroke="url(#amber-grad)" strokeWidth="1" strokeDasharray="3 3" />
        <defs>
          <linearGradient id="indigo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="amber-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Decorative Soft Blurry Ambient Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-amber-50/5 blur-[120px] pointer-events-none" />

      {/* Clean Subtle Grid Mesh representing Woven Fabric Structure */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(#2e1d0f 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px"
        }}
      />

      {/* Main Glassmorphic Login Card */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md border border-amber-900/10 rounded-2xl shadow-2xl p-8 z-10 space-y-6 transition-all hover:shadow-amber-900/5">
        
        {/* Seyon ERP Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 bg-indigo-950 text-[#fbf7f0] rounded-2xl flex items-center justify-center shadow-lg relative group">
            <Scissors className="w-6 h-6 text-amber-500 transform group-hover:rotate-45 transition-transform duration-300" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-950">✓</div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-950 tracking-tight">Seyon ERP</h1>
            <p className="text-[10px] text-amber-700 uppercase tracking-widest font-extrabold mt-0.5">Apparel ERP & Logistics OS</p>
          </div>
          <div className="h-0.5 w-12 bg-amber-500/30 mx-auto rounded-full" />
          <p className="text-xs text-indigo-900/60 font-medium leading-relaxed max-w-xs mx-auto">
            Weaving inventory tracking, vendor catalogs, and Seyon Bridge sync into a single unified fabric.
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
            <label className="text-[10px] font-bold text-indigo-950/60 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" /> Operator Username or Email
            </label>
            <input
              required
              type="text"
              placeholder="Username or email address"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#fdfbf9] border border-amber-950/15 focus:bg-white focus:ring-2 focus:ring-amber-500/10 rounded-xl py-2 px-3.5 text-sm text-indigo-950 focus:outline-none focus:border-amber-600 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-indigo-950/60 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" /> Vault Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fdfbf9] border border-amber-950/15 focus:bg-white focus:ring-2 focus:ring-amber-500/10 rounded-xl py-2 pl-3.5 pr-10 text-sm text-indigo-950 focus:outline-none focus:border-amber-600 font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-950/40 hover:text-amber-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs select-none">
            <label className="flex items-center gap-2 text-indigo-955/70 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-amber-950/15 text-indigo-950 focus:ring-amber-500/10 cursor-pointer accent-indigo-950"
              />
              <span>Remember me?</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-950 hover:bg-indigo-900 disabled:bg-indigo-900/50 text-[#fdfbf9] font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-950/15 flex items-center justify-center gap-1.5 active:scale-[0.99] mt-6"
          >
            {loading ? "Aligning Threads..." : "Enter Fabric Workspace"}
            {!loading && <ArrowRight className="w-4 h-4 text-amber-500" />}
          </button>
        </form>

        {/* Developer Quick Login Options */}
        {showDevMode && (
          <div className="pt-6 border-t border-amber-950/10 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-extrabold text-indigo-950/50 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Developer Quick Logins
              </h3>
            </div>
            <div className="space-y-2">
              {[
                {
                  role: "Superadmin (Owner)",
                  user: "superadmin",
                  pass: "super123",
                  comp: "syn",
                  desc: "Platform setups & billing panels",
                  style: "border-amber-950/10 hover:border-amber-500/30 hover:bg-amber-50/20"
                },
                {
                  role: "Tenant Admin (Manager)",
                  user: "admin",
                  pass: "admin123",
                  comp: "syn",
                  desc: "Textile settings & catalog sync",
                  style: "border-amber-950/10 hover:border-amber-500/30 hover:bg-amber-50/20"
                },
                {
                  role: "Warehouse Staff (Weaver)",
                  user: "operator",
                  pass: "operator123",
                  comp: "syn",
                  desc: "Restricted barcode & stock scan workflows",
                  style: "border-amber-950/10 hover:border-amber-500/30 hover:bg-amber-50/20"
                }
              ].map((profile) => (
                <button
                  key={profile.role}
                  onClick={() => handleQuickLogin(profile.comp, profile.user, profile.pass)}
                  disabled={loading}
                  className={`w-full text-left p-3 border rounded-xl flex justify-between items-center transition-all ${profile.style}`}
                >
                  <div>
                    <span className="block text-xs font-bold text-indigo-950">{profile.role}</span>
                    <span className="block text-[10px] text-indigo-950/60 mt-0.5">{profile.desc}</span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-950 font-mono px-2 py-0.5 rounded font-bold">
                    {profile.user}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showDevModeToggle && (
          <div className="text-center pt-2">
            <button 
              onClick={() => setShowDevMode(!showDevMode)}
              className="text-[10px] font-bold text-indigo-950/40 hover:text-amber-700 transition-colors uppercase tracking-wider"
            >
              {showDevMode ? "Hide Quick Logins" : "Show Quick Logins"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
