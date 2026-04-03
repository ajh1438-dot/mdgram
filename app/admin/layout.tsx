import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Double-check auth in layout — middleware guards the edge,
  // this guards server-rendered content.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col" style={{ backgroundColor: "var(--bg)" }}>
      {/* Gradient accent line at top */}
      <div
        className="h-0.5 w-full"
        style={{ background: "linear-gradient(to right, var(--accent), var(--accent-hover))" }}
      />
      <header
        className="border-b glass-panel"
        style={{ borderColor: "color-mix(in srgb, var(--border) 50%, transparent)" }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span
            className="text-sm font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text"
            style={{ WebkitTextFillColor: "transparent" }}
          >
            Admin — 연결의 숲
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {user.email}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
