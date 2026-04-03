"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { FolderTreeNode } from "@/types/tree";
import InlineMarkdown from "./InlineMarkdown";
import InlineEditor from "./InlineEditor";
import ReactionBadge from "./ReactionBadge";

/* ── Icons ── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]"
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.18 }}
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </motion.svg>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4 flex-shrink-0 text-[var(--accent)]"
      aria-hidden="true"
    >
      {open ? (
        <path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H2V6z" />
      ) : (
        <path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      )}
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm6 1V2.5L12.5 5H10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-3 h-3"
      aria-hidden="true"
    >
      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
    </svg>
  );
}

/* ── Collapse animation variants ── */
const collapseVariants: Variants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

/* ── Derive keyword from node name ── */
function nodeKeyword(node: FolderTreeNode): string {
  return node.name.replace(/\.[^.]+$/, "").trim().toLowerCase();
}

/* ── Walk tree to collect breadcrumb keywords for a node id ── */
function collectKeywordsForNode(
  nodes: FolderTreeNode[],
  targetId: string,
  ancestors: string[] = []
): string[] | null {
  for (const node of nodes) {
    const kw = nodeKeyword(node);
    if (node.id === targetId) return [...ancestors, kw];
    if (node.children?.length) {
      const found = collectKeywordsForNode(node.children, targetId, [
        ...ancestors,
        kw,
      ]);
      if (found) return found;
    }
  }
  return null;
}

/* ── Single node ── */
interface OutlineNodeProps {
  node: FolderTreeNode;
  depth: number;
  expandedFiles: Set<string>;
  onToggleFile: (id: string) => void;
  activeNodeId: string | null;
  onActivate: (id: string) => void;
  isAdmin: boolean;
  editingFileId: string | null;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, newContent?: string) => void;
  nodeContents: Record<string, string>;
}

