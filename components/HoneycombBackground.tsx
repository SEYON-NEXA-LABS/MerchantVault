"use client";

import React from "react";

interface HoneycombBackgroundProps {
  className?: string;
  patternColor?: string;
  glowColor?: string;
  ambientOpacity?: number;
  children?: React.ReactNode;
}

/**
 * HoneycombBackground
 * Renders a crisp, mathematical hexagonal/honeycomb SVG pattern overlay
 * inspired by the Seyon Nexa Labs hexagram logo architecture, featuring
 * subtle ambient gradients and soft radial lighting.
 */
export function HoneycombBackground({
  className = "",
  patternColor = "#0051d7", // Seyon Nexa Labs Signature Royal Electric Blue
  glowColor = "#0066ff",
  ambientOpacity = 0.22, // Increased for crisp, clear visibility
  children
}: HoneycombBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background radial glow accents matching Seyon Nexa Labs Brand Palette */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[400px] rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, #0051d740 0%, #0088f520 50%, transparent 80%)`,
        }}
      />
      <div 
        className="absolute top-1/4 -right-24 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, rgba(0, 136, 245, 0.25) 0%, transparent 70%)`,
        }}
      />
      <div 
        className="absolute top-1/2 -left-28 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, rgba(0, 73, 203, 0.22) 0%, transparent 70%)`,
        }}
      />

      {/* Repeating SVG Honeycomb Pattern matching user's exact dual-line spaced hexagon tile */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: ambientOpacity }}
      >
        <defs>
          {/* Gradient matching Seyon logo's light-to-deep blue transition */}
          <linearGradient id="seyon-hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0088f5" />
            <stop offset="50%" stopColor="#0051d7" />
            <stop offset="100%" stopColor="#003db3" />
          </linearGradient>

          {/*
            Exact geometric pattern from user's image:
            Hexagonal matrix composed of:
            - Regular hexagons
            - Chevron roofs / cube isometric top facets
            - Vertical pin stalks extending into cells with terminal circuit dots
            - Inverted chevron valleys with node vertex dots
            Tile geometry: Width = 64, Height = 96
          */}
          {/*
            Interlocking Hexagonal Grid Mesh:
            Regular hexagons arranged in a staggered triangular lattice.
            - Cell radius R = 32, width = sqrt(3)*R ≈ 55.4256, vertical repeat = 3*R = 96
            - Every hexagon corner (vertex) is joined by connecting lines.
            - Every vertex features a subtle circular joint node (node dot).
            - Includes isometric internal diagonals (triangulated mesh chords) connecting opposite vertices.
          */}
          <pattern
            id="honeycomb-grid"
            width="55.4256"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            {/* Base Hexagon outlines (Stroke Mesh) */}
            {/* Hexagon 1: Centered at (27.7128, 32) */}
            <polygon
              points="
                27.7128,0
                55.4256,16
                55.4256,48
                27.7128,64
                0,48
                0,16
              "
              fill="none"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />

            {/* Hexagon 2: Offset staggered row centered at (0, 80) and (55.4256, 80) */}
            <polygon
              points="
                0,48
                27.7128,64
                27.7128,96
                0,112
                -27.7128,96
                -27.7128,64
              "
              fill="none"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <polygon
              points="
                55.4256,48
                83.1384,64
                83.1384,96
                55.4256,112
                27.7128,96
                27.7128,64
              "
              fill="none"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />

            {/* Internal Isometric Mesh Lines joining opposite vertices */}
            {/* Vertical central chord */}
            <line
              x1="27.7128" y1="0"
              x2="27.7128" y2="64"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="1.0"
              strokeDasharray="2 3"
              opacity="0.75"
            />
            {/* Diagonal chords */}
            <line
              x1="0" y1="16"
              x2="55.4256" y2="48"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="0.9"
              opacity="0.6"
            />
            <line
              x1="0" y1="48"
              x2="55.4256" y2="16"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="0.9"
              opacity="0.6"
            />

            {/* Offset cell chords */}
            <line
              x1="0" y1="48"
              x2="0" y2="112"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="1.0"
              strokeDasharray="2 3"
              opacity="0.75"
            />
            <line
              x1="55.4256" y1="48"
              x2="55.4256" y2="112"
              stroke="url(#seyon-hex-gradient)"
              strokeWidth="1.0"
              strokeDasharray="2 3"
              opacity="0.75"
            />

            {/* Joined Hexagon Vertices (Nodes / Points at every line intersection) */}
            {/* Row 1 Vertices */}
            <circle cx="27.7128" cy="0" r="2.2" fill="#0088f5" />
            <circle cx="27.7128" cy="96" r="2.2" fill="#0088f5" />
            
            {/* Row 2 Vertices */}
            <circle cx="0" cy="16" r="2.2" fill="#0051d7" />
            <circle cx="55.4256" cy="16" r="2.2" fill="#0051d7" />

            {/* Center & Lateral Intersections */}
            <circle cx="27.7128" cy="32" r="2.5" fill="#0088f5" />
            <circle cx="0" cy="48" r="2.2" fill="#0051d7" />
            <circle cx="55.4256" cy="48" r="2.2" fill="#0051d7" />

            {/* Row 3 Vertices */}
            <circle cx="27.7128" cy="64" r="2.2" fill="#0088f5" />
            <circle cx="0" cy="80" r="2.5" fill="#0088f5" />
            <circle cx="55.4256" cy="80" r="2.5" fill="#0088f5" />
          </pattern>

          {/* Mask for soft edge vignette */}
          <radialGradient id="honeycomb-fade" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
          </radialGradient>
          <mask id="honeycomb-mask">
            <rect width="100%" height="100%" fill="url(#honeycomb-fade)" />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#honeycomb-grid)"
          mask="url(#honeycomb-mask)"
        />
      </svg>

      {/* Content wrapper with higher stacking index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
