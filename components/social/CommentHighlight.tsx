"use client";

import type { ReactNode } from "react";
import type { SelectedRange } from "./CommentPanel";

interface CommentHighlightProps {
  /** The text content to display with the highlight */
  children: ReactNode;
  /** The range associated with this highlight */
  range: SelectedRange;
  /** Called when the user clicks this highlighted text */
  onClick: (range: SelectedRange) => void;
  /** Number of comments for this range — shows a small badge */
  commentCount?: number;
}

/**
 * Renders a span of text with a subtle highlight background, indicating
 * that the text range has at least one comment. Clicking opens the
 * CommentPanel for that range.
 */
export default function CommentHighlight({
  children,
  range,
  onClick,
  commentCount,
}: CommentHighlightProps) {
  return (
    <mark
      role="button"
      tabIndex={0}
      title={`댓글 ${commentCount ?? 1}개 — 클릭하여 보기`}
      onClick={() => onClick(range)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(range);
        }
      }}
      style={{
        backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
        borderBottom: "1.5px solid var(--accent)",
        color: "inherit",
        borderRadius: "2px",
        cursor: "pointer",
        padding: "0 1px",
        position: "relative",
      }}
      className="transition-colors hover:[background-color:color-mix(in_srgb,var(--accent)_30%,transparent)]"
    >
      {children}
      {commentCount !== undefined && commentCount > 0 && (
        <sup
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--accent)",
            color: "#fff",
            fontSize: "9px",
            lineHeight: 1,
            borderRadius: "99px",
            padding: "1px 4px",
            marginLeft: "2px",
            fontWeight: 700,
            verticalAlign: "super",
            userSelect: "none",
          }}
        >
          {commentCount}
        </sup>
      )}
    </mark>
  );
}
