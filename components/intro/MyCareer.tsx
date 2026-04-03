"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface CareerItem {
  period: string;
  year: string;
  title: string;
  desc: string;
  accent?: boolean;
  current?: boolean;
}

const CAREER: CareerItem[] = [
  {
    period: "2010",
    year: "2010",
    title: "회계사 합격",
    desc: "오랜 수험 생활 끝에 공인회계사(CPA) 자격 취득. 숫자 너머에 이야기가 있다는 걸 처음 배운 해.",
    accent: true,
  },
  {
    period: "2010 — 2021",
    year: "11년",
    title: "회계법인 & 증권사 IB",
    desc: "회계법인에서 감사와 자문을 익히고, 증권사 IB에서 딜의 세계를 경험했다. 숫자가 비즈니스 언어라는 확신을 얻은 시간.",
  },
  {
    period: "2021 — 2024",
    year: "3년",
    title: "CFO · 경영지원 총괄",
    desc: "스타트업 CFO로서 재무를 넘어 전략, 조직, 운영까지 책임졌다. 리더십이 무엇인지 제대로 부딪혀가며 배웠다.",
    accent: true,
  },
  {
    period: "2024 — 현재",
    year: "NOW",
    title: "그룹사 경영관리 담당",
    desc: "게임 그룹사의 경영관리를 담당하며 더 큰 그림을 그리고 있다. 그리고 그 옆에서, 이런 것도 만들고 있다.",
    current: true,
  },
];

export default function MyCareer() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      id="intro-career"
      ref={ref as React.RefObject<HTMLElement>}
      className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 bg-[var(--bg-secondary)]"
    >
      <div className="max-w-3xl w-full">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest">
            Career
          </span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          최근 15년 간 이렇게 살았다
        </motion.h2>

        <motion.p
          className="text-[var(--text-muted)] mb-14"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          회계사 합격부터 지금까지, 숫자와 함께한 커리어 타임라인
        </motion.p>

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[68px] sm:left-[80px] top-0 bottom-0 w-0.5 bg-[var(--border)]" />

          <div className="space-y-10">
            {CAREER.map((item, i) => (
              <motion.div
                key={i}
                className="relative flex gap-6 sm:gap-8"
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
              >
                {/* Year marker */}
                <div className="flex-shrink-0 w-[68px] sm:w-[80px] flex flex-col items-end gap-1 pt-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.accent || item.current
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)] bg-[var(--border)] "
                    }`}
                  >
                    {item.year}
                  </span>
                </div>

                {/* Dot on the line */}
                <div className="absolute left-[62px] sm:left-[74px] top-2 w-4 h-4 rounded-full border-2 z-10 flex-shrink-0"
                  style={{
                    backgroundColor: (item.accent || item.current) ? "var(--accent)" : "var(--bg)",
                    borderColor: (item.accent || item.current) ? "var(--accent)" : "var(--border)",
                  }}
                />

                {/* Card */}
                <div
                  className={`flex-1 bg-[var(--card)] border rounded-2xl p-5 shadow-sm mb-1 ${
                    item.current
                      ? "border-[var(--accent)]/50 ring-1 ring-[var(--accent)]/20"
                      : item.accent
                      ? "border-[var(--accent)]/30"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[var(--text)] text-base leading-snug">
                      {item.title}
                    </h3>
                    {item.current && (
                      <span className="flex-shrink-0 text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20">
                        현재
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-2">{item.period}</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
