import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { TransitionSeries, springTiming, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { loadFont as loadDisplay } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadKR } from '@remotion/google-fonts/NotoSansKR';
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';

const display = loadDisplay('normal', { weights: ['500', '700'], subsets: ['latin'] });
const kr = loadKR('normal', { weights: ['400', '500', '700', '900'] });
const serif = loadSerif('normal', { weights: ['400'], subsets: ['latin'] });

export const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const TRANS = S(0.6);
// scene visible durations
const D1 = S(3.2);
const D2 = S(3.8);
const D3 = S(4.6);
const D4 = S(3.8);
const D5 = S(4.0);
// each transition overlaps prev+next, so total = sum(D) - 4 * TRANS? Actually TransitionSeries: total = sum durations - sum transitions.
export const TOTAL_FRAMES = D1 + D2 + D3 + D4 + D5 - 4 * TRANS;

const GOLD = '#C8B88A';
const INK = '#0E0E10';
const PAPER = '#FAFAF7';
const MUTED = '#6B6B72';

const KR_FONT = `${kr.fontFamily}, 'Pretendard Variable', system-ui, sans-serif`;
const DISP = `${display.fontFamily}, ${kr.fontFamily}, sans-serif`;
const SERIF = `${serif.fontFamily}, serif`;

// ----------- Persistent paper background -----------
const PaperBG: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 40]);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div
        style={{
          position: 'absolute',
          inset: -100,
          background: `radial-gradient(circle at ${30 + drift * 0.3}% ${20 + drift * 0.2}%, rgba(200,184,138,0.15), transparent 55%), radial-gradient(circle at ${80 - drift * 0.2}% ${70 + drift * 0.1}%, rgba(14,14,16,0.05), transparent 60%)`,
        }}
      />
      {/* subtle grain via dots */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
        <defs>
          <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill={INK} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </AbsoluteFill>
  );
};

// ----------- Scene 1: Hero -----------
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t1 = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const t2 = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  const t3 = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const lineW = interpolate(t2, [0, 1], [0, 220]);
  const yA = interpolate(t1, [0, 1], [40, 0]);
  const yB = interpolate(t2, [0, 1], [40, 0]);
  const yC = interpolate(t3, [0, 1], [40, 0]);
  return (
    <AbsoluteFill style={{ padding: '120px 140px', justifyContent: 'center', fontFamily: KR_FONT, color: INK }}>
      <div style={{ opacity: t1, transform: `translateY(${yA}px)`, fontFamily: DISP, letterSpacing: 4, color: GOLD, fontSize: 22, fontWeight: 500, marginBottom: 28 }}>
        AIHPRO · MIND TRACK
      </div>
      <div style={{ opacity: t2, transform: `translateY(${yB}px)`, fontFamily: SERIF, fontSize: 168, lineHeight: 1.02, letterSpacing: -2, fontStyle: 'italic' }}>
        마음을,
      </div>
      <div style={{ opacity: t2, transform: `translateY(${yB}px)`, fontSize: 168, lineHeight: 1.02, letterSpacing: -6, fontWeight: 900, marginTop: -12 }}>
        데이터로 본다.
      </div>
      <div style={{ width: lineW, height: 2, background: GOLD, marginTop: 44 }} />
      <div style={{ opacity: t3, transform: `translateY(${yC}px)`, marginTop: 28, fontSize: 26, color: MUTED, letterSpacing: -0.5 }}>
        전문가가 검증한 30일 마음 트랙
      </div>
    </AbsoluteFill>
  );
};

