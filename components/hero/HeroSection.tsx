"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MindmapBackground from "./MindmapBackground";
import ScrollCTA from "./ScrollCTA";
import { FolderTreeNode } from "@/types/tree";

interface SiteConfig {
  hero_title: string;
  hero_subtitle: string;
  hero_copy: string;
}

export default function HeroSection() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderTreeNode | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: SiteConfig) => setConfig(data))
      .catch(() => {
        // Fallback so Hero renders without API
        setConfig({
          hero_title: "연결의 숲",
          hero_subtitle: "생각이 나무처럼 자라고 이야기가 숲을 이루는 곳",
          hero_copy: "마크다운 서사 소셜 플랫폼",
        });
      });
  }, []);

  const handleNodeClick = (folder: FolderTreeNode) => {
    setSelectedFolder(folder);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-bg flex items-center justify-center">
      {/* D3 Mindmap Background */}
      <MindmapBackground onNodeClick={handleNodeClick} />

      {/* Radial gradient vignette so text is readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, var(--bg) 100%)",
        }}
      />

      {/* Hero text */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-2xl w-full overflow-hidden">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-text leading-tight break-words"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {config?.hero_title ?? "연결의 숲"}
        </motion.h1>

        <motion.p
          className="mt-4 sm:mt-5 text-base sm:text-lg md:text-2xl text-text-muted font-medium"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {config?.hero_subtitle ?? "생각이 나무처럼 자라고 이야기가 숲을 이루는 곳"}
        </motion.p>

        <motion.p
          className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-accent font-semibold tracking-wide uppercase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          {config?.hero_copy ?? "마크다운 서사 소셜 플랫폼"}
        </motion.p>

        {selectedFolder && (
          <motion.div
            className="mt-6 px-4 py-2 rounded-full border border-accent text-accent text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {selectedFolder.name} 탐색 중...
          </motion.div>
        )}
      </div>

      {/* Scroll CTA */}
      <ScrollCTA />
    </section>
  );
}
