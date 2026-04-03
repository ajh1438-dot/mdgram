"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import SettingsPanel from "@/components/SettingsPanel";
import ModeToggle from "@/components/ModeToggle";

type Mode = "intro" | "markdown";
const MODE_KEY = "forest-view-mode";

// ─── Markdown mode (existing) ───────────────────────────────────────────
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

// ─── Intro mode (new) ───────────────────────────────────────────────────
const HeroIntro = dynamic(() => import("@/components/intro/HeroIntro"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)]">
      <span className="text-[var(--text-muted)] text-sm animate-pulse">소개 로딩 중…</span>
    </div>
  ),
});

const AboutMe = dynamic(() => import("@/components/intro/AboutMe"), { ssr: false });
const MyCareer = dynamic(() => import("@/components/intro/MyCareer"), { ssr: false });
const MyInterests = dynamic(() => import("@/components/intro/MyInterests"), { ssr: false });
const BuildingProcess = dynamic(() => import("@/components/intro/BuildingProcess"), { ssr: false });
const GuestBook = dynamic(() => import("@/components/intro/GuestBook"), { ssr: false });
const ForestCTA = dynamic(() => import("@/components/intro/ForestCTA"), { ssr: false });

export default function Home() {
  const [mode, setMode] = useState<Mode>("intro");
  const [mounted, setMounted] = useState(false);

  // Restore preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(MODE_KEY) as Mode | null;
    if (saved === "intro" || saved === "markdown") setMode(saved);
    setMounted(true);
  }, []);

  function handleModeChange(next: Mode) {
    setMode(next);
    localStorage.setItem(MODE_KEY, next);
    // Scroll to top on mode switch
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!mounted) {
    // SSR / initial flash prevention — show a minimal shell
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)]">
        <span className="text-[var(--text-muted)] text-sm animate-pulse">연결의 숲…</span>
      </div>
    );
  }

  return (
    <>
      {/* Mode toggle — fixed top-left */}
      <ModeToggle mode={mode} onChange={handleModeChange} />

      {/* Settings gear — fixed top-right */}
      <div className="fixed top-4 right-4 z-50">
        <SettingsPanel />
      </div>

      <AnimatePresence mode="wait">
        {mode === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <HeroIntro />
            <AboutMe />
            <MyCareer />
            <MyInterests />
            <BuildingProcess />
            <GuestBook />
            <ForestCTA />
          </motion.div>
        ) : (
          <motion.div
            key="markdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <HeroSection />
            <ExplorerSection />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
