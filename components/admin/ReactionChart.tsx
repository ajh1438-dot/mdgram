"use client";

import { useEffect, useState } from "react";
import { FolderTreeNode } from "@/types/tree";

interface ReactionRow {
  node_id: string;
  count: number;
}

interface ChartItem {
  node_id: string;
  name: string;
  count: number;
}

/** Flatten a nested tree into a map of id → name */
function flattenTree(
  nodes: FolderTreeNode[],
  acc: Map<string, string> = new Map()
): Map<string, string> {
  for (const node of nodes) {
    acc.set(node.id, node.name);
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, acc);
    }
  }
  return acc;
}

export default function ReactionChart() {
  const [items, setItems] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [reactionsRes, treeRes] = await Promise.all([
          fetch("/api/reactions"),
          fetch("/api/tree"),
        ]);

        if (!reactionsRes.ok) throw new Error("Failed to fetch reactions");
        if (!treeRes.ok) throw new Error("Failed to fetch tree");

        const reactions: ReactionRow[] = await reactionsRes.json();
        const tree: FolderTreeNode[] = await treeRes.json();

        const nameMap = flattenTree(tree);

        const mapped: ChartItem[] = reactions
          .map((r) => ({
            node_id: r.node_id,
            name: nameMap.get(r.node_id) ?? r.node_id.slice(0, 8) + "…",
            count: r.count,
          }))
          .sort((a, b) => b.count - a.count);

        setItems(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[var(--text-muted)]">
        Loading reactions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-950/30 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[var(--text-muted)]">
        No reactions yet.
      </div>
    );
  }

  const maxCount = items[0].count;

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        return (
          <div key={item.node_id} className="flex items-center gap-3">
            {/* Label */}
            <span
              className="w-36 shrink-0 truncate text-right text-xs text-[var(--text-muted)]"
              title={item.name}
            >
              {item.name}
            </span>

            {/* Bar track */}
            <div className="relative flex-1 h-5 rounded bg-[var(--bg-secondary)] overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: "var(--accent)",
                  opacity: 0.85,
                }}
              />
            </div>

            {/* Count */}
            <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-[var(--text)]">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
