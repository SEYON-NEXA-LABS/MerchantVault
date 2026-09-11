"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  Truck, 
  Flame, 
  Clock, 
  Gift, 
  Tag 
} from "lucide-react";

export interface HeroConfig {
  template?: "editorial" | "flash_drop" | "festive" | "media_showcase" | "default";
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  bannerImageUrl?: string;
  overlayOpacity?: number;
  alignment?: "left" | "center";
}

interface StorefrontHeroProps {
  company?: any;
  activeBrandObj?: any;
  onCtaClick?: () => void;
}

export function StorefrontHero({ company, activeBrandObj, onCtaClick }: StorefrontHeroProps) {
  // Resolve themeConfig from brand or company
  let themeConfig: any = null;
  const rawTheme = activeBrandObj?.themeConfig || company?.themeConfig;
  if (rawTheme) {
    try {
      themeConfig = typeof rawTheme === "string" ? JSON.parse(rawTheme) : rawTheme;
    } catch (e) {
      // ignore
    }
  }

  const hero: HeroConfig = themeConfig?.hero || {};
  const template = hero.template || "editorial";
  const alignment = hero.alignment || (template === "flash_drop" || template === "media_showcase" ? "left" : "center");

  // Defaults based on company / brand context
  const companyDisplayName = activeBrandObj?.name || company?.name || company?.storeName || "Storefront";
  const badgeText = hero.badgeText || (
    template === "flash_drop" 
      ? "⚡ LIMITED RUN — LIVE CATALOG DROP" 
      : template === "festive" 
      ? "✨ GRAND FESTIVE COLLECTION" 
      : template === "media_showcase"
      ? "EDITORIAL CAMPAIGN 2026"
      : "0% Commission Direct Verified Storefront"
  );

  const headline = hero.headline || (
    template === "flash_drop"
      ? "The Heavyweight Streetwear Drop"
      : template === "festive"
      ? "Celebrate Traditions In Timeless Splendor"
      : template === "media_showcase"
      ? "Uncompromising Quality & Everyday Elegance"
      : `Premium Products from ${companyDisplayName}`
  );

  const subheadline = hero.subheadline || (
    template === "flash_drop"
      ? "Precision-crafted oversized fits, heavyweight French terry cotton, and drop-shoulder silhouettes. Live inventory tracking active."
      : template === "festive"
      ? "Handwoven Chanderi silks, zardozi embroidery, and regal festive ensembles dispatched directly from verified central warehouses."
      : template === "media_showcase"
      ? "Explore our latest campaign lookbook engineered with high-grade textiles, durable finishing, and all-day comfort."
      : "Direct manufacturer catalog linked to real-time central warehouse inventory. Zero middlemen, instant order dispatch."
  );

  const ctaText = hero.ctaText || (template === "festive" ? "Shop Festive Specials" : template === "flash_drop" ? "Claim Your Size" : "Explore Catalog");
  const ctaLink = hero.ctaLink || "#catalog";
  const secondaryCtaText = hero.secondaryCtaText || "Direct Cart";
  const secondaryCtaLink = hero.secondaryCtaLink || "/cart";
  const bannerImageUrl = hero.bannerImageUrl?.trim();
  const overlayOpacity = typeof hero.overlayOpacity === "number" ? hero.overlayOpacity : 0.5;

  const isLeftAligned = alignment === "left";

  // Template 1: Full-Bleed Media Showcase (with background image or lookbook backdrop)
  if (template === "media_showcase" || bannerImageUrl) {
    const bgUrl = bannerImageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80";
    return (
      <section style={{
        position: "relative",
        minHeight: "520px",
        display: "flex",
        alignItems: "center",
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderBottom: "1px solid #27272a",
        padding: "4.5rem 1.5rem",
        overflow: "hidden"
      }}>
        {/* Dark Adjustable Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgba(9, 9, 11, ${overlayOpacity})`,
          backdropFilter: "blur(2px)",
          zIndex: 1
        }} />

        {/* Content Container */}
        <div style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          justifyContent: isLeftAligned ? "flex-start" : "center"
        }}>
          <div style={{
            maxWidth: "680px",
            textAlign: isLeftAligned ? "left" : "center",
            backgroundColor: "rgba(9, 9, 11, 0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "1rem",
            padding: "2.5rem 2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#f4f4f5",
              fontSize: "0.75rem",
              fontWeight: "600",
              padding: "0.3rem 0.8rem",
              borderRadius: "9999px",
              marginBottom: "1.25rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}>
              <Sparkles style={{ width: "0.85rem", height: "0.85rem", color: "var(--primary, #2dd4bf)" }} />
              <span>{badgeText}</span>
            </div>

            <h1 style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: "800",
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: "0 0 1rem 0"
            }}>
              {headline}
            </h1>

            <p style={{
              fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
              color: "#d4d4d8",
              lineHeight: 1.6,
              margin: "0 0 2rem 0"
            }}>
              {subheadline}
            </p>

            <div style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: isLeftAligned ? "flex-start" : "center"
            }}>
              <a
                href={ctaLink}
                onClick={onCtaClick}
                style={{
                  backgroundColor: "var(--primary, #0d9488)",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "var(--radius, 0.5rem)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.4)",
                  transition: "all 0.15s ease"
                }}
              >
                {ctaText} <ArrowRight style={{ width: "1rem", height: "1rem" }} />
              </a>

              <Link
                href={secondaryCtaLink}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  textDecoration: "none",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "var(--radius, 0.5rem)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.15s ease"
                }}
              >
                <ShoppingBag style={{ width: "1rem", height: "1rem" }} /> {secondaryCtaText}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Template 2: High-Conversion Flash Drop (Streetwear / Urgency)
  if (template === "flash_drop") {
    return (
      <section style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#09090b",
        color: "#ffffff",
        borderBottom: "1px solid #27272a",
        padding: "4.5rem 1.5rem"
      }}>
        {/* Neon Ambient Grid */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.6,
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />

        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "3rem",
          alignItems: "center"
        }}>
          {/* Left Column: Urgency & Headlines */}
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#f87171",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              marginBottom: "1.25rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}>
              <Flame style={{ width: "0.9rem", height: "0.9rem", color: "#ef4444" }} />
              <span>{badgeText}</span>
            </div>

            <h1 style={{
              fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
              fontWeight: "900",
              color: "#ffffff",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              margin: "0 0 1.25rem 0",
              textTransform: "uppercase"
            }}>
              {headline}
            </h1>

            <p style={{
              fontSize: "1rem",
              color: "#a1a1aa",
              lineHeight: 1.6,
              margin: "0 0 2rem 0",
              maxWidth: "520px"
            }}>
              {subheadline}
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href={ctaLink}
                onClick={onCtaClick}
                style={{
                  backgroundColor: "var(--primary, #6366f1)",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "0.85rem 1.85rem",
                  borderRadius: "var(--radius, 0.5rem)",
                  fontWeight: "800",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5)",
                  transition: "all 0.15s ease"
                }}
              >
                {ctaText} <ArrowRight style={{ width: "1rem", height: "1rem" }} />
              </a>

              <Link
                href={secondaryCtaLink}
                style={{
                  backgroundColor: "#18181b",
                  color: "#e4e4e7",
                  textDecoration: "none",
                  border: "1px solid #27272a",
                  padding: "0.85rem 1.5rem",
                  borderRadius: "var(--radius, 0.5rem)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <ShoppingBag style={{ width: "1rem", height: "1rem" }} /> {secondaryCtaText}
              </Link>
            </div>
          </div>

          {/* Right Column: Live Inventory Drop Card */}
          <div style={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Drop Status
              </span>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: "700",
                backgroundColor: "#22c55e",
                color: "#052e16",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px"
              }}>
                ● LIVE SYNC
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "0.5rem",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <Clock style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b", flexShrink: 0 }} />
                <div>
                  <div style={{ color: "#ffffff", fontWeight: "700", fontSize: "0.85rem" }}>Express Central Dispatch</div>
                  <div style={{ color: "#71717a", fontSize: "0.75rem" }}>Orders packed & dispatched within 24 hours</div>
                </div>
              </div>

              <div style={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "0.5rem",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <Tag style={{ width: "1.25rem", height: "1.25rem", color: "#6366f1", flexShrink: 0 }} />
                <div>
                  <div style={{ color: "#ffffff", fontWeight: "700", fontSize: "0.85rem" }}>Zero Intermediary Markup</div>
                  <div style={{ color: "#71717a", fontSize: "0.75rem" }}>Direct warehouse rates with 0% platform surcharge</div>
                </div>
              </div>

              <div style={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "0.5rem",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <Zap style={{ width: "1.25rem", height: "1.25rem", color: "#22c55e", flexShrink: 0 }} />
                <div>
                  <div style={{ color: "#ffffff", fontWeight: "700", fontSize: "0.85rem" }}>Guaranteed Stock Registry</div>
                  <div style={{ color: "#71717a", fontSize: "0.75rem" }}>Instant inventory hold upon checkout</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Template 3: Seasonal Festive & Celebration Sale
  if (template === "festive") {
    return (
      <section style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #450a0a 0%, #18181b 50%, #451a03 100%)",
        color: "#ffffff",
        borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
        padding: "5rem 1.5rem",
        textAlign: "center"
      }}>
        {/* Warm Golden Ambient Glow */}
        <div style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "550px",
          height: "350px",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(220, 38, 38, 0.1) 45%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "780px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            color: "#fbbf24",
            fontSize: "0.75rem",
            fontWeight: "700",
            padding: "0.35rem 0.95rem",
            borderRadius: "9999px",
            marginBottom: "1.5rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            <Gift style={{ width: "0.9rem", height: "0.9rem", color: "#fbbf24" }} />
            <span>{badgeText}</span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: "900",
            color: "#ffffff",
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            margin: "0 0 1.25rem 0"
          }}>
            {headline}
          </h1>

          <p style={{
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            color: "#e4e4e7",
            lineHeight: 1.6,
            maxWidth: "600px",
            margin: "0 auto 2.25rem auto"
          }}>
            {subheadline}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <a
              href={ctaLink}
              onClick={onCtaClick}
              style={{
                backgroundColor: "#f59e0b",
                color: "#18181b",
                textDecoration: "none",
                padding: "0.85rem 2rem",
                borderRadius: "var(--radius, 0.5rem)",
                fontWeight: "800",
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)",
                transition: "all 0.15s ease"
              }}
            >
              {ctaText} <ArrowRight style={{ width: "1rem", height: "1rem" }} />
            </a>

            <Link
              href={secondaryCtaLink}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                textDecoration: "none",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                padding: "0.85rem 1.65rem",
                borderRadius: "var(--radius, 0.5rem)",
                fontWeight: "700",
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backdropFilter: "blur(8px)"
              }}
            >
              <ShoppingBag style={{ width: "1rem", height: "1rem" }} /> {secondaryCtaText}
            </Link>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            fontSize: "0.78rem",
            color: "#fcd34d",
            fontWeight: "600"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 style={{ width: "0.9rem", height: "0.9rem" }} /> Authentic Handloom Quality
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Truck style={{ width: "0.9rem", height: "0.9rem" }} /> Express Pan-India Delivery
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Zap style={{ width: "0.9rem", height: "0.9rem" }} /> Ready Stock Dispatch
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Template 4: Minimalist Editorial (Default clean high-end fashion)
  return (
    <section className="hero-section-container">
      <div className="hero-ambient-glow" />
      <div className="hero-grid-pattern" />

      <div className="hero-content-wrapper" style={{ textAlign: isLeftAligned ? "left" : "center" }}>
        <div className="hero-badge-pill">
          <Sparkles style={{ width: "0.85rem", height: "0.85rem", color: "var(--primary, #0d9488)" }} />
          <span>{badgeText}</span>
        </div>

        <h2 className="hero-main-heading">
          <span className="hero-main-heading-gradient">
            {headline}
          </span>
        </h2>

        <p className="hero-subtitle-text" style={{ margin: isLeftAligned ? "0 0 2rem 0" : "0 auto 2.25rem auto" }}>
          {subheadline}
        </p>

        <div className="hero-cta-group" style={{ justifyContent: isLeftAligned ? "flex-start" : "center" }}>
          <a href={ctaLink} onClick={onCtaClick} className="hero-cta-btn-primary">
            {ctaText} <ArrowRight style={{ width: "0.95rem", height: "0.95rem" }} />
          </a>
          <Link href={secondaryCtaLink} className="hero-cta-btn-secondary">
            <ShoppingBag style={{ width: "0.95rem", height: "0.95rem" }} /> {secondaryCtaText}
          </Link>
        </div>

        <div className="hero-trust-bar" style={{ justifyContent: isLeftAligned ? "flex-start" : "center" }}>
          <div className="hero-trust-item">
            <Zap style={{ width: "0.85rem", height: "0.85rem" }} /> Real-Time Stock Sync
          </div>
          <div className="hero-trust-item">
            <CheckCircle2 style={{ width: "0.85rem", height: "0.85rem" }} /> Zero Overselling Guarantee
          </div>
          <div className="hero-trust-item">
            <Truck style={{ width: "0.85rem", height: "0.85rem" }} /> Direct Fulfillment
          </div>
        </div>
      </div>
    </section>
  );
}
