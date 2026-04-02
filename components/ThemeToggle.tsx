"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "forest";

const THEMES: Theme[] = ["dark", "light", "forest"];

const THEME_META: Record<Theme, { icon: string; label: string }> = {
  dark:   { icon: "🌙", label: "Dark" },
  light:  { icon: "☀️", label: "Light" },
  forest: { icon: "🌲", label: "Forest" },
};

const STORAGE_KEY = "forest-theme";

function getNextTheme(current: Theme): Theme {
  const idx = THEMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length];
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  /* Read saved theme on mount */
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark";
    const valid = THEMES.includes(saved) ? saved : "dark";
    applyTheme(valid);
    setTheme(valid);
  }, []);

  function applyTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
  }

  function handleToggle() {
    const next = getNextTheme(theme);
    applyTheme(next);
    setTheme(next);
  }

  const { icon, label } = THEME_META[theme];

  return (
    <button
      onClick={handleToggle}
      aria-label={`현재 테마: ${label}. 클릭하여 전환`}
      title={`현재 테마: ${label}`}
      className="
        inline-flex items-center gap-2
        px-3 py-1.5
        rounded-md
        border border-[var(--border)]
        bg-[var(--card)]
        text-[var(--text)]
        text-sm font-medium
        transition-colors duration-200
        hover:bg-[var(--bg-secondary)]
        hover:text-[var(--accent)]
        focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
        focus:ring-offset-[var(--bg)]
      "
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
