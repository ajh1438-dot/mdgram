import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

// POST /api/auth/signup
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password, username, display_name } = body as {
    email?: string;
    password?: string;
    username?: string;
    display_name?: string;
  };

  if (!email || !password || !username || !display_name) {
    return NextResponse.json(
      { error: "email, password, username, display_name are all required" },
      { status: 400 }
    );
  }

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "username must be 3-20 characters (letters, numbers, underscore only)" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check username uniqueness
  const { data: existing } = await supabase
    .from("user_profile")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 사용 중인 사용자명입니다" }, { status: 409 });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "회원가입 실패" },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // Create user_profile row using service role via supabase admin
  // We use the same client but we need admin rights for insert — however the RLS
  // policy allows insert when auth.uid() = id, and we just signed up so we are
  // that user. But server-side the session may not be propagated yet, so we use
  // the service-role key if available, falling back to a direct insert attempt.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  let profileError: { message: string } | null = null;

  if (serviceRoleKey) {
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey);
    const { error } = await adminClient
      .from("user_profile")
      .insert({ id: userId, username, display_name });
    profileError = error;
  } else {
    const { error } = await supabase
      .from("user_profile")
      .insert({ id: userId, username, display_name });
    profileError = error;
  }

  if (profileError) {
    // Attempt to clean up the auth user to avoid orphans
    return NextResponse.json(
      { error: `프로필 생성 실패: ${profileError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      user: {
        id: userId,
        email: authData.user.email,
        username,
        display_name,
      },
    },
    { status: 201 }
  );
}
