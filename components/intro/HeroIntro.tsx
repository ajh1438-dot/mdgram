"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MindmapBackground = dynamic(() => import("@/components/hero/MindmapBackground"), {
  ssr: false,
  loading: () => null,
});

interface HeroIntroProps {
  onScrollNext?: () => void;
  onSwitchToMarkdown?: () => void;
}

export default function HeroIntro({ onScrollNext, onSwitchToMarkdown }: HeroIntroProps) {

  const handleScroll = () => {
    if (onScrollNext) {
      onScrollNext();
    } else {
      const next = document.getElementById("intro-about");
      next?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="intro-hero"
      className="relative h-screen w-full overflow-hidden bg-[var(--bg)] flex items-center justify-center"
    >
      {/* D3 Mindmap Background */}
      <MindmapBackground onNodeClick={() => {}} />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, var(--bg) 100%)",
        }}
      />

      {/* Hero text */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-2xl w-full">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[var(--text)] leading-tight whitespace-pre-line"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          {"호기심 천국에 사는\n회계사"}
        </motion.h1>

        <motion.div
          className="mt-10 flex gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <motion.button
            onClick={handleScroll}
            className="px-6 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            내 소개
          </motion.button>
          <motion.button
            onClick={() => onSwitchToMarkdown?.()}
            className="px-6 py-3 rounded-full border border-[var(--accent)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)]/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            마크다운
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[var(--text-muted)] text-xs tracking-wide">스크롤</span>
        <motion.button
          onClick={handleScroll}
          aria-label="아래로 스크롤"
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}
