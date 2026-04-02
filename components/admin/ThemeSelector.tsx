"use client";

import { useEffect, useState } from "react";

interface Theme {
  id: string;
  name: string;
  is_active: boolean;
}

interface ThemeSelectorProps {
  onThemeChange?: (themeName: string) => void;
}

export default function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchThemes() {
      try {
        const [listRes, activeRes] = await Promise.all([
          fetch("/api/themes"),
          fetch("/api/themes/active"),
        ]);
        const list: Theme[] = await listRes.json();
        const active: Theme = await activeRes.json();
        setThemes(list);
        setActiveId(active?.id ?? "");
        if (active?.name && onThemeChange) {
          onThemeChange(active.name);
        }
      } catch {
        // silently fail
      }
    }
    fetchThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setActiveId(id);
    setLoading(true);
    try {
      const res = await fetch("/api/themes/active", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const updated: Theme = await res.json();
        if (onThemeChange) onThemeChange(updated.name);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        테마
      </span>
      <select
        value={activeId}
        onChange={handleChange}
        disabled={loading || themes.length === 0}
        className="rounded px-2 py-1 text-xs border cursor-pointer disabled:opacity-50"
        style={{
          backgroundColor: "var(--card)",
          color: "var(--text)",
          borderColor: "var(--border)",
        }}
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
