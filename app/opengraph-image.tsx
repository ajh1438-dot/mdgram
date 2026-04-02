import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "연결의 숲 — 마크다운 서사 소셜 플랫폼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles mimicking mindmap nodes */}
        {[
          { top: "12%", left: "8%", size: 80, opacity: 0.15 },
          { top: "65%", left: "5%", size: 50, opacity: 0.1 },
          { top: "20%", right: "10%", size: 60, opacity: 0.12 },
          { top: "70%", right: "8%", size: 90, opacity: 0.1 },
          { top: "45%", left: "15%", size: 40, opacity: 0.08 },
          { top: "30%", right: "22%", size: 45, opacity: 0.09 },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: c.top,
              left: "left" in c ? c.left : undefined,
              right: "right" in c ? c.right : undefined,
              width: `${c.size}px`,
              height: `${c.size}px`,
              borderRadius: "50%",
              border: `2px solid rgba(99,102,241,${c.opacity * 4})`,
              background: `rgba(99,102,241,${c.opacity})`,
            }}
          />
        ))}

        {/* Title */}
        <div
          style={{
            fontSize: "88px",
            fontWeight: 800,
            color: "#f4f4f5",
            letterSpacing: "-2px",
            lineHeight: 1.1,
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          연결의 숲
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "780px",
            lineHeight: 1.5,
            marginBottom: "32px",
          }}
        >
          생각이 나무처럼 자라고 이야기가 숲을 이루는 곳
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 24px",
            borderRadius: "9999px",
            border: "1.5px solid rgba(99,102,241,0.6)",
            color: "#818cf8",
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          마크다운 서사 소셜 플랫폼
        </div>
      </div>
    ),
    { ...size }
  );
}
