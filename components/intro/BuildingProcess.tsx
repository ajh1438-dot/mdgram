"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface Step {
  num: string;
  title: string;
  desc: string;
  emoji: string;
  fail?: boolean;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "무모한 시작",
    desc: "코딩을 전혀 모르는 상태에서 AI에게 '쇼핑몰 만들어줘'라고 했다. AI가 만들어줬는데 내가 어디에 올려야 할지 몰랐다.",
    emoji: "🙈",
    fail: true,
  },
  {
    num: "02",
    title: "Vercel 발견",
    desc: "어딘가에 올려야 한다는 것을 알게 됐다. Vercel이라는 곳이 있다고 해서 가입했다. 여전히 Git이 뭔지 몰랐다.",
    emoji: "🌐",
  },
  {
    num: "03",
    title: "첫 번째 빌드 실패",
    desc: "npm run build가 무엇인지 물어봤다. AI가 설명해줬다. 이해했다고 생각했는데 에러 메시지를 봤을 때 다시 몰랐다.",
    emoji: "💥",
    fail: true,
  },
  {
    num: "04",
    title: "마크다운 탐색기 완성",
    desc: "드디어 폴더-파일 구조로 글을 탐색할 수 있는 페이지가 완성됐다. Supabase에 데이터도 넣었다. 뿌듯했다.",
    emoji: "🌲",
  },
  {
    num: "05",
    title: "소개 페이지 도전",
    desc: "'이제 인트로도 멋있게 만들어야지.' — 이 문장이 이 섹션을 만들게 했다. 지금 당신이 보고 있는 게 바로 그 결과다.",
    emoji: "🚀",
  },
  {
    num: "06",
    title: "계속 진행 중",
    desc: "완성은 없다. 생각이 자라면 페이지도 자란다. 바이브코딩은 실패해도 재미있다는 걸 배웠다.",
    emoji: "🌱",
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

        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          이 페이지를 만드는 과정
        </motion.h2>

        <motion.p
          className="text-[var(--text-muted)] mb-12"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          바이브 코딩 실패 역사 — 솔직하게 씁니다.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              className={`relative bg-[var(--card)] border rounded-2xl p-6 overflow-hidden ${
                step.fail
                  ? "border-red-500/20"
                  : "border-[var(--border)]"
              }`}
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.08 }}
            >
              {/* Number watermark */}
              <div className="absolute top-4 right-5 text-5xl font-black text-[var(--border)] select-none opacity-40">
                {step.num}
              </div>

              <div className="text-2xl mb-3">{step.emoji}</div>

              <h3 className="font-semibold text-[var(--text)] mb-2">
                {step.title}
                {step.fail && (
                  <span className="ml-2 text-xs font-normal text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                    실패
                  </span>
                )}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
