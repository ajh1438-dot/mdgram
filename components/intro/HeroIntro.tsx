"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MindmapBackground = dynamic(() => import("@/components/hero/MindmapBackground"), {
  ssr: false,
  loading: () => null,
});

interface SiteConfig {
  hero_title: string;
  hero_subtitle: string;
  hero_copy: string;
}

interface HeroIntroProps {
  onScrollNext?: () => void;
}

export default function HeroIntro({ onScrollNext }: HeroIntroProps) {
  const [config, setConfig] = useState<SiteConfig>({
    hero_title: "연결의 숲",
    hero_subtitle: "호기심 천국에 사는 회계사",
    hero_copy: "모든 것이 궁금합니다. 그것들을 배우고, 연결합니다.",
  });

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: SiteConfig) => setConfig(data))
      .catch(() => {});
  }, []);

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
        <motion.div
          className="mb-4 px-3 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold tracking-widest uppercase"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {config.hero_title}
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[var(--text)] leading-tight"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          {config.hero_subtitle}
        </motion.h1>

        <motion.p
          className="mt-5 text-base sm:text-lg md:text-xl text-[var(--text-muted)] font-medium max-w-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          {config.hero_copy}
          <br />
          <span className="text-[var(--accent)]">그게 제 인생의 행복입니다.</span>
        </motion.p>

        <motion.button
          onClick={handleScroll}
          className="mt-10 px-6 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          소개 보기
        </motion.button>
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
