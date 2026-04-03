import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/users — list all public user profiles (for "다른 분들의 숲" section)
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profile")
    .select("id, username, display_name, bio, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? [], { status: 200 });
}
