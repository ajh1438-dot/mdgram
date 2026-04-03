"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectedRange {
  selected_text: string;
  offset_start: number;
  offset_end: number;
}

export interface Comment {
  id: string;
  file_id: string;
  selected_text: string;
  offset_start: number;
  offset_end: number;
  content: string;
  author_name: string;
  created_at: string;
}

interface CommentPanelProps {
  open: boolean;
  fileId: string;
  selectedRange: SelectedRange | null;
  onClose: () => void;
}

export default function CommentPanel({
  open,
  fileId,
  selectedRange,
  onClose,
}: CommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?file_id=${encodeURIComponent(fileId)}`);
      if (!res.ok) throw new Error("댓글을 불러오지 못했습니다.");
      const data = await res.json();
      // If viewing a specific range, filter to overlapping comments
      if (selectedRange) {
        setComments(
          (data as Comment[]).filter(
            (c) =>
              c.offset_start < selectedRange.offset_end &&
              c.offset_end > selectedRange.offset_start
          )
        );
      } else {
        setComments(data as Comment[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fileId, selectedRange]);

  useEffect(() => {
    if (open) {
      fetchComments();
      setContent("");
      setAuthorName("");
      setError(null);
    }
  }, [open, fetchComments]);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay to avoid capturing the same click that opened the panel
    const t = setTimeout(() => document.addEventListener("mousedown", handleClick), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onClose]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("댓글 내용을 입력해주세요.");
      textareaRef.current?.focus();
      return;
    }
    if (!selectedRange) {
      setError("선택된 텍스트가 없습니다.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: fileId,
          selected_text: selectedRange.selected_text,
          offset_start: selectedRange.offset_start,
          offset_end: selectedRange.offset_end,
          content: content.trim(),
          author_name: authorName.trim() || "익명",
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? "제출 실패");
      }
      setContent("");
      setAuthorName("");
      await fetchComments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string) {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "방금";
      if (minutes < 60) return `${minutes}분 전`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}시간 전`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}일 전`;
      return new Date(iso).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function avatarColor(name: string) {
    const colors = [
      "bg-violet-500", "bg-blue-500", "bg-emerald-500",
      "bg-orange-500", "bg-pink-500", "bg-cyan-500",
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (transparent, click-outside handled via ref) */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide-in panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[92vw] flex flex-col glass-panel border-l shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text)]">문장 댓글</h3>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Selected text quote */}
            {selectedRange && (
              <div className="mx-4 mt-3 mb-1 rounded-lg border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-2">
                <p className="text-xs text-[var(--accent)] font-medium mb-1">선택된 문장</p>
                <p className="text-xs leading-relaxed text-[var(--text)] line-clamp-4 italic">
                  &ldquo;{selectedRange.selected_text}&rdquo;
                </p>
              </div>
            )}

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0 custom-scrollbar">
              {loading && (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <span className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[var(--text-muted)]">불러오는 중…</span>
                </div>
              )}

              {!loading && comments.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] text-center py-6">
                  아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
                </p>
              )}

              {!loading &&
                comments.map((c, idx) => (
                  <div key={c.id}>
                    {idx > 0 && (
                      <div className="border-t border-[var(--border)]/40 mx-1" />
                    )}
                    <div className="py-3">
                      <div className="flex items-start gap-2.5">
                        {/* Avatar initial circle */}
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${avatarColor(c.author_name)}`}
                        >
                          {c.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[var(--accent)]">{c.author_name}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">{formatDate(c.created_at)}</span>
                          </div>
                          {c.selected_text && c.selected_text !== selectedRange?.selected_text && (
                            <p className="text-[10px] text-[var(--text-muted)] italic mb-1 line-clamp-2">
                              &ldquo;{c.selected_text}&rdquo;
                            </p>
                          )}
                          <p className="text-xs text-[var(--text)] leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--border)]" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2 flex-shrink-0">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="닉네임 (선택, 기본: 익명)"
                maxLength={30}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="댓글을 입력하세요…"
                rows={3}
                maxLength={500}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
              />
              {error && <p className="text-[10px] text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="w-full rounded-lg bg-[var(--accent)] text-white text-xs font-semibold py-2 hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "제출 중…" : "댓글 달기"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
