import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { loadFont as loadKR } from '@remotion/google-fonts/NotoSansKR';
import { loadFont as loadEN } from '@remotion/google-fonts/SpaceGrotesk';

const kr = loadKR('normal', { weights: ['700', '900'] });
const en = loadEN('normal', { weights: ['400', '600', '700'], subsets: ['latin'] });

export const FPS = 30;
const SCENE = 150; // 5s each
export const TOTAL_FRAMES = SCENE * 5; // 25s

// Brand
const GOLD = '#C8B88A';
const INK = '#0E0E10';
const PAPER = '#FAFAF7';
const MUTED = '#6B6B72';

const krFont = kr.fontFamily;
const enFont = en.fontFamily;

// Subtle grain background
const Grain: React.FC = () => (
  <div
    style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
      backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
      backgroundSize: '3px 3px',
    }}
  />
);

// Floating gold orb
const Orb: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin((frame + delay) / 40) * 20;
  return (
    <div style={{
      position: 'absolute', left: x, top: y + drift, width: size, height: size,
      borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}55 0%, transparent 70%)`,
      filter: 'blur(20px)',
    }} />
  );
};

// Scene 1: Hook — 30일, 매일 7분
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelY = interpolate(spring({ frame: frame - 5, fps, config: { damping: 200 } }), [0, 1], [30, 0]);
  const labelO = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' });
  const titleO = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 200 } }), [0, 1], [60, 0]);
  const sub = interpolate(frame, [55, 85], [0, 1], { extrapolateRight: 'clamp' });
  const lineW = interpolate(frame, [60, 110], [0, 240], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: PAPER, padding: 120 }}>
      <Orb x={1500} y={120} size={400} delay={0} />
      <Orb x={-100} y={700} size={520} delay={20} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: 1400 }}>
        <div style={{
          opacity: labelO, transform: `translateY(${labelY}px)`,
          fontFamily: enFont, color: GOLD, letterSpacing: 8, fontSize: 22, fontWeight: 600, marginBottom: 36,
        }}>
          AIHPRO · MIND TRACK 30
        </div>
        <div style={{
          opacity: titleO, transform: `translateY(${titleY}px)`,
          fontFamily: krFont, color: INK, fontSize: 168, fontWeight: 900, lineHeight: 1.05, letterSpacing: -4,
        }}>
          하루 7분,<br />30일의 변화.
        </div>
        <div style={{ height: 2, background: GOLD, width: lineW, marginTop: 56 }} />
        <div style={{
          opacity: sub, fontFamily: krFont, color: MUTED, fontSize: 30, marginTop: 32, fontWeight: 400, letterSpacing: -0.5,
        }}>
          마음을 바꾸는 가장 가벼운 루틴
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: 매일 7분 루틴 — 체크인 / 미션 / 영상
const RoutineCard: React.FC<{ no: string; title: string; desc: string; min: string; delay: number }> = ({ no, title, desc, min, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 140 } });
  const y = interpolate(s, [0, 1], [80, 0]);
  return (
    <div style={{
      flex: 1, background: '#fff', borderRadius: 32, padding: 56,
      boxShadow: '0 30px 80px -30px rgba(14,14,16,0.18)',
      opacity: s, transform: `translateY(${y}px)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 460,
      border: '1px solid rgba(200,184,138,0.2)',
    }}>
      <div>
        <div style={{ fontFamily: enFont, color: GOLD, fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>{no}</div>
        <div style={{ fontFamily: krFont, color: INK, fontSize: 56, fontWeight: 800, marginTop: 24, letterSpacing: -2 }}>{title}</div>
        <div style={{ fontFamily: krFont, color: MUTED, fontSize: 26, marginTop: 20, lineHeight: 1.5, letterSpacing: -0.3 }}>{desc}</div>
      </div>
      <div style={{ fontFamily: enFont, color: INK, fontSize: 30, fontWeight: 600, marginTop: 32 }}>
        <span style={{ color: GOLD }}>●</span> {min}
      </div>
    </div>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const head = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const headY = interpolate(frame, [0, 25], [20, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: PAPER, padding: '110px 120px' }}>
      <Orb x={-200} y={-100} size={600} delay={10} />
      <div style={{ opacity: head, transform: `translateY(${headY}px)` }}>
        <div style={{ fontFamily: enFont, color: GOLD, fontSize: 22, letterSpacing: 6, fontWeight: 600, marginBottom: 20 }}>
          DAILY 7-MIN ROUTINE
        </div>
        <div style={{ fontFamily: krFont, color: INK, fontSize: 84, fontWeight: 900, letterSpacing: -3, lineHeight: 1.05 }}>
          매일 단 세 가지.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, marginTop: 80 }}>
        <RoutineCard no="01" title="체크인" desc="오늘의 마음 상태를 30초 만에 기록합니다." min="30 sec" delay={20} />
        <RoutineCard no="02" title="미션" desc="전문가가 설계한 오늘의 작은 실천을 따라갑니다." min="3 min" delay={35} />
        <RoutineCard no="03" title="영상 코칭" desc="감정·관계·수면 — 그날에 맞는 짧은 가이드 영상." min="3 min" delay={50} />
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: 30일 변화 (progress dots)
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: INK, padding: 120 }}>
      <Orb x={1400} y={600} size={500} delay={5} />
      <div style={{ opacity: head }}>
        <div style={{ fontFamily: enFont, color: GOLD, fontSize: 22, letterSpacing: 6, fontWeight: 600, marginBottom: 24 }}>
          30 DAYS · 4 CHAPTERS
        </div>
        <div style={{ fontFamily: krFont, color: PAPER, fontSize: 96, fontWeight: 900, letterSpacing: -3, lineHeight: 1.05 }}>
          한 챕터씩,<br />마음이 단단해집니다.
        </div>
      </div>
      {/* 30 dots */}
      <div style={{ display: 'flex', gap: 14, marginTop: 100, flexWrap: 'wrap', maxWidth: 1500 }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const s = spring({ frame: frame - 25 - i * 2, fps, config: { damping: 200 } });
          const isMilestone = (i + 1) % 7 === 0;
          return (
            <div key={i} style={{
              width: 42, height: 42, borderRadius: '50%',
              background: isMilestone ? GOLD : 'rgba(255,255,255,0.18)',
              border: isMilestone ? `2px solid ${GOLD}` : '2px solid rgba(255,255,255,0.25)',
              transform: `scale(${s})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: enFont, fontSize: 14, color: isMilestone ? INK : 'rgba(255,255,255,0.6)', fontWeight: 700,
            }}>
              {i + 1}
            </div>
          );
        })}
      </div>
      <div style={{
        opacity: interpolate(frame, [110, 140], [0, 1], { extrapolateRight: 'clamp' }),
        fontFamily: krFont, color: 'rgba(255,255,255,0.7)', fontSize: 26, marginTop: 50, letterSpacing: -0.3,
      }}>
        주차별 챕터 · 매주 새로운 테마 · 4주차 마음 리포트
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: 신뢰 — 전문가 검수
const TrustPill: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div style={{
      padding: '24px 40px', borderRadius: 999, border: `1.5px solid ${GOLD}`,
      fontFamily: krFont, fontSize: 30, fontWeight: 600, color: INK,
      background: '#fff', opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
      letterSpacing: -0.5,
    }}>
      {label}
    </div>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const head = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: PAPER, padding: 120, justifyContent: 'center' }}>
      <Orb x={1400} y={100} size={500} delay={0} />
      <div style={{ opacity: head, maxWidth: 1500 }}>
        <div style={{ fontFamily: enFont, color: GOLD, fontSize: 22, letterSpacing: 6, fontWeight: 600, marginBottom: 24 }}>
          EXPERT-REVIEWED · NON-MEDICAL
        </div>
        <div style={{ fontFamily: krFont, color: INK, fontSize: 96, fontWeight: 900, letterSpacing: -3, lineHeight: 1.1 }}>
          전문가가 설계하고,<br />매주 점검합니다.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 64, flexWrap: 'wrap', maxWidth: 1500 }}>
        <TrustPill label="14년 경력 임상 전문가 검수" delay={25} />
        <TrustPill label="비의료 코칭 · 안전한 가이드" delay={40} />
        <TrustPill label="개인정보 암호화 · 익명 닉네임" delay={55} />
      </div>
      <div style={{
        opacity: interpolate(frame, [80, 110], [0, 1], { extrapolateRight: 'clamp' }),
        fontFamily: krFont, color: MUTED, fontSize: 26, marginTop: 56, letterSpacing: -0.3, maxWidth: 1100, lineHeight: 1.5,
      }}>
        30일 마음 트랙은 진단·치료가 아닌, 전문가의 시선으로 설계한 발달·심리 코칭 루틴입니다.
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: CTA
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const priceS = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const ctaS = spring({ frame: frame - 50, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ background: INK, justifyContent: 'center', alignItems: 'center', padding: 120 }}>
      <Orb x={200} y={700} size={500} delay={0} />
      <Orb x={1400} y={150} size={500} delay={15} />
      <div style={{
        fontFamily: enFont, color: GOLD, fontSize: 24, letterSpacing: 8, fontWeight: 600,
        opacity: s, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
      }}>
        START TODAY
      </div>
      <div style={{
        fontFamily: krFont, color: PAPER, fontSize: 132, fontWeight: 900, letterSpacing: -4, marginTop: 40, textAlign: 'center', lineHeight: 1.05,
        opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
      }}>
        오늘부터,<br />30일 마음 트랙.
      </div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 64,
        opacity: priceS, transform: `scale(${interpolate(priceS, [0, 1], [0.9, 1])})`,
      }}>
        <span style={{ fontFamily: enFont, color: GOLD, fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>₩19,900</span>
        <span style={{ fontFamily: krFont, color: 'rgba(255,255,255,0.6)', fontSize: 36, fontWeight: 400 }}>/ 30일 단일 결제</span>
      </div>
      <div style={{
        marginTop: 56, padding: '28px 64px', borderRadius: 999, background: GOLD,
        fontFamily: krFont, color: INK, fontSize: 36, fontWeight: 700, letterSpacing: -0.5,
        opacity: ctaS, transform: `translateY(${interpolate(ctaS, [0, 1], [20, 0])}px)`,
      }}>
        aihpro.app / mind-track
      </div>
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={SCENE}><Scene1 /></Sequence>
    <Sequence from={SCENE} durationInFrames={SCENE}><Scene2 /></Sequence>
    <Sequence from={SCENE * 2} durationInFrames={SCENE}><Scene3 /></Sequence>
    <Sequence from={SCENE * 3} durationInFrames={SCENE}><Scene4 /></Sequence>
    <Sequence from={SCENE * 4} durationInFrames={SCENE}><Scene5 /></Sequence>
    <Grain />
  </AbsoluteFill>
);
