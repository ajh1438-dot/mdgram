import { FolderTreeNode } from '@/types/tree';

/**
 * Converts a flat array of FolderTreeNode rows (from DB) into a nested tree.
 * Nodes are sorted by their `order` field at each level.
 */
export function buildTree(rows: FolderTreeNode[]): FolderTreeNode[] {
  const map = new Map<string, FolderTreeNode>();
  const roots: FolderTreeNode[] = [];

  // First pass: clone each row and initialise children array
  for (const row of rows) {
    map.set(row.id, { ...row, children: [] });
  }

  // Second pass: wire up parent→child relationships
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort every level by `order`
  const sortChildren = (nodes: FolderTreeNode[]): FolderTreeNode[] => {
    nodes.sort((a, b) => a.order - b.order);
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    }
    return nodes;
  };

  return sortChildren(roots);
}
