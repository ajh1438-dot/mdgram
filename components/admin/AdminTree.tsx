"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { FolderTreeNode } from "@/types/tree";

// ─── Icons ───────────────────────────────────────────────────────────────────

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </>
      ) : (
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      )}
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── Context menu ─────────────────────────────────────────────────────────────

interface ContextMenuState {
  x: number;
  y: number;
  node: FolderTreeNode;
}

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onNewFolder: (parent: FolderTreeNode) => void;
  onNewFile: (parent: FolderTreeNode) => void;
  onRename: (node: FolderTreeNode) => void;
  onDelete: (node: FolderTreeNode) => void;
}

function ContextMenu({
  state,
  onClose,
  onNewFolder,
  onNewFile,
  onRename,
  onDelete,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const item = (label: string, action: () => void, danger = false) => (
    <button
      key={label}
      onClick={() => {
        action();
        onClose();
      }}
      className="flex w-full items-center px-3 py-1.5 text-xs text-left rounded hover:opacity-80 transition-opacity"
      style={{ color: danger ? "#f87171" : "var(--text)" }}
    >
      {label}
    </button>
  );

  const isFolder = state.node.type === "folder";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{
        position: "fixed",
        top: state.y,
        left: state.x,
        zIndex: 9999,
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "4px",
        minWidth: "160px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {isFolder && item("새 폴더", () => onNewFolder(state.node))}
      {isFolder && item("새 파일", () => onNewFile(state.node))}
      {item("이름 변경", () => onRename(state.node))}
      <div
        className="my-1"
        style={{ borderTop: "1px solid var(--border)" }}
      />
      {item("삭제", () => onDelete(state.node), true)}
    </motion.div>
  );
}

// ─── Sortable tree node ───────────────────────────────────────────────────────

interface TreeNodeProps {
  node: FolderTreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (node: FolderTreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FolderTreeNode) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  renamingId: string | null;
  onRenameSubmit: (id: string, name: string) => void;
}

function SortableTreeNode({
  node,
  depth,
  selectedId,
  onSelect,
  onContextMenu,
  expandedIds,
  onToggleExpand,
  renamingId,
  onRenameSubmit,
}: TreeNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isFolder = node.type === "folder";
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isRenaming = renamingId === node.id;

  const [renameValue, setRenameValue] = useState(node.name);

  useEffect(() => {
    if (isRenaming) setRenameValue(node.name);
  }, [isRenaming, node.name]);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="flex items-center gap-1 rounded cursor-pointer select-none"
        style={{
          paddingLeft: `${8 + depth * 16}px`,
          paddingRight: "8px",
          paddingTop: "4px",
          paddingBottom: "4px",
          backgroundColor: isSelected
            ? "color-mix(in srgb, var(--accent) 15%, transparent)"
            : "transparent",
          color: isSelected ? "var(--accent)" : "var(--text)",
          borderRadius: "4px",
        }}
        onClick={() => {
          if (isFolder) onToggleExpand(node.id);
          onSelect(node);
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
        {...attributes}
        {...listeners}
      >
        {/* Chevron for folders */}
        {isFolder ? (
          <span style={{ color: "var(--text-muted)", display: "flex" }}>
            <ChevronIcon expanded={isExpanded} />
          </span>
        ) : (
          <span style={{ width: 10 }} />
        )}

        {/* Icon */}
        <span
          style={{
            color: isFolder ? "var(--accent)" : "var(--text-muted)",
            display: "flex",
          }}
        >
          {isFolder ? <FolderIcon open={isExpanded} /> : <FileIcon />}
        </span>

        {/* Name / rename input */}
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => onRenameSubmit(node.id, renameValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRenameSubmit(node.id, renameValue);
              if (e.key === "Escape") onRenameSubmit(node.id, node.name);
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent outline-none text-xs border-b"
            style={{ borderColor: "var(--accent)", color: "var(--text)" }}
          />
        ) : (
          <span className="text-xs truncate flex-1">{node.name}</span>
        )}
      </div>

      {/* Children */}
      {isFolder && isExpanded && node.children && node.children.length > 0 && (
        <SortableContext
          items={node.children.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map((child) => (
            <SortableTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              renamingId={renamingId}
              onRenameSubmit={onRenameSubmit}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}

// ─── Flatten tree for dnd-kit ─────────────────────────────────────────────────

function flattenTree(nodes: FolderTreeNode[]): FolderTreeNode[] {
  const result: FolderTreeNode[] = [];
  function walk(list: FolderTreeNode[]) {
    for (const n of list) {
      result.push(n);
      if (n.children) walk(n.children);
    }
  }
  walk(nodes);
  return result;
}

function findNode(nodes: FolderTreeNode[], id: string): FolderTreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

// ─── Main AdminTree ───────────────────────────────────────────────────────────

interface AdminTreeProps {
  tree: FolderTreeNode[];
  selectedId: string | null;
  onSelect: (node: FolderTreeNode) => void;
  onTreeChange: () => void; // triggers refetch
}

export default function AdminTree({
  tree,
  selectedId,
  onSelect,
  onTreeChange,
}: AdminTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, node: FolderTreeNode) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, node });
    },
    []
  );

  async function createNode(
    type: "folder" | "file",
    parent: FolderTreeNode | null
  ) {
    const name = type === "folder" ? "새 폴더" : "새 파일.md";
    const siblings = parent ? parent.children ?? [] : tree;
    const maxOrder = siblings.reduce((m, n) => Math.max(m, n.order), -1);

    const res = await fetch("/api/tree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        parent_id: parent?.id ?? null,
        order: maxOrder + 1,
        content: type === "file" ? "" : null,
      }),
    });
    if (res.ok) {
      const created: FolderTreeNode = await res.json();
      onTreeChange();
      // Open parent folder
      if (parent) {
        setExpandedIds((prev) => new Set([...prev, parent.id]));
      }
      // Start renaming immediately
      setRenamingId(created.id);
    }
  }

  async function handleRenameSubmit(id: string, name: string) {
    setRenamingId(null);
    const node = findNode(tree, id);
    if (!node || name === node.name) return;
    await fetch(`/api/tree/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    onTreeChange();
  }

  async function handleDelete(node: FolderTreeNode) {
    await fetch(`/api/tree/${node.id}`, { method: "DELETE" });
    onTreeChange();
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const flat = flattenTree(tree);
    const activeNode = flat.find((n) => n.id === active.id);
    const overNode = flat.find((n) => n.id === over.id);
    if (!activeNode || !overNode) return;

    // Reorder within same parent
    const parentId = activeNode.parent_id;
    const siblings = flat.filter((n) => n.parent_id === parentId);
    const activeIdx = siblings.findIndex((n) => n.id === active.id);
    const overIdx = siblings.findIndex((n) => n.id === over.id);
    if (activeIdx === -1 || overIdx === -1) return;

    // Build new order for siblings
    const reordered = [...siblings];
    reordered.splice(activeIdx, 1);
    reordered.splice(overIdx, 0, activeNode);

    const updates = reordered.map((n, i) => ({
      id: n.id,
      order: i,
      parent_id: n.parent_id,
    }));

    await fetch("/api/tree/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    onTreeChange();
  }

  const flat = flattenTree(tree);
  const activeNode = activeId ? flat.find((n) => n.id === activeId) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tree list */}
      <div className="flex-1 overflow-y-auto p-2">
        {tree.length === 0 ? (
          <p
            className="text-xs p-2 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            우클릭하여 항목 추가
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tree.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
            >
              {tree.map((node) => (
                <SortableTreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onContextMenu={handleContextMenu}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  renamingId={renamingId}
                  onRenameSubmit={handleRenameSubmit}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeNode ? (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--accent)",
                    color: "var(--text)",
                    opacity: 0.9,
                  }}
                >
                  {activeNode.type === "folder" ? <FolderIcon open={false} /> : <FileIcon />}
                  <span>{activeNode.name}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            state={contextMenu}
            onClose={() => setContextMenu(null)}
            onNewFolder={(parent) => createNode("folder", parent)}
            onNewFile={(parent) => createNode("file", parent)}
            onRename={(node) => setRenamingId(node.id)}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
