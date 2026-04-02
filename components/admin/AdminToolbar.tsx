"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderTreeNode } from "@/types/tree";

interface AdminToolbarProps {
  selectedNode: FolderTreeNode | null;
  tree: FolderTreeNode[];
  onTreeChange: () => void;
  onSave: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function Modal({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        transition={{ duration: 0.15 }}
        className="rounded-lg p-6 w-full max-w-sm shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h3>
        <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs border"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border)",
              backgroundColor: "transparent",
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{
              backgroundColor: danger ? "#ef4444" : "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Name input modal ─────────────────────────────────────────────────────────

interface NameModalProps {
  title: string;
  defaultValue: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function NameModal({ title, defaultValue, onConfirm, onCancel }: NameModalProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        transition={{ duration: 0.15 }}
        className="rounded-lg p-6 w-full max-w-sm shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h3>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onConfirm(value.trim());
            if (e.key === "Escape") onCancel();
          }}
          className="w-full rounded px-3 py-2 text-sm border outline-none mb-4"
          style={{
            backgroundColor: "var(--bg)",
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs border"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border)",
              backgroundColor: "transparent",
            }}
          >
            취소
          </button>
          <button
            onClick={() => value.trim() && onConfirm(value.trim())}
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            확인
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function TBtn({
  onClick,
  disabled,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-opacity disabled:opacity-40"
      style={{
        backgroundColor: danger ? "rgba(239,68,68,0.12)" : "var(--bg-secondary)",
        color: danger ? "#f87171" : "var(--text)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ModalState =
  | { type: "newFolder" }
  | { type: "newFile" }
  | { type: "delete" }
  | null;

export default function AdminToolbar({
  selectedNode,
  tree,
  onTreeChange,
  onSave,
}: AdminToolbarProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const [loading, setLoading] = useState(false);

  async function createNode(type: "folder" | "file", name: string) {
    setLoading(true);
    // Place at root, after existing items
    const maxOrder = tree.reduce((m, n) => Math.max(m, n.order), -1);
    await fetch("/api/tree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        parent_id: null,
        order: maxOrder + 1,
        content: type === "file" ? "" : null,
      }),
    });
    setLoading(false);
    setModal(null);
    onTreeChange();
  }

  async function deleteSelected() {
    if (!selectedNode) return;
    setLoading(true);
    await fetch(`/api/tree/${selectedNode.id}`, { method: "DELETE" });
    setLoading(false);
    setModal(null);
    onTreeChange();
  }

  return (
    <>
      <div
        className="flex items-center gap-2 px-4 py-2 border-b shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <TBtn onClick={() => setModal({ type: "newFolder" })} disabled={loading}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
          새 폴더
        </TBtn>

        <TBtn onClick={() => setModal({ type: "newFile" })} disabled={loading}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          새 파일
        </TBtn>

        <TBtn
          onClick={() => setModal({ type: "delete" })}
          disabled={!selectedNode || loading}
          danger
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          삭제
        </TBtn>

        <TBtn onClick={onSave}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          저장
        </TBtn>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === "newFolder" && (
          <NameModal
            title="새 폴더 만들기"
            defaultValue="새 폴더"
            onConfirm={(name) => createNode("folder", name)}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === "newFile" && (
          <NameModal
            title="새 파일 만들기"
            defaultValue="새 파일.md"
            onConfirm={(name) => createNode("file", name)}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === "delete" && selectedNode && (
          <Modal
            title="항목 삭제"
            message={`"${selectedNode.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
            confirmLabel="삭제"
            danger
            onConfirm={deleteSelected}
            onCancel={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
