"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface FailCard {
  emoji: string;
  title: string;
  desc: string;
}

interface DayStep {
  day: string;
  title: string;
  desc: string;
  highlight?: boolean;
}

const FAIL_CARDS: FailCard[] = [
  {
    emoji: "🚌",
    title: "셔틀버스 앱",
    desc: "야심차게 시작했다. 지금도 미완성이다.",
  },
  {
    emoji: "🏫",
    title: "유치원 ERP",
    desc: "딸 다니는 유치원에 쓰이길 바랐다. 바람으로 끝났다.",
  },
  {
    emoji: "🧾",
    title: "세무 ERP",
    desc: "회계사니까 이건 잘 만들 줄 알았다. 아니었다.",
  },
  {
    emoji: "🇺🇸",
    title: "영어공부 앱",
    desc: "영어는 중요하다. 앱은 여전히 없다.",
  },
];

const DAY_STEPS: DayStep[] = [
  {
    day: "1~2일차",
    title: "Grok과 소크라테스식 인터뷰",
    desc: "AI한테 나를 인터뷰 받는다는 게 처음엔 어색했다. 하지만 끝날 때쯤 내가 어떤 사람인지 더 선명해졌다.",
  },
  {
    day: "3일차",
    title: "랩장님 Clabs, 스킬 활용하여 제작",
    desc: "클로드 코드와 함께 자기소개 페이지를 처음으로 만들었다. 결과물이 나왔을 때의 그 짜릿함.",
    highlight: true,
  },
  {
    day: "4일차",
    title: "Grok과 2차 인터뷰",
    desc: "만든 페이지를 두고 Grok과 다시 대화했다. 더 깊은 질문들이 나왔다.",
  },
  {
    day: "5일차",
    title: "소셜 플랫폼 MVP 제작",
    desc: "새롭게 얻은 아이디어에 착안해 마크다운 형태의 소셜 플랫폼 MVP를 만들었다. 이 숲이 태어난 날.",
    highlight: true,
  },
  {
    day: "5일차 저녁",
    title: "마감 임박, 제출",
    desc: "와이프와 딸을 장모님댁에 보내고, 마감에 쫓기며 제출했다. 고요한 집에서 혼자 버튼을 눌렀다.",
  },
];

export default function BuildingProcess() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      id="intro-process"
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
            Process
          </span>
        </motion.div>

        {/* === Part 1: 바이브코딩은 어려웠다 === */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          AI에 관심이 많으나 바이브코딩은 어려웠다
        </motion.h2>

        <motion.p
          className="text-[var(--text-muted)] mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          25년 12월부터 26년 2월까지, 시도했던 모든 앱은 여전히 미완성이다.
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {FAIL_CARDS.map((card, i) => (
            <motion.div
              key={i}
              className="relative bg-[var(--card)] border border-red-500/20 rounded-2xl p-5 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            >
              <div className="text-2xl mb-2">{card.emoji}</div>
              <h3 className="font-semibold text-[var(--text)] text-sm mb-1">
                {card.title}
              </h3>
              <span className="text-xs font-normal text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                미완성
              </span>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-sm text-[var(--text-muted)] italic mb-14 border-l-2 border-[var(--accent)]/40 pl-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          그 후 최근 1개월 간 바이브코딩은 멈췄고, 옵시디언 및 오픈클로와 가장 가까운 친구가 되었다.
        </motion.p>

        {/* === Part 2: 홈페이지를 만드는 과정 === */}
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          홈페이지를 만드는 과정
        </motion.h2>

        <motion.p
          className="text-[var(--text-muted)] mb-10"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          5일간의 솔직한 기록
        </motion.p>

        {/* Day-by-day timeline */}
        <div className="relative">
          <div className="absolute left-[40px] sm:left-[52px] top-0 bottom-0 w-0.5 bg-[var(--border)]" />

          <div className="space-y-7">
            {DAY_STEPS.map((step, i) => (
              <motion.div
                key={i}
                className="relative flex gap-5 sm:gap-7"
                initial={{ opacity: 0, x: -25 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.7 + i * 0.1 }}
              >
                {/* Day badge */}
                <div className="flex-shrink-0 w-[40px] sm:w-[52px] flex flex-col items-end pt-1">
                  <span
                    className={`text-[10px] font-bold text-center leading-tight px-1 py-0.5 rounded-md ${
                      step.highlight
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)] bg-[var(--border)]"
                    }`}
                  >
                    {step.day}
                  </span>
                </div>

                {/* Dot */}
                <div
                  className="absolute left-[34px] sm:left-[46px] top-2.5 w-3.5 h-3.5 rounded-full border-2 z-10"
                  style={{
                    backgroundColor: step.highlight ? "var(--accent)" : "var(--bg)",
                    borderColor: step.highlight ? "var(--accent)" : "var(--border)",
                  }}
                />

                {/* Content */}
                <div
                  className={`flex-1 bg-[var(--card)] border rounded-2xl p-4 ${
                    step.highlight
                      ? "border-[var(--accent)]/40"
                      : "border-[var(--border)]"
                  }`}
                >
                  <h3 className="font-semibold text-[var(--text)] text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
