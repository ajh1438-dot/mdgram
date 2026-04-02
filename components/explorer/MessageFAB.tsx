"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopicMessageModal from "@/components/social/TopicMessageModal";

interface MessageFABProps {
  /** Keywords from the currently active folder/file context */
  contextKeywords?: string[];
}

export default function MessageFAB({ contextKeywords = [] }: MessageFABProps) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
        {/* Tooltip label */}
        <AnimatePresence>
          {hovered && (
            <motion.span
              key="fab-tooltip"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className={[
                "text-xs font-medium whitespace-nowrap",
                "bg-[var(--card)] text-[var(--text)] border border-[var(--border)]",
                "px-3 py-1.5 rounded-full shadow-lg",
              ].join(" ")}
              role="tooltip"
            >
              이 주제로 메시지 보내기
            </motion.span>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.button
          onClick={() => setModalOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label="이 주제로 메시지 보내기"
          title="이 주제로 메시지 보내기"
          className={[
            "w-14 h-14 rounded-full shadow-xl",
            "bg-[var(--accent)] text-white",
            "flex items-center justify-center",
            "hover:bg-[var(--accent-hover)] transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
            "focus:ring-offset-[var(--bg)]",
          ].join(" ")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
            aria-hidden="true"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </motion.button>
      </div>

      {/* Topic message modal */}
      <TopicMessageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialKeywords={contextKeywords}
      />
    </>
  );
}
