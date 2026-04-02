"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PreviewPaneProps {
  content: string;
  activeTheme?: string;
}

export default function PreviewPane({ content, activeTheme }: PreviewPaneProps) {
  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      data-theme={activeTheme}
    >
      {/* Preview header */}
      <div
        className="flex items-center px-4 py-2 text-xs border-b shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        미리보기
      </div>

      {/* Markdown rendered content */}
      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {content ? (
          <div
            className="prose-custom max-w-none"
            style={{ color: "var(--text)" }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1
                    className="text-2xl font-bold mb-4 pb-2 border-b"
                    style={{ color: "var(--text)", borderColor: "var(--border)" }}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    className="text-xl font-semibold mb-3 mt-6"
                    style={{ color: "var(--text)" }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    className="text-lg font-semibold mb-2 mt-4"
                    style={{ color: "var(--text)" }}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p
                    className="mb-3 leading-relaxed"
                    style={{ color: "var(--text)" }}
                  >
                    {children}
                  </p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="underline"
                    style={{ color: "var(--accent)" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded text-sm font-mono"
                        style={{
                          backgroundColor: "var(--card)",
                          color: "var(--accent)",
                          border: "1px solid var(--border)",
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className={`${className ?? ""} text-sm font-mono`}
                      style={{ color: "var(--text)" }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre
                    className="rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono"
                    style={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="border-l-4 pl-4 mb-4 italic"
                    style={{
                      borderColor: "var(--accent)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-3 space-y-1" style={{ color: "var(--text)" }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-3 space-y-1" style={{ color: "var(--text)" }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed" style={{ color: "var(--text)" }}>
                    {children}
                  </li>
                ),
                hr: () => (
                  <hr className="my-6" style={{ borderColor: "var(--border)" }} />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table
                      className="min-w-full text-sm border-collapse"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th
                    className="px-3 py-2 text-left font-semibold border"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td
                    className="px-3 py-2 border"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {children}
                  </td>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold" style={{ color: "var(--text)" }}>
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em style={{ color: "var(--text-muted)" }}>{children}</em>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              편집기에 내용을 입력하면 미리보기가 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
