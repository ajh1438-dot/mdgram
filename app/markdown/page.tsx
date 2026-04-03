"use client";

import dynamic from "next/dynamic";
import SettingsPanel from "@/components/SettingsPanel";

const HeroSection = dynamic(() => import("@/components/hero/HeroSection"), {
  ssr: false,
  loading: () => (
    <div className="relative h-screen w-full flex items-center justify-center bg-[var(--bg)]">
      <span className="text-[var(--text-muted)] text-sm animate-pulse">로딩 중…</span>
    </div>
  ),
});

const ExplorerSection = dynamic(() => import("@/components/explorer/ExplorerSection"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
      <span className="text-[var(--text-muted)] text-sm animate-pulse">탐색기 로딩 중…</span>
    </div>
  ),
});

export default function MarkdownPage() {
  return (
    <>
      {/* Back to intro — fixed top-left */}
      <a
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] text-xs font-medium hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        내 소개
      </a>

      {/* Settings gear — fixed top-right */}
      <div className="fixed top-4 right-4 z-50">
        <SettingsPanel />
      </div>

      <HeroSection />
      <ExplorerSection />
    </>
  );
}
