"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BulkUploadProps {
  onClose: () => void;
  onTreeChange: () => void;
}

type UploadMode = "replace" | "merge";
type UploadPhase = "idle" | "confirm" | "uploading" | "done" | "error";

// ─── Modal shell ──────────────────────────────────────────────────────────────

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 12 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="rounded-xl shadow-2xl w-full max-w-md mx-4"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({
  onFile,
  file,
}: {
  onFile: (f: File) => void;
  file: File | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && dropped.name.endsWith(".zip")) onFile(dropped);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center py-8 gap-2 select-none"
      style={{
        borderColor: dragging ? "var(--accent)" : "var(--border)",
        backgroundColor: dragging ? "rgba(99,102,241,0.06)" : "var(--bg)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--text-muted)" }}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {file ? (
        <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
          {file.name}{" "}
          <span style={{ color: "var(--text-muted)" }}>
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </span>
      ) : (
        <>
          <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
            zip 파일을 여기에 끌어다 놓거나 클릭하여 선택
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            .zip 형식만 지원됩니다
          </span>
        </>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ indeterminate }: { indeterminate?: boolean }) {
  return (
    <div
      className="w-full rounded-full overflow-hidden h-1.5"
      style={{ backgroundColor: "var(--border)" }}
    >
      {indeterminate ? (
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--accent)", width: "40%" }}
          animate={{ x: ["0%", "200%", "0%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--accent)", width: "100%" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.4 }}
        />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BulkUpload({ onClose, onTreeChange }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<UploadMode>("replace");
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [resultMsg, setResultMsg] = useState("");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/tree/export");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        alert(err.error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Read filename from Content-Disposition
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "tree-export.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("내보내기 중 오류가 발생했습니다.");
    } finally {
      setExporting(false);
    }
  }

  function handleUploadClick() {
    if (!file) return;
    if (mode === "replace") {
      setPhase("confirm");
    } else {
      doUpload();
    }
  }

  async function doUpload() {
    if (!file) return;
    setPhase("uploading");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);

      const res = await fetch("/api/tree/import", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        setPhase("error");
        setResultMsg(json.error ?? "업로드에 실패했습니다.");
        return;
      }

      setPhase("done");
      setResultMsg(
        `${json.inserted}개 항목이 성공적으로 ${mode === "replace" ? "교체" : "추가"}되었습니다.`
      );
      onTreeChange();
    } catch {
      setPhase("error");
      setResultMsg("업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <ModalShell onClose={phase === "uploading" ? () => {} : onClose}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          가져오기 / 내보내기
        </h2>
        {phase !== "uploading" && (
          <button
            onClick={onClose}
            className="rounded p-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            aria-label="닫기"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Export section */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
            내보내기
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium border transition-opacity disabled:opacity-50 w-full justify-center"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text)",
              borderColor: "var(--border)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? "내보내는 중..." : "현재 트리를 zip으로 내보내기"}
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)" }} />

        {/* Import section */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
            가져오기
          </p>

          {/* Drop zone — hidden during upload/done/error */}
          {(phase === "idle" || phase === "confirm") && (
            <DropZone onFile={setFile} file={file} />
          )}

          {/* Mode selector */}
          {(phase === "idle" || phase === "confirm") && (
            <div className="flex gap-4 mt-3">
              {(["replace", "merge"] as const).map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-1.5 cursor-pointer text-xs select-none"
                  style={{ color: "var(--text)" }}
                >
                  <input
                    type="radio"
                    name="upload-mode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className="accent-[var(--accent)]"
                  />
                  {m === "replace" ? "전체 교체" : "기존에 추가"}
                </label>
              ))}
            </div>
          )}

          {/* Replace mode warning */}
          {(phase === "idle" || phase === "confirm") && mode === "replace" && (
            <div
              className="mt-2 flex items-start gap-1.5 rounded-md px-3 py-2 text-xs"
              style={{
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 mt-0.5"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              기존 콘텐츠가 모두 삭제됩니다
            </div>
          )}

          {/* Confirm dialog (inline within modal) */}
          <AnimatePresence>
            {phase === "confirm" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div
                  className="rounded-lg p-3 text-xs"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "var(--text)",
                  }}
                >
                  <p className="font-semibold mb-1" style={{ color: "#f87171" }}>
                    정말로 전체를 교체하시겠습니까?
                  </p>
                  <p style={{ color: "var(--text-muted)" }}>
                    현재 저장된 폴더 트리 전체가 삭제되고 업로드한 zip의 내용으로
                    교체됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setPhase("idle")}
                      className="flex-1 px-3 py-1.5 rounded text-xs border"
                      style={{
                        color: "var(--text-muted)",
                        borderColor: "var(--border)",
                        backgroundColor: "transparent",
                      }}
                    >
                      취소
                    </button>
                    <button
                      onClick={doUpload}
                      className="flex-1 px-3 py-1.5 rounded text-xs font-medium"
                      style={{ backgroundColor: "#ef4444", color: "#fff", border: "none" }}
                    >
                      교체 실행
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uploading state */}
          {phase === "uploading" && (
            <div className="flex flex-col gap-3 items-center py-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                업로드 및 처리 중...
              </p>
              <ProgressBar indeterminate />
            </div>
          )}

          {/* Done state */}
          {phase === "done" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "#4ade80" }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-xs font-medium" style={{ color: "var(--text)" }}>
                {resultMsg}
              </p>
              <button
                onClick={onClose}
                className="mt-1 px-4 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: "var(--accent)", color: "#fff", border: "none" }}
              >
                닫기
              </button>
            </div>
          )}

          {/* Error state */}
          {phase === "error" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "#f87171" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-xs" style={{ color: "#f87171" }}>
                {resultMsg}
              </p>
              <button
                onClick={() => {
                  setPhase("idle");
                  setResultMsg("");
                }}
                className="mt-1 px-4 py-1.5 rounded text-xs border"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                  backgroundColor: "transparent",
                }}
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer — upload button */}
      {(phase === "idle") && (
        <div
          className="flex justify-end gap-2 px-5 py-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs border"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border)",
              backgroundColor: "transparent",
            }}
          >
            닫기
          </button>
          <button
            onClick={handleUploadClick}
            disabled={!file}
            className="px-4 py-1.5 rounded text-xs font-medium disabled:opacity-40"
            style={{ backgroundColor: "var(--accent)", color: "#fff", border: "none" }}
          >
            가져오기 시작
          </button>
        </div>
      )}
    </ModalShell>
  );
}
