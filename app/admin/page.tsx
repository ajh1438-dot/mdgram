"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FolderTreeNode } from "@/types/tree";
import AdminTree from "@/components/admin/AdminTree";
import AdminToolbar from "@/components/admin/AdminToolbar";
import ThemeSelector from "@/components/admin/ThemeSelector";

// Dynamically import heavy editor to avoid SSR issues
const MarkdownEditor = dynamic(() => import("@/components/admin/MarkdownEditor"), {
  ssr: false,
  loading: () => (
    <div
      className="flex flex-1 items-center justify-center"
      style={{ color: "var(--text-muted)", fontSize: "13px" }}
    >
      에디터 로딩 중...
    </div>
  ),
});

const PreviewPane = dynamic(() => import("@/components/admin/PreviewPane"), {
  ssr: false,
});

export default function AdminPage() {
  const [tree, setTree] = useState<FolderTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<FolderTreeNode | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [activeTheme, setActiveTheme] = useState<string>("dark");
  const saveRef = useRef<(() => void) | null>(null);

  const fetchTree = useCallback(async () => {
    try {
      const res = await fetch("/api/tree");
      if (!res.ok) return;
      const data: FolderTreeNode[] = await res.json();
      setTree(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // When tree updates, keep selectedNode in sync
  useEffect(() => {
    if (!selectedNode) return;
    function findNode(nodes: FolderTreeNode[], id: string): FolderTreeNode | null {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = findNode(n.children, id);
          if (found) return found;
        }
      }
      return null;
    }
    const updated = findNode(tree, selectedNode.id);
    if (updated) setSelectedNode(updated);
  }, [tree]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelectNode(node: FolderTreeNode) {
    if (node.type === "file") {
      setSelectedNode(node);
      setEditorContent(node.content ?? "");
    } else {
      setSelectedNode(node);
    }
  }

  function handleEditorChange(content: string) {
    setEditorContent(content);
  }

  // Manual save trigger exposed to toolbar
  function handleSave() {
    if (saveRef.current) saveRef.current();
  }

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ height: "calc(100vh - 56px)", backgroundColor: "var(--bg)" }}
    >
      {/* Toolbar row */}
      <div className="shrink-0">
        <AdminToolbar
          selectedNode={selectedNode}
          tree={tree}
          onTreeChange={fetchTree}
          onSave={handleSave}
        />
      </div>

      {/* Main layout: sidebar + editor + preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: file tree */}
        <aside
          className="flex flex-col shrink-0 border-r overflow-hidden"
          style={{
            width: "240px",
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          {/* Sidebar header */}
          <div
            className="flex items-center justify-between px-3 py-2 border-b shrink-0"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              파일 탐색기
            </span>
            <ThemeSelector onThemeChange={setActiveTheme} />
          </div>

          {/* Tree */}
          {loading ? (
            <div
              className="flex flex-1 items-center justify-center text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              로딩 중...
            </div>
          ) : (
            <AdminTree
              tree={tree}
              selectedId={selectedNode?.id ?? null}
              onSelect={handleSelectNode}
              onTreeChange={fetchTree}
            />
          )}
        </aside>

        {/* Editor + Preview panes */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor — left half */}
          <div
            className="flex flex-col flex-1 border-r overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <MarkdownEditor
              node={selectedNode?.type === "file" ? selectedNode : null}
              onChange={handleEditorChange}
            />
          </div>

          {/* Preview — right half */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <PreviewPane content={editorContent} activeTheme={activeTheme} />
          </div>
        </div>
      </div>
    </div>
  );
}
