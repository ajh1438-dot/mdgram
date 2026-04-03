"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderTreeNode } from "@/types/tree";

type Theme =
  | "dark"
  | "light"
  | "forest"
  | "minimal"
  | "things"
  | "blue-topaz"
  | "sanctum"
  | "dracula"
  | "nord"
  | "atom";

const STORAGE_KEY = "forest-theme";

const ALL_THEMES: Theme[] = [
  "dark",
  "light",
  "forest",
  "minimal",
  "things",
  "blue-topaz",
  "sanctum",
  "dracula",
  "nord",
  "atom",
];

const THEME_CONFIG: Record<
  Theme,
  { label: string; bg: string; accent: string; text: string; border: string }
> = {
  dark: {
    label: "다크",
    bg: "#0a0a0a",
    accent: "#6366f1",
    text: "#e4e4e7",
    border: "#27272a",
  },
  light: {
    label: "라이트",
    bg: "#fafafa",
    accent: "#4f46e5",
    text: "#18181b",
    border: "#e4e4e7",
  },
  forest: {
    label: "포레스트",
    bg: "#0c1a0c",
    accent: "#22c55e",
    text: "#d4e7d4",
    border: "#1a3a1a",
  },
  minimal: {
    label: "미니멀",
    bg: "#f4f4f4",
    accent: "#5c7cfa",
    text: "#2e3338",
    border: "#d8d8d8",
  },
  things: {
    label: "띵스",
    bg: "#ffffff",
    accent: "#2eaadc",
    text: "#37352f",
    border: "#e9e9e7",
  },
  "blue-topaz": {
    label: "블루토파즈",
    bg: "#1e2029",
    accent: "#00b4d8",
    text: "#d4d4d8",
    border: "#2e3244",
  },
  sanctum: {
    label: "생텀",
    bg: "#f5f0e8",
    accent: "#8b6914",
    text: "#3d3929",
    border: "#d9d2c2",
  },
  dracula: {
    label: "드라큘라",
    bg: "#282a36",
    accent: "#bd93f9",
    text: "#f8f8f2",
    border: "#44475a",
  },
  nord: {
    label: "노드",
    bg: "#2e3440",
    accent: "#88c0d0",
    text: "#d8dee9",
    border: "#3b4252",
  },
  atom: {
    label: "아톰",
    bg: "#21252b",
    accent: "#61afef",
    text: "#abb2bf",
    border: "#2c313a",
  },
};

interface AuthState {
  authenticated: boolean;
  email: string | null;
}

interface SettingsPanelProps {
  /** When admin clicks a file in "본문 관리", scroll the explorer to that file */
  onAdminSelectFile?: (fileId: string) => void;
}

export default function SettingsPanel({ onAdminSelectFile }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [auth, setAuth] = useState<AuthState>({ authenticated: false, email: null });
  const [treeFiles, setTreeFiles] = useState<FolderTreeNode[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load saved theme on mount
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark";
    setTheme((ALL_THEMES as string[]).includes(saved) ? (saved as Theme) : "dark");
  }, []);

  // Fetch auth state when panel opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAuth(d as AuthState))
      .catch(() => {});
  }, [open]);

  // Fetch tree files for admin when panel opens
  useEffect(() => {
    if (!open || !auth.authenticated) return;
    fetch("/api/tree")
      .then((r) => r.json())
      .then((d: FolderTreeNode[]) => {
        // Flatten to files only
        const files: FolderTreeNode[] = [];
        function walk(nodes: FolderTreeNode[]) {
          for (const n of nodes) {
            if (n.type === "file") files.push(n);
            if (n.children?.length) walk(n.children);
          }
        }
        walk(d);
        setTreeFiles(files);
      })
      .catch(() => {});
  }, [open, auth.authenticated]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    const t = setTimeout(() => document.addEventListener("mousedown", handleMouseDown), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function applyTheme(t: Theme) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem(STORAGE_KEY, t);
    setTheme(t);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      // Use supabase browser client via a simple fetch to a logout route,
      // or redirect to /login which handles it
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      setAuth({ authenticated: false, email: null });
    } catch {
      // silent
    } finally {
      setLoggingOut(false);
    }
  }

  function handleFileClick(file: FolderTreeNode) {
    setOpen(false);
    if (onAdminSelectFile) onAdminSelectFile(file.id);
    // Scroll to explorer section
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* Gear trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="설정 패널 열기"
        title="설정"
        className="
          inline-flex items-center justify-center
          w-9 h-9
          rounded-md
          border border-[var(--border)]
          bg-[var(--card)]
          text-[var(--text-muted)]
          transition-colors duration-200
          hover:bg-[var(--bg-secondary)]
          hover:text-[var(--accent)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
          focus:ring-offset-[var(--bg)]
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="settings-backdrop"
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Slide-in panel */}
            <motion.div
              key="settings-panel"
              ref={panelRef}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[92vw] flex flex-col bg-[var(--card)] border-l border-[var(--border)] shadow-2xl overflow-hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--accent)]">
                    <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-sm font-semibold text-[var(--text)]">설정</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="닫기"
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Section: 스킨 변경 */}
                <div className="px-5 py-4 border-b border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">스킨 변경</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_THEMES.map((key) => {
                      const cfg = THEME_CONFIG[key];
                      return (
                        <button
                          key={key}
                          onClick={() => applyTheme(key)}
                          className={[
                            "rounded-xl border-2 px-2.5 py-2 flex items-center gap-2 transition-all text-left",
                            theme === key
                              ? "border-[var(--accent)] shadow-sm scale-[1.03]"
                              : "border-[var(--border)] hover:border-[var(--accent)] hover:scale-[1.03]",
                          ].join(" ")}
                          style={{ background: cfg.bg }}
                        >
                          {/* Preview dots: bg, accent, text */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.accent }} />
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.text, opacity: 0.5 }} />
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-medium block truncate" style={{ color: cfg.text }}>
                              {cfg.label}
                            </span>
                            {theme === key && (
                              <span className="text-[9px]" style={{ color: cfg.accent }}>✓ 선택됨</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: 본문 관리 (admin only) */}
                {auth.authenticated && (
                  <div className="px-5 py-4 border-b border-[var(--border)]">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">본문 관리</p>

                    {treeFiles.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] text-center py-3">파일이 없습니다.</p>
                    ) : (
                      <ul className="space-y-1 max-h-48 overflow-y-auto">
                        {treeFiles.map((f) => (
                          <li key={f.id}>
                            <button
                              onClick={() => handleFileClick(f)}
                              className="w-full text-left text-xs px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0 text-[var(--accent)]">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm6 1V2.5L12.5 5H10z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{f.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <a
                      href="/admin"
                      className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                      </svg>
                      가져오기 / 내보내기
                    </a>
                  </div>
                )}

                {/* Section: 로그인/로그아웃 */}
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">계정</p>
                  {auth.authenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
                        <div className="w-6 h-6 rounded-full bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--text-muted)]">관리자</p>
                          <p className="text-xs text-[var(--text)] truncate">{auth.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {loggingOut ? "로그아웃 중…" : "로그아웃"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-[var(--text-muted)]">로그인하면 관리자 기능을 사용할 수 있습니다.</p>
                      <a
                        href="/login"
                        className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                        </svg>
                        로그인
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
