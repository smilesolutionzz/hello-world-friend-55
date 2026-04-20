import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const SceneOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const badgeY = interpolate(badgeIn, [0, 1], [20, 0]);

  const titleProgress = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const titleClip = interpolate(titleProgress, [0, 1], [100, 0]);

  const subIn = spring({ frame: frame - 38, fps, config: { damping: 22 } });
  const subY = interpolate(subIn, [0, 1], [24, 0]);

  const lineW = interpolate(frame, [55, 95], [0, 220], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div style={{ maxWidth: 1400, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 22px",
            borderRadius: 999,
            background: "rgba(99, 102, 241, 0.10)",
            color: "#4f46e5",
            fontFamily: "Space Grotesk, Nanum Gothic, sans-serif",
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: 0.5,
            opacity: badgeIn,
            transform: `translateY(${badgeY}px)`,
            border: "1px solid rgba(99,102,241,0.18)",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#6366f1" }} />
          AIHPRO · 발달 코칭 & 마음 건강
        </div>

        <h1
          style={{
            fontFamily: "Nanum Myeongjo, Playfair Display, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 144,
            lineHeight: 1.05,
            color: "#0f172a",
            marginTop: 36,
            marginBottom: 0,
            clipPath: `inset(0 ${titleClip}% 0 0)`,
            letterSpacing: -2,
          }}
        >
          하루 3분,
          <br />
          마음의 변화
        </h1>

        <div
          style={{
            width: lineW,
            height: 3,
            background: "linear-gradient(90deg, #6366f1, #ec4899)",
            margin: "32px auto 0",
            borderRadius: 2,
          }}
        />

        <p
          style={{
            fontFamily: "Nanum Gothic, Inter, sans-serif",
            fontWeight: 400,
            fontSize: 30,
            color: "#475569",
            marginTop: 28,
            opacity: subIn,
            transform: `translateY(${subY}px)`,
            letterSpacing: -0.3,
          }}
        >
          데이터로 증명하는 30일의 성장
        </p>
      </div>
    </AbsoluteFill>
  );
};
