import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("theme")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  // Admin check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
  }

  // Deactivate all themes
  const { error: deactivateError } = await supabase
    .from("theme")
    .update({ is_active: false })
    .eq("is_active", true);

  if (deactivateError) {
    return NextResponse.json({ error: deactivateError.message }, { status: 500 });
  }

  // Activate the selected theme
  const { data, error: activateError } = await supabase
    .from("theme")
    .update({ is_active: true })
    .eq("id", id)
    .select()
    .single();

  if (activateError) {
    return NextResponse.json({ error: activateError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
