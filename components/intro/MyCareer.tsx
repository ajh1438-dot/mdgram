"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface CareerItem {
  year: string;
  title: string;
  org: string;
  desc: string;
  accent?: boolean;
}

const CAREER: CareerItem[] = [
  {
    year: "2013",
    title: "세무/회계 커리어 시작",
    org: "회계법인",
    desc: "숫자의 세계에 발을 들이다. 재무제표가 이야기를 품고 있다는 걸 처음 알게 됐다.",
  },
  {
    year: "2016",
    title: "공인회계사 자격 취득",
    org: "한국공인회계사회",
    desc: "수년간의 공부 끝에 CPA. 시험보다 더 힘든 건 그 다음이었다.",
    accent: true,
  },
  {
    year: "2019",
    title: "스타트업 CFO 역할",
    org: "테크 스타트업",
    desc: "회계를 넘어 전략을 배우기 시작. 숫자가 아닌 방향을 설계하는 일.",
  },
  {
    year: "2022",
    title: "독립 컨설턴트",
    org: "프리랜서",
    desc: "내 방식으로 일하기로 결심. 클라이언트와 더 깊은 파트너십을 만들어가는 중.",
    accent: true,
  },
  {
    year: "2025~",
    title: "바이브코딩 + 지식 탐구",
    org: "연결의 숲",
    desc: "AI 도구로 직접 서비스를 만들기 시작. 이 페이지도 그 실험의 산물이다.",
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
      <div className="max-w-4xl w-full">
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
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          내 커리어
        </motion.h2>

        {/* Timeline */}
        <div className="relative">
          {/* Center line (desktop only) */}
          <div className="hidden sm:block absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-[var(--border)]" />

          <div className="space-y-8 sm:space-y-0">
            {CAREER.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  className={`relative sm:flex sm:items-start sm:gap-8 ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                >
                  {/* Card (takes half width on desktop) */}
                  <div className="sm:w-1/2">
                    <div
                      className={`relative bg-[var(--card)] border rounded-2xl p-5 shadow-sm transition-colors ${
                        item.accent
                          ? "border-[var(--accent)]/40"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.accent
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]"
                          }`}
                        >
                          {item.year}
                        </div>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-[var(--text)]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--accent)] font-medium mt-0.5">{item.org}</p>
                      <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Center dot (desktop) */}
                  <div className="hidden sm:flex w-0 items-start justify-center pt-5">
                    <div
                      className={`w-3 h-3 rounded-full border-2 z-10 flex-shrink-0 ${
                        item.accent
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "bg-[var(--bg)] border-[var(--border)]"
                      }`}
                    />
                  </div>

                  {/* Empty half on desktop */}
                  <div className="hidden sm:block sm:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
