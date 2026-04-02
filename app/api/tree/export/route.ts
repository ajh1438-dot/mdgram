import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildTree } from '@/lib/tree';
import { FolderTreeNode } from '@/types/tree';
import JSZip from 'jszip';

// GET /api/tree/export — download entire tree as a zip of markdown files
export async function GET() {
  const supabase = await createClient();

  // Admin auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from('folder_tree')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tree = buildTree((rows ?? []) as FolderTreeNode[]);

  const zip = new JSZip();

  // Recursively build zip structure from the nested tree
  function addToZip(nodes: FolderTreeNode[], currentPath: string) {
    for (const node of nodes) {
      const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;

      if (node.type === 'folder') {
        zip.folder(nodePath);
        if (node.children && node.children.length > 0) {
          addToZip(node.children, nodePath);
        }
      } else {
        // File node — ensure it has a .md extension
        const filePath = nodePath.endsWith('.md') ? nodePath : `${nodePath}.md`;
        zip.file(filePath, node.content ?? '');
      }
    }
  }

  addToZip(tree, '');

  const zipArrayBuffer = await zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `tree-export-${timestamp}.zip`;

  // Convert ArrayBuffer to a ReadableStream so NextResponse accepts it
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(zipArrayBuffer));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(zipArrayBuffer.byteLength),
    },
  });
}
