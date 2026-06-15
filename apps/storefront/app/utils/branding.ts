export function isDarkColor(colorName: string) {
  const normalized = (colorName || "").toLowerCase();
  return (
    normalized.includes("black") ||
    normalized.includes("charcoal") ||
    normalized.includes("navy") ||
    normalized.includes("rose") ||
    normalized.includes("crimson") ||
    normalized.includes("indigo") ||
    normalized.includes("olive") ||
    normalized.startsWith("#0") ||
    normalized.startsWith("#1") ||
    normalized.startsWith("#2") ||
    normalized.startsWith("#3")
  );
}

export function applyBrandingStyles(company: any, activeBrand: any) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;

  let theme: any = null;
  if (activeBrand?.themeConfig) {
    theme = typeof activeBrand.themeConfig === "string" ? JSON.parse(activeBrand.themeConfig) : activeBrand.themeConfig;
  }
  if (!theme && company?.themeConfig) {
    theme = typeof company.themeConfig === "string" ? JSON.parse(company.themeConfig) : company.themeConfig;
  }

  if (theme) {
    if (theme.primary) {
      root.style.setProperty("--primary", theme.primary);
      root.style.setProperty("--primary-foreground", isDarkColor(theme.primary) ? "#ffffff" : "#09090b");
    }
    if (theme.accent) {
      root.style.setProperty("--accent", theme.accent);
      root.style.setProperty("--accent-foreground", isDarkColor(theme.accent) ? "#ffffff" : "#09090b");
    }
    if (theme.radius) {
      root.style.setProperty("--radius", theme.radius);
    }
  } else {
    // Reset to defaults if no theme is found
    root.style.setProperty("--primary", "#0d9488");
    root.style.setProperty("--primary-foreground", "#ffffff");
    root.style.setProperty("--accent", "#fbbf24");
    root.style.setProperty("--accent-foreground", "#1c1917");
    root.style.setProperty("--radius", "0.375rem");
  }
}
