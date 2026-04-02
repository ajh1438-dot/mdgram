"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SelectedRange } from "./CommentPanel";

interface PopoverPosition {
  top: number;
  left: number;
}

interface CommentPopoverProps {
  /** The InlineMarkdown (or any) content to wrap */
  children: ReactNode;
  /** Called when the user clicks "댓글 달기" with the selection info */
  onRequestComment: (range: SelectedRange) => void;
}

/**
 * Wraps markdown content and detects text selection via the Web Selection API.
 * When text is selected inside the wrapper, shows a small "댓글 달기" popover
 * above the selection.
 */
export default function CommentPopover({
  children,
  onRequestComment,
}: CommentPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPosition | null>(null);
  const [pendingRange, setPendingRange] = useState<SelectedRange | null>(null);

  const clearPopover = useCallback(() => {
    setPopoverPos(null);
    setPendingRange(null);
  }, []);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();

    if (
      !selection ||
      selection.isCollapsed ||
      selection.rangeCount === 0
    ) {
      clearPopover();
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    if (!selectedText || selectedText.length < 2) {
      clearPopover();
      return;
    }

    // Only activate inside our container
    const container = containerRef.current;
    if (!container) {
      clearPopover();
      return;
    }
    if (
      !container.contains(range.commonAncestorContainer)
    ) {
      clearPopover();
      return;
    }

    // Calculate character offsets relative to container plain text
    const fullText = container.innerText ?? container.textContent ?? "";
    const beforeRange = document.createRange();
    beforeRange.setStart(container, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const offsetStart = beforeRange.toString().length;
    const offsetEnd = offsetStart + selectedText.length;

    setPendingRange({
      selected_text: selectedText,
      offset_start: offsetStart,
      offset_end: offsetEnd,
    });

    // Position popover above selection
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    // Fallback if getBoundingClientRect returns zeros
    if (rect.width === 0 && rect.height === 0) {
      clearPopover();
      return;
    }

    setPopoverPos({
      top: rect.top - containerRect.top - 40, // 40px above
      left: Math.max(0, rect.left - containerRect.left + rect.width / 2),
    });

    // Suppress unused variable warning
    void fullText;
  }, [clearPopover]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  // Clear on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        clearPopover();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [clearPopover]);

  function handleCommentClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pendingRange) {
      onRequestComment(pendingRange);
      clearPopover();
      window.getSelection()?.removeAllRanges();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {children}

      <AnimatePresence>
        {popoverPos && pendingRange && (
          <motion.div
            key="comment-popover"
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: popoverPos.top,
              left: popoverPos.left,
              transform: "translateX(-50%)",
              zIndex: 30,
            }}
            className="pointer-events-auto"
            onMouseDown={(e) => e.preventDefault()} // prevent selection loss
          >
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.58A13.026 13.026 0 0011 14c2.236 0 4.43-.18 6.57-.524C19.007 13.245 20 11.986 20 10.574V5.426c0-1.413-.993-2.67-2.43-2.902A41.102 41.102 0 0010 2zm0 8a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm8-1a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
              댓글 달기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
