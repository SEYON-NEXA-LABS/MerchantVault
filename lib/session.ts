import { cookies } from "next/headers";
import { supabase } from "./supabase";

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: "SUPERADMIN" | "TENANTADMIN" | "STAFF";
  companyId: string;
  companyCode: string;
  companyName: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;
    if (!token) return null;
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
  } catch (e) {
    console.warn("Failed to parse session cookie:", e);
    return null;
  }
}

export async function getContextCompanyId(): Promise<string | null> {
  const user = await getSessionUser();
  if (user?.companyId) return user.companyId;

  // Fallback to seyon for local dev mode/testing
  const { data: company } = await supabase
    .from("Company")
    .select("id")
    .eq("code", "seyon")
    .maybeSingle();

  return company?.id || null;
}
