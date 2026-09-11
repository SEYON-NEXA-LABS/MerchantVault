"use client";

import React from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  ExternalLink 
} from "lucide-react";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
  LinkedinIcon
} from "@/components/icons";

interface StorefrontFooterProps {
  company: any;
  brands?: any[];
  selectedBrand?: string;
  onSelectBrand?: (brandCode: string) => void;
}

export function StorefrontFooter({ company, brands = [], selectedBrand = "", onSelectBrand }: StorefrontFooterProps) {
  let themeConfig: any = null;
  if (company?.themeConfig) {
    try {
      themeConfig = typeof company.themeConfig === "string" 
        ? JSON.parse(company.themeConfig) 
        : company.themeConfig;
    } catch (e) {
      // ignore parse error
    }
  }

  const footerTheme = themeConfig?.footerTheme || "light";
  const isLight = footerTheme === "light";
  const socials = themeConfig?.socials || {};

  const colors = {
    bg: isLight ? "#f8fafc" : "#09090b",
    text: isLight ? "#64748b" : "#a1a1aa",
    heading: isLight ? "#0f172a" : "#ffffff",
    border: isLight ? "#e2e8f0" : "#27272a",
    subBorder: isLight ? "#e2e8f0" : "#18181b",
    cardBg: isLight ? "#ffffff" : "#18181b",
    accentText: isLight ? "#0f172a" : "#e4e4e7",
    subText: isLight ? "#64748b" : "#71717a",
    socialBg: isLight ? "#ffffff" : "#18181b",
    socialBorder: isLight ? "#e2e8f0" : "#27272a",
    socialColor: isLight ? "#334155" : "#e4e4e7",
  };

  const currentYear = new Date().getFullYear();
  const storeDisplayName = company?.name || company?.storeName || "Storefront";
  const entityName = company?.name || "MerchantVault Partner";
  const tenantCode = company?.code || "mv";

  const socialLinks = [
    { name: "Instagram", url: socials.instagram || "https://instagram.com", icon: InstagramIcon, hoverBg: "#e1306c" },
    { name: "Facebook", url: socials.facebook || "https://facebook.com", icon: FacebookIcon, hoverBg: "#1877f2" },
    { name: "X / Twitter", url: socials.twitter || "https://x.com", icon: TwitterIcon, hoverBg: "#000000" },
    { name: "YouTube", url: socials.youtube || "https://youtube.com", icon: YoutubeIcon, hoverBg: "#ff0000" },
    { name: "LinkedIn", url: socials.linkedin || "https://linkedin.com", icon: LinkedinIcon, hoverBg: "#0a66c2" },
  ];

  return (
    <footer style={{
      backgroundColor: colors.bg,
      color: colors.text,
      padding: "2.5rem 1.5rem 1.75rem 1.5rem",
      fontSize: "0.85rem",
      borderTop: `1px solid ${colors.border}`,
      marginTop: "auto",
      transition: "background-color 0.2s ease, color 0.2s ease"
    }}>
      {/* Lean Trust Highlights */}
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto 2rem auto",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem",
        borderBottom: `1px solid ${colors.subBorder}`,
        paddingBottom: "1.75rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Truck style={{ width: "1.1rem", height: "1.1rem", color: "var(--primary, #0d9488)" }} />
          <span style={{ color: colors.heading, fontWeight: "600", fontSize: "0.82rem" }}>Fast Pan-India Delivery</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <ShieldCheck style={{ width: "1.1rem", height: "1.1rem", color: "var(--primary, #0d9488)" }} />
          <span style={{ color: colors.heading, fontWeight: "600", fontSize: "0.82rem" }}>100% Secure Payments</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <RefreshCw style={{ width: "1.1rem", height: "1.1rem", color: "var(--primary, #0d9488)" }} />
          <span style={{ color: colors.heading, fontWeight: "600", fontSize: "0.82rem" }}>Direct Merchant Support</span>
        </div>
      </div>

      {/* Main Grid: Clean & Compact */}
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "2rem",
        marginBottom: "2rem"
      }}>
        {/* Brand & Socials */}
        <div>
          <h4 style={{ color: colors.heading, fontSize: "1.05rem", fontWeight: "700", margin: "0 0 0.35rem 0", letterSpacing: "-0.01em" }}>
            {storeDisplayName}
          </h4>
          {entityName !== storeDisplayName && (
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.75rem", color: colors.subText }}>
              by {entityName}
            </p>
          )}

          {/* Social Links */}
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
            {socialLinks.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.45rem",
                    borderRadius: "0.375rem",
                    backgroundColor: colors.socialBg,
                    color: colors.socialColor,
                    border: `1px solid ${colors.socialBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    boxShadow: isLight ? "0 1px 2px rgba(0,0,0,0.04)" : "none"
                  }}
                  title={item.name}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = item.hoverBg; 
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = item.hoverBg;
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = colors.socialBg; 
                    e.currentTarget.style.color = colors.socialColor;
                    e.currentTarget.style.borderColor = colors.socialBorder;
                  }}
                >
                  <IconComponent />
                </a>
              );
            })}
          </div>
        </div>

        {/* Store Brands */}
        {brands && brands.length > 0 && (
          <div>
            <h5 style={{ color: colors.heading, fontSize: "0.78rem", fontWeight: "700", margin: "0 0 0.6rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Brands
            </h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {onSelectBrand && (
                <button
                  type="button"
                  onClick={() => onSelectBrand("")}
                  style={{
                    backgroundColor: !selectedBrand ? "var(--primary, #0d9488)" : colors.cardBg,
                    color: !selectedBrand ? "#ffffff" : colors.text,
                    fontSize: "0.72rem",
                    padding: "0.25rem 0.55rem",
                    borderRadius: "0.25rem",
                    border: `1px solid ${colors.border}`,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  All
                </button>
              )}
              {brands.map((b: any) => {
                const isSelected = selectedBrand?.toLowerCase() === b.code?.toLowerCase();
                return (
                  <button
                    key={b.id || b.code}
                    type="button"
                    onClick={() => onSelectBrand ? onSelectBrand(isSelected ? "" : b.code) : undefined}
                    style={{
                      backgroundColor: isSelected ? "var(--primary, #0d9488)" : colors.cardBg,
                      color: isSelected ? "#ffffff" : colors.text,
                      fontSize: "0.72rem",
                      padding: "0.25rem 0.55rem",
                      borderRadius: "0.25rem",
                      border: `1px solid ${colors.border}`,
                      cursor: onSelectBrand ? "pointer" : "default",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Corporate Details */}
        {(company?.gstin || company?.taxId) && (
          <div>
            <h5 style={{ color: colors.heading, fontSize: "0.78rem", fontWeight: "700", margin: "0 0 0.6rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Business Info
            </h5>
            <div style={{ fontSize: "0.75rem", color: colors.subText, lineHeight: 1.6 }}>
              {company?.gstin && (
                <p style={{ margin: 0 }}>
                  GSTIN: <span style={{ color: colors.heading, fontFamily: "monospace", fontWeight: "600" }}>{company.gstin}</span>
                </p>
              )}
              {company?.taxId && (
                <p style={{ margin: 0 }}>
                  PAN: <span style={{ color: colors.heading, fontFamily: "monospace", fontWeight: "600" }}>{company.taxId}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Customer Support */}
        <div>
          <h5 style={{ color: colors.heading, fontSize: "0.78rem", fontWeight: "700", margin: "0 0 0.6rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Contact & Support
          </h5>
          <div style={{ fontSize: "0.78rem", lineHeight: 1.7 }}>
            {company?.contactEmail && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.25rem" }}>
                <Mail style={{ width: "0.85rem", height: "0.85rem", color: colors.subText }} />
                <a 
                  href={`mailto:${company.contactEmail}`}
                  style={{ color: colors.heading, textDecoration: "none", fontWeight: "500" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {company.contactEmail}
                </a>
              </div>
            )}

            {company?.whatsappNumber && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <Phone style={{ width: "0.85rem", height: "0.85rem", color: "#16a34a" }} />
                <a 
                  href={`https://wa.me/${company.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20have%20an%20order%20inquiry`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: colors.heading, textDecoration: "none", fontWeight: "500" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  WhatsApp Support
                </a>
              </div>
            )}

            {!company?.contactEmail && !company?.whatsappNumber && (
              <span style={{ color: colors.subText, fontSize: "0.75rem" }}>Support via Helpdesk</span>
            )}
          </div>
        </div>
      </div>

      {/* Subfooter: Minimal single line */}
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        borderTop: `1px solid ${colors.subBorder}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
        paddingTop: "1.25rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: colors.subText }}>
            © {currentYear} {storeDisplayName}
          </span>
          <Link 
            href="/platform" 
            target="_blank"
            style={{ 
              fontSize: "0.68rem", 
              color: colors.subText, 
              borderLeft: `1px solid ${colors.border}`, 
              paddingLeft: "0.5rem", 
              textDecoration: "none", 
              transition: "color 0.15s ease" 
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.heading)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.subText)}
          >
            Powered by <strong style={{ color: colors.heading }}>MerchantVault</strong> by Seyon Nexa Labs ↗
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", color: colors.subText }}>
          <span style={{ cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.color = colors.heading)} onMouseLeave={(e) => (e.currentTarget.style.color = colors.subText)}>Privacy</span>
          <span style={{ cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.color = colors.heading)} onMouseLeave={(e) => (e.currentTarget.style.color = colors.subText)}>Terms</span>
          <a 
            href="/dashboard" 
            style={{ color: colors.subText, textDecoration: "none", transition: "color 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.heading)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.subText)}
          >
            Merchant Portal ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
