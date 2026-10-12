// Centralized Navigation Registry and Color Themes
// Shared across components/Sidebar.tsx and app/help/components/SopWorkflowsClient.tsx

export interface NavigationSectionTheme {
  headerStyle: string;
  dotColor: string;
  badgeStyle: string;
  title: string;
}

export const NAVIGATION_SECTION_THEMES: Record<string, NavigationSectionTheme> = {
  "1": {
    title: "1. Inbound & Procurement",
    headerStyle: "text-amber-700 bg-amber-50/80 border-amber-200/60",
    dotColor: "bg-amber-500",
    badgeStyle: "bg-amber-100 text-amber-900 border-amber-300",
  },
  "2": {
    title: "2. Inventory & Warehouse",
    headerStyle: "text-emerald-700 bg-emerald-50/80 border-emerald-200/60",
    dotColor: "bg-emerald-500",
    badgeStyle: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  "3": {
    title: "3. Sales & Dispatch",
    headerStyle: "text-cyan-700 bg-cyan-50/80 border-cyan-200/60",
    dotColor: "bg-cyan-500",
    badgeStyle: "bg-cyan-100 text-cyan-900 border-cyan-300",
  },
  "4": {
    title: "4. Logistics & Delivery",
    headerStyle: "text-blue-700 bg-blue-50/80 border-blue-200/60",
    dotColor: "bg-blue-500",
    badgeStyle: "bg-blue-100 text-blue-900 border-blue-300",
  },
  "5": {
    title: "5. Customer Management (CRM)",
    headerStyle: "text-purple-700 bg-purple-50/80 border-purple-200/60",
    dotColor: "bg-purple-500",
    badgeStyle: "bg-purple-100 text-purple-900 border-purple-300",
  },
  "6": {
    title: "6. Administration & System",
    headerStyle: "text-indigo-700 bg-indigo-50/80 border-indigo-200/60",
    dotColor: "bg-indigo-500",
    badgeStyle: "bg-indigo-100 text-indigo-900 border-indigo-300",
  },
  "7": {
    title: "7. Platform Superadmin",
    headerStyle: "text-rose-700 bg-rose-50/80 border-rose-200/60",
    dotColor: "bg-rose-500",
    badgeStyle: "bg-rose-100 text-rose-900 border-rose-300",
  },
};

/**
 * Returns the exact badge color classes for a sidebar code (e.g. "1.1", "2.1", "POS", "HOME").
 * Shared globally between Sidebar and Help documentation.
 */
export function getSidebarBadgeStyle(code?: string): string {
  if (!code) return "bg-slate-100 text-slate-800 border-slate-300";

  const upper = code.trim().toUpperCase();
  if (upper === "POS" || upper.includes("POS")) {
    return "bg-emerald-600 text-white border-emerald-600";
  }

  if (upper === "HOME") {
    return "bg-slate-200/80 text-slate-700 border-slate-300";
  }

  // Check section prefix: "1.1" -> "1", "2.3" -> "2"
  const sectionKey = code.split(".")[0]?.trim();
  if (sectionKey && NAVIGATION_SECTION_THEMES[sectionKey]) {
    return NAVIGATION_SECTION_THEMES[sectionKey].badgeStyle;
  }

  return "bg-slate-100 text-slate-800 border-slate-300";
}
