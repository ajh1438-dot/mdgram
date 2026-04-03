import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildTree } from '@/lib/tree';
import { FolderTreeNode } from '@/types/tree';

// GET /api/tree — fetch all nodes, return nested tree
// Optional query param: ?owner_id=xxx to filter by owner
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("owner_id");

  let query = supabase
    .from('folder_tree')
    .select('*')
    .order('order', { ascending: true });

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tree = buildTree((data ?? []) as FolderTreeNode[]);
  return NextResponse.json(tree, { status: 200 });
}

// POST /api/tree — create a new node
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get the authenticated user and attach owner_id
  const { data: { user } } = await supabase.auth.getUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, type, parent_id = null, order = 0, content = null } = body as {
    name?: string;
    type?: string;
    parent_id?: string | null;
    order?: number;
    content?: string | null;
  };

  if (!name || !type) {
    return NextResponse.json(
      { error: '`name` and `type` are required' },
      { status: 400 }
    );
  }

  if (type !== 'folder' && type !== 'file') {
    return NextResponse.json(
      { error: '`type` must be "folder" or "file"' },
      { status: 400 }
    );
  }

  const insertPayload: Record<string, unknown> = { name, type, parent_id, order, content };
  if (user) insertPayload.owner_id = user.id;

  const { data, error } = await supabase
    .from('folder_tree')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
