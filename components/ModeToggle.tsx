"use client";

import { motion } from "framer-motion";

type Mode = "intro" | "markdown";

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const isIntro = mode === "intro";

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => onChange(isIntro ? "markdown" : "intro")}
        aria-label={isIntro ? "마크다운 모드로 전환" : "소개 모드로 전환"}
        title={isIntro ? "마크다운 탐색기로 전환" : "소개 페이지로 전환"}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-all duration-200 group"
      >
        {/* Animated pill indicator */}
        <div className="relative w-8 h-4 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex-shrink-0 overflow-hidden">
          <motion.div
            className="absolute top-0.5 w-3 h-3 rounded-full bg-[var(--accent)]"
            animate={{ left: isIntro ? "2px" : "calc(100% - 14px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Label */}
        <span className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors whitespace-nowrap">
          {isIntro ? (
            <>
              <span className="mr-1">📖</span>소개
            </>
          ) : (
            <>
              <span className="mr-1">📁</span>탐색기
            </>
          )}
        </span>

        {/* Arrow icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
