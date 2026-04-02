import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isReadParam = searchParams.get("is_read");

  let query = supabase
    .from("message")
    .select("*")
    .order("created_at", { ascending: false });

  if (isReadParam === "true") {
    query = query.eq("is_read", true);
  } else if (isReadParam === "false") {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json();
  const { keyword_tags, content, sender_name, sender_email } = body;

  if (!sender_name || !content) {
    return NextResponse.json(
      { error: "sender_name and content are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("message")
    .insert({
      keyword_tags: keyword_tags ?? [],
      content,
      sender_name,
      sender_email: sender_email ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
