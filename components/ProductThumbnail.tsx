"use client";

import { useMemo } from "react";

interface ProductThumbnailProps {
  imageUrl?: string;
  skuColor?: string;
  skuTitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  thumbnailConfig?: string | null;
}

// Map common colors to beautiful, curated HSL gradient palettes
const COLOR_PALETTES: Record<string, { from: string; to: string; text: string; bg: string }> = {
  red: { from: "from-red-500", to: "to-rose-600", text: "text-red-950", bg: "bg-red-100" },
  blue: { from: "from-blue-500", to: "to-cyan-600", text: "text-blue-950", bg: "bg-blue-100" },
  green: { from: "from-emerald-500", to: "to-teal-600", text: "text-emerald-950", bg: "bg-emerald-100" },
  yellow: { from: "from-amber-400", to: "to-orange-500", text: "text-amber-950", bg: "bg-amber-100" },
  orange: { from: "from-orange-500", to: "to-red-600", text: "text-orange-950", bg: "bg-orange-100" },
  purple: { from: "from-purple-500", to: "to-indigo-600", text: "text-purple-950", bg: "bg-purple-100" },
  pink: { from: "from-pink-500", to: "to-rose-500", text: "text-pink-950", bg: "bg-pink-100" },
  indigo: { from: "from-indigo-500", to: "to-violet-600", text: "text-indigo-950", bg: "bg-indigo-100" },
  black: { from: "from-gray-800", to: "to-black", text: "text-gray-250", bg: "bg-gray-800" },
  white: { from: "from-slate-100", to: "to-slate-300", text: "text-slate-800", bg: "bg-slate-100" },
  grey: { from: "from-gray-400", to: "to-slate-600", text: "text-gray-900", bg: "bg-gray-100" },
  gray: { from: "from-gray-400", to: "to-slate-600", text: "text-gray-900", bg: "bg-gray-100" },
  navy: { from: "from-sky-900", to: "to-slate-900", text: "text-sky-100", bg: "bg-sky-950" }
};

export default function ProductThumbnail({
  imageUrl,
  skuColor = "indigo",
  skuTitle = "Product",
  size = "md",
  className = "",
  thumbnailConfig
}: ProductThumbnailProps) {
  
  // Size dimensions map
  const sizeClasses = {
    sm: "w-10 h-10 text-[9px] rounded-md",
    md: "w-14 h-14 text-[11px] rounded-lg",
    lg: "w-24 h-24 text-sm rounded-xl"
  };

  // Extract initials
  const initials = useMemo(() => {
    return skuTitle
      .split(" ")
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();
  }, [skuTitle]);

  // Parse persisted config if available
  const parsedConfig = useMemo(() => {
    if (!thumbnailConfig) return null;
    try {
      return JSON.parse(thumbnailConfig);
    } catch (e) {
      console.error("Failed to parse thumbnail config", e);
      return null;
    }
  }, [thumbnailConfig]);

  // Determine dynamic gradient palette based on SKU color or custom config
  const palette = useMemo(() => {
    if (parsedConfig?.from && parsedConfig?.to && parsedConfig?.text) {
      return {
        from: parsedConfig.from,
        to: parsedConfig.to,
        text: parsedConfig.text,
        bg: parsedConfig.bg || "bg-indigo-100"
      };
    }
    const colorKey = (parsedConfig?.color || skuColor).toLowerCase().trim();
    return COLOR_PALETTES[colorKey] || COLOR_PALETTES.indigo;
  }, [skuColor, parsedConfig]);

  // Generate stable random offsets/sizes for circles based on the skuTitle string hash
  const randomShapes = useMemo(() => {
    const hash = skuTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = 3;
    const shapesList = [];
    for (let i = 0; i < count; i++) {
      const shapeSize = 30 + ((hash + i * 13) % 40); // 30px to 70px
      const top = ((hash * (i + 1)) % 70); // 0% to 70%
      const left = ((hash + i * 27) % 70); // 0% to 70%
      const opacity = 0.15 + ((hash + i) % 3) * 0.1; // 0.15 to 0.35
      shapesList.push({ size: shapeSize, top, left, opacity });
    }
    return shapesList;
  }, [skuTitle]);

  // Use stored shapes if present, otherwise default to random shapes list
  const shapes = useMemo(() => {
    if (Array.isArray(parsedConfig?.shapes)) {
      return parsedConfig.shapes;
    }
    return randomShapes;
  }, [randomShapes, parsedConfig]);

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden border border-slate-200 flex-shrink-0 bg-white ${sizeClasses[size]} ${className}`}>
        <img 
          src={imageUrl} 
          alt={skuTitle} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // If no imageUrl, render default vector circle blended thumbnail
  return (
    <div 
      className={`relative overflow-hidden border border-slate-200/60 flex-shrink-0 flex items-center justify-center font-bold shadow-inner transition-all select-none ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: "#f8fafc" // fallback background
      }}
    >
      {/* Background vector circles (Shutterstock masked design) */}
      <div 
        className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-25"
        style={{
          backgroundImage: `url('https://www.shutterstock.com/shutterstock/photos/220641787/display_1500/stock-vector-set-of-circles-220641787.jpg')`
        }}
      />

      {/* Dynamic SKU-Color theme overlay gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.from} ${palette.to} opacity-30 mix-blend-color-burn`} />

      {/* Layered random geometric shapes */}
      {shapes.map((shape: any, idx: number) => (
        <div
          key={idx}
          className={`absolute rounded-full bg-gradient-to-tr ${palette.from} ${palette.to}`}
          style={{
            width: `${shape.size}%`,
            height: `${shape.size}%`,
            top: `${shape.top}%`,
            left: `${shape.left}%`,
            opacity: shape.opacity,
            filter: "blur(2px)"
          }}
        />
      ))}

      {/* Centered SKU text identifier */}
      <div className={`relative z-10 font-extrabold tracking-wider ${palette.text} drop-shadow-sm flex flex-col items-center justify-center leading-none`}>
        <span>{initials}</span>
        {size === "lg" && (
          <span className="text-[10px] opacity-75 font-semibold mt-1 uppercase">
            {skuColor}
          </span>
        )}
      </div>

      {/* Subtle border shine */}
      <div className="absolute inset-0 border border-white/20 rounded-md pointer-events-none" />
    </div>
  );
}
