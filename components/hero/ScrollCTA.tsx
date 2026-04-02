"use client";

import { motion } from "framer-motion";

export default function ScrollCTA() {
  const handleClick = () => {
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
      <span className="text-text-muted text-sm font-medium tracking-wide">
        숲을 탐색하기
      </span>

      <motion.button
        onClick={handleClick}
        aria-label="아래로 스크롤하여 숲을 탐색하기"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-border text-accent hover:border-accent hover:bg-accent/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* Down chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.button>
    </div>
  );
}
