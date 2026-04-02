import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ReorderItem {
  id: string;
  order: number;
  parent_id?: string | null;
}

// PATCH /api/tree/reorder — bulk update order (and optionally parent_id) for multiple nodes
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json(
      { error: 'Body must be a non-empty array of { id, order, parent_id? }' },
      { status: 400 }
    );
  }

  const items = body as ReorderItem[];

  // Validate each item
  for (const item of items) {
    if (typeof item.id !== 'string' || typeof item.order !== 'number') {
      return NextResponse.json(
        { error: 'Each item must have a string `id` and a number `order`' },
        { status: 400 }
      );
    }
  }

  // Supabase JS client does not support bulk update in a single call,
  // so we use Promise.all with individual upserts via the primary key.
  const updates = items.map(({ id, order, parent_id }) => {
    const patch: Record<string, unknown> = { order };
    if (parent_id !== undefined) patch.parent_id = parent_id;
    return supabase
      .from('folder_tree')
      .update(patch)
      .eq('id', id)
      .select('id, order, parent_id');
  });

  const results = await Promise.all(updates);

  const errors = results
    .map((r, i) => (r.error ? { id: items[i].id, message: r.error.message } : null))
    .filter(Boolean);

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Some updates failed', details: errors }, { status: 500 });
  }

  const updated = results.flatMap((r) => r.data ?? []);
  return NextResponse.json(updated, { status: 200 });
}
