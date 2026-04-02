import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reactions?node_id=<uuid>  — count for one node
// GET /api/reactions                 — counts grouped by node_id
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const nodeId = searchParams.get('node_id');

  if (nodeId) {
    const { count, error } = await supabase
      .from('reaction')
      .select('*', { count: 'exact', head: true })
      .eq('node_id', nodeId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ node_id: nodeId, count: count ?? 0 }, { status: 200 });
  }

  // Return all rows and aggregate in JS (Supabase JS client doesn't expose GROUP BY)
  const { data, error } = await supabase
    .from('reaction')
    .select('node_id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const grouped: Record<string, number> = {};
  for (const row of data ?? []) {
    grouped[row.node_id] = (grouped[row.node_id] ?? 0) + 1;
  }

  const result = Object.entries(grouped).map(([node_id, count]) => ({ node_id, count }));
  return NextResponse.json(result, { status: 200 });
}

// POST /api/reactions — create a reaction
// Body: { keyword: string, node_id: string, visitor_hash: string }
// Returns 409 if (node_id, visitor_hash) pair already exists
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { keyword, node_id, visitor_hash } = body as {
    keyword?: string;
    node_id?: string;
    visitor_hash?: string;
  };

  if (!keyword || !node_id || !visitor_hash) {
    return NextResponse.json(
      { error: '`keyword`, `node_id`, and `visitor_hash` are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('reaction')
    .insert({ keyword, node_id, visitor_hash })
    .select()
    .single();

  if (error) {
    // Postgres unique violation error code
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Reaction already exists for this visitor and node' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
