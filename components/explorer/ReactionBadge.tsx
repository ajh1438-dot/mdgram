"use client";

interface ReactionBadgeProps {
  count?: number;
}

export default function ReactionBadge({ count = 0 }: ReactionBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded-full text-xs bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)] select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3 h-3 text-[var(--accent)]"
        aria-hidden="true"
      >
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.075C4.32 12.78 3 10.98 3 8.5a5.5 5.5 0 0111 0c0 2.48-1.32 4.28-2.885 5.645a22.044 22.044 0 01-2.582 2.075 20.76 20.76 0 01-1.162.682l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
      </svg>
      <span>{count}</span>
    </span>
  );
}
