"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Visitor fingerprint ── */
function getOrCreateVisitorHash(): string {
  const key = "vhash";
  const stored = localStorage.getItem(key);
  if (stored) return stored;

  const raw = `${navigator.userAgent}|${screen.width}x${screen.height}`;
  // djb2-style numeric hash → hex string
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) + h) ^ raw.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  const hash = h.toString(16).padStart(8, "0");
  localStorage.setItem(key, hash);
  return hash;
}

/* ── Heart icons ── */
function HeartOutline({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.344l1.172-1.172a4 4 0 115.656 5.656L10 17.656l-6.828-6.828a4 4 0 010-5.656z"
      />
    </svg>
  );
}

function HeartFilled({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.344l1.172-1.172a4 4 0 115.656 5.656L10 17.656l-6.828-6.828a4 4 0 010-5.656z" />
    </svg>
  );
}

/* ── Component ── */
interface ReactionBadgeProps {
  node_id: string;
  keyword: string;
}

export default function ReactionBadge({ node_id, keyword }: ReactionBadgeProps) {
  const [count, setCount] = useState(0);
  const [reacted, setReacted] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevCount = useRef(0);

  /* Fetch initial count */
  useEffect(() => {
    if (!node_id) return;

    // Check if this visitor already reacted (persisted in localStorage)
    const reactedKey = `reacted:${node_id}`;
    const alreadyReacted = localStorage.getItem(reactedKey) === "1";
    if (alreadyReacted) setReacted(true);

    fetch(`/api/reactions?node_id=${encodeURIComponent(node_id)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && typeof data.count === "number") {
          prevCount.current = data.count;
          setCount(data.count);
        }
      })
      .catch(() => {/* silent */});
  }, [node_id]);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation(); // don't toggle file/folder
    if (reacted || loading) return;

    setLoading(true);
    const visitorHash = getOrCreateVisitorHash();

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, node_id, visitor_hash: visitorHash }),
      });

      if (res.ok || res.status === 409) {
        // 409 = already reacted on server side — treat as reacted
        setReacted(true);
        localStorage.setItem(`reacted:${node_id}`, "1");
        if (res.ok) {
          setCount((c) => c + 1);
        }
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={reacted || loading}
      whileTap={reacted ? {} : { scale: 1.3 }}
      aria-label={reacted ? `좋아요 ${count}개` : "좋아요"}
      title={reacted ? "이미 공감했습니다" : "공감하기"}
      className={[
        "inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded-full text-xs",
        "bg-[var(--bg-secondary)] border border-[var(--border)] select-none",
        "transition-colors duration-150",
        reacted
          ? "text-red-500 border-red-300 cursor-default"
          : "text-[var(--text-muted)] hover:text-red-400 hover:border-red-300 cursor-pointer",
        loading ? "opacity-60" : "",
      ].join(" ")}
    >
      <motion.span
        key={reacted ? "filled" : "outline"}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-3 h-3 flex-shrink-0"
      >
        {reacted ? (
          <HeartFilled className="w-3 h-3 text-red-500" />
        ) : (
          <HeartOutline className="w-3 h-3" />
        )}
      </motion.span>

      {/* Animated count */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
