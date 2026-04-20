import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const personas = [
  { emoji: "👩‍💼", name: "워킹맘", concern: "육아·일 균형" },
  { emoji: "🏠", name: "전업맘", concern: "고립감·번아웃" },
  { emoji: "👨", name: "아빠", concern: "역할·정서표현" },
  { emoji: "💼", name: "직장인", concern: "스트레스·수면" },
];

export const ScenePersonas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ padding: "100px 120px", justifyContent: "center" }}>
      <div
        style={{
          opacity: headerIn,
          transform: `translateY(${interpolate(headerIn, [0, 1], [20, 0])}px)`,
        }}
      >
        <p
          style={{
            fontFamily: "Space Grotesk, Noto Sans KR, sans-serif",
            fontSize: 22,
            color: "#6366f1",
            letterSpacing: 4,
            textTransform: "uppercase",
            margin: 0,
            fontWeight: 500,
          }}
        >
          For Every You
        </p>
        <h2
          style={{
            fontFamily: "Nanum Myeongjo, Playfair Display, serif",
            fontStyle: "italic",
            fontSize: 96,
            color: "#0f172a",
            margin: "12px 0 60px",
            lineHeight: 1,
            letterSpacing: -1.5,
          }}
        >
          당신의 이야기에<br/>맞춰집니다
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
        {personas.map((p, i) => {
          const delay = 20 + i * 10;
          const inProg = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 110 } });
          const y = interpolate(inProg, [0, 1], [60, 0]);
          const float = Math.sin((frame - delay) / 24 + i) * 6;
          return (
            <div
              key={p.name}
              style={{
                opacity: inProg,
                transform: `translateY(${y + float}px)`,
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(15,23,42,0.06)",
                borderRadius: 28,
                padding: "44px 32px",
                boxShadow: "0 30px 60px -30px rgba(15,23,42,0.18)",
              }}
            >
              <div style={{ fontSize: 88, marginBottom: 20 }}>{p.emoji}</div>
              <div
                style={{
                  fontFamily: "Noto Sans KR, Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 36,
                  color: "#0f172a",
                  letterSpacing: -0.5,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontFamily: "Noto Sans KR, Inter, sans-serif",
                  fontSize: 20,
                  color: "#64748b",
                  marginTop: 8,
                }}
              >
                {p.concern}
              </div>
              <div
                style={{
                  marginTop: 28,
                  height: 4,
                  background: "linear-gradient(90deg, #6366f1, #ec4899)",
                  borderRadius: 2,
                  width: `${interpolate(inProg, [0, 1], [0, 100])}%`,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
