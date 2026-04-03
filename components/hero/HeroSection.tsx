"use client";

import { motion } from "framer-motion";
import MindmapBackground from "./MindmapBackground";
import { FolderTreeNode } from "@/types/tree";
import { useState } from "react";

export default function HeroSection() {
  const [selectedFolder, setSelectedFolder] = useState<FolderTreeNode | null>(null);

  const handleNodeClick = (folder: FolderTreeNode) => {
    setSelectedFolder(folder);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-bg flex items-center justify-center">
      <MindmapBackground onNodeClick={handleNodeClick} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, var(--bg) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-2xl w-full overflow-hidden">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-text leading-tight break-words"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          연결의 숲
        </motion.h1>

        <motion.p
          className="mt-4 sm:mt-5 text-base sm:text-lg md:text-2xl text-text-muted font-medium"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          마크다운으로 저를 소개할게요
        </motion.p>

        {/* Two buttons */}
        <motion.div
          className="mt-10 flex gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <motion.a
            href="/"
            className="px-6 py-3 rounded-full border border-[var(--accent)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)]/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            내 소개
          </motion.a>
          <motion.button
            onClick={() => {
              const el = document.getElementById("explore");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            마크다운
          </motion.button>
        </motion.div>

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
    </section>
  );
}
