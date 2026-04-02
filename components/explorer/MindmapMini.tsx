"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import { FolderTreeNode } from "@/types/tree";

interface MindmapMiniProps {
  tree: FolderTreeNode[];
  /** ID of the currently expanded/active folder, if any */
  activeFolderId?: string;
}

/* Convert our tree to D3 hierarchy */
function toHierarchy(nodes: FolderTreeNode[]): d3.HierarchyNode<FolderTreeNode> {
  const root: FolderTreeNode = {
    id: "__root__",
    name: "연결의 숲",
    type: "folder",
    parent_id: null,
    order: 0,
    content: null,
    created_at: "",
    updated_at: "",
    children: nodes,
  };
  return d3.hierarchy<FolderTreeNode>(root, (d) => d.children ?? []);
}

const WIDTH = 320;
const HEIGHT = 240;
const MARGIN = { top: 20, right: 16, bottom: 20, left: 16 };

export default function MindmapMini({ tree, activeFolderId }: MindmapMiniProps) {
  const [open, setOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!open || !svgRef.current || tree.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const root = toHierarchy(tree);
    const treeLayout = d3
      .tree<FolderTreeNode>()
      .size([HEIGHT - MARGIN.top - MARGIN.bottom, WIDTH - MARGIN.left - MARGIN.right]);

    treeLayout(root);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    /* Links */
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "var(--border)")
      .attr("stroke-width", 1)
      .attr("d", (d) => {
        const s = d.source as d3.HierarchyPointNode<FolderTreeNode>;
        const t = d.target as d3.HierarchyPointNode<FolderTreeNode>;
        return `M${s.y},${s.x}C${(s.y + t.y) / 2},${s.x} ${(s.y + t.y) / 2},${t.x} ${t.y},${t.x}`;
      });

    /* Nodes */
    const node = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${(d as d3.HierarchyPointNode<FolderTreeNode>).y},${(d as d3.HierarchyPointNode<FolderTreeNode>).x})`);

    node
      .append("circle")
      .attr("r", (d) => (d.data.id === activeFolderId ? 5 : 3))
      .attr("fill", (d) => {
        if (d.data.id === "__root__") return "var(--accent)";
        if (d.data.id === activeFolderId) return "var(--accent-hover)";
        return d.data.type === "folder" ? "var(--accent)" : "var(--text-muted)";
      })
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1);

    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -6 : 6))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "9px")
      .attr("font-family", "var(--font-sans, sans-serif)")
      .text((d) => (d.data.name.length > 10 ? d.data.name.slice(0, 9) + "…" : d.data.name));
  }, [open, tree, activeFolderId]);

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        title={open ? "마인드맵 닫기" : "마인드맵 보기"}
        aria-label={open ? "마인드맵 닫기" : "마인드맵 보기"}
        className={[
          "inline-flex items-center justify-center",
          "w-9 h-9 rounded-full",
          "border border-[var(--border)]",
          "bg-[var(--card)] text-[var(--text-muted)]",
          "hover:text-[var(--accent)] hover:border-[var(--accent)]",
          "transition-colors duration-150 shadow-sm",
        ].join(" ")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M13.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM15 6.5A1.5 1.5 0 0113.5 8h-.293l-3.25 3.25A1.5 1.5 0 017.5 13H6a1.5 1.5 0 110-3h.293l.75-.75H7a1.5 1.5 0 000-3 1.5 1.5 0 000 3h-.043l-1.25 1.25A1.5 1.5 0 114 12.5a1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5 1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 01.75-1.299V8.8A1.5 1.5 0 013 7.5 1.5 1.5 0 014.5 6a1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-.75 1.299v3.401a1.5 1.5 0 01.43.3l.82-.82A1.5 1.5 0 017 9a1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-.75 1.3l2.957-2.957A1.5 1.5 0 0112 7.5 1.5 1.5 0 0113.5 6 1.5 1.5 0 0115 7.5z" />
        </svg>
      </button>

      {/* Overlay panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mindmap-panel"
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ duration: 0.18 }}
            className={[
              "absolute right-0 top-11 z-50",
              "bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl",
              "overflow-hidden",
            ].join(" ")}
            style={{ width: WIDTH, height: HEIGHT }}
          >
            <div className="px-3 pt-2 pb-1 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)]">트리 구조</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                aria-label="닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
                </svg>
              </button>
            </div>
            {tree.length === 0 ? (
              <div className="flex items-center justify-center h-full pb-8">
                <p className="text-xs text-[var(--text-muted)]">데이터 없음</p>
              </div>
            ) : (
              <svg
                ref={svgRef}
                width={WIDTH}
                height={HEIGHT - 32}
                aria-label="트리 마인드맵"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
