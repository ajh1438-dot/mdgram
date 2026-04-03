"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CommentPopover from "@/components/social/CommentPopover";
import CommentPanel, {
  type Comment,
  type SelectedRange,
} from "@/components/social/CommentPanel";

interface InlineMarkdownProps {
  content: string;
  /** file_id used to fetch and post comments */
  fileId?: string;
  /** Optional highlight IDs for future comment highlight feature */
  highlightIds?: string[];
}

export default function InlineMarkdown({
  content,
  fileId,
  highlightIds: _highlightIds,
}: InlineMarkdownProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // Fetch all comments for this file so we can show highlights
  const fetchComments = useCallback(async () => {
    if (!fileId) return;
    try {
      const res = await fetch(`/api/comments?file_id=${encodeURIComponent(fileId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data as Comment[]);
    } catch {
      // silent — highlights are best-effort
    }
  }, [fileId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleRequestComment = useCallback((range: SelectedRange) => {
    setSelectedRange(range);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    // Refresh highlights after panel closes (new comment may have been added)
    fetchComments();
  }, [fetchComments]);

  // Build a simple map of commented ranges for potential highlight use
  // (kept for future use; CommentHighlight integration lives in OutlineTree)
  void comments;

  const markdownContent = (
    <div
      className="inline-md mt-3 text-base leading-8 text-[var(--text)] overflow-x-hidden whitespace-normal"
      style={{ overflowWrap: "anywhere", wordBreak: "normal", overflowY: "visible" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-5 mb-3 text-[var(--accent)] border-b border-[var(--accent)]/20 pb-1.5">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-4 mb-2 text-[var(--accent)]">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-3 mb-1.5 text-[var(--accent)]/80">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-1.5 text-[var(--text)]">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-5 my-1.5 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-5 my-1.5 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[var(--text)]">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--accent)] pl-4 my-2 text-[var(--text-muted)] italic">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  className={`${className} block overflow-x-auto rounded-md text-xs leading-6`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="inline-block px-1 py-0.5 rounded text-xs bg-[var(--bg-secondary)] text-[var(--accent)] font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md p-3 my-2 overflow-x-auto text-xs">
              {children}
            </pre>
          ),
          hr: () => <hr className="border-[var(--border)] my-3" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text)]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[var(--text-muted)]">{children}</em>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-sm border-collapse border border-[var(--border)]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--border)] px-3 py-1.5 bg-[var(--bg-secondary)] font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--border)] px-3 py-1.5">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  // If no fileId, render plain markdown without comment features
  if (!fileId) {
    return markdownContent;
  }

  return (
    <>
      <CommentPopover onRequestComment={handleRequestComment}>
        {markdownContent}
      </CommentPopover>

      <CommentPanel
        open={panelOpen}
        fileId={fileId}
        selectedRange={selectedRange}
        onClose={handleClosePanel}
      />
    </>
  );
}
