import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

/**
 * ShadowEscapeScene — Cinematic scene + tap multiple-choice with live character control.
 *
 * 업그레이드:
 *  - 장면별 정지 위치 / 입장 시간 / 소품 스케일을 sceneConfig 로 자동 보정
 *  - PC 키보드(←/→, A/D), 모바일 화면 좌/우 버튼으로 캐릭터를 살짝 움직여 생동감 부여
 *  - 선택 시 카드가 자연스럽게 접히고(높이/투명도) 캐릭터가 소품 방향으로 퇴장
 *  - 손잡이/문 같은 핵심 소품은 더 크게, 캐릭터는 더 가깝게 정지
 */
interface Props {
  currentScene: StoryScene | null;
  gameState: 'intro' | 'exploring' | 'narrating' | 'choice' | 'result';
  onArrive: (sceneIndex: number) => void;
  sceneIndex: number;
  onChoiceSelect: (scene: StoryScene, choice: StoryChoice) => void;
  displayedText: string;
  selectedChoice: string | null;
  showParentNotes: boolean;
}

type SceneId = 'first_sound' | 'alley' | 'door' | 'reveal' | 'ending' | string;

const sceneMood: Record<
  string,
  { from: string; to: string; intensity: number; label: string; floor: string }
> = {
  first_sound: { from: '#0a0a0f', to: '#161624', intensity: 0.35, label: '01 · 첫 신호', floor: '#1a1a26' },
  alley:       { from: '#0b0d18', to: '#1a1430', intensity: 0.55, label: '02 · 갈림길', floor: '#1a142a' },
  door:        { from: '#08070c', to: '#1c0c0c', intensity: 0.85, label: '03 · 임계점', floor: '#1a0c0c' },
  reveal:      { from: '#1a1408', to: '#2a1f0a', intensity: 0.20, label: '04 · 해소', floor: '#241a0c' },
  ending:      { from: '#0a0f1a', to: '#1a2030', intensity: 0.10, label: '에필로그', floor: '#1a2030' },
};

/**
 * 장면별 캐릭터 정지 위치 / 입장 시간 / 소품 스케일.
 * stopXPct: 캐릭터가 정지할 가로 위치(%) (좌측 0, 우측 100)
 * entryMs:  입장 애니메이션 시간 (ms)
 * propScale: SceneProp 전체 스케일 (손잡이 등 핵심 소품은 더 크게)
 * exitDir: 선택 시 퇴장 방향
 */
const sceneConfig: Record<
  string,
  { stopXPct: number; entryMs: number; propScale: number; exitDir: 1 | -1; facingLeft?: boolean }
> = {
  first_sound: { stopXPct: 55, entryMs: 1500, propScale: 1.0,  exitDir: 1, facingLeft: true  }, // 그림자가 뒤에서 오므로 살짝 뒤돌아봄
  alley:       { stopXPct: 50, entryMs: 1500, propScale: 1.05, exitDir: 1 },
  door:        { stopXPct: 64, entryMs: 1700, propScale: 1.45, exitDir: 1 }, // 문 손잡이 앞까지 더 가깝게
  reveal:      { stopXPct: 40, entryMs: 1300, propScale: 1.15, exitDir: 1, facingLeft: true }, // 강아지 바라봄
  ending:      { stopXPct: 50, entryMs: 1800, propScale: 1.0,  exitDir: 1 },
};

const MANUAL_MAX = 90; // ±px 자유 이동 범위
const MANUAL_STEP = 18;

