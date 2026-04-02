"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { FolderTreeNode } from "@/types/tree";

interface Props {
  onNodeClick?: (folder: FolderTreeNode) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  data?: FolderTreeNode;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export default function MindmapBackground({ onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topFolders, setTopFolders] = useState<FolderTreeNode[]>([]);

  useEffect(() => {
    fetch("/api/tree")
      .then((r) => r.json())
      .then((tree: FolderTreeNode[]) => {
        const folders = Array.isArray(tree)
          ? tree.filter((n) => n.type === "folder" && n.parent_id === null)
          : [];
        setTopFolders(folders);
      })
      .catch(() => {
        // Fallback demo nodes so the background renders even without API
        setTopFolders([
          { id: "1", name: "생각", type: "folder", parent_id: null, order: 0, content: null, created_at: "", updated_at: "" },
          { id: "2", name: "기술", type: "folder", parent_id: null, order: 1, content: null, created_at: "", updated_at: "" },
          { id: "3", name: "일상", type: "folder", parent_id: null, order: 2, content: null, created_at: "", updated_at: "" },
          { id: "4", name: "탐구", type: "folder", parent_id: null, order: 3, content: null, created_at: "", updated_at: "" },
          { id: "5", name: "연결", type: "folder", parent_id: null, order: 4, content: null, created_at: "", updated_at: "" },
        ]);
      });
  }, []);

  useEffect(() => {
    if (!svgRef.current || topFolders.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || window.innerWidth;
    const height = svgRef.current.clientHeight || window.innerHeight;

    // Get CSS variable colors
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue("--accent").trim() || "#6366f1";
    const textColor = style.getPropertyValue("--text").trim() || "#e4e4e7";
    const bgColor = style.getPropertyValue("--bg").trim() || "#0a0a0a";

    // Build typed nodes and links
    const centerNode: GraphNode = { id: "center", name: "", fx: width / 2, fy: height / 2 };
    const folderNodes: GraphNode[] = topFolders.map((f) => ({
      id: f.id,
      name: f.name,
      data: f,
    }));
    const nodes: GraphNode[] = [centerNode, ...folderNodes];
    const links: GraphLink[] = topFolders.map((f) => ({
      source: "center",
      target: f.id,
    }));

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(140)
          .strength(0.6)
      )
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(60));

    const g = svg.append("g");

    // Links
    const link = g
      .append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", accent)
      .attr("stroke-opacity", 0.18)
      .attr("stroke-width", 1.2);

    // Node groups (exclude center)
    const node = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(folderNodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (_event, d) => {
        if (d.data && onNodeClick) {
          onNodeClick(d.data);
          document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
        }
      });

    // Circles
    node
      .append("circle")
      .attr("r", 36)
      .attr("fill", bgColor)
      .attr("fill-opacity", 0.55)
      .attr("stroke", accent)
      .attr("stroke-opacity", 0.45)
      .attr("stroke-width", 1.5);

    // Labels
    node
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", textColor)
      .attr("fill-opacity", 0.7)
      .attr("font-size", "13px")
      .attr("font-weight", "500")
      .attr("pointer-events", "none");

    // Hover effects
    node
      .on("mouseenter", function () {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0.9)
          .attr("fill-opacity", 0.75)
          .attr("r", 42);
        d3.select(this)
          .select("text")
          .transition()
          .duration(200)
          .attr("fill-opacity", 1);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0.45)
          .attr("fill-opacity", 0.55)
          .attr("r", 36);
        d3.select(this)
          .select("text")
          .transition()
          .duration(200)
          .attr("fill-opacity", 0.7);
      });

    // Center glow dot
    g.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", 6)
      .attr("fill", accent)
      .attr("fill-opacity", 0.5);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Settle then idle
    setTimeout(() => {
      simulation.alphaDecay(0.02);
      simulation.alpha(0.05).restart();
    }, 2000);

    return () => {
      simulation.stop();
    };
  }, [topFolders, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      aria-hidden="true"
    />
  );
}
