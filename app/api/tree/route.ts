import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildTree } from '@/lib/tree';
import { FolderTreeNode } from '@/types/tree';

// GET /api/tree — fetch all nodes, return nested tree
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('folder_tree')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tree = buildTree((data ?? []) as FolderTreeNode[]);
  return NextResponse.json(tree, { status: 200 });
}

// POST /api/tree — create a new node
export async function POST(request: NextRequest) {
  const supabase = await createClient();

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

  const { data, error } = await supabase
    .from('folder_tree')
    .insert({ name, type, parent_id, order, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
