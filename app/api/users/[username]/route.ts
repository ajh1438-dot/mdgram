import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTree } from "@/lib/tree";
import { FolderTreeNode } from "@/types/tree";

// GET /api/users/[username] — return profile + their folder tree
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = await createClient();

  // Lookup profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch their tree
  const { data: treeData, error: treeError } = await supabase
    .from("folder_tree")
    .select("*")
    .eq("owner_id", profile.id)
    .order("order", { ascending: true });

  if (treeError) {
    return NextResponse.json({ error: treeError.message }, { status: 500 });
  }

  const tree = buildTree((treeData ?? []) as FolderTreeNode[]);

  return NextResponse.json({ profile, tree }, { status: 200 });
}
