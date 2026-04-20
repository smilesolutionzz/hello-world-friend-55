import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProg = spring({ frame, fps, config: { damping: 200 } });
  const clip = interpolate(titleProg, [0, 1], [100, 0]);

  const subIn = spring({ frame: frame - 28, fps, config: { damping: 22 } });
  const subY = interpolate(subIn, [0, 1], [20, 0]);

  const logoIn = spring({ frame: frame - 60, fps, config: { damping: 18 } });
  const logoY = interpolate(logoIn, [0, 1], [20, 0]);

  const lineW = interpolate(frame, [40, 90], [0, 380], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <div style={{ textAlign: "center", maxWidth: 1500 }}>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 156,
            lineHeight: 1.02,
            color: "#0f172a",
            margin: 0,
            clipPath: `inset(0 0 ${clip}% 0)`,
            letterSpacing: -3,
          }}
        >
          시작하세요,
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1, #ec4899, #0ea5e9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            오늘의 당신
          </span>
        </h1>

        <div
          style={{
            width: lineW,
            height: 3,
            background: "linear-gradient(90deg, #6366f1, #ec4899)",
            margin: "44px auto 0",
            borderRadius: 2,
          }}
        />

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 32,
            color: "#475569",
            marginTop: 36,
            opacity: subIn,
            transform: `translateY(${subY}px)`,
            letterSpacing: -0.3,
          }}
        >
          체험검사 무료 · ₩990 단건 · ₩9,900 무제한 구독
        </p>

        <div
          style={{
            marginTop: 80,
            opacity: logoIn,
            transform: `translateY(${logoY}px)`,
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: 38,
            color: "#0f172a",
            letterSpacing: 8,
          }}
        >
          AIHPRO
          <div
            style={{
              fontSize: 16,
              color: "#94a3b8",
              letterSpacing: 6,
              marginTop: 10,
              fontWeight: 400,
            }}
          >
            aihpro.app
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
