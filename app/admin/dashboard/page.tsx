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
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </h2>
      {children}
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
