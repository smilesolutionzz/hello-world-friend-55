import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

/**
 * ShadowEscapeScene — Cinematic scene + tap multiple-choice with manual walking.
 *
 *  - 자동 입장 제거: 사용자가 키보드(←/→·A/D) 또는 화면 좌·우 버튼으로 직접 캐릭터를 옮긴다.
 *  - 금색 빛기둥(target pillar)과 화살표가 다음 정지 지점을 안내한다.
 *  - 캐릭터가 빛기둥 근처에 도착하면 자동으로 도착 처리(onArrive) → 내레이션·선택지 진행
 *  - 내레이션 카드는 슬림하게(캐릭터를 가리지 않음).
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
 * 장면별 정지 위치 / 소품 스케일.
 *  stopXPct: 캐릭터가 정지할 가로 위치(%, 좌0 ~ 우100)
 *  startXPct: 캐릭터가 새 장면에서 시작하는 위치(%) — 진행 방향
 *  propScale: SceneProp 전체 스케일
 *  facingLeft: 캐릭터가 왼쪽을 바라봄
 */
const sceneConfig: Record<
  string,
  { stopXPct: number; startXPct: number; propScale: number; facingLeft?: boolean }
> = {
  first_sound: { stopXPct: 55, startXPct: 8,  propScale: 1.0,  facingLeft: true },
  alley:       { stopXPct: 50, startXPct: 6,  propScale: 1.05 },
  door:        { stopXPct: 64, startXPct: 6,  propScale: 1.45 },
  reveal:      { stopXPct: 40, startXPct: 6,  propScale: 1.15, facingLeft: true },
  ending:      { stopXPct: 50, startXPct: 6,  propScale: 1.0 },
};

