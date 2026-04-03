"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FolderTreeNode } from "@/types/tree";
import VisitorPostForm from "@/components/social/VisitorPostForm";
import { useInView } from "./useInView";

interface Post {
  id: string;
  name: string;
  content: string;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView(0.1);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/tree");
      const data: FolderTreeNode[] = await res.json();
      const allFiles: FolderTreeNode[] = [];
      function walk(nodes: FolderTreeNode[]) {
        for (const n of nodes) {
          if (n.type === "file") allFiles.push(n);
          if (n.children?.length) walk(n.children);
        }
      }
      walk(data);

      const visitorPosts = allFiles
        .filter((f) => f.name.includes("소개"))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 12)
        .map((f) => ({
          id: f.id,
          name: f.name.replace("_소개.md", "").replace(".md", ""),
          content: f.content ?? "",
          created_at: f.created_at,
        }));

      setPosts(visitorPosts);
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
                    {post.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{post.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
                  {post.content.replace(/^#+\s/gm, "").slice(0, 150)}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Post form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <VisitorPostForm onPostCreated={fetchPosts} />
        </motion.div>
      </div>
    </section>
  );
}
