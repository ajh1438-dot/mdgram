"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

const STATS = [
  { label: "회계사 경력", value: "16년차" },
  { label: "자격증", value: "CPA" },
  { label: "현직", value: "그룹사 경영관리" },
];

export default function AboutMe() {
  const { ref, inView } = useInView(0.15);

  return (
    <section
      id="intro-about"
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
            About
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: decorative avatar placeholder */}
          <motion.div
            className="flex justify-center lg:justify-start"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 40%, var(--bg)) 100%)",
              }}
            >
              {/* Forest / tree decoration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3/4 h-3/4 opacity-30"
                >
                  <polygon points="60,10 100,80 20,80" fill="white" />
                  <polygon points="60,30 95,90 25,90" fill="white" opacity="0.6" />
                  <rect x="52" y="85" width="16" height="25" rx="2" fill="white" opacity="0.4" />
                </svg>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg">호기심 천국에 사는</p>
                <p className="text-white/70 text-sm">개척정신 회계사</p>
              </div>
            </div>
          </motion.div>

          {/* Right: content card */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Main card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-7 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 leading-snug">
                호기심 천국에 사는 회계사
              </h2>
              <p className="text-[var(--text-muted)] text-base leading-relaxed mb-4">
                모든 것이 궁금합니다. 그것들을 배우고, 연결합니다.
              </p>
              <p className="text-[var(--text-muted)] text-base leading-relaxed">
                그게 제 인생의 행복입니다.
              </p>
            </div>

            {/* Stat line */}
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                >
                  <p className="text-[var(--accent)] font-bold text-base sm:text-lg mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
