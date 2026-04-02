import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/tree/[id] — fetch a single node
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('folder_tree')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data, { status: 200 });
}

// PUT /api/tree/[id] — update a node's name, content, parent_id, or order
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, content, parent_id, order } = body as {
    name?: string;
    content?: string | null;
    parent_id?: string | null;
    order?: number;
  };

  // Build only the fields that were explicitly provided
  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (content !== undefined) patch.content = content;
  if (parent_id !== undefined) patch.parent_id = parent_id;
  if (order !== undefined) patch.order = order;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: 'No updatable fields provided' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('folder_tree')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(data, { status: 200 });
}

// DELETE /api/tree/[id] — delete a node (cascade handled by DB)
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from('folder_tree')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