export default function ShadowEscapeScene({
  currentScene,
  gameState,
  onArrive,
  sceneIndex,
  onChoiceSelect,
  displayedText,
  selectedChoice,
  showParentNotes,
}: Props) {
  const [arrived, setArrived] = useState(false);
  const [tension, setTension] = useState(35);
  const [heart, setHeart] = useState(74);
  const [manualOffset, setManualOffset] = useState(0); // px, ±MANUAL_MAX
  const arrivedTimer = useRef<number | null>(null);
  const heldDir = useRef<0 | 1 | -1>(0);
  const heldRaf = useRef<number | null>(null);

  const mood = useMemo(() => {
    if (!currentScene) return sceneMood.first_sound;
    return sceneMood[currentScene.id] ?? sceneMood.first_sound;
  }, [currentScene]);

  const cfg = useMemo(() => {
    if (!currentScene) return sceneConfig.first_sound;
    return sceneConfig[currentScene.id] ?? sceneConfig.first_sound;
  }, [currentScene]);

  // 장면 전환 시 입장 모션 + 도착 콜백 (장면별 entryMs 적용)
  useEffect(() => {
    setArrived(false);
    setManualOffset(0);
    if (arrivedTimer.current) window.clearTimeout(arrivedTimer.current);
    arrivedTimer.current = window.setTimeout(() => {
      setArrived(true);
      if (gameState === 'exploring') onArrive(sceneIndex);
    }, cfg.entryMs);
    return () => {
      if (arrivedTimer.current) window.clearTimeout(arrivedTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, currentScene?.id]);

  useEffect(() => {
    if (gameState === 'exploring' && arrived) onArrive(sceneIndex);
  }, [gameState, arrived, sceneIndex, onArrive]);

  // 긴장도 / 심박
  useEffect(() => {
    if (gameState === 'narrating' || gameState === 'choice') {
      const base = 35 + Math.round(mood.intensity * 50);
      setTension(base);
      setHeart(72 + Math.round(mood.intensity * 50));
      const id = setInterval(() => {
        setTension((v) => Math.min(98, v + Math.random() * 1.2));
        setHeart((v) => Math.min(150, v + (Math.random() > 0.6 ? 1 : 0)));
      }, 420);
      return () => clearInterval(id);
    }
  }, [gameState, mood.intensity, sceneIndex]);

  // 키보드: ←/→, A/D 로 캐릭터 좌우 이동(도착 후, 선택 전)
  const canMove = arrived && !selectedChoice && gameState !== 'result';
  useEffect(() => {
    if (!canMove) return;
    const handleKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') {
        e.preventDefault();
        setManualOffset((v) => Math.max(-MANUAL_MAX, v - MANUAL_STEP));
      } else if (k === 'arrowright' || k === 'd') {
        e.preventDefault();
        setManualOffset((v) => Math.min(MANUAL_MAX, v + MANUAL_STEP));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canMove]);

  // 모바일 D-pad 길게 누르기 — 연속 이동
  const startHold = useCallback((dir: 1 | -1) => {
    if (!canMove) return;
    heldDir.current = dir;
    const loop = () => {
      if (!heldDir.current) return;
      setManualOffset((v) =>
        Math.max(-MANUAL_MAX, Math.min(MANUAL_MAX, v + heldDir.current * 4))
      );
      heldRaf.current = requestAnimationFrame(loop);
    };
    loop();
  }, [canMove]);
  const endHold = useCallback(() => {
    heldDir.current = 0;
    if (heldRaf.current) cancelAnimationFrame(heldRaf.current);
    heldRaf.current = null;
  }, []);
  useEffect(() => () => endHold(), [endHold]);

  if (!currentScene) {
    return <div className="w-full h-full bg-black rounded-2xl" />;
  }

  const isReveal = currentScene.id === 'reveal';
  const isEnding = currentScene.id === 'ending';

  // 캐릭터의 최종 X 위치(translate -50% 기준): `${stopXPct}% + offset`
  const characterX = arrived
    ? `calc(${cfg.stopXPct}% - 50% + ${manualOffset}px)`
    : `calc(-60vw)`;
  const exitX = `calc(${cfg.stopXPct}% - 50% + ${cfg.exitDir * 75}vw)`;
  const walking = !arrived || !!selectedChoice;

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl select-none"
      style={{ background: `linear-gradient(180deg, ${mood.from} 0%, ${mood.to} 100%)` }}
    >
      {/* === 배경: 복도 원근 라인 === */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(200,184,138,0.10) 0%, transparent 70%)',
          }}
        />
        {Array.from({ length: 6 }).map((_, i) => {
          const t = (i + 1) / 7;
          return (
            <div
              key={`pl-${i}`}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: 100 + i * 14,
                width: `${100 - t * 80}%`,
                height: 1,
                background: 'rgba(200,184,138,0.10)',
              }}
            />
          );
        })}
        {[0, 1, 2].map((i) => (
          <div
            key={`pillar-${i}`}
            className="absolute bottom-[100px]"
            style={{
              left: `${6 + i * 6}%`,
              width: 22 - i * 4,
              height: `${55 - i * 10}%`,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              borderTop: '1px solid rgba(200,184,138,0.10)',
            }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <div
            key={`pillar-r-${i}`}
            className="absolute bottom-[100px]"
            style={{
              right: `${6 + i * 6}%`,
              width: 22 - i * 4,
              height: `${55 - i * 10}%`,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              borderTop: '1px solid rgba(200,184,138,0.10)',
            }}
          />
        ))}
      </div>

      {/* === 바닥 === */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: 100,
          background: `linear-gradient(180deg, ${mood.floor} 0%, #000 100%)`,
          borderTop: '1px solid rgba(200,184,138,0.12)',
        }}
      />

      {/* 캐릭터 발 밑 스포트라이트 — 캐릭터를 따라감 */}
      <motion.div
        className="absolute"
        animate={{ left: characterX }}
        transition={{ duration: 0.25, ease: 'linear' }}
        style={{
          bottom: 78,
          width: 360,
          height: 60,
          marginLeft: -180,
          background:
            'radial-gradient(ellipse 50% 50% at 50% 100%, rgba(200,184,138,0.30) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />

      {/* === 장면 소품 === */}
      <SceneProp sceneId={currentScene.id} intensity={mood.intensity} scale={cfg.propScale} />

      {/* === 캐릭터 (대형) — 입장/퇴장/수동 이동 통합 === */}
      <motion.div
        key={`char-${sceneIndex}`}
        initial={{ left: 'calc(-60vw)' }}
        animate={{
          left: selectedChoice ? exitX : characterX,
        }}
        transition={{
          duration: selectedChoice ? 0.75 : arrived ? 0.28 : cfg.entryMs / 1000,
          ease: selectedChoice ? 'easeIn' : arrived ? 'easeOut' : [0.4, 0, 0.2, 1],
        }}
        className="absolute z-10"
        style={{ bottom: 88 }}
      >
        <BigCharacter walking={walking} facingLeft={!!cfg.facingLeft && !selectedChoice} />
      </motion.div>

      {/* === Vignette === */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.78) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* === HUD === */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between text-[10px] font-mono tracking-widest text-[#C8B88A]/85 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/45 backdrop-blur border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8B88A] animate-pulse" />
          {mood.label}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/45 backdrop-blur border border-white/5">
            <Activity className="w-3 h-3" />
            <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  background:
                    tension > 75
                      ? 'linear-gradient(90deg,#C8B88A,#ef4444)'
                      : 'linear-gradient(90deg,#C8B88A,#f59e0b)',
                }}
                animate={{ width: `${tension}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="tabular-nums">{Math.round(tension)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/45 backdrop-blur border border-white/5">
            <motion.span
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: Math.max(0.4, 60 / heart), repeat: Infinity }}
              className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400"
            />
            <span className="tabular-nums">{heart} bpm</span>
          </div>
        </div>
      </div>

      {/* === Narration === */}
      {(gameState === 'narrating' || gameState === 'choice') && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-20 pointer-events-none">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-black/55 backdrop-blur-md border border-white/10 px-4 py-3"
          >
            <div className="text-[10px] font-semibold tracking-[0.2em] text-[#C8B88A]/80 uppercase mb-1">
              {currentScene.title}
            </div>
            <p className="text-white/95 text-[13px] md:text-[14px] leading-relaxed whitespace-pre-line break-keep min-h-[2.6em]">
              {displayedText || currentScene.description}
              {gameState === 'narrating' && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-[#C8B88A] ml-1 align-middle"
                />
              )}
            </p>
          </motion.div>
        </div>
      )}

      {/* === 화면 내 좌/우 이동 버튼 (모바일·PC 공용) === */}
      {canMove && (
        <div className="absolute bottom-[170px] left-3 right-3 flex justify-between pointer-events-none z-20">
          <button
            onPointerDown={(e) => { e.preventDefault(); startHold(-1); }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            aria-label="왼쪽으로 이동"
            className="pointer-events-auto w-12 h-12 rounded-full bg-black/55 backdrop-blur border border-white/15 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); startHold(1); }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            aria-label="오른쪽으로 이동"
            className="pointer-events-auto w-12 h-12 rounded-full bg-black/55 backdrop-blur border border-white/15 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* === Choice cards (bottom — tap based, 접기 애니메이션) === */}
      <AnimatePresence mode="wait">
        {gameState === 'choice' && !isEnding && !selectedChoice && (
          <motion.div
            key={`choices-${currentScene.id}`}
            initial={{ y: 40, opacity: 0, height: 'auto' }}
            animate={{ y: 0, opacity: 1, height: 'auto' }}
            exit={{ y: 16, opacity: 0, scaleY: 0.6, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'bottom center', overflow: 'hidden' }}
            className="absolute bottom-4 left-3 right-3 z-30"
          >
            <div className="mb-2 text-center text-[10px] font-mono tracking-[0.2em] text-[#C8B88A]/80 uppercase flex items-center justify-center gap-1.5">
              <Eye className="w-3 h-3" /> 당신의 선택
            </div>
            <div className="flex flex-col gap-2">
              {currentScene.choices.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  onClick={() => onChoiceSelect(currentScene, c)}
                  className="w-full text-left rounded-xl px-4 py-3 backdrop-blur-md border transition-colors bg-black/55 border-white/10 hover:bg-black/70 hover:border-[#C8B88A]/40 text-white/95"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-lg">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono tracking-widest text-[#C8B88A]/80">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[14px] leading-snug break-keep">{c.text}</div>
                      {showParentNotes && c.parentNote && (
                        <div className="mt-1 text-[11px] text-amber-200/70 italic break-keep">
                          → {c.parentNote}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 선택 시 화면 플래시 */}
      <AnimatePresence>
        {selectedChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#C8B88A]/10 pointer-events-none z-30"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
 * 대형 캐릭터 — 면적이 큰 실루엣
 * ============================================================ */
function BigCharacter({ walking, facingLeft }: { walking: boolean; facingLeft: boolean }) {
  return (
    <motion.div
      animate={walking ? { y: [0, -3, 0] } : { y: 0 }}
      transition={{ duration: 0.36, repeat: walking ? Infinity : 0 }}
      style={{
        width: 110,
        height: 200,
        transform: `translateX(-50%) scaleX(${facingLeft ? -1 : 1})`,
        filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.55))',
      }}
      className="relative"
    >
      <div className="absolute left-1/2 -translate-x-1/2 top-0 rounded-full" style={{ width: 42, height: 42, background: '#f6c08a' }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-t-full" style={{ top: -4, width: 46, height: 24, background: '#1a1a1a' }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 40, width: 14, height: 8, background: '#e0a878' }} />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-md"
        style={{
          top: 46, width: 70, height: 78,
          background: 'linear-gradient(180deg,#ef4444 0%,#b91c1c 100%)',
          boxShadow: 'inset 0 -10px 14px rgba(0,0,0,0.25)',
        }}
      />
      <motion.div
        animate={walking ? { rotate: [20, -25, 20] } : { rotate: -8 }}
        transition={{ duration: 0.36, repeat: walking ? Infinity : 0 }}
        className="absolute rounded-md"
        style={{ top: 50, left: 8, width: 14, height: 60, background: '#b91c1c', transformOrigin: 'top center' }}
      />
      <motion.div
        animate={walking ? { rotate: [-20, 25, -20] } : { rotate: 8 }}
        transition={{ duration: 0.36, repeat: walking ? Infinity : 0 }}
        className="absolute rounded-md"
        style={{ top: 50, right: 8, width: 14, height: 60, background: '#b91c1c', transformOrigin: 'top center' }}
      />
      <motion.div
        animate={walking ? { rotate: [-22, 22, -22] } : { rotate: 0 }}
        transition={{ duration: 0.36, repeat: walking ? Infinity : 0 }}
        className="absolute rounded-md"
        style={{ top: 124, left: '50%', marginLeft: -16, width: 14, height: 64, background: '#1f2937', transformOrigin: 'top center' }}
      />
      <motion.div
        animate={walking ? { rotate: [22, -22, 22] } : { rotate: 0 }}
        transition={{ duration: 0.36, repeat: walking ? Infinity : 0 }}
        className="absolute rounded-md"
        style={{ top: 124, left: '50%', marginLeft: 2, width: 14, height: 64, background: '#1f2937', transformOrigin: 'top center' }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -10, width: 90, height: 14,
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.65) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
    </motion.div>
  );
}

/* ============================================================
 * 장면별 시각 소품 — 질문 내용을 화면으로 보여준다 (scale 지원)
 * ============================================================ */
function SceneProp({ sceneId, intensity, scale = 1 }: { sceneId: string; intensity: number; scale?: number }) {
  const wrap = (children: React.ReactNode) => (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ transform: `scale(${scale})`, transformOrigin: 'center bottom' }}
    >
      {children}
    </div>
  );

  if (sceneId === 'first_sound') {
    return wrap(
      <>
        <motion.div
          initial={{ x: -200, opacity: 0.4 }}
          animate={{ x: -60, opacity: 0.85 }}
          transition={{ duration: 3.5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute"
          style={{ left: '15%', bottom: 90, width: 180, height: 240 }}
        >
          <div
            style={{
              width: '100%', height: '100%',
              background: 'radial-gradient(ellipse 55% 70% at 50% 55%, #000 0%, rgba(0,0,0,0.8) 55%, transparent 80%)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={`fp-${i}`}
            className="absolute"
            style={{ left: `${15 + i * 6}%`, bottom: 88, width: 18, height: 8 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(200,184,138,0.35)', filter: 'blur(2px)' }} />
          </motion.div>
        ))}
      </>
    );
  }

  if (sceneId === 'alley') {
    return wrap(
      <>
        <div
          className="absolute"
          style={{
            left: '8%', bottom: 100, width: 120, height: 220,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(20,20,40,0.4) 100%)',
            clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)',
            borderTop: '2px solid rgba(200,184,138,0.15)',
          }}
        />
        <div
          className="absolute"
          style={{
            right: '8%', bottom: 100, width: 120, height: 220,
            background: 'linear-gradient(180deg, rgba(255,224,150,0.35) 0%, rgba(255,224,150,0.05) 100%)',
            clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)',
            borderTop: '2px solid rgba(255,224,150,0.45)',
            boxShadow: '0 -20px 60px rgba(255,224,150,0.25)',
          }}
        />
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="absolute"
          style={{
            right: '13%', bottom: 220, width: 80, height: 80,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,224,150,0.55) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 30, background: 'rgba(72,187,120,0.85)', color: '#fff',
            fontSize: 10, letterSpacing: 4, padding: '6px 14px', borderRadius: 6,
            boxShadow: '0 0 30px rgba(72,187,120,0.55)', fontWeight: 700,
          }}
        >
          24H STORE
        </div>
      </>
    );
  }

  if (sceneId === 'door') {
    // 손잡이 강조: 문 크기/손잡이 크기 자체를 더 키움
    return wrap(
      <>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute"
          style={{
            right: '14%', bottom: 100, width: 160, height: 270,
            background: 'linear-gradient(180deg, #3a2418 0%, #2a1810 60%, #1a0f08 100%)',
            border: '3px solid rgba(200,184,138,0.30)',
            borderBottom: 'none',
            borderTopLeftRadius: 10, borderTopRightRadius: 10,
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6), 0 0 50px rgba(0,0,0,0.6)',
          }}
        >
          <div className="absolute inset-3 rounded-sm" style={{ border: '1.5px solid rgba(200,184,138,0.22)' }} />
          <div className="absolute inset-x-3" style={{ top: '45%', height: 1, background: 'rgba(200,184,138,0.22)' }} />
          {/* 손잡이 — 더 크고 강한 펄스 */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(200,184,138,0.75)',
                '0 0 0 22px rgba(200,184,138,0)',
              ],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute"
            style={{
              right: 16, top: '52%',
              width: 26, height: 26, borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #f4ecd1 0%, #b8a878 55%, #4a4438 100%)',
              border: '1.5px solid rgba(255,255,255,0.5)',
            }}
          />
          <div
            className="absolute"
            style={{
              right: -12, top: '52%',
              transform: 'translateY(-50%) translateX(100%)',
              color: 'rgba(200,184,138,0.9)', fontSize: 10, letterSpacing: 3,
              fontFamily: 'monospace', whiteSpace: 'nowrap',
            }}
          >
            ← 차가운 손잡이
          </div>
        </motion.div>
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute"
          style={{
            left: '8%', bottom: 90, width: 220, height: 260,
            background: 'radial-gradient(ellipse 55% 70% at 50% 55%, #000 0%, rgba(0,0,0,0.85) 55%, transparent 80%)',
            filter: `blur(${6 + intensity * 4}px)`,
          }}
        />
      </>
    );
  }

  if (sceneId === 'reveal') {
    return wrap(
      <>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
          className="absolute"
          style={{ left: '52%', bottom: 92, fontSize: 110, filter: 'drop-shadow(0 8px 24px rgba(200,184,138,0.35))' }}
        >
          🐕
        </motion.div>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`heart-${i}`}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -60, opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7 }}
            className="absolute"
            style={{ left: `${54 + i * 4}%`, bottom: 200, fontSize: 18 }}
          >
            🫶
          </motion.div>
        ))}
      </>
    );
  }

  if (sceneId === 'ending') {
    return wrap(
      <>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 60, width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #fef3c7 0%, #d4a84c 60%, #8a6a28 100%)',
            boxShadow: '0 0 60px rgba(254,243,199,0.45)',
          }}
        />
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
            className="absolute rounded-full"
            style={{
              left: `${(i * 53) % 100}%`, top: `${(i * 31) % 50}%`,
              width: 2, height: 2, background: '#fff',
            }}
          />
        ))}
      </>
    );
  }

  return null;
}
