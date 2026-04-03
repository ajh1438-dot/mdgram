import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/guestbook — return all entries ordered by newest first
export async function GET() {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("guestbook")
    .select("id, author_name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? [], { status: 200 });
}

// POST /api/guestbook — create a new entry
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { author_name, message } = body as {
    author_name?: string;
    message?: string;
  };

  if (!author_name?.trim()) {
    return NextResponse.json({ error: "author_name is required" }, { status: 400 });
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("guestbook")
    .insert({ author_name: author_name.trim(), message: message.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
