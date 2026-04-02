import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/auth/me — returns current auth status
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false, email: null }, { status: 200 });
    }

    return NextResponse.json(
      { authenticated: true, email: user.email ?? null },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ authenticated: false, email: null }, { status: 200 });
  }
}
