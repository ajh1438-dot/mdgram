"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toast, { ToastData } from "@/components/ui/Toast";

/* ── Types ── */
interface TopicMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Keywords pre-filled from the active folder/file context */
  initialKeywords?: string[];
}

/* ── Keyword chip editor ── */
function KeywordChips({
  keywords,
  onChange,
}: {
  keywords: string[];
  onChange: (kw: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addKeyword(raw: string) {
    const trimmed = raw.trim().replace(/^#/, "");
    if (!trimmed || keywords.includes(trimmed)) return;
    onChange([...keywords, trimmed]);
    setInput("");
  }

  function removeKeyword(kw: string) {
    onChange(keywords.filter((k) => k !== kw));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addKeyword(input);
    }
    if (e.key === "Backspace" && input === "" && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center min-h-[2.25rem] p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] focus-within:border-[var(--accent)] transition-colors">
      <AnimatePresence mode="popLayout">
        {keywords.map((kw) => (
          <motion.span
            key={kw}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30"
          >
            #{kw}
            <button
              type="button"
              onClick={() => removeKeyword(kw)}
              aria-label={`${kw} 태그 제거`}
              className="hover:text-red-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3 h-3"
                aria-hidden="true"
              >
                <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
              </svg>
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addKeyword(input)}
        placeholder={keywords.length === 0 ? "태그 입력 후 Enter…" : ""}
        className="flex-1 min-w-[6rem] bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
      />
    </div>
  );
}

/* ── Main Modal ── */
export default function TopicMessageModal({
  isOpen,
  onClose,
  initialKeywords = [],
}: TopicMessageModalProps) {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [content, setContent] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Sync keywords when prop changes (new context selected) */
  useEffect(() => {
    if (isOpen) {
      setKeywords(initialKeywords);
    }
  }, [isOpen, initialKeywords]);

  /* Focus textarea when modal opens */
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => textareaRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [isOpen, onClose]);

  /* Reset form */
  function resetForm() {
    setContent("");
    setSenderName("");
    setSenderEmail("");
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const addToast = useCallback((message: string, type: ToastData["type"]) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!senderName.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!content.trim()) newErrors.content = "메시지 내용을 입력해주세요.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword_tags: keywords,
          content: content.trim(),
          sender_name: senderName.trim(),
          sender_email: senderEmail.trim() || undefined,
        }),
      });

      if (res.ok) {
        addToast("메시지가 성공적으로 전송되었습니다!", "success");
        resetForm();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data?.error ?? "메시지 전송에 실패했습니다.", "error");
      }
    } catch {
      addToast("네트워크 오류가 발생했습니다. 다시 시도해주세요.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Toast lives outside modal so it persists after modal closes */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <motion.div
              key="modal"
              role="dialog"
              aria-modal="true"
              aria-label="주제 메시지 보내기"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className={[
                "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                "w-full max-w-md mx-4",
                "bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl",
                "flex flex-col max-h-[90vh]",
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--border)]">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">
                    이 주제로 메시지 보내기
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    생각이나 질문을 전해주세요.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="닫기"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>

              {/* Scrollable body */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 px-6 py-5 overflow-y-auto flex-1"
                noValidate
              >
                {/* Keyword chips */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                    주제 태그
                  </label>
                  <KeywordChips keywords={keywords} onChange={setKeywords} />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Enter 또는 쉼표로 태그 추가
                  </p>
                </div>

                {/* Message content */}
                <div>
                  <label
                    htmlFor="modal-content"
                    className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
                  >
                    메시지 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="modal-content"
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
                    }}
                    placeholder="생각, 질문, 피드백을 자유롭게 적어주세요…"
                    rows={5}
                    className={[
                      "w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text)]",
                      "bg-[var(--bg-secondary)] border resize-none outline-none",
                      "placeholder:text-[var(--text-muted)]",
                      "focus:border-[var(--accent)] transition-colors",
                      errors.content ? "border-red-400" : "border-[var(--border)]",
                    ].join(" ")}
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs text-red-400">{errors.content}</p>
                  )}
                </div>

                {/* Sender name */}
                <div>
                  <label
                    htmlFor="modal-sender-name"
                    className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
                  >
                    이름 <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="modal-sender-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => {
                      setSenderName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="홍길동"
                    className={[
                      "w-full px-3 py-2 rounded-lg text-sm text-[var(--text)]",
                      "bg-[var(--bg-secondary)] border outline-none",
                      "placeholder:text-[var(--text-muted)]",
                      "focus:border-[var(--accent)] transition-colors",
                      errors.name ? "border-red-400" : "border-[var(--border)]",
                    ].join(" ")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Sender email (optional) */}
                <div>
                  <label
                    htmlFor="modal-sender-email"
                    className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
                  >
                    이메일 <span className="text-[var(--text-muted)]">(선택)</span>
                  </label>
                  <input
                    id="modal-sender-email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full px-3 py-2 rounded-lg text-sm text-[var(--text)] bg-[var(--bg-secondary)] border border-[var(--border)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="px-6 pb-5 pt-3 border-t border-[var(--border)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors"
                >
                  취소
                </button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                  whileTap={{ scale: 0.96 }}
                  className={[
                    "px-5 py-2 text-sm font-medium rounded-lg",
                    "bg-[var(--accent)] text-white",
                    "hover:bg-[var(--accent-hover)] transition-colors",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "flex items-center gap-2",
                  ].join(" ")}
                >
                  {submitting && (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  {submitting ? "전송 중…" : "보내기"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