function OutlineNode({
  node,
  depth,
  expandedFiles,
  onToggleFile,
  activeNodeId,
  onActivate,
  isAdmin,
  editingFileId,
  onStartEdit,
  onEndEdit,
  nodeContents,
}: OutlineNodeProps) {
  const [folderOpen, setFolderOpen] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isFile = node.type === "file";
  const isFolder = node.type === "folder";
  const isFileExpanded = expandedFiles.has(node.id);
  const isActive = activeNodeId === node.id;
  const isEditing = editingFileId === node.id;

  const keyword = nodeKeyword(node);
  const indentClass = depth > 0 ? `pl-3 sm:pl-6` : "";

  // Current content (may have been edited)
  const currentContent = nodeContents[node.id] ?? node.content ?? "";

  function handleClick() {
    onActivate(node.id);
    if (isFolder) setFolderOpen((p) => !p);
    else if (isFile) onToggleFile(node.id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    // Expand the file if not already
    if (!isFileExpanded) onToggleFile(node.id);
    onStartEdit(node.id);
  }

  return (
    <div className={`${indentClass} overflow-hidden`}>
      {/* Row */}
      <div
        role={isFolder ? "button" : undefined}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={[
          "group flex items-center gap-1.5 py-1 pr-2 rounded-md cursor-pointer",
          "text-xs sm:text-sm select-none min-w-0",
          "hover:bg-[var(--bg-secondary)] transition-colors duration-100",
          isFolder
            ? "font-medium text-[var(--text)]"
            : "text-[var(--text-muted)] hover:text-[var(--text)]",
          isActive ? "bg-[var(--bg-secondary)]" : "",
        ].join(" ")}
      >
        {isFolder && <ChevronIcon open={folderOpen} />}
        {isFolder ? <FolderIcon open={folderOpen} /> : <FileIcon />}
        <span className="truncate flex-1">{node.name}</span>
        <ReactionBadge node_id={node.id} keyword={keyword} />
        {/* Admin edit pencil for files */}
        {isAdmin && isFile && (
          <button
            onClick={handleEditClick}
            aria-label={`${node.name} 편집`}
            title="인라인 편집"
            className={[
              "ml-1 p-1 rounded transition-colors",
              isEditing
                ? "text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
                : "opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)]",
            ].join(" ")}
          >
            <PencilIcon />
          </button>
        )}
      </div>

      {/* File accordion — markdown content or inline editor */}
      {isFile && (
        <AnimatePresence initial={false}>
          {isFileExpanded && (
            <motion.div
              key="file-content"
              variants={collapseVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden"
            >
              <div className="pl-6 pb-2 border-l border-[var(--border)] ml-1.5">
                {isEditing ? (
                  <InlineEditor
                    fileId={node.id}
                    initialContent={currentContent}
                    onSave={(newContent) => onEndEdit(node.id, newContent)}
                    onCancel={() => onEndEdit(node.id)}
                  />
                ) : (
                  currentContent && (
                    <InlineMarkdown content={currentContent} fileId={node.id} />
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Folder children */}
      {isFolder && hasChildren && (
        <AnimatePresence initial={false}>
          {folderOpen && (
            <motion.div
              key="folder-children"
              variants={collapseVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden"
            >
              <OutlineTreeInner
                nodes={node.children!}
                depth={depth + 1}
                expandedFiles={expandedFiles}
                onToggleFile={onToggleFile}
                activeNodeId={activeNodeId}
                onActivate={onActivate}
                isAdmin={isAdmin}
                editingFileId={editingFileId}
                onStartEdit={onStartEdit}
                onEndEdit={onEndEdit}
                nodeContents={nodeContents}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ── Inner recursive list ── */
interface OutlineTreeInnerProps {
  nodes: FolderTreeNode[];
  depth: number;
  expandedFiles: Set<string>;
  onToggleFile: (id: string) => void;
  activeNodeId: string | null;
  onActivate: (id: string) => void;
  isAdmin: boolean;
  editingFileId: string | null;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, newContent?: string) => void;
  nodeContents: Record<string, string>;
}

function OutlineTreeInner({
  nodes,
  depth,
  expandedFiles,
  onToggleFile,
  activeNodeId,
  onActivate,
  isAdmin,
  editingFileId,
  onStartEdit,
  onEndEdit,
  nodeContents,
}: OutlineTreeInnerProps) {
  return (
    <div>
      {nodes.map((node) => (
        <OutlineNode
          key={node.id}
          node={node}
          depth={depth}
          expandedFiles={expandedFiles}
          onToggleFile={onToggleFile}
          activeNodeId={activeNodeId}
          onActivate={onActivate}
          isAdmin={isAdmin}
          editingFileId={editingFileId}
          onStartEdit={onStartEdit}
          onEndEdit={onEndEdit}
          nodeContents={nodeContents}
        />
      ))}
    </div>
  );
}

/* ── Public root component ── */
interface OutlineTreeProps {
  nodes: FolderTreeNode[];
  /** Called whenever the active context keywords change */
  onContextChange?: (keywords: string[]) => void;
}

export default function OutlineTree({ nodes, onContextChange }: OutlineTreeProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  // Track locally edited content so edits persist while tree is open
  const [nodeContents, setNodeContents] = useState<Record<string, string>>({});

  // Check admin status
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { authenticated?: boolean }) => {
        setIsAdmin(d.authenticated === true);
      })
      .catch(() => setIsAdmin(false));
  }, []);

  function toggleFile(id: string) {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleActivate(id: string) {
    setActiveNodeId(id);
    if (onContextChange) {
      const kws = collectKeywordsForNode(nodes, id) ?? [];
      onContextChange(kws);
    }
  }

  function handleStartEdit(id: string) {
    setEditingFileId(id);
  }

  function handleEndEdit(id: string, newContent?: string) {
    setEditingFileId(null);
    if (newContent !== undefined) {
      setNodeContents((prev) => ({ ...prev, [id]: newContent }));
    }
  }

  if (nodes.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-8 text-center">
        아직 작성된 내용이 없습니다.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)] overflow-hidden">
      {nodes.map((node) => (
        <div key={node.id} className="py-1 overflow-hidden">
          <OutlineNode
            node={node}
            depth={0}
            expandedFiles={expandedFiles}
            onToggleFile={toggleFile}
            activeNodeId={activeNodeId}
            onActivate={handleActivate}
            isAdmin={isAdmin}
            editingFileId={editingFileId}
            onStartEdit={handleStartEdit}
            onEndEdit={handleEndEdit}
            nodeContents={nodeContents}
          />
        </div>
      ))}
    </div>
  );
}
