"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  id: string;
  keyword_tags: string[];
  content: string;
  sender_name: string;
  sender_email: string | null;
  is_read: boolean;
  created_at: string;
}

type FilterTab = "all" | "unread" | "read";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Group messages by their first keyword tag (or "기타" if empty) */
function groupByTag(messages: Message[]): Map<string, Message[]> {
  const map = new Map<string, Message[]>();
  for (const msg of messages) {
    const tag =
      msg.keyword_tags && msg.keyword_tags.length > 0
        ? msg.keyword_tags[0]
        : "기타";
    if (!map.has(tag)) map.set(tag, []);
    map.get(tag)!.push(msg);
  }
  return map;
}

export default function MessageInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data: Message[] = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleExpand(msg: Message) {
    const isExpanding = expandedId !== msg.id;
    setExpandedId(isExpanding ? msg.id : null);

    // Mark as read if unread and we are expanding
    if (isExpanding && !msg.is_read) {
      setMarkingId(msg.id);
      try {
        const res = await fetch(`/api/messages/${msg.id}/read`, {
          method: "PATCH",
        });
        if (res.ok) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
          );
        }
      } finally {
        setMarkingId(null);
      }
    }
  }

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return m.is_read;
    return true;
  });

  const grouped = groupByTag(filtered);
  const unreadCount = messages.filter((m) => !m.is_read).length;

  const tabClass = (tab: FilterTab) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      filter === tab
        ? "bg-[var(--accent)] text-white"
        : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)]"
    }`;

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[var(--text-muted)]">
        Loading messages…
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

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5">
        <button className={tabClass("all")} onClick={() => setFilter("all")}>
          전체 ({messages.length})
        </button>
        <button
          className={tabClass("unread")}
          onClick={() => setFilter("unread")}
        >
          읽지 않음
          {unreadCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button className={tabClass("read")} onClick={() => setFilter("read")}>
          읽음
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-sm text-[var(--text-muted)]">
          {filter === "unread" ? "읽지 않은 메시지가 없습니다." : "메시지가 없습니다."}
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([tag, msgs]) => (
            <div key={tag} className="space-y-1">
              {/* Tag group header */}
              <div className="flex items-center gap-2 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                  #{tag}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {msgs.length}개
                </span>
              </div>

              {/* Message rows */}
              <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] overflow-hidden">
                {msgs.map((msg) => {
                  const isExpanded = expandedId === msg.id;
                  return (
                    <div key={msg.id} className="bg-[var(--card)]">
                      {/* Row header — clickable */}
                      <button
                        onClick={() => handleExpand(msg)}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        {/* Unread dot */}
                        <span
                          className={`shrink-0 h-2 w-2 rounded-full transition-colors ${
                            msg.is_read
                              ? "bg-transparent border border-[var(--border)]"
                              : "bg-[var(--accent)]"
                          }`}
                        />

                        {/* Sender */}
                        <span
                          className={`flex-1 text-sm truncate ${
                            msg.is_read
                              ? "text-[var(--text-muted)]"
                              : "font-semibold text-[var(--text)]"
                          }`}
                        >
                          {msg.sender_name}
                        </span>

                        {/* Preview */}
                        <span className="hidden sm:block flex-[2] text-xs text-[var(--text-muted)] truncate">
                          {msg.content}
                        </span>

                        {/* Timestamp */}
                        <time className="shrink-0 text-xs text-[var(--text-muted)]">
                          {formatDate(msg.created_at)}
                        </time>

                        {/* Chevron */}
                        <svg
                          className={`shrink-0 h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Expanded detail */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="detail"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-4 space-y-3">
                              {/* Meta */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                                <span>
                                  <span className="font-medium text-[var(--text)]">보낸이:</span>{" "}
                                  {msg.sender_name}
                                </span>
                                {msg.sender_email && (
                                  <span>
                                    <span className="font-medium text-[var(--text)]">이메일:</span>{" "}
                                    <a
                                      href={`mailto:${msg.sender_email}`}
                                      className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)]"
                                    >
                                      {msg.sender_email}
                                    </a>
                                  </span>
                                )}
                                <span>
                                  <span className="font-medium text-[var(--text)]">일시:</span>{" "}
                                  {formatDate(msg.created_at)}
                                </span>
                                {markingId === msg.id && (
                                  <span className="text-[var(--accent)]">읽음 처리 중…</span>
                                )}
                              </div>

                              {/* Tags */}
                              {msg.keyword_tags && msg.keyword_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.keyword_tags.map((t) => (
                                    <span
                                      key={t}
                                      className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs text-[var(--accent)]"
                                    >
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Content */}
                              <p className="text-sm leading-relaxed text-[var(--text)] whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
