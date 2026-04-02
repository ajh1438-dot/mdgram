"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderTreeNode } from "@/types/tree";

interface Comment {
  id: string;
  file_id: string;
  selected_text: string;
  content: string;
  author_name: string;
  created_at: string;
  offset_start: number;
  offset_end: number;
}

interface CommentWithFile extends Comment {
  file_name: string;
}

/** Flatten tree → only file nodes */
function collectFiles(nodes: FolderTreeNode[]): FolderTreeNode[] {
  const files: FolderTreeNode[] = [];
  const walk = (list: FolderTreeNode[]) => {
    for (const n of list) {
      if (n.type === "file") files.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return files;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentList() {
  const [comments, setComments] = useState<CommentWithFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const treeRes = await fetch("/api/tree");
      if (!treeRes.ok) throw new Error("Failed to fetch tree");
      const tree: FolderTreeNode[] = await treeRes.json();
      const files = collectFiles(tree);

      // Fetch comments for every file in parallel
      const results = await Promise.all(
        files.map(async (file) => {
          const res = await fetch(`/api/comments?file_id=${file.id}`);
          if (!res.ok) return [];
          const data: Comment[] = await res.json();
          return data.map((c) => ({ ...c, file_name: file.name }));
        })
      );

      const all: CommentWithFile[] = results
        .flat()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setComments(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, fileName: string) {
    if (
      !window.confirm(
        `"${fileName}" 의 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    )
      return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error("Delete failed");
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[var(--text-muted)]">
        Loading comments…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-950/30 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[var(--text-muted)]">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {comments.map((c) => (
        <div key={c.id} className="py-4 space-y-1.5">
          {/* File label */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
              <svg
                className="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {c.file_name}
            </span>
            <button
              onClick={() => handleDelete(c.id, c.file_name)}
              disabled={deletingId === c.id}
              className="shrink-0 rounded px-2 py-0.5 text-xs text-red-400 hover:bg-red-950/40 disabled:opacity-50 transition-colors"
            >
              {deletingId === c.id ? "삭제 중…" : "삭제"}
            </button>
          </div>

          {/* Selected text */}
          <blockquote className="border-l-2 border-[var(--accent)] pl-3 text-xs italic text-[var(--text-muted)] line-clamp-2">
            {c.selected_text}
          </blockquote>

          {/* Comment body */}
          <p className="text-sm text-[var(--text)]">{c.content}</p>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="font-medium">{c.author_name}</span>
            <span>·</span>
            <time>{formatDate(c.created_at)}</time>
          </div>
        </div>
      ))}
    </div>
  );
}
