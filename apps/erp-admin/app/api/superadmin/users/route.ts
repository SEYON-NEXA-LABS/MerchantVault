import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "../../../../lib/supabase";

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("User")
      .select(`
        id, 
        companyId, 
        email, 
        username, 
        isActive, 
        role, 
        createdAt, 
        Company (name)
      `)
      .order("username", { ascending: true });

    if (error) throw error;
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Superadmin Fetch Users Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, isActive, role, email, username, password } = body;

    if (action === "CREATE_USER") {
      const { companyId, username, email, password, role, isActive } = body;
      if (!username || !email || !password || !role) {
        return NextResponse.json({ error: "Missing required user fields" }, { status: 400 });
      }

      // Check if username is already taken globally
      const { data: existingUser } = await supabase
        .from("User")
        .select("id")
        .eq("username", username.trim())
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({ error: `Username "${username}" is already taken.` }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("User")
        .insert({
          companyId: companyId || null,
          username: username.trim(),
          email: email.trim(),
          password,
          role,
          isActive: isActive !== undefined ? !!isActive : true
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (action === "TOGGLE_ACTIVE") {
      const { data, error } = await supabase
        .from("User")
        .update({ isActive: !!isActive })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "UPDATE_USER") {
      const updates: any = {};
      if (role) updates.role = role;
      if (email) updates.email = email;
      if (username) updates.username = username;
      if (password) updates.password = password;

      const { data, error } = await supabase
        .from("User")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "DELETE_USER") {
      const { error } = await supabase
        .from("User")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Superadmin Update User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
