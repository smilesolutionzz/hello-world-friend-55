import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const trust = [
  { num: "20+", label: "전문 심리검사" },
  { num: "1,247", label: "규준 집단 N" },
  { num: "11", label: "TOP 전문가" },
  { num: "50", label: "제휴 기관" },
];

export const SceneTrust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ padding: "120px 140px", justifyContent: "center" }}>
      <div
        style={{
          opacity: headerIn,
          transform: `translateY(${interpolate(headerIn, [0, 1], [20, 0])}px)`,
          textAlign: "center",
          marginBottom: 80,
        }}
      >
        <p
          style={{
            fontFamily: "Space Grotesk, Noto Sans KR, sans-serif",
            fontSize: 22,
            color: "#0ea5e9",
            letterSpacing: 4,
            textTransform: "uppercase",
            margin: 0,
            fontWeight: 500,
          }}
        >
          Clinically Grounded
        </p>
        <h2
          style={{
            fontFamily: "Nanum Myeongjo, Playfair Display, serif",
            fontStyle: "italic",
            fontSize: 88,
            color: "#0f172a",
            margin: "12px 0 0",
            lineHeight: 1,
            letterSpacing: -1.5,
          }}
        >
          AI의 정확함 ×<br/>전문가의 따뜻함
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {trust.map((t, i) => {
          const delay = 20 + i * 8;
          const inProg = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 130 } });
          const y = interpolate(inProg, [0, 1], [40, 0]);
          return (
            <div
              key={t.label}
              style={{
                opacity: inProg,
                transform: `translateY(${y}px)`,
                textAlign: "center",
                padding: "40px 20px",
                borderLeft: i === 0 ? "none" : "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, Noto Sans KR, sans-serif",
                  fontWeight: 700,
                  fontSize: 96,
                  color: "#0f172a",
                  letterSpacing: -3,
                  lineHeight: 1,
                  background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.num}
              </div>
              <div
                style={{
                  fontFamily: "Noto Sans KR, Inter, sans-serif",
                  fontSize: 22,
                  color: "#475569",
                  marginTop: 14,
                  letterSpacing: -0.3,
                }}
              >
                {t.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
