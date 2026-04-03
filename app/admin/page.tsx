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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      {/* On mobile: flex-col (sidebar stacked above editor); on sm+: flex-row */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
        {/* Sidebar: file tree */}
        <aside
          className="flex flex-col shrink-0 border-b sm:border-b-0 sm:border-r overflow-hidden glass-panel"
          style={{
            width: sidebarOpen ? undefined : undefined,
            borderColor: "color-mix(in srgb, var(--border) 50%, transparent)",
          }}
        >
          {/* Sidebar header with collapsible toggle */}
          <div
            className="flex items-center justify-between px-3 py-2 border-b shrink-0"
            style={{
              borderColor: "color-mix(in srgb, var(--border) 50%, transparent)",
              backgroundColor: "transparent",
            }}
          >
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs font-semibold select-none"
              style={{ color: "var(--text-muted)" }}
              aria-expanded={sidebarOpen}
              aria-label="파일 탐색기 토글"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: sidebarOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
              파일 탐색기
            </button>
            <ThemeSelector onThemeChange={setActiveTheme} />
          </div>

          {/* Tree — collapsible */}
          {sidebarOpen && (
            <div
              className="overflow-hidden sm:overflow-auto custom-scrollbar"
              style={{ maxHeight: "40vh", minWidth: "200px" }}
            >
              <div className="sm:w-60">
                {loading ? (
                  <div
                    className="flex items-center justify-center text-xs py-6"
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
              </div>
            </div>
          )}
        </aside>

        {/* Editor + Preview panes */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor — left half */}
          <div
            className="flex flex-col flex-1 border-r overflow-hidden glass-panel rounded-none"
            style={{ borderColor: "color-mix(in srgb, var(--border) 50%, transparent)" }}
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
