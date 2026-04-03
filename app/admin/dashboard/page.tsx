import ReactionChart from "@/components/admin/ReactionChart";
import CommentList from "@/components/admin/CommentList";
import MessageInbox from "@/components/admin/MessageInbox";

export const metadata = {
  title: "Admin Dashboard — 연결의 숲",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-xl overflow-hidden shadow-sm">
      {/* Gradient header bar */}
      <div
        className="px-5 py-3"
        style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, var(--accent-hover) 8%, transparent))" }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
          {title}
        </h2>
      </div>
      <div className="p-5 custom-scrollbar">
        {children}
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text)]">대시보드</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          리액션 통계 · 댓글 관리 · 메시지 수신함
        </p>
      </div>

      {/* Reaction stats */}
      <Section title="리액션 통계">
        <ReactionChart />
      </Section>

      {/* Comment management */}
      <Section title="댓글 관리">
        <CommentList />
      </Section>

      {/* Message inbox */}
      <Section title="메시지 수신함">
        <MessageInbox />
      </Section>
    </div>
  );
}
