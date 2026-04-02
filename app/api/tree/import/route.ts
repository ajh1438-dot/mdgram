import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildTree } from '@/lib/tree';
import JSZip from 'jszip';

// POST /api/tree/import
// Accepts multipart/form-data: { file: zip, mode: 'replace' | 'merge' }
// Parses folder/file structure from zip and inserts into DB.
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Admin auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const mode = (formData.get('mode') as string) ?? 'replace';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!['replace', 'merge'].includes(mode)) {
    return NextResponse.json({ error: 'mode must be "replace" or "merge"' }, { status: 400 });
  }

  // Read zip in memory
  let zip: JSZip;
  try {
    const buffer = await file.arrayBuffer();
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return NextResponse.json({ error: 'Failed to parse zip file' }, { status: 400 });
  }

  // Collect all zip entries
  type ZipEntry = { path: string; dir: boolean; content?: string };
  const entries: ZipEntry[] = [];

  for (const [relativePath, zipObj] of Object.entries(zip.files)) {
    if (zipObj.dir) {
      // Strip trailing slash
      entries.push({ path: relativePath.replace(/\/$/, ''), dir: true });
    } else {
      // Only process .md files (skip hidden files like __MACOSX)
      const cleanPath = relativePath;
      if (
        cleanPath.startsWith('__MACOSX') ||
        cleanPath.includes('/.') ||
        cleanPath.startsWith('.')
      ) {
        continue;
      }
      const content = await zipObj.async('string');
      entries.push({ path: cleanPath, dir: false, content });
    }
  }

  // Sort so that parent directories always come before children
  entries.sort((a, b) => {
    const aDepth = a.path.split('/').length;
    const bDepth = b.path.split('/').length;
    return aDepth - bDepth || a.path.localeCompare(b.path);
  });

  // Replace mode: delete all existing records first
  if (mode === 'replace') {
    const { error: deleteError } = await supabase
      .from('folder_tree')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to clear tree: ${deleteError.message}` },
        { status: 500 }
      );
    }
  }

  // Build path→id map so we can wire up parent_id relationships
  const pathToId = new Map<string, string>();

  // Also track order index per parent path
  const parentOrderCount = new Map<string, number>();

  function getParentPath(filePath: string): string | null {
    const parts = filePath.split('/');
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('/');
  }

  function getOrder(parentPath: string | null): number {
    const key = parentPath ?? '__root__';
    const current = parentOrderCount.get(key) ?? 0;
    parentOrderCount.set(key, current + 1);
    return current;
  }

  // Insert rows one by one (maintaining order and parent-child relationships)
  for (const entry of entries) {
    const parts = entry.path.split('/');
    const name = parts[parts.length - 1];
    if (!name) continue; // skip empty paths

    const parentPath = getParentPath(entry.path);
    const parent_id = parentPath ? (pathToId.get(parentPath) ?? null) : null;
    const order = getOrder(parentPath);

    const isFile = !entry.dir;
    const type = isFile ? 'file' : 'folder';
    const content = isFile ? (entry.content ?? '') : null;

    // For .md files: strip the .md extension from display name if desired
    // We keep the full name (with .md) to match conventions used in the project
    const displayName = name;

    const { data, error } = await supabase
      .from('folder_tree')
      .insert({ name: displayName, type, parent_id, order, content })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to insert "${entry.path}": ${error.message}` },
        { status: 500 }
      );
    }

    pathToId.set(entry.path, data.id);
  }

  // Return the new tree
  const { data: rows, error: fetchError } = await supabase
    .from('folder_tree')
    .select('*')
    .order('order', { ascending: true });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const tree = buildTree(rows ?? []);
  return NextResponse.json({ mode, inserted: entries.length, tree }, { status: 200 });
}
