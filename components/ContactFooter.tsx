export default function ContactFooter() {
  return (
    <footer className="w-full py-10 px-4 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          Contact
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
          <a
            href="mailto:pioneermind1438@gmail.com"
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            pioneermind1438@gmail.com
          </a>
          <span className="hidden sm:inline text-[var(--border)]">|</span>
          <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.5 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.77l-.55 3.27a.5.5 0 0 0 .74.53L10.62 19h1.38c5.5 0 10-3.58 10-8s-4.5-8-10-8z" />
            </svg>
            카카오톡 jakeahn22
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)]/50 mt-2">
          © 2026 연결의 숲. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
