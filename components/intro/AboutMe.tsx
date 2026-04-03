"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FolderTreeNode } from "@/types/tree";
import { useInView } from "./useInView";

export default function AboutMe() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView(0.15);

  useEffect(() => {
    fetch("/api/tree")
      .then((r) => r.json())
      .then((data: FolderTreeNode[]) => {
        // Find file containing "저는요" or first file with content
        const allFiles: FolderTreeNode[] = [];
        function walk(nodes: FolderTreeNode[]) {
          for (const n of nodes) {
            if (n.type === "file") allFiles.push(n);
            if (n.children?.length) walk(n.children);
          }
        }
        walk(data);

        const aboutFile =
          allFiles.find((f) => f.name.includes("저는요")) ??
          allFiles.find((f) => f.name.includes("소개") && f.content) ??
          allFiles.find((f) => f.content && f.content.length > 50);

        if (aboutFile?.content) {
          setContent(aboutFile.content);
        } else {
          setContent(
            "# 안녕하세요!\n\n저는 **안지훈**입니다. 호기심이 많은 회계사로, 숫자와 언어 사이 어딘가에 삽니다.\n\n건강, 과학, 영성, 리더십 같은 주제를 탐색하며 생각을 나무처럼 키워가고 있습니다."
          );
        }
      })
      .catch(() => {
        setContent(
          "# 안녕하세요!\n\n저는 **안지훈**입니다. 호기심이 많은 회계사로, 숫자와 언어 사이 어딘가에 삽니다."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Simple markdown-like render (just paragraphs + bold + headings)
  function renderSimpleMarkdown(md: string) {
    return md.split("\n").map((line, i) => {
      if (line.startsWith("# ")) {
        return (
          <h2 key={i} className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4">
            {line.slice(2)}
          </h2>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={i} className="text-xl font-semibold text-[var(--accent)] mb-3 mt-6">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="text-[var(--text-muted)] ml-4 list-disc mb-1">
            {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}
          </li>
        );
      }
      if (!line.trim()) return <br key={i} />;
      const boldified = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
      return (
        <p
          key={i}
          className="text-[var(--text-muted)] leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: boldified }}
        />
      );
    });
  }

  return (
    <section
      id="intro-about"
      ref={ref as React.RefObject<HTMLElement>}
      className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 bg-[var(--bg)]"
    >
      <div className="max-w-5xl w-full">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest">
            About
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: decorative avatar placeholder */}
          <motion.div
            className="flex justify-center lg:justify-start"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 40%, var(--bg)) 100%)",
              }}
            >
              {/* Forest / tree decoration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3/4 h-3/4 opacity-30"
                >
                  <polygon points="60,10 100,80 20,80" fill="white" />
                  <polygon points="60,30 95,90 25,90" fill="white" opacity="0.6" />
                  <rect x="52" y="85" width="16" height="25" rx="2" fill="white" opacity="0.4" />
                </svg>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg">안지훈</p>
                <p className="text-white/70 text-sm">호기심 천국 회계사</p>
              </div>
            </div>
          </motion.div>

          {/* Right: content */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 rounded bg-[var(--border)] animate-pulse"
                    style={{ width: `${70 + Math.random() * 30}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {renderSimpleMarkdown(content.slice(0, 800))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