// ----------- Scene 2: Problem (scattered words) -----------
const words = [
  { t: '불면', x: 12, y: 22, s: 64, d: 0 },
  { t: '번아웃', x: 64, y: 14, s: 88, d: 4 },
  { t: '불안', x: 30, y: 38, s: 110, d: 8 },
  { t: '관계 피로', x: 58, y: 48, s: 72, d: 12 },
  { t: '집중력', x: 14, y: 64, s: 80, d: 16 },
  { t: '감정 기복', x: 50, y: 72, s: 96, d: 20 },
  { t: '무기력', x: 74, y: 64, s: 70, d: 24 },
  { t: '자기 의심', x: 22, y: 84, s: 60, d: 28 },
];
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerT = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ fontFamily: KR_FONT, color: INK }}>
      <div style={{ position: 'absolute', top: 90, left: 140, opacity: headerT, transform: `translateY(${interpolate(headerT,[0,1],[20,0])}px)` }}>
        <div style={{ fontFamily: DISP, color: GOLD, letterSpacing: 4, fontSize: 18, fontWeight: 500 }}>01 · PROBLEM</div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, marginTop: 12 }}>흩어진 마음의 신호들.</div>
      </div>
      {words.map((w, i) => {
        const t = spring({ frame: frame - 18 - w.d, fps, config: { damping: 14, stiffness: 90 } });
        const float = Math.sin((frame + i * 12) / 22) * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${w.x}%`,
              top: `${w.y}%`,
              opacity: t * 0.85,
              transform: `translate(-50%,-50%) translateY(${float}px) scale(${interpolate(t,[0,1],[0.7,1])})`,
              fontSize: w.s,
              fontWeight: 700,
              letterSpacing: -2,
              color: i % 3 === 0 ? INK : MUTED,
            }}
          >
            {w.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ----------- Scene 3: Track card mock -----------
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headT = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  const cardT = spring({ frame: frame - 14, fps, config: { damping: 18, stiffness: 120 } });
  const weeks = ['Week 1\n알아차리기', 'Week 2\n뿌리 보기', 'Week 3\n바꿔보기', 'Week 4\n자리잡기'];
  return (
    <AbsoluteFill style={{ fontFamily: KR_FONT, color: INK, padding: '80px 120px' }}>
      <div style={{ opacity: headT, transform: `translateY(${interpolate(headT,[0,1],[20,0])}px)` }}>
        <div style={{ fontFamily: DISP, color: GOLD, letterSpacing: 4, fontSize: 18, fontWeight: 500 }}>02 · 30-DAY MIND TRACK</div>
        <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: -2.5, marginTop: 12 }}>30일, 한 가지 마음에 집중.</div>
      </div>
      <div
        style={{
          marginTop: 48,
          background: '#fff',
          borderRadius: 36,
          padding: '44px 52px',
          boxShadow: '0 30px 60px -30px rgba(14,14,16,0.18), 0 0 0 1px rgba(14,14,16,0.04)',
          opacity: cardT,
          transform: `translateY(${interpolate(cardT,[0,1],[60,0])}px) scale(${interpolate(cardT,[0,1],[0.96,1])})`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: MUTED, fontSize: 18, letterSpacing: 1, fontWeight: 500 }}>SLEEP RESET TRACK</div>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, marginTop: 8 }}>잠, 다시 시작하는 30일</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: DISP, fontSize: 64, fontWeight: 700, color: INK }}>₩19,900</span>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(14,14,16,0.08)', margin: '32px 0' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {weeks.map((w, i) => {
            const t = spring({ frame: frame - 30 - i * 6, fps, config: { damping: 200 } });
            return (
              <div
                key={i}
                style={{
                  borderRadius: 20,
                  padding: '22px 20px',
                  background: i === 0 ? GOLD : 'rgba(200,184,138,0.12)',
                  color: i === 0 ? '#fff' : INK,
                  opacity: t,
                  transform: `translateY(${interpolate(t,[0,1],[20,0])}px)`,
                  whiteSpace: 'pre-line',
                  lineHeight: 1.35,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  minHeight: 110,
                }}
              >
                {w}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 28, color: MUTED, fontSize: 20, letterSpacing: -0.3 }}>
          매일 5분 · AI 코칭 + 전문가 검증 · 진행도 리포트
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ----------- Scene 4: Trust pillars -----------
const pillars = [
  { k: '01', t: '전문가 매칭', d: '심리·코칭 전문가가\n곁에서 함께합니다' },
  { k: '02', t: '데이터 리포트', d: '나의 변화를\n수치로 확인합니다' },
  { k: '03', t: '안전한 익명성', d: '닉네임 기반의\n보호된 공간' },
];
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ fontFamily: KR_FONT, color: INK, padding: '110px 140px', justifyContent: 'center' }}>
      <div style={{ opacity: head, transform: `translateY(${interpolate(head,[0,1],[20,0])}px)` }}>
        <div style={{ fontFamily: DISP, color: GOLD, letterSpacing: 4, fontSize: 18, fontWeight: 500 }}>03 · WHY AIHPRO</div>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2.5, marginTop: 12, lineHeight: 1.1 }}>
          AI의 빠르기와<br />사람의 깊이를 함께.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, marginTop: 70 }}>
        {pillars.map((p, i) => {
          const t = spring({ frame: frame - 18 - i * 8, fps, config: { damping: 18, stiffness: 110 } });
          return (
            <div
              key={i}
              style={{
                opacity: t,
                transform: `translateY(${interpolate(t,[0,1],[40,0])}px)`,
                paddingTop: 28,
                borderTop: `2px solid ${GOLD}`,
              }}
            >
              <div style={{ fontFamily: DISP, color: GOLD, fontSize: 20, letterSpacing: 2, fontWeight: 700 }}>{p.k}</div>
              <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1.5, marginTop: 16 }}>{p.t}</div>
              <div style={{ fontSize: 22, color: MUTED, marginTop: 14, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{p.d}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ----------- Scene 5: Outro -----------
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 22, fps, config: { damping: 200 } });
  const c = spring({ frame: frame - 38, fps, config: { damping: 200 } });
  const lineW = interpolate(b, [0, 1], [0, 320]);
  return (
    <AbsoluteFill style={{ fontFamily: KR_FONT, color: INK, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ opacity: a, transform: `translateY(${interpolate(a,[0,1],[20,0])}px)`, fontFamily: DISP, letterSpacing: 6, color: GOLD, fontSize: 22, fontWeight: 500 }}>
        START YOUR 30 DAYS
      </div>
      <div style={{ opacity: a, transform: `translateY(${interpolate(a,[0,1],[30,0])}px)`, marginTop: 28, fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: INK }}>
        오늘의 마음에서,
      </div>
      <div style={{ opacity: a, transform: `translateY(${interpolate(a,[0,1],[30,0])}px)`, fontSize: 110, fontWeight: 900, letterSpacing: -4, marginTop: -6 }}>
        내일의 변화로.
      </div>
      <div style={{ width: lineW, height: 2, background: GOLD, marginTop: 50 }} />
      <div style={{ opacity: c, marginTop: 36, fontFamily: DISP, fontSize: 44, fontWeight: 700, letterSpacing: 2 }}>
        aihpro.app
      </div>
      <div style={{ opacity: c, marginTop: 12, fontSize: 20, color: MUTED, letterSpacing: 1 }}>
        AIHPRO · 발달 코칭 & 의사결정 보조
      </div>
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PaperBG />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D1}><Scene1 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS })} />
        <TransitionSeries.Sequence durationInFrames={D2}><Scene2 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANS })} />
        <TransitionSeries.Sequence durationInFrames={D3}><Scene3 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS })} />
        <TransitionSeries.Sequence durationInFrames={D4}><Scene4 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS })} />
        <TransitionSeries.Sequence durationInFrames={D5}><Scene5 /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
