"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { FolderTreeNode } from "@/types/tree";

interface MarkdownEditorProps {
  node: FolderTreeNode | null;
  onChange: (content: string) => void;
}

type SaveStatus = "saved" | "saving" | "idle";

const forestTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
    fontFamily: "var(--font-mono, 'Fira Code', monospace)",
    backgroundColor: "var(--bg)",
    color: "var(--text)",
  },
  ".cm-content": {
    padding: "16px",
    caretColor: "var(--accent)",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-editor": {
    height: "100%",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "inherit",
  },
  ".cm-gutters": {
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-muted)",
    border: "none",
    borderRight: "1px solid var(--border)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--card)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--card)",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--accent)",
  },
  ".cm-selectionBackground": {
    backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
  },
});

export default function MarkdownEditor({ node, onChange }: MarkdownEditorProps) {
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentNodeId = useRef<string | null>(null);

  // Load content when node changes
  useEffect(() => {
    if (!node || node.type !== "file") {
      setContent("");
      setSaveStatus("idle");
      currentNodeId.current = null;
      return;
    }

    currentNodeId.current = node.id;
    setContent(node.content ?? "");
    setSaveStatus("saved");
  }, [node]);

  const save = useCallback(
    async (id: string, text: string) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/tree/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    },
    []
  );

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      onChange(value);

      if (!currentNodeId.current) return;

      setSaveStatus("saving");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      const id = currentNodeId.current;
      debounceRef.current = setTimeout(() => {
        save(id, value);
      }, 2000);
    },
    [onChange, save]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!node || node.type !== "file") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          파일을 선택하면 편집기가 열립니다
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Editor header */}
      <div
        className="flex items-center justify-between px-4 py-2 text-xs border-b shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <span style={{ color: "var(--text)" }}>{node.name}</span>
        <span>
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--accent)" }}
              />
              저장 중...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
              />
              저장됨
            </span>
          )}
        </span>
      </div>

      {/* CodeMirror editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={content}
          height="100%"
          extensions={[markdown(), forestTheme]}
          onChange={handleChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: false,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: false,
            historyKeymap: true,
            foldKeymap: false,
            completionKeymap: false,
            lintKeymap: false,
          }}
          style={{ height: "100%", overflow: "hidden" }}
        />
      </div>
    </div>
  );
}
