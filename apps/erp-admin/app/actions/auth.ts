"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase, supabaseAdmin } from "../../lib/supabase";

export async function loginUser(formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();
  const rememberMe = formData.get("rememberMe")?.toString() === "true";

  if (!username || !password) {
    return { error: "Please fill in all fields" };
  }

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters long" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  let shouldRedirect = false;

  // 1. Attempt database-backed user authentication
  try {
    const isEmail = username.includes("@");
    // Use supabaseAdmin to bypass RLS since the user is not yet logged in/authenticated
    const baseQuery = supabaseAdmin
      .from("User")
      .select("id, username, email, role, companyId, password, isActive");

    const { data: user, error: userErr } = isEmail
      ? await baseQuery.eq("email", username.toLowerCase()).maybeSingle()
      : await baseQuery.eq("username", username).maybeSingle();

    if (!userErr && user && user.password === password) {
      if (!user.isActive) {
        return { error: "This user account has been deactivated." };
      }

      let companyCode = "";
      let companyName = "";

      if (user.companyId) {
        const { data: company, error: compErr } = await supabaseAdmin
          .from("Company")
          .select("id, name, code")
          .eq("id", user.companyId)
          .maybeSingle();

        if (compErr || !company) {
          return { error: "Associated tenant company not found" };
        }
        companyCode = company.code;
        companyName = company.name;
      } else if (user.role !== "SUPERADMIN") {
        return { error: "This account must belong to a registered company." };
      } else {
        companyCode = "superadmin";
        companyName = "Platform Administration";
      }

      const sessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyCode,
        companyName
      };

      const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");
      const cookieStore = await cookies();
      cookieStore.set("sb-access-token", token, {
        path: "/",
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days vs 1 day
        httpOnly: false,
        sameSite: "lax"
      });
      
      return { success: true };
    }
  } catch (err: any) {
    console.warn("Database lookup failed/skipped during login:", err.message || err);
  }

  // 2. In-memory developer accounts fallback (for empty database seeding)
  const devAccounts: Record<string, { role: "SUPERADMIN" | "TENANTADMIN" | "STAFF"; email: string; pass: string }> = {
    superadmin: { role: "SUPERADMIN", email: "seyonnexalabs@gmail.com", pass: "super123" },
    admin: { role: "TENANTADMIN", email: "admin@seyon.local", pass: "admin123" },
    operator: { role: "STAFF", email: "operator@seyon.local", pass: "operator123" }
  };

  if (devAccounts[username]) {
    const match = devAccounts[username];
    if (match.pass === password) {
      const mockUserIdMap: Record<string, string> = {
        superadmin: "00000000-0000-0000-0000-000000000001",
        admin: "00000000-0000-0000-0000-000000000002",
        operator: "00000000-0000-0000-0000-000000000003"
      };

      // Query database company to get the real companyId, fall back to "seyon"
      const { data: dbCompany } = await supabaseAdmin
        .from("Company")
        .select("id, name, code")
        .eq("code", "seyon")
        .maybeSingle();


      const companyCode = dbCompany?.code || "seyon";
      const sessionData = {
        id: mockUserIdMap[username] || "00000000-0000-0000-0000-000000000000",
        username: username,
        email: match.email,
        role: match.role,
        companyId: dbCompany?.id || "00000000-0000-0000-0000-000000000000",
        companyCode: companyCode,
        companyName: dbCompany?.name || "Seyon Clothing (Mock Fallback)"
      };

      const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");
      const cookieStore = await cookies();
      cookieStore.set("sb-access-token", token, {
        path: "/",
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days vs 1 day
        httpOnly: false,
        sameSite: "lax"
      });
      
      return { success: true };
    }
  }

  return { error: "Invalid username or password" };
}
