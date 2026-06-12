"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "../../lib/supabase";

export async function loginUser(formData: FormData) {
  const companyCode = formData.get("company")?.toString().trim().toLowerCase();
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!companyCode || !username || !password) {
    return { error: "Please fill in all fields" };
  }

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters long" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  // 1. Attempt database-backed user authentication
  try {
    const { data: company, error: compErr } = await supabase
      .from("Company")
      .select("id, name, code")
      .eq("code", companyCode)
      .maybeSingle();

    if (!compErr && company) {
      const { data: user, error: userErr } = await supabase
        .from("User")
        .select("id, username, email, role, companyId, password, isActive")
        .eq("companyId", company.id)
        .eq("username", username)
        .maybeSingle();

      if (!userErr && user && user.password === password) {
        if (!user.isActive) {
          return { error: "This user account has been deactivated." };
        }

        const sessionData = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyCode: company.code,
          companyName: company.name
        };

        const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");
        const cookieStore = await cookies();
        cookieStore.set("sb-access-token", token, {
          path: "/",
          maxAge: 60 * 60 * 24, // 1 day session
          httpOnly: false,
          sameSite: "lax"
        });
        
        redirect("/dashboard");
      }
    }
  } catch (err: any) {
    // Next.js redirect throws an internal exception which we shouldn't swallow in a generic catch block
    if (err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.warn("Database lookup failed/skipped during login:", err.message || err);
  }

  // 2. In-memory developer accounts fallback (for empty database seeding)
  const devAccounts: Record<string, { role: "SUPERADMIN" | "TENANTADMIN" | "STAFF"; email: string; pass: string }> = {
    superadmin: { role: "SUPERADMIN", email: "seyonnexalabs@gmail.com", pass: "super123" },
    admin: { role: "TENANTADMIN", email: "admin@seyon.local", pass: "admin123" },
    operator: { role: "STAFF", email: "operator@seyon.local", pass: "operator123" }
  };

  if ((companyCode === "seyon" || companyCode === "syn") && devAccounts[username]) {
    const match = devAccounts[username];
    if (match.pass === password) {
      const mockUserIdMap: Record<string, string> = {
        superadmin: "00000000-0000-0000-0000-000000000001",
        admin: "00000000-0000-0000-0000-000000000002",
        operator: "00000000-0000-0000-0000-000000000003"
      };

      // Query database company to get the real companyId
      const { data: dbCompany } = await supabase
        .from("Company")
        .select("id, name")
        .eq("code", companyCode)
        .maybeSingle();

      const sessionData = {
        id: mockUserIdMap[username] || "00000000-0000-0000-0000-000000000000",
        username: username,
        email: match.email,
        role: match.role,
        companyId: dbCompany?.id || "00000000-0000-0000-0000-000000000000",
        companyCode: companyCode,
        companyName: dbCompany?.name || (companyCode === "syn" ? "SEYON (Mock Fallback)" : "Seyon Clothing (Mock Fallback)")
      };

      const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");
      const cookieStore = await cookies();
      cookieStore.set("sb-access-token", token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: false,
        sameSite: "lax"
      });
      
      redirect("/dashboard");
    }
  }

  return { error: "Invalid username or password" };
}
