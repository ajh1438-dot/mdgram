"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  created_at: string;
}

export default function ForestCTA() {
  const { ref, inView } = useInView(0.1);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) return;
    // Fetch a handful of user profiles from the users list endpoint
    fetch("/api/users")
      .then((r) => r.ok ? r.json() as Promise<UserProfile[]> : Promise.resolve([]))
      .then((data) => { setUsers(data.slice(0, 6)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative py-20 px-4 bg-[var(--bg)] overflow-hidden"
    >
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-96 h-96 rounded-full bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
            나도 만들기
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] leading-snug mb-4">
            나만의 연결의 숲을 시작해보세요
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed mb-8">
            마크다운으로 생각을 정리하고 나만의 숲을 만들어보세요.
            회원가입은 무료이며 몇 분이면 충분합니다.
          </p>

          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            무료로 나만의 숲 만들기
          </a>
        </motion.div>

        {/* User list */}
        {!loading && users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            <p className="text-xs text-[var(--text-muted)] mb-4">다른 분들의 숲</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {users.map((u) => (
                <a
                  key={u.id}
                  href={`/${u.username}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] flex items-center justify-center text-[var(--accent)] font-bold text-[9px] flex-shrink-0">
                    {u.display_name.charAt(0)}
                  </span>
                  {u.display_name}
                  <span className="text-[var(--text-muted)] opacity-50">@{u.username}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
