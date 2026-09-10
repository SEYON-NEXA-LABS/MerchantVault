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

// Clean lightweight inline SVG icons for social media
const InstagramIcon = ({ className = "w-4 h-4", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

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

  const socials = themeConfig?.socials || {};
  const currentYear = new Date().getFullYear();
  const storeDisplayName = company?.storeName || company?.name || "Seyon Shopping Store";
  const entityName = company?.name || "Seyon Shopping Partner";
  const tenantCode = company?.code || "syn";

  return (
    <footer style={{
      backgroundColor: "#09090b",
      color: "#a1a1aa",
      padding: "3.5rem 1.5rem 2rem 1.5rem",
      fontSize: "0.85rem",
      borderTop: "1px solid #27272a",
      marginTop: "auto"
    }}>
      {/* Value Proposition Highlights */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 3rem auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem",
        borderBottom: "1px solid #18181b",
        paddingBottom: "2.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            padding: "0.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "#18181b",
            color: "var(--primary, #0d9488)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Truck style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div>
            <span style={{ color: "#ffffff", fontWeight: "600", fontSize: "0.85rem", display: "block" }}>Fast Pan-India Delivery</span>
            <span style={{ color: "#71717a", fontSize: "0.75rem" }}>Real-time live tracked dispatch</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            padding: "0.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "#18181b",
            color: "var(--primary, #0d9488)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ShieldCheck style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div>
            <span style={{ color: "#ffffff", fontWeight: "600", fontSize: "0.85rem", display: "block" }}>100% Secure Checkout</span>
            <span style={{ color: "#71717a", fontSize: "0.75rem" }}>Encrypted UPI, Cards & NetBanking</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            padding: "0.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "#18181b",
            color: "var(--primary, #0d9488)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <RefreshCw style={{ width: "1.25rem", height: "1.25rem" }} />
          </div>
          <div>
            <span style={{ color: "#ffffff", fontWeight: "600", fontSize: "0.85rem", display: "block" }}>Hassle-Free Support</span>
            <span style={{ color: "#71717a", fontSize: "0.75rem" }}>Direct merchant resolution</span>
          </div>
        </div>
      </div>

      {/* Main Grid Columns */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "2.5rem",
        marginBottom: "2.5rem"
      }}>
        {/* Col 1: Brand & Socials */}
        <div>
          <h4 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: "700", margin: "0 0 0.5rem 0", letterSpacing: "-0.01em" }}>
            {storeDisplayName}
          </h4>
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.78rem", color: "#a1a1aa", lineHeight: 1.5 }}>
            Registered Business Entity: <strong style={{ color: "#e4e4e7" }}>{entityName}</strong>
          </p>
          <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.72rem", color: "#71717a" }}>
            Direct Verified Merchant Channel ({tenantCode})
          </p>

          {/* Social Links */}
          {(socials.instagram || socials.facebook || socials.twitter || socials.youtube || socials.linkedin) ? (
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#e4e4e7", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Connect With Us
              </span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.45rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "#18181b",
                      color: "#e4e4e7",
                      border: "1px solid #27272a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    title="Instagram"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e1306c"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#18181b"; e.currentTarget.style.color = "#e4e4e7"; }}
                  >
                    <InstagramIcon />
                  </a>
                )}
                {socials.facebook && (
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.45rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "#18181b",
                      color: "#e4e4e7",
                      border: "1px solid #27272a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    title="Facebook"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1877f2"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#18181b"; e.currentTarget.style.color = "#e4e4e7"; }}
                  >
                    <FacebookIcon />
                  </a>
                )}
                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.45rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "#18181b",
                      color: "#e4e4e7",
                      border: "1px solid #27272a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    title="X / Twitter"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#000000"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#18181b"; e.currentTarget.style.color = "#e4e4e7"; }}
                  >
                    <TwitterIcon />
                  </a>
                )}
                {socials.youtube && (
                  <a
                    href={socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.45rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "#18181b",
                      color: "#e4e4e7",
                      border: "1px solid #27272a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    title="YouTube"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ff0000"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#18181b"; e.currentTarget.style.color = "#e4e4e7"; }}
                  >
                    <YoutubeIcon />
                  </a>
                )}
                {socials.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.45rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "#18181b",
                      color: "#e4e4e7",
                      border: "1px solid #27272a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    title="LinkedIn"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a66c2"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#18181b"; e.currentTarget.style.color = "#e4e4e7"; }}
                  >
                    <LinkedinIcon />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "#71717a" }}>Official merchant verified catalog</span>
          )}
        </div>

        {/* Col 2: Brands Portfolio */}
        <div>
          <h5 style={{ color: "#ffffff", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.75rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Store Brands
          </h5>
          {brands && brands.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {onSelectBrand && (
                <button
                  type="button"
                  onClick={() => onSelectBrand("")}
                  style={{
                    backgroundColor: !selectedBrand ? "var(--primary, #0d9488)" : "#18181b",
                    color: !selectedBrand ? "#ffffff" : "#d4d4d8",
                    fontSize: "0.72rem",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #27272a",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  All Brands
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
                      backgroundColor: isSelected ? "var(--primary, #0d9488)" : "#18181b",
                      color: isSelected ? "#ffffff" : "#d4d4d8",
                      fontSize: "0.72rem",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #27272a",
                      cursor: onSelectBrand ? "pointer" : "default",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#71717a", lineHeight: 1.5 }}>
              Direct unified merchandise catalog from verified central warehouses.
            </p>
          )}
        </div>

        {/* Col 3: Legal & Corporate Registrations */}
        <div>
          <h5 style={{ color: "#ffffff", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.75rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Corporate Details
          </h5>
          <div style={{ fontSize: "0.78rem", color: "#a1a1aa", lineHeight: 1.8 }}>
            {company?.gstin ? (
              <p style={{ margin: 0 }}>
                GSTIN: <span style={{ color: "#e4e4e7", fontFamily: "monospace", fontWeight: "600" }}>{company.gstin}</span>
              </p>
            ) : null}
            {company?.taxId ? (
              <p style={{ margin: 0 }}>
                Tax ID / PAN: <span style={{ color: "#e4e4e7", fontFamily: "monospace", fontWeight: "600" }}>{company.taxId}</span>
              </p>
            ) : null}
            {!company?.gstin && !company?.taxId && (
              <p style={{ margin: 0, color: "#71717a" }}>Verified Indian Business Merchant</p>
            )}
            <p style={{ margin: "0.5rem 0 0 0", color: "#71717a", fontSize: "0.72rem" }}>
              Compliant Invoicing & Direct Tax Calculation Active
            </p>
          </div>
        </div>

        {/* Col 4: Customer Support */}
        <div>
          <h5 style={{ color: "#ffffff", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.75rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Customer Support
          </h5>
          <div style={{ fontSize: "0.78rem", color: "#a1a1aa", lineHeight: 1.8 }}>
            {company?.contactEmail ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <Mail style={{ width: "0.9rem", height: "0.9rem", color: "#71717a" }} />
                <a 
                  href={`mailto:${company.contactEmail}`}
                  style={{ color: "#e4e4e7", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {company.contactEmail}
                </a>
              </div>
            ) : null}

            {company?.whatsappNumber ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <Phone style={{ width: "0.9rem", height: "0.9rem", color: "#22c55e" }} />
                <a 
                  href={`https://wa.me/${company.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20have%20an%20order%20inquiry`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#e4e4e7", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  WhatsApp: {company.whatsappNumber}
                </a>
              </div>
            ) : null}

            {!company?.contactEmail && !company?.whatsappNumber && (
              <p style={{ margin: 0, color: "#71717a" }}>Support available via Merchant Helpdesk</p>
            )}
            <p style={{ margin: "0.5rem 0 0 0", color: "#71717a", fontSize: "0.72rem" }}>
              Standard Response Window: 10:00 AM – 7:00 PM IST
            </p>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        borderTop: "1px solid #18181b",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
        paddingTop: "1.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#71717a" }}>
            © {currentYear} {storeDisplayName}. All rights reserved.
          </p>
          <Link 
            href="/platform" 
            target="_blank"
            style={{ 
              fontSize: "0.68rem", 
              color: "#71717a", 
              borderLeft: "1px solid #27272a", 
              paddingLeft: "0.5rem", 
              textDecoration: "none", 
              transition: "color 0.15s ease" 
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
          >
            Powered by <strong style={{ color: "#e4e4e7" }}>Seyon Shopping</strong> ↗
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.75rem", color: "#71717a" }}>
          <span style={{ cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}>Privacy Policy</span>
          <span style={{ cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}>Terms of Service</span>
          <a 
            href="/dashboard" 
            style={{ color: "#71717a", textDecoration: "none", transition: "color 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
          >
            Merchant Portal ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
