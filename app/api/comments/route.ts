import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/comments?file_id=<uuid> — fetch comments for a file, ordered by offset_start
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const file_id = searchParams.get('file_id');

  if (!file_id) {
    return NextResponse.json({ error: '`file_id` query param is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comment')
    .select('*')
    .eq('file_id', file_id)
    .order('offset_start', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// POST /api/comments — create a new comment
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    file_id,
    selected_text,
    offset_start,
    offset_end,
    content,
    author_name,
  } = body as {
    file_id?: string;
    selected_text?: string;
    offset_start?: number;
    offset_end?: number;
    content?: string;
    author_name?: string;
  };

  const missing: string[] = [];
  if (!file_id) missing.push('file_id');
  if (!selected_text) missing.push('selected_text');
  if (offset_start === undefined || offset_start === null) missing.push('offset_start');
  if (offset_end === undefined || offset_end === null) missing.push('offset_end');
  if (!content) missing.push('content');
  if (!author_name) missing.push('author_name');

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comment')
    .insert({ file_id, selected_text, offset_start, offset_end, content, author_name })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
