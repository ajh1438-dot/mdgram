import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/auth/me — returns current auth status + username if available
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false, email: null, username: null }, { status: 200 });
    }

    // Fetch username from user_profile
    const { data: profile } = await supabase
      .from("user_profile")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json(
      {
        authenticated: true,
        email: user.email ?? null,
        username: profile?.username ?? null,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ authenticated: false, email: null, username: null }, { status: 200 });
  }
}
