"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface GuestbookEntry {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export default function GuestBook() {
  const [posts, setPosts] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView(0.1);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/guestbook");
      const data: GuestbookEntry[] = await res.json();
      setPosts(Array.isArray(data) ? data.slice(0, 12) : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <section
      id="intro-guestbook"
      ref={ref as React.RefObject<HTMLElement>}
      className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 bg-[var(--bg)]"
    >
      <div className="max-w-4xl w-full">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest">
            Guestbook
          </span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          랩장님과 참가자 분들께
        </motion.h2>

        <motion.p
          className="text-[var(--text-muted)] mb-4 max-w-xl text-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          많은 가르침을 요청드립니다.
        </motion.p>

        <motion.p
          className="text-[var(--text-muted)] mb-10 max-w-xl text-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          어떤 한 마디도 이 숲을 자라게 합니다. 피드백이든, 응원이든, 한 줄이든 — 남겨주세요.
        </motion.p>

        {/* Visitor posts */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            className="text-center py-16 mb-10"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-[var(--text-muted)]">아직 방문자 소개가 없습니다.</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">첫 번째 이야기를 심어보세요!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)]/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] flex items-center justify-center text-[var(--accent)] text-xs font-bold flex-shrink-0">
                    {post.author_name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{post.author_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
                  {post.message.slice(0, 150)}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Guestbook form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GuestbookForm onPosted={fetchPosts} />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Simple inline guestbook form ── */
function GuestbookForm({ onPosted }: { onPosted: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("이름을 입력해주세요."); return; }
    if (!message.trim()) { setError("메시지를 입력해주세요."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? "제출 실패");
      }
      setSuccess(true);
      setName("");
      setMessage("");
      onPosted();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-[var(--text)] mb-4">한 마디 남겨보세요</p>
      {success && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          메시지가 숲에 심어졌습니다!
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            이름 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            maxLength={30}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            메시지 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="응원의 한 마디, 피드백, 짧은 소개 — 무엇이든 좋습니다."
            rows={4}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition resize-y"
          />
        </div>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "남기는 중…" : "남기기"}
          </button>
        </div>
      </form>
    </div>
  );
}
