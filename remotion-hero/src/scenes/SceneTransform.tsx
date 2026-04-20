import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const metrics = [
  { label: "스트레스", before: 78, after: 42, color: "#ef4444" },
  { label: "수면의 질", before: 35, after: 81, color: "#0ea5e9", reverse: true },
  { label: "정서 안정", before: 41, after: 79, color: "#10b981", reverse: true },
];

export const SceneTransform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ padding: "90px 140px", justifyContent: "center" }}>
      <div style={{ opacity: headerIn, transform: `translateY(${interpolate(headerIn, [0, 1], [20, 0])}px)` }}>
        <p
          style={{
            fontFamily: "Space Grotesk, Noto Sans KR, sans-serif",
            fontSize: 22,
            color: "#ec4899",
            letterSpacing: 4,
            textTransform: "uppercase",
            margin: 0,
            fontWeight: 500,
          }}
        >
          30 Days · Real Change
        </p>
        <h2
          style={{
            fontFamily: "Nanum Myeongjo, Playfair Display, serif",
            fontStyle: "italic",
            fontSize: 88,
            color: "#0f172a",
            margin: "10px 0 50px",
            lineHeight: 1,
            letterSpacing: -1.5,
          }}
        >
          데이터가 말해주는 변화
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        {metrics.map((m, i) => {
          const delay = 18 + i * 18;
          const rowIn = spring({ frame: frame - delay, fps, config: { damping: 22 } });
          const fillProg = interpolate(frame - delay - 8, [0, 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const beforeW = m.before;
          const afterW = interpolate(fillProg, [0, 1], [m.before, m.after]);
          const num = Math.round(afterW);
          return (
            <div
              key={m.label}
              style={{
                opacity: rowIn,
                transform: `translateX(${interpolate(rowIn, [0, 1], [-40, 0])}px)`,
                display: "grid",
                gridTemplateColumns: "260px 1fr 140px",
                alignItems: "center",
                gap: 32,
              }}
            >
              <div
                style={{
                  fontFamily: "Noto Sans KR, Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 36,
                  color: "#0f172a",
                  letterSpacing: -0.5,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  position: "relative",
                  height: 22,
                  background: "rgba(15,23,42,0.06)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${beforeW}%`,
                    background: "rgba(15,23,42,0.18)",
                    borderRadius: 999,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${afterW}%`,
                    background: `linear-gradient(90deg, ${m.color}, ${m.color}dd)`,
                    borderRadius: 999,
                    boxShadow: `0 0 20px ${m.color}66`,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, Noto Sans KR, sans-serif",
                  fontWeight: 700,
                  fontSize: 56,
                  color: m.color,
                  textAlign: "right",
                  letterSpacing: -1,
                }}
              >
                {num}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 50,
          display: "flex",
          gap: 40,
          fontFamily: "Noto Sans KR, Inter, sans-serif",
          fontSize: 18,
          color: "#94a3b8",
          opacity: interpolate(frame, [80, 110], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <span>● 검사 전 (Day 0)</span>
        <span style={{ color: "#0f172a" }}>● 30일 후 (Day 30)</span>
      </div>
    </AbsoluteFill>
  );
};
