import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

  const supabaseAdmin = getAdminClient();

  // Check username uniqueness
  const { data: existing } = await supabaseAdmin
    .from("user_profile")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 사용 중인 사용자명입니다" }, { status: 409 });
  }

  // Create auth user via admin API with email_confirm: true (bypasses email verification)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "회원가입 실패" },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // Create user_profile row
  const { error: profileError } = await supabaseAdmin
    .from("user_profile")
    .insert({ id: userId, username, display_name });

  if (profileError) {
    // Clean up auth user to avoid orphans
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: `프로필 생성 실패: ${profileError.message}` },
      { status: 500 }
    );
  }

  // Create a welcome README.md for the new user
  await supabaseAdmin
    .from("folder_tree")
    .insert({
      name: "README.md",
      type: "file",
      parent_id: null,
      order: 0,
      content: `# 안녕하세요, ${display_name}님의 숲입니다!\n\n이 공간에 마크다운 파일을 추가해보세요.\n관리자 페이지에서 파일을 만들거나 ZIP을 업로드할 수 있습니다.`,
      owner_id: userId,
    });

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
