import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadKr } from "@remotion/google-fonts/NanumGothic";
import { loadFont as loadKrSerif } from "@remotion/google-fonts/NanumMyeongjo";

import { SceneOpen } from "./scenes/SceneOpen";
import { ScenePersonas } from "./scenes/ScenePersonas";
import { SceneTransform } from "./scenes/SceneTransform";
import { SceneTrust } from "./scenes/SceneTrust";
import { SceneClose } from "./scenes/SceneClose";

loadInter("normal", { weights: ["400", "600"], subsets: ["latin"] });
loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] });
loadSerif("normal", { weights: ["400", "700"], subsets: ["latin"], style: "italic" });
loadKr("normal", { weights: ["400", "700", "800"], subsets: ["korean"] });
loadKrSerif("normal", { weights: ["400", "700"], subsets: ["korean"] });

// Persistent ambient background — soft warm gradient with slow drift
const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 30]);
  const hue = interpolate(frame, [0, durationInFrames], [218, 232]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at ${30 + drift}% ${20 + drift / 2}%, hsl(${hue}, 60%, 97%) 0%, hsl(${hue + 5}, 40%, 94%) 35%, hsl(220, 25%, 90%) 100%)`,
      }}
    />
  );
};

// Floating subtle orbs
const PersistentOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 15, y: 25, size: 380, color: "rgba(99, 102, 241, 0.10)", speed: 0.4 },
    { x: 78, y: 70, size: 460, color: "rgba(236, 72, 153, 0.08)", speed: 0.6 },
    { x: 55, y: 15, size: 280, color: "rgba(14, 165, 233, 0.09)", speed: 0.5 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {orbs.map((o, i) => {
        const dy = Math.sin((frame * o.speed) / 30) * 40;
        const dx = Math.cos((frame * o.speed) / 40) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.size,
              height: o.size,
              borderRadius: "50%",
              background: o.color,
              filter: "blur(80px)",
              transform: `translate(${dx}px, ${dy}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <PersistentOrbs />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneOpen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <ScenePersonas />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 24 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneTransform />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneTrust />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <SceneClose />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
