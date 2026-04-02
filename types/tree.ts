export interface FolderTreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null;
  order: number;
  content: string | null;
  created_at: string;
  updated_at: string;
  children?: FolderTreeNode[];
}
