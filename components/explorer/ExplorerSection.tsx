"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderTreeNode } from "@/types/tree";
import OutlineTree from "./OutlineTree";
import MindmapMini from "./MindmapMini";
import MessageFAB from "./MessageFAB";

type FetchState = "idle" | "loading" | "success" | "error";

export default function ExplorerSection() {
  const [tree, setTree] = useState<FolderTreeNode[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [contextKeywords, setContextKeywords] = useState<string[]>([]);

  const handleContextChange = useCallback((kws: string[]) => {
    setContextKeywords(kws);
  }, []);

  useEffect(() => {
    setState("loading");
    fetch("/api/tree")
      .then((res) => {
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
        return res.json() as Promise<FolderTreeNode[]>;
      })
      .then((data) => {
        setTree(data);
        setState("success");
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setState("error");
      });
  }, []);

  return (
    <section
      id="explore"
      className="relative min-h-screen bg-[var(--bg-secondary)] px-6 py-20"
    >
      {/* Section header */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">
              숲을 탐색하기
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              생각의 나무를 펼쳐보세요 — 항목을 클릭하면 내용이 열립니다.
            </p>
          </div>
          {/* Mindmap mini toggle — top-right of the section header */}
          <div className="flex-shrink-0 pt-1">
            <MindmapMini tree={tree} />
          </div>
        </div>
      </div>

      {/* Main content card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          {/* Loading */}
          {state === "loading" && (
            <div className="flex items-center justify-center py-24">
              <span className="inline-block w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-[var(--text-muted)]">불러오는 중…</span>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-8 h-8 text-red-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-[var(--text-muted)]">
                데이터를 불러올 수 없습니다
              </p>
              {errorMsg && (
                <p className="text-xs text-red-400 font-mono">{errorMsg}</p>
              )}
              <button
                onClick={() => {
                  setState("loading");
                  setErrorMsg("");
                  fetch("/api/tree")
                    .then((r) => r.json())
                    .then((d) => { setTree(d); setState("success"); })
                    .catch((e: unknown) => {
                      setErrorMsg(e instanceof Error ? e.message : String(e));
                      setState("error");
                    });
                }}
                className="mt-2 text-xs px-4 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Tree */}
          {state === "success" && (
            <div className="p-6">
              <OutlineTree nodes={tree} onContextChange={handleContextChange} />
            </div>
          )}

          {/* Idle — show nothing or skeleton (unused in practice) */}
          {state === "idle" && null}
        </div>
      </div>

      {/* Floating action button — passes active context keywords to modal */}
      <MessageFAB contextKeywords={contextKeywords} />
    </section>
  );
}
