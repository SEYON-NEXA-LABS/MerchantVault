"use client";

import { useMemo } from "react";
import {
  Shirt,
  ShoppingBag,
  Gem,
  Watch,
  Glasses,
  Footprints,
  Crown,
  Scissors,
  Palette,
  Sparkles,
  Star,
  Zap,
  type LucideIcon
} from "lucide-react";

interface ProductThumbnailProps {
  imageUrl?: string;
  skuColor?: string;
  skuTitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  thumbnailConfig?: string | null;
}

// Clean color palettes: solid background + icon/text color
const COLOR_PALETTES: Record<string, { bg: string; icon: string; text: string }> = {
  red:    { bg: "bg-red-50",     icon: "text-red-400",     text: "text-red-700" },
  blue:   { bg: "bg-blue-50",    icon: "text-blue-400",    text: "text-blue-700" },
  green:  { bg: "bg-emerald-50", icon: "text-emerald-400", text: "text-emerald-700" },
  yellow: { bg: "bg-amber-50",   icon: "text-amber-400",   text: "text-amber-700" },
  orange: { bg: "bg-orange-50",  icon: "text-orange-400",  text: "text-orange-700" },
  purple: { bg: "bg-purple-50",  icon: "text-purple-400",  text: "text-purple-700" },
  pink:   { bg: "bg-pink-50",    icon: "text-pink-400",    text: "text-pink-700" },
  indigo: { bg: "bg-indigo-50",  icon: "text-indigo-400",  text: "text-indigo-700" },
  black:  { bg: "bg-gray-100",   icon: "text-gray-400",    text: "text-gray-700" },
  white:  { bg: "bg-slate-50",   icon: "text-slate-300",   text: "text-slate-600" },
  grey:   { bg: "bg-gray-50",    icon: "text-gray-400",    text: "text-gray-600" },
  gray:   { bg: "bg-gray-50",    icon: "text-gray-400",    text: "text-gray-600" },
  navy:   { bg: "bg-sky-50",     icon: "text-sky-400",     text: "text-sky-700" },
  beige:  { bg: "bg-amber-50",   icon: "text-amber-300",   text: "text-amber-700" },
};

// Deterministic icon selection based on product title hash
const PRODUCT_ICONS: LucideIcon[] = [
  Shirt, ShoppingBag, Gem, Watch, Glasses, Footprints,
  Crown, Scissors, Palette, Sparkles, Star, Zap
];

export default function ProductThumbnail({
  imageUrl,
  skuColor = "indigo",
  skuTitle = "Product",
  size = "md",
  className = "",
  thumbnailConfig
}: ProductThumbnailProps) {

  const sizeConfig = {
    sm: { container: "w-10 h-10 rounded-md",  iconSize: 14, textSize: "text-[8px]" },
    md: { container: "w-14 h-14 rounded-lg",  iconSize: 20, textSize: "text-[10px]" },
    lg: { container: "w-24 h-24 rounded-xl",  iconSize: 32, textSize: "text-xs" },
  };

  const cfg = sizeConfig[size];

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

  // Determine palette
  const palette = useMemo(() => {
    const colorKey = (parsedConfig?.color || skuColor).toLowerCase().trim();
    return COLOR_PALETTES[colorKey] || COLOR_PALETTES.indigo;
  }, [skuColor, parsedConfig]);

  // Deterministic icon pick from product title
  const IconComponent = useMemo(() => {
    const hash = skuTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PRODUCT_ICONS[hash % PRODUCT_ICONS.length];
  }, [skuTitle]);

  // Extract initials
  const initials = useMemo(() => {
    return skuTitle
      .split(" ")
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();
  }, [skuTitle]);

  const finalImageUrl = imageUrl || parsedConfig?.imageUrl;
  if (finalImageUrl) {
    return (
      <div className={`relative overflow-hidden border border-slate-200 flex-shrink-0 bg-white ${cfg.container} ${className}`}>
        <img
          src={finalImageUrl}
          alt={skuTitle}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden border border-slate-200/60 flex-shrink-0 flex flex-col items-center justify-center select-none ${palette.bg} ${cfg.container} ${className}`}
    >
      {/* Lucide icon as subtle backdrop */}
      <IconComponent
        className={`${palette.icon} opacity-30 absolute`}
        style={{ width: cfg.iconSize * 1.6, height: cfg.iconSize * 1.6 }}
        strokeWidth={1.2}
      />

      {/* Centered initials */}
      <span className={`relative z-10 font-bold ${palette.text} ${cfg.textSize} tracking-wide leading-none`}>
        {initials}
      </span>
    </div>
  );
}
