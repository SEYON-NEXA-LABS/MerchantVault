import { getContextCompanyId } from "@/lib/session";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    const { data: users, error: userErr } = await supabase
      .from("User")
      .select("id, companyId, username, email, role, isActive, createdAt, updatedAt")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (userErr) throw userErr;

    return NextResponse.json(users || []);
  } catch (error: any) {
    console.error("Fetch Staff Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, username, password, role, isActive } = body;

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Company context not found" }, { status: 404 });
    }

    if (id) {
      // Update User
      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (password !== undefined && password !== "") updateData.password = password;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = !!isActive;

      const { data: updatedUser, error: updateErr } = await supabase
        .from("User")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return NextResponse.json(updatedUser);
    } else {
      // Create User
      if (!username || !password || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Check if username already exists for the company
      const { data: existingUser } = await supabase
        .from("User")
        .select("id")
        .eq("companyId", companyId)
        .eq("username", username)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({ error: "Username already exists under this tenant" }, { status: 400 });
      }

      const email = `${username.toLowerCase()}@seyon.local`;

      const { data: newUser, error: createErr } = await supabase
        .from("User")
        .insert({
          companyId: companyId,
          username,
          password,
          email,
          role,
          isActive: true
        })
        .select()
        .single();

      if (createErr) throw createErr;
      return NextResponse.json(newUser);
    }
  } catch (error: any) {
    console.error("Save User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("User")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
