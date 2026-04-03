"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

interface InterestCard {
  emoji: string;
  name: string;
  headline: string;
  desc: string;
  color: string;
}

const INTERESTS: InterestCard[] = [
  {
    emoji: "💪",
    name: "건강",
    headline: "1년만에 30kg 뺀 파워 다이어터",
    desc: "인슐린·간헐적단식·저탄고지의 '준 고수'. 몸도 과학으로 이해하면 바꿀 수 있다.",
    color: "#22c55e",
  },
  {
    emoji: "🔬",
    name: "과학",
    headline: "원리를 끝까지 추적",
    desc: "모든 것에는 과학적 이유가 있을 거라 추정하고, 왜 그런지 밝혀낼 때까지 멈추지 않는다.",
    color: "#06b6d4",
  },
  {
    emoji: "🌿",
    name: "삶의 철학",
    headline: "No Self + 끌어당김의 법칙",
    desc: "No Self의 자세로 어떻게 끌어당김의 법칙을 실행할 것인가. 내 인생의 오래된 화두.",
    color: "#8b5cf6",
  },
  {
    emoji: "🧭",
    name: "리더십·경영",
    headline: "기업의 성공 방정식",
    desc: "기업의 성공 방정식은 무엇이고, 나는 나중에 경영을 어떻게 할 것인가. 아직도 공부 중.",
    color: "#f59e0b",
  },
  {
    emoji: "🔗",
    name: "통섭·연결",
    headline: "지식과 끊임없이 연결",
    desc: "새로운 지식을 끊임없이 추구하되, 내가 가진 지식과 끊임없이 연결한다. 그게 이 숲의 이름이 된 이유.",
    color: "var(--accent)",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

export default function MyInterests() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      id="intro-interests"
      ref={ref as React.RefObject<HTMLElement>}
      className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 bg-[var(--bg)]"
    >
      <div className="max-w-5xl w-full">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest">
            Interests
          </span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          관심사가 다양하고 독서를 좋아한다
        </motion.h2>

        <motion.p
          className="text-[var(--text-muted)] mb-12 max-w-xl"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          숲의 각 구역은 내가 오랫동안 탐색해온 주제들입니다.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {INTERESTS.map((card, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 cursor-default overflow-hidden transition-shadow hover:shadow-lg"
            >
              {/* Accent corner decoration */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-bl-3xl opacity-10 transition-opacity group-hover:opacity-20"
                style={{ background: card.color }}
              />

              <div className="text-3xl mb-3">{card.emoji}</div>

              <div
                className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-3"
                style={{
                  background: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                  color: card.color,
                  border: `1px solid color-mix(in srgb, ${card.color} 30%, transparent)`,
                }}
              >
                {card.name}
              </div>

              <h3 className="font-semibold text-[var(--text)] text-sm mb-2 leading-snug">
                {card.headline}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{card.desc}</p>

              {/* Bottom accent bar */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                style={{ background: card.color }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
