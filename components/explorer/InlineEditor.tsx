"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface InlineEditorProps {
  fileId: string;
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

export default function InlineEditor({
  fileId,
  initialContent,
  onSave,
  onCancel,
}: InlineEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const saveContent = useCallback(
    async (value: string, isManual = false) => {
      if (isManual) setSaving(true);
      setAutoSaveStatus("pending");
      setError(null);
      try {
        const res = await fetch(`/api/tree/${fileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as { error?: string }).error ?? "저장 실패");
        }
        const updated = await res.json();
        setAutoSaveStatus("saved");
        if (isManual) {
          onSave(updated.content ?? value);
        }
        // Reset saved status after 2s
        setTimeout(() => setAutoSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch (err) {
        setAutoSaveStatus("error");
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        if (isManual) setSaving(false);
      }
    },
    [fileId, onSave]
  );

  // Debounced auto-save
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    setAutoSaveStatus("pending");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveContent(val, false);
    }, 2000);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function handleSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await saveContent(content, true);
  }

  const statusColors = {
    idle: "text-[var(--text-muted)]",
    pending: "text-amber-400",
    saved: "text-emerald-500",
    error: "text-red-400",
  };

  const statusLabels = {
    idle: "",
    pending: "저장 중…",
    saved: "저장됨",
    error: "저장 실패",
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-medium ${statusColors[autoSaveStatus]}`}>
          {statusLabels[autoSaveStatus]}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-[11px] rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 text-[11px] font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        rows={16}
        className="w-full rounded-lg border border-[var(--accent)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text)] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y transition"
      />

      {error && (
        <p className="text-[10px] text-red-400">{error}</p>
      )}
    </div>
  );
}
