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

export interface ContextSession {
  companyId: string | null;
  companyCode: string;
  user: SessionUser | null;
}

export async function getContextSession(): Promise<ContextSession> {
  const user = await getSessionUser();
  if (!user) {
    return { companyId: null, companyCode: "", user: null };
  }

  if (user.companyId && user.companyId !== "00000000-0000-0000-0000-000000000000") {
    return {
      companyId: user.companyId,
      companyCode: user.companyCode || "",
      user
    };
  }

  // Fallback to query dynamically matching the user's companyCode
  const code = user.companyCode || "syn";
  const { data: company } = await supabase
    .from("Company")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  return {
    companyId: company?.id || null,
    companyCode: company?.code || code,
    user
  };
}

export async function getContextCompanyId(): Promise<string | null> {
  const session = await getContextSession();
  return session.companyId;
}