const ARRIVE_THRESHOLD = 38; // px
const STEP_PX = 22;          // 키 1회 이동
const HOLD_SPEED = 5;        // 길게 누를 때 px/frame

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [posPx, setPosPx] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [tension, setTension] = useState(35);
  const [heart, setHeart] = useState(74);
  const heldDir = useRef<0 | 1 | -1>(0);
  const heldRaf = useRef<number | null>(null);
  const arrivedFiredRef = useRef(false);

  const mood = useMemo(() => {
    if (!currentScene) return sceneMood.first_sound;
    return sceneMood[currentScene.id] ?? sceneMood.first_sound;
  }, [currentScene]);

  const cfg = useMemo(() => {
    if (!currentScene) return sceneConfig.first_sound;
    return sceneConfig[currentScene.id] ?? sceneConfig.first_sound;
  }, [currentScene]);

  // 컨테이너 크기 측정
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setContainerW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const targetPx = useMemo(() => (containerW * cfg.stopXPct) / 100, [containerW, cfg.stopXPct]);

  // 장면 전환: 시작 위치로 캐릭터를 옮기고 도착 플래그 리셋
  useEffect(() => {
    arrivedFiredRef.current = false;
    setArrived(false);
    if (containerW > 0) {
      setPosPx((containerW * cfg.startXPct) / 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, currentScene?.id, containerW]);

  // 도착 판정
  useEffect(() => {
    if (selectedChoice) return;
    if (containerW === 0) return;
    if (Math.abs(posPx - targetPx) <= ARRIVE_THRESHOLD) {
      if (!arrived) setArrived(true);
      if (gameState === 'exploring' && !arrivedFiredRef.current) {
        arrivedFiredRef.current = true;
        onArrive(sceneIndex);
      }
    } else if (arrived) {
      setArrived(false);
    }
  }, [posPx, targetPx, containerW, gameState, sceneIndex, onArrive, selectedChoice, arrived]);

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

  // 조작 가능 조건: 선택 직후·결과화면 외 항상 가능 (도착 전후 모두)
  const canMove = !selectedChoice && gameState !== 'result' && containerW > 0;

  const clampPos = useCallback(
    (n: number) => Math.max(40, Math.min(containerW - 40, n)),
    [containerW]
  );

  // 키보드: ←/→, A/D
  useEffect(() => {
    if (!canMove) return;
    const handleKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') {
        e.preventDefault();
        setPosPx((v) => clampPos(v - STEP_PX));
      } else if (k === 'arrowright' || k === 'd') {
        e.preventDefault();
        setPosPx((v) => clampPos(v + STEP_PX));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canMove, clampPos]);

  // D-pad 길게 누르기
  const startHold = useCallback((dir: 1 | -1) => {
    if (!canMove) return;
    heldDir.current = dir;
    const loop = () => {
      if (!heldDir.current) return;
      setPosPx((v) => clampPos(v + heldDir.current * HOLD_SPEED));
      heldRaf.current = requestAnimationFrame(loop);
    };
    loop();
  }, [canMove, clampPos]);
  const endHold = useCallback(() => {
    heldDir.current = 0;
    if (heldRaf.current) cancelAnimationFrame(heldRaf.current);
    heldRaf.current = null;
  }, []);
  useEffect(() => () => endHold(), [endHold]);

  if (!currentScene) {
    return <div ref={containerRef} className="w-full h-full bg-black rounded-2xl" />;
  }

  const isEnding = currentScene.id === 'ending';

  // 선택 후 퇴장: 오른쪽 바깥으로
  const exitPx = containerW + 200;
  const displayX = selectedChoice ? exitPx : posPx;
  const walking = heldDir.current !== 0 || !!selectedChoice;
  // 캐릭터가 진행해야 할 방향(가이드 화살표/캐릭터 facing 보조)
  const goingRight = targetPx >= posPx;

  return (
    <div
      ref={containerRef}
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

      {/* === 금색 빛기둥 (도착 안내) — 도착 전·선택 전에만 === */}
      {!arrived && !selectedChoice && containerW > 0 && (
        <GoldenPillar leftPx={targetPx} />
      )}

      {/* === 캐릭터 발 밑 스포트라이트 === */}
      <motion.div
        className="absolute"
        animate={{ left: displayX }}
        transition={{ duration: 0.18, ease: 'linear' }}
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

      {/* === 캐릭터 === */}
      <motion.div
        className="absolute z-10"
        animate={{ left: displayX }}
        transition={{
          duration: selectedChoice ? 0.75 : 0.22,
          ease: selectedChoice ? 'easeIn' : 'linear',
        }}
        style={{ bottom: 88 }}
      >
        <BigCharacter
          walking={walking}
          facingLeft={!!cfg.facingLeft && !selectedChoice ? true : !goingRight && walking}
        />
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
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between text-[10px] font-mono tracking-widest text-[#C8B88A]/85 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/45 backdrop-blur border border-white/5">
          <span className="w-1 h-1 rounded-full bg-[#C8B88A] animate-pulse" />
          {mood.label}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/45 backdrop-blur border border-white/5">
            <Activity className="w-2.5 h-2.5" />
            <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
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
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/45 backdrop-blur border border-white/5">
            <motion.span
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: Math.max(0.4, 60 / heart), repeat: Infinity }}
              className="inline-block w-1 h-1 rounded-full bg-rose-400"
            />
            <span className="tabular-nums">{heart}</span>
          </div>
        </div>
      </div>

      {/* === 가이드 토스트 (도착 전) === */}
      {!arrived && !selectedChoice && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="px-2.5 py-1 rounded-full bg-black/55 backdrop-blur border border-[#C8B88A]/30 text-[10px] text-[#C8B88A] tracking-wider flex items-center gap-1.5">
            <span className="animate-pulse">●</span>
            금색 빛기둥까지 이동하세요
            {goingRight ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </div>
        </motion.div>
      )}

      {/* === Narration (슬림) — 도착 후에만 노출 === */}
      {arrived && (gameState === 'narrating' || gameState === 'choice') && (
        <div className="absolute top-9 left-2 right-2 z-20 pointer-events-none">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-[440px] rounded-lg bg-black/55 backdrop-blur-md border border-white/10 px-3 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-[#C8B88A]/80 uppercase shrink-0">
                {currentScene.title}
              </span>
              <span className="text-white/15">·</span>
              <p className="text-white/95 text-[12px] leading-snug break-keep flex-1 line-clamp-2">
                {displayedText || currentScene.description}
                {gameState === 'narrating' && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="inline-block w-0.5 h-3 bg-[#C8B88A] ml-1 align-middle"
                  />
                )}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* === 화면 내 좌/우 이동 버튼 (PC·모바일 공용) === */}
      {canMove && (
        <div className="absolute bottom-[170px] left-2 right-2 flex justify-between pointer-events-none z-20">
          <button
            onPointerDown={(e) => { e.preventDefault(); startHold(-1); }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            aria-label="왼쪽으로 이동"
            className="pointer-events-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); startHold(1); }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            aria-label="오른쪽으로 이동"
            className="pointer-events-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* === Choice cards === */}
      <AnimatePresence mode="wait">
        {arrived && gameState === 'choice' && !isEnding && !selectedChoice && (
          <motion.div
            key={`choices-${currentScene.id}`}
            initial={{ y: 40, opacity: 0, height: 'auto' }}
            animate={{ y: 0, opacity: 1, height: 'auto' }}
            exit={{ y: 16, opacity: 0, scaleY: 0.6, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'bottom center', overflow: 'hidden' }}
            className="absolute bottom-3 left-2 right-2 z-30"
          >
            <div className="mb-1.5 text-center text-[10px] font-mono tracking-[0.2em] text-[#C8B88A]/80 uppercase flex items-center justify-center gap-1.5">
              <Eye className="w-3 h-3" /> 당신의 선택
            </div>
            <div className="flex flex-col gap-1.5">
              {currentScene.choices.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  onClick={() => onChoiceSelect(currentScene, c)}
                  className="w-full text-left rounded-xl px-3 py-2.5 backdrop-blur-md border transition-colors bg-black/60 border-white/10 hover:bg-black/75 hover:border-[#C8B88A]/40 text-white/95"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-base">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono tracking-widest text-[#C8B88A]/80">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[13px] leading-snug break-keep">{c.text}</div>
                      {showParentNotes && c.parentNote && (
                        <div className="mt-0.5 text-[10px] text-amber-200/70 italic break-keep">
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
 * 금색 빛기둥 + 화살표 가이드
 * ============================================================ */
function GoldenPillar({ leftPx }: { leftPx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="absolute z-[5] pointer-events-none"
      style={{ left: leftPx, bottom: 90, transform: 'translateX(-50%)' }}
    >
      {/* 빛 기둥 */}
      <motion.div
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          width: 70,
          height: 280,
          background:
            'linear-gradient(180deg, rgba(200,184,138,0) 0%, rgba(200,184,138,0.55) 60%, rgba(200,184,138,0.85) 100%)',
          filter: 'blur(6px)',
          borderRadius: 999,
        }}
      />
      {/* 중심 코어 */}
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="absolute left-1/2 -translate-x-1/2 bottom-0"
        style={{
          width: 6,
          height: 280,
          background: 'linear-gradient(180deg, transparent 0%, #f4e3a8 60%, #fff5d1 100%)',
          boxShadow: '0 0 20px rgba(244,227,168,0.8)',
          borderRadius: 999,
        }}
      />
      {/* 바닥 글로우 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -8,
          width: 120,
          height: 30,
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(244,227,168,0.7) 0%, transparent 70%)',
          filter: 'blur(4px)',
        }}
      />
      {/* 떠다니는 화살표 */}
      <motion.div
        animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: -22, color: '#f4e3a8', fontSize: 22, lineHeight: 1 }}
      >
        ▼
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
 * 대형 캐릭터
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
 * 장면별 시각 소품
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
