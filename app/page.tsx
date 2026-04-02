"use client";

import dynamic from "next/dynamic";
import ThemeToggle from "@/components/ThemeToggle";

// Dynamic imports for code splitting — heavy D3 / tree components
const HeroSection = dynamic(() => import("@/components/hero/HeroSection"), {
  ssr: false,
  loading: () => (
    <div className="relative h-screen w-full flex items-center justify-center bg-bg">
      <span className="text-text-muted text-sm animate-pulse">로딩 중…</span>
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

export default function Home() {
  return (
    <>
      {/* Fixed ThemeToggle in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero — fullscreen */}
      <HeroSection />

      {/* Explorer — inline outline view */}
      <ExplorerSection />
    </>
  );
}
