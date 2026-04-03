"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { FolderTreeNode } from "@/types/tree";

const OutlineTree = dynamic(() => import("@/components/explorer/OutlineTree"), { ssr: false });
const MindmapMini = dynamic(() => import("@/components/explorer/MindmapMini"), { ssr: false });

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  created_at: string;
}

interface PageData {
  profile: UserProfile;
  tree: FolderTreeNode[];
}

type Status = "loading" | "notfound" | "ready" | "error";

export default function UserPage() {
  const params = useParams();
  const username = typeof params?.username === "string" ? params.username : "";

  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<PageData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch profile + tree
  useEffect(() => {
    if (!username) return;
    setStatus("loading");

    fetch(`/api/users/${encodeURIComponent(username)}`)
      .then(async (res) => {
        if (res.status === 404) { setStatus("notfound"); return; }
        if (!res.ok) { setStatus("error"); return; }
        const json = await res.json() as PageData;
        setData(json);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [username]);

  // Check if logged-in user is the owner
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (data && currentUserId) {
      setIsOwner(data.profile.id === currentUserId);
    }
  }, [data, currentUserId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <span className="inline-block w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-[var(--text-muted)] animate-pulse">불러오는 중…</span>
      </div>
    );
  }

  if (status === "notfound") {
    notFound();
    return null;
  }

  if (status === "error" || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <p className="text-sm text-[var(--text-muted)]">페이지를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { profile, tree } = data;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          연결의 숲으로
        </a>
      </div>

      {/* Profile header */}
      <header className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start gap-5">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] text-2xl font-bold select-none">
            {profile.display_name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                {profile.display_name}
              </h1>
              <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                @{profile.username}
              </span>
              {isOwner && (
                <span className="text-xs bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] px-2 py-0.5 rounded-full font-medium">
                  내 페이지
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="mt-2 text-sm text-[var(--text-muted)] max-w-prose leading-relaxed">
                {profile.bio}
              </p>
            )}
            {!profile.bio && isOwner && (
              <p className="mt-2 text-sm text-[var(--text-muted)] italic">
                아직 소개글이 없습니다.
              </p>
            )}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex-shrink-0">
              <a
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
                콘텐츠 관리
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Tree section */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {profile.display_name}님의 숲
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              항목을 클릭하면 내용이 열립니다.
            </p>
          </div>
          {tree.length > 0 && (
            <div className="hidden sm:block flex-shrink-0">
              <MindmapMini tree={tree} />
            </div>
          )}
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          {tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-[var(--text-muted)] opacity-40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <p className="text-sm text-[var(--text-muted)]">
                {isOwner ? "아직 콘텐츠가 없습니다. 관리자 페이지에서 추가해보세요!" : "아직 콘텐츠가 없습니다."}
              </p>
              {isOwner && (
                <a
                  href="/admin"
                  className="text-xs px-4 py-1.5 rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  콘텐츠 추가하기
                </a>
              )}
            </div>
          ) : (
            <div className="p-6">
              <OutlineTree nodes={tree} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
