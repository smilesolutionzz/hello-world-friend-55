import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Activity, Eye, ChevronLeft, ChevronRight, Battery } from 'lucide-react';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

/** 선택 시 카드 접힘 ↔ 캐릭터 퇴장 ↔ 다음 장면 입장이 모두 동일한 프레임 윈도우 위에서 동기화되도록
 *  사용하는 단일 타임라인 상수. GameCounseling3DMode 의 1100ms 와 정확히 맞물린다. */
const EXIT_MS = 850;            // 캐릭터 퇴장 + 카드 접힘 길이
const SCENE_HANDOFF_MS = 1100;  // 부모(GameCounseling3DMode)의 setTimeout 과 일치

/**
 * MidnightOfficeScene — 성인용 시네마틱 게임 검사 (자정의 회의실)
 *
 *  • 와이드 월드 (가상 가로폭 = 컨테이너의 2.4배)에서 캐릭터가 자유 이동
 *  • 카메라가 캐릭터를 따라가고 배경/소품/조명이 다층 패럴랙스로 흐른다
 *  • 4D 효과: 형광등 깜빡임 · 빗줄기 · 번개 플래시 · 먼지 입자 · 스캔라인 · 카메라 셰이크
 *  • 장면별 소품(모니터·전화·머신·창·슬라이드·거울·엘리베이터·문)이 정지 지점에 등장
 *  • PC 키보드(←/→·A/D) + 모바일 좌·우 버튼(길게 누르면 가속)
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

type PropKind =
  | 'monitor' | 'phone' | 'coffee' | 'window'
  | 'slide' | 'mirror' | 'elevator' | 'door' | 'sunrise';

interface SceneCfg {
  stopPct: number;       // 정지 지점 (월드 기준 %)
  startPct: number;      // 시작 지점 (월드 기준 %)
  prop: PropKind;
  propScale: number;
  bgA: string;
  bgB: string;
  haze: string;          // 안개/광원 색
  intensity: number;     // 0~1 긴장도
  label: string;
  facingLeft?: boolean;
  rain?: boolean;
  lightning?: boolean;
  flicker?: boolean;
}

const SCENES: Record<string, SceneCfg> = {
  mo_start:   { stopPct: 18, startPct: 5,  prop: 'monitor',  propScale: 1.25, bgA: '#0b1020', bgB: '#1b2240', haze: 'rgba(120,180,255,0.18)', intensity: 0.55, label: '01 · 빈 사무실',         flicker: true },
  mo_call:    { stopPct: 32, startPct: 12, prop: 'phone',    propScale: 1.30, bgA: '#10112a', bgB: '#241848', haze: 'rgba(180,140,255,0.18)', intensity: 0.45, label: '02 · 집에서 온 전화' },
  mo_coffee:  { stopPct: 48, startPct: 26, prop: 'coffee',   propScale: 1.20, bgA: '#1a1812', bgB: '#2a241a', haze: 'rgba(255,200,140,0.18)', intensity: 0.40, label: '03 · 탕비실',             flicker: true },
  mo_window:  { stopPct: 62, startPct: 42, prop: 'window',   propScale: 1.45, bgA: '#0c1426', bgB: '#1a2440', haze: 'rgba(120,160,220,0.22)', intensity: 0.50, label: '04 · 19층 창가',         rain: true, lightning: true },
  mo_block:   { stopPct: 50, startPct: 58, prop: 'slide',    propScale: 1.35, bgA: '#0a1828', bgB: '#143048', haze: 'rgba(120,220,255,0.18)', intensity: 0.75, label: '05 · 화이트아웃', facingLeft: true },
  mo_mirror:  { stopPct: 70, startPct: 48, prop: 'mirror',   propScale: 1.30, bgA: '#161620', bgB: '#26262e', haze: 'rgba(255,255,255,0.10)', intensity: 0.70, label: '06 · 거울 앞' },
  mo_morning: { stopPct: 80, startPct: 66, prop: 'elevator', propScale: 1.25, bgA: '#1f1a14', bgB: '#3a2a18', haze: 'rgba(255,200,140,0.20)', intensity: 0.55, label: '07 · 엘리베이터' },
  mo_door:    { stopPct: 92, startPct: 78, prop: 'door',     propScale: 1.40, bgA: '#231a18', bgB: '#3a221e', haze: 'rgba(255,180,160,0.22)', intensity: 0.85, label: '08 · 회의실 문' },
  mo_end:     { stopPct: 50, startPct: 30, prop: 'sunrise',  propScale: 1.20, bgA: '#1a2a2a', bgB: '#2e4a44', haze: 'rgba(255,220,180,0.25)', intensity: 0.15, label: '에필로그' },
};

const WORLD_FACTOR = 2.4;       // 가상 월드 = 컨테이너 * 2.4
const ARRIVE_THRESHOLD = 48;
const STEP_PX = 28;
const HOLD_SPEED = 7;

export default function MidnightOfficeScene({
  currentScene, gameState, onArrive, sceneIndex,
  onChoiceSelect, displayedText, selectedChoice, showParentNotes,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [viewW, setViewW] = useState(0);
  const [posPx, setPosPx] = useState(0);          // 월드 좌표
  const [arrived, setArrived] = useState(false);
  const [tension, setTension] = useState(35);
  const [heart, setHeart] = useState(74);
  const [shake, setShake] = useState(0);
  const heldDir = useRef<0 | 1 | -1>(0);
  const heldRaf = useRef<number | null>(null);
  const arrivedFired = useRef(false);

  const cfg = useMemo<SceneCfg>(
    () => (currentScene ? SCENES[currentScene.id] ?? SCENES.mo_start : SCENES.mo_start),
    [currentScene]
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setViewW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const worldW = viewW * WORLD_FACTOR;
  const targetPx = useMemo(() => (worldW * cfg.stopPct) / 100, [worldW, cfg.stopPct]);

  // 장면 전환
  useEffect(() => {
    arrivedFired.current = false;
    setArrived(false);
    if (worldW > 0) setPosPx((worldW * cfg.startPct) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, currentScene?.id, worldW]);

  // 도착 판정
  useEffect(() => {
    if (selectedChoice || worldW === 0) return;
    if (Math.abs(posPx - targetPx) <= ARRIVE_THRESHOLD) {
      if (!arrived) setArrived(true);
      if (gameState === 'exploring' && !arrivedFired.current) {
        arrivedFired.current = true;
        onArrive(sceneIndex);
      }
    } else if (arrived) setArrived(false);
  }, [posPx, targetPx, worldW, gameState, sceneIndex, onArrive, selectedChoice, arrived]);

  // 긴장 / 심박 / 셰이크 — 강도 단계화 + 모션 감소 옵션 존중
  useEffect(() => {
    if (gameState === 'narrating' || gameState === 'choice') {
      const base = 35 + Math.round(cfg.intensity * 55);
      setTension(base);
      setHeart(72 + Math.round(cfg.intensity * 55));
      const id = setInterval(() => {
        setTension((v) => Math.min(99, v + Math.random() * 1.3));
        setHeart((v) => Math.min(155, v + (Math.random() > 0.55 ? 1 : 0)));
        // 강도가 0.55 이상이고 모션 감소가 꺼져 있을 때만 셰이크. 강도가 높을수록 더 자주.
        if (!prefersReducedMotion && cfg.intensity > 0.55) {
          const trigger = 0.95 - cfg.intensity * 0.35; // intensity 0.6→0.74, 1.0→0.6
          if (Math.random() > trigger) {
            setShake(1);
            setTimeout(() => setShake(0), 160);
          }
        }
      }, 380);
      return () => clearInterval(id);
    }
  }, [gameState, cfg.intensity, sceneIndex, prefersReducedMotion]);

  const canMove = !selectedChoice && gameState !== 'result' && worldW > 0;

  const clampPos = useCallback(
    (n: number) => Math.max(50, Math.min(worldW - 50, n)),
    [worldW]
  );

  // 키보드
  useEffect(() => {
    if (!canMove) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { e.preventDefault(); setPosPx((v) => clampPos(v - STEP_PX)); }
      else if (k === 'arrowright' || k === 'd') { e.preventDefault(); setPosPx((v) => clampPos(v + STEP_PX)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canMove, clampPos]);

  // 길게 누르기
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

  const isEnding = currentScene.id === 'mo_end';

  // 카메라: 캐릭터를 화면 중앙으로 유지 (clamp)
  const camX = Math.max(0, Math.min(worldW - viewW, posPx - viewW / 2));
  const charScreenX = posPx - camX;       // 화면상 캐릭터 위치
  const propWorldX  = targetPx;           // 소품 월드 좌표
  const propScreenX = propWorldX - camX;  // 화면상 소품 위치
  const goingRight = targetPx >= posPx;
  const exiting = !!selectedChoice;
  const walking = heldDir.current !== 0 || exiting;

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl select-none"
      style={{ background: `linear-gradient(180deg, ${cfg.bgA} 0%, ${cfg.bgB} 100%)` }}
      animate={shake ? { x: [0, -3, 3, -2, 0] } : { x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* === Parallax sky / 도시 실루엣 === */}
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{
          width: worldW || '100%',
          transform: `translateX(${-camX * 0.25}px)`,
        }}
      >
        <CitySkyline color={cfg.haze} />
      </div>

      {/* === 중간 배경: 형광등 천장 + 광원 === */}
      <div
        className="absolute top-0 left-0 right-0 h-[55%] pointer-events-none"
        style={{
          width: worldW || '100%',
          transform: `translateX(${-camX * 0.55}px)`,
          background: `radial-gradient(ellipse 28% 60% at ${cfg.stopPct}% 30%, ${cfg.haze} 0%, transparent 70%)`,
        }}
      />

      {/* === 비 (window 장면) === */}
      {cfg.rain && <RainLayer width={viewW} />}

      {/* === 먼지 입자 === */}
      <DustParticles seed={currentScene.id} />

      {/* === 형광등 깜빡임 === */}
      {cfg.flicker && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.05, 0, 0.02, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.87, 0.89, 0.91, 1] }}
        />
      )}

      {/* === 번개 플래시 === */}
      {cfg.lightning && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(220,235,255,0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.8, 0, 0.4, 0] }}
          transition={{ duration: 9, repeat: Infinity, times: [0, 0.7, 0.71, 0.73, 0.74, 1] }}
        />
      )}

      {/* === 바닥 (월드 폭만큼) === */}
      <div
        className="absolute left-0 bottom-0"
        style={{
          width: worldW || '100%',
          height: 110,
          transform: `translateX(${-camX}px)`,
          background: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, #000 100%)`,
          borderTop: '1px solid rgba(200,184,138,0.15)',
        }}
      >
        {/* 바닥 격자 */}
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0"
            style={{ left: `${(i / 14) * 100}%`, width: 1, background: 'rgba(200,184,138,0.08)' }} />
        ))}
      </div>

      {/* === 가이드 빛기둥 (도착 전) === */}
      {!arrived && !selectedChoice && viewW > 0 && (
        <GoldenPillar leftPx={propScreenX} />
      )}

      {/* === 장면 소품 (스크린 좌표) === */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: propScreenX,
          bottom: 100,
          transform: `translateX(-50%) scale(${cfg.propScale * (arrived ? 1.08 : 1)})`,
          transformOrigin: 'bottom center',
          transition: 'transform 600ms cubic-bezier(0.2,0.7,0.2,1)',
        }}
      >
        <SceneProp kind={cfg.prop} intensity={cfg.intensity} />
      </div>

      {/* === 캐릭터 발 밑 스포트라이트 === */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{ left: exiting ? viewW + 220 : charScreenX }}
        transition={{ duration: exiting ? 0.85 : 0.18, ease: exiting ? 'easeIn' : 'linear' }}
        style={{
          bottom: 84, width: 380, height: 70, marginLeft: -190,
          background: 'radial-gradient(ellipse 50% 50% at 50% 100%, rgba(200,184,138,0.32) 0%, transparent 70%)',
          filter: 'blur(3px)',
        }}
      />

      {/* === 캐릭터 (크게) === */}
      <motion.div
        className="absolute z-10"
        animate={{ left: exiting ? viewW + 220 : charScreenX }}
        transition={{ duration: exiting ? 0.85 : 0.22, ease: exiting ? 'easeIn' : 'linear' }}
        style={{ bottom: 96 }}
      >
        <AdultCharacter
          walking={walking}
          facingLeft={!!cfg.facingLeft && !exiting ? true : !goingRight && walking}
        />
      </motion.div>

      {/* === Vignette + 스캔라인 === */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.82) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
        }} />

      {/* === HUD === */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between text-[10px] font-mono tracking-widest text-[#C8B88A]/90 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/10">
          <span className="w-1 h-1 rounded-full bg-[#C8B88A] animate-pulse" />
          {cfg.label}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/10">
            <Activity className="w-2.5 h-2.5" />
            <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full"
                style={{ background: tension > 80 ? 'linear-gradient(90deg,#C8B88A,#ef4444)' : 'linear-gradient(90deg,#C8B88A,#f59e0b)' }}
                animate={{ width: `${tension}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span className="tabular-nums">{Math.round(tension)}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/10">
            <motion.span animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: Math.max(0.38, 60 / heart), repeat: Infinity }}
              className="inline-block w-1 h-1 rounded-full bg-rose-400" />
            <span className="tabular-nums">{heart}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/10">
            <Battery className="w-2.5 h-2.5" />
            <span className="tabular-nums">{Math.max(5, 100 - sceneIndex * 11)}%</span>
          </div>
        </div>
      </div>

      {/* === 미니맵 (월드 진행) === */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-2 py-1 rounded-full bg-black/55 backdrop-blur border border-white/10 flex items-center gap-1.5">
          <div className="relative w-32 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="absolute top-0 bottom-0 bg-[#C8B88A]/80"
              style={{ left: 0, width: `${(posPx / Math.max(1, worldW)) * 100}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C8B88A] ring-1 ring-black/40"
              style={{ left: `calc(${cfg.stopPct}% - 3px)` }} />
          </div>
          <span className="text-[9px] font-mono text-[#C8B88A]/80 tabular-nums">
            {String(sceneIndex + 1).padStart(2, '0')}/09
          </span>
        </div>
      </div>

      {/* === 가이드 토스트 === */}
      {!arrived && !selectedChoice && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-[58px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-[#C8B88A]/35 text-[10px] text-[#C8B88A] tracking-wider flex items-center gap-1.5">
            <span className="animate-pulse">●</span>
            금색 빛기둥까지 이동
            {goingRight ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </div>
        </motion.div>
      )}

      {/* === Narration === */}
      {arrived && (gameState === 'narrating' || gameState === 'choice') && (
        <div className="absolute top-[58px] left-2 right-2 z-20 pointer-events-none">
          <motion.div key={currentScene.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-[480px] rounded-lg bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-[#C8B88A]/85 uppercase shrink-0">
                {currentScene.title}
              </span>
              <span className="text-white/15">·</span>
              <p className="text-white/95 text-[12px] leading-snug break-keep flex-1 line-clamp-2">
                {displayedText || currentScene.description}
                {gameState === 'narrating' && (
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
                    className="inline-block w-0.5 h-3 bg-[#C8B88A] ml-1 align-middle" />
                )}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* === D-pad === */}
      {canMove && (
        <div className="absolute bottom-[180px] left-2 right-2 flex justify-between pointer-events-none z-20">
          <button onPointerDown={(e) => { e.preventDefault(); startHold(-1); }}
            onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
            aria-label="왼쪽으로"
            className="pointer-events-auto w-14 h-14 rounded-full bg-black/65 backdrop-blur border border-white/15 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button onPointerDown={(e) => { e.preventDefault(); startHold(1); }}
            onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
            aria-label="오른쪽으로"
            className="pointer-events-auto w-14 h-14 rounded-full bg-black/65 backdrop-blur border border-white/15 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg">
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* === Choice cards === */}
      <AnimatePresence mode="wait">
        {arrived && gameState === 'choice' && !isEnding && !selectedChoice && (
          <motion.div key={`c-${currentScene.id}`}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0, scaleY: 0.6, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'bottom center', overflow: 'hidden' }}
            className="absolute bottom-3 left-2 right-2 z-30">
            <div className="mb-1.5 text-center text-[10px] font-mono tracking-[0.2em] text-[#C8B88A]/80 uppercase flex items-center justify-center gap-1.5">
              <Eye className="w-3 h-3" /> 당신의 선택
            </div>
            <div className="flex flex-col gap-1.5">
              {currentScene.choices.map((c, i) => (
                <motion.button key={c.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  onClick={() => onChoiceSelect(currentScene, c)}
                  className="w-full text-left rounded-xl px-3 py-2.5 backdrop-blur-md border transition-colors bg-black/65 border-white/10 hover:bg-black/80 hover:border-[#C8B88A]/45 text-white/95">
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

      {/* 선택 시 플래시 */}
      <AnimatePresence>
        {selectedChoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#C8B88A]/12 pointer-events-none z-30" />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ====================== 보조 컴포넌트 ====================== */

function GoldenPillar({ leftPx }: { leftPx: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      className="absolute z-[5] pointer-events-none"
      style={{ left: leftPx, bottom: 100, transform: 'translateX(-50%)' }}>
      <div className="relative">
        <motion.div className="absolute left-1/2 -translate-x-1/2 bottom-0"
          style={{
            width: 36, height: 220,
            background: 'linear-gradient(180deg, rgba(200,184,138,0) 0%, rgba(200,184,138,0.55) 50%, rgba(200,184,138,0.9) 100%)',
            filter: 'blur(2px)',
          }}
          animate={{ opacity: [0.45, 0.95, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity }} />
        <motion.div className="absolute left-1/2 -translate-x-1/2 -top-3"
          animate={{ y: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <div className="text-[#C8B88A] text-lg drop-shadow-[0_0_8px_rgba(200,184,138,0.8)]">▼</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function CitySkyline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 1600 400" preserveAspectRatio="none" className="w-full h-full opacity-60">
      <defs>
        <linearGradient id="haze" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <rect width="1600" height="400" fill="url(#haze)" />
      {/* 빌딩 실루엣 */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = i * 62 + (i % 3) * 8;
        const h = 80 + ((i * 53) % 160);
        return (
          <g key={i}>
            <rect x={x} y={400 - h} width={50} height={h} fill="rgba(8,12,22,0.85)" />
            {/* 창문 점등 */}
            {Array.from({ length: Math.floor(h / 20) }).map((_, j) => (
              ((i + j) % 3 === 0) && (
                <rect key={j} x={x + 6 + (j % 2) * 22} y={400 - h + 8 + j * 20}
                  width={10} height={8} fill="rgba(255,220,160,0.6)" />
              )
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function RainLayer({ width }: { width: number }) {
  const drops = useMemo(
    () => Array.from({ length: 60 }).map((_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 1.4, dur: 0.6 + Math.random() * 0.6,
    })),
    []
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((d) => (
        <motion.div key={d.id} className="absolute top-[-10%]"
          style={{ left: `${d.left}%`, width: 1, height: 14, background: 'linear-gradient(180deg, rgba(180,210,255,0) 0%, rgba(180,210,255,0.85) 100%)' }}
          animate={{ y: ['0%', '900%'] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'linear' }} />
      ))}
    </div>
  );
}

function DustParticles({ seed }: { seed: string }) {
  const items = useMemo(
    () => Array.from({ length: 18 }).map((_, i) => ({
      id: `${seed}-${i}`, left: Math.random() * 100, top: 20 + Math.random() * 60,
      dur: 6 + Math.random() * 6, delay: Math.random() * 3, size: 1 + Math.random() * 2,
    })),
    [seed]
  );
  return (
    <div className="absolute inset-0 pointer-events-none">
      {items.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full bg-white/40"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{ y: [-6, 6, -6], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/* ============== 캐릭터 (크게 — 약 H 230px) ============== */
function AdultCharacter({ walking, facingLeft }: { walking: boolean; facingLeft: boolean }) {
  return (
    <div style={{ transform: `translateX(-50%) ${facingLeft ? 'scaleX(-1)' : ''}`, transformOrigin: 'bottom center' }}>
      <motion.div
        animate={walking ? { y: [0, -4, 0, -3, 0] } : { y: 0 }}
        transition={{ duration: 0.5, repeat: walking ? Infinity : 0 }}
        style={{ width: 96, height: 230, position: 'relative' }}>
        {/* 머리 */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 46, height: 50, borderRadius: '50%',
          background: 'linear-gradient(180deg,#f1d6b8 0%,#d8b294 100%)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        }} />
        {/* 머리카락 */}
        <div style={{
          position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)',
          width: 50, height: 26, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          background: '#1a1a22',
        }} />
        {/* 셔츠 */}
        <div style={{
          position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
          width: 72, height: 86, borderRadius: '20px 20px 8px 8px',
          background: 'linear-gradient(180deg,#e8eef5 0%,#b8c4d0 100%)',
          boxShadow: 'inset 0 -8px 14px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.4)',
        }}>
          {/* 넥타이 */}
          <div style={{
            position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
            width: 10, height: 44, background: '#8b1e2b', clipPath: 'polygon(50% 0,100% 25%,80% 100%,20% 100%,0 25%)',
          }} />
        </div>
        {/* 팔 */}
        <motion.div
          animate={walking ? { rotate: [10, -20, 10] } : { rotate: 0 }}
          transition={{ duration: 0.5, repeat: walking ? Infinity : 0 }}
          style={{
            position: 'absolute', top: 60, left: 4, width: 14, height: 64,
            borderRadius: 8, background: 'linear-gradient(180deg,#cdd6e0 0%,#8a98a8 100%)',
            transformOrigin: 'top center',
          }} />
        <motion.div
          animate={walking ? { rotate: [-10, 20, -10] } : { rotate: 0 }}
          transition={{ duration: 0.5, repeat: walking ? Infinity : 0 }}
          style={{
            position: 'absolute', top: 60, right: 4, width: 14, height: 64,
            borderRadius: 8, background: 'linear-gradient(180deg,#cdd6e0 0%,#8a98a8 100%)',
            transformOrigin: 'top center',
          }} />
        {/* 다리 */}
        <motion.div
          animate={walking ? { rotate: [-18, 18, -18] } : { rotate: 0 }}
          transition={{ duration: 0.5, repeat: walking ? Infinity : 0 }}
          style={{
            position: 'absolute', top: 134, left: 24, width: 18, height: 74,
            borderRadius: 8, background: 'linear-gradient(180deg,#2a2a36 0%,#0e0e16 100%)',
            transformOrigin: 'top center',
          }} />
        <motion.div
          animate={walking ? { rotate: [18, -18, 18] } : { rotate: 0 }}
          transition={{ duration: 0.5, repeat: walking ? Infinity : 0 }}
          style={{
            position: 'absolute', top: 134, right: 24, width: 18, height: 74,
            borderRadius: 8, background: 'linear-gradient(180deg,#2a2a36 0%,#0e0e16 100%)',
            transformOrigin: 'top center',
          }} />
        {/* 신발 */}
        <div style={{ position: 'absolute', bottom: 0, left: 18, width: 28, height: 10, background: '#0a0a10', borderRadius: 6 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 18, width: 28, height: 10, background: '#0a0a10', borderRadius: 6 }} />
      </motion.div>
    </div>
  );
}

/* ============== 장면별 소품 ============== */
function SceneProp({ kind, intensity }: { kind: PropKind; intensity: number }) {
  switch (kind) {
    case 'monitor': return <Monitor />;
    case 'phone': return <Phone />;
    case 'coffee': return <CoffeeMachine />;
    case 'window': return <RainWindow intensity={intensity} />;
    case 'slide': return <BlankSlide />;
    case 'mirror': return <Mirror />;
    case 'elevator': return <Elevator />;
    case 'door': return <MeetingDoor />;
    case 'sunrise': return <Sunrise />;
    default: return null;
  }
}

function Monitor() {
  return (
    <div style={{ position: 'relative', width: 220, height: 180 }}>
      {/* 책상 */}
      <div style={{ position: 'absolute', bottom: 0, left: -40, right: -40, height: 18, background: '#1a1a22', borderTop: '1px solid rgba(200,184,138,0.2)' }} />
      {/* 받침대 */}
      <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', width: 40, height: 28, background: '#0e0e16' }} />
      <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', width: 90, height: 6, background: '#1a1a22', borderRadius: 3 }} />
      {/* 모니터 */}
      <div style={{ position: 'absolute', bottom: 46, left: '50%', transform: 'translateX(-50%)', width: 220, height: 130, background: '#000', border: '3px solid #1a1a22', borderRadius: 4 }}>
        <motion.div
          animate={{ opacity: [0.7, 1, 0.85, 1, 0.75] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          style={{ position: 'absolute', inset: 4, background: 'linear-gradient(180deg,#0a3a5a 0%,#0a1a2a 100%)' }}>
          {/* slide bars */}
          <div style={{ position: 'absolute', top: 10, left: 12, right: 12, height: 6, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: 24, left: 12, width: '50%', height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: 40, left: 12, right: 50, height: 30, background: 'rgba(200,220,255,0.15)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: 40, right: 12, width: 30, height: 30, background: 'rgba(255,200,140,0.3)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, height: 4, background: 'rgba(255,255,255,0.2)' }} />
        </motion.div>
        {/* 글로우 */}
        <div style={{ position: 'absolute', inset: -12, background: 'radial-gradient(ellipse at center, rgba(80,160,255,0.45) 0%, transparent 65%)', filter: 'blur(8px)', zIndex: -1 }} />
      </div>
    </div>
  );
}

function Phone() {
  return (
    <div style={{ position: 'relative', width: 130, height: 200 }}>
      <motion.div
        animate={{ rotate: [-3, 3, -3, 0, 0, 0] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          width: 80, height: 160, background: 'linear-gradient(180deg,#222 0%,#0a0a10 100%)',
          borderRadius: 16, border: '2px solid #2a2a36', boxShadow: '0 0 30px rgba(180,140,255,0.4)',
        }}>
        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, background: 'linear-gradient(180deg,#2a2348 0%,#1a1430 100%)', borderRadius: 10 }}>
          <div style={{ position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 8, opacity: 0.7, letterSpacing: 2 }}>HOME</div>
          <div style={{ position: 'absolute', top: 32, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>📞</div>
          <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 7, opacity: 0.8 }}>incoming…</div>
        </div>
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(180,140,255,0.6)',
        }} />
    </div>
  );
}

function CoffeeMachine() {
  return (
    <div style={{ position: 'relative', width: 170, height: 200 }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, background: '#1a1a22' }} />
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', width: 130, height: 170, background: 'linear-gradient(180deg,#2a2a32 0%,#14141a 100%)', borderRadius: 8, border: '2px solid rgba(200,184,138,0.2)' }}>
        <div style={{ position: 'absolute', top: 14, left: 12, right: 12, height: 32, background: '#0a0a10', borderRadius: 4 }}>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ position: 'absolute', top: 10, left: 10, color: '#ff8a3a', fontSize: 11, fontFamily: 'monospace' }}>● BREW</motion.div>
        </div>
        <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 16, height: 30, background: '#0a0a10' }} />
        {/* 컵 */}
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, background: '#f5efe6', borderRadius: '4px 4px 18px 18px', border: '2px solid #1a1a22' }}>
          <motion.div animate={{ opacity: [0.3, 0.8, 0.3], y: [-2, -8, -2] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', top: -16, left: '30%', width: 4, height: 14, background: 'rgba(255,255,255,0.5)', borderRadius: 2, filter: 'blur(2px)' }} />
          <motion.div animate={{ opacity: [0.4, 0.9, 0.4], y: [-2, -10, -2] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.3 }}
            style={{ position: 'absolute', top: -18, left: '55%', width: 4, height: 16, background: 'rgba(255,255,255,0.5)', borderRadius: 2, filter: 'blur(2px)' }} />
        </div>
      </div>
    </div>
  );
}

function RainWindow({ intensity }: { intensity: number }) {
  return (
    <div style={{ position: 'relative', width: 260, height: 200 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0a1828 0%,#16243a 100%)', border: '6px solid #1a1a22', borderRadius: 4, overflow: 'hidden' }}>
        {/* 도시 야경 */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(120,160,220,0.3) 0%, transparent 70%)' }} />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', bottom: 8, left: i * 22, width: 16, height: 8 + (i % 4) * 8, background: 'rgba(255,210,140,0.6)' }} />
        ))}
        {/* 빗방울 흐름 */}
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, 200], opacity: [0.7, 0.1] }}
            transition={{ duration: 1.5 + (i % 3) * 0.4, repeat: Infinity, delay: i * 0.15, ease: 'linear' }}
            style={{ position: 'absolute', top: -10, left: `${(i * 7) % 95}%`, width: 1.5, height: 18, background: 'rgba(220,235,255,0.7)', borderRadius: 2 }} />
        ))}
      </div>
      {/* 창틀 십자 */}
      <div style={{ position: 'absolute', top: '50%', left: 6, right: 6, height: 6, background: '#1a1a22', transform: 'translateY(-50%)' }} />
      <div style={{ position: 'absolute', left: '50%', top: 6, bottom: 6, width: 6, background: '#1a1a22', transform: 'translateX(-50%)' }} />
    </div>
  );
}

function BlankSlide() {
  return (
    <div style={{ position: 'relative', width: 240, height: 160 }}>
      <motion.div
        animate={{ boxShadow: ['0 0 30px rgba(180,220,255,0.3)', '0 0 60px rgba(180,220,255,0.7)', '0 0 30px rgba(180,220,255,0.3)'] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, background: '#f8fbff', border: '6px solid #1a1a22', borderRadius: 4 }}>
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, height: 4, background: '#dde4ec', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 30, left: 16, width: '40%', height: 3, background: '#dde4ec', borderRadius: 2 }} />
        <div style={{ position: 'absolute', bottom: 16, right: 16, color: '#a8b2bc', fontSize: 11, fontFamily: 'monospace' }}>
          [ 결론 ___________ ]
        </div>
        <motion.div animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 20, right: 26, width: 2, height: 12, background: '#1a1a22' }} />
      </motion.div>
    </div>
  );
}

function Mirror() {
  return (
    <div style={{ position: 'relative', width: 180, height: 230 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#3a3a44 0%,#1a1a22 100%)', borderRadius: '90px 90px 8px 8px', border: '4px solid #2a2a32' }}>
        <div style={{ position: 'absolute', inset: 8, background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)', borderRadius: '82px 82px 4px 4px' }}>
          {/* 반사된 흐릿한 얼굴 */}
          <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', width: 64, height: 70, borderRadius: '50%', background: 'rgba(241,214,184,0.35)', filter: 'blur(4px)' }} />
          <div style={{ position: 'absolute', top: 96, left: '50%', transform: 'translateX(-50%)', width: 90, height: 90, background: 'rgba(232,238,245,0.25)', borderRadius: '20px 20px 0 0', filter: 'blur(3px)' }} />
        </div>
      </div>
      {/* 세면대 */}
      <div style={{ position: 'absolute', bottom: -10, left: -30, right: -30, height: 14, background: '#0a0a10', borderRadius: 4 }} />
    </div>
  );
}

function Elevator() {
  return (
    <div style={{ position: 'relative', width: 200, height: 220 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#2a2a32 0%,#14141a 100%)', border: '4px solid #1a1a22', borderRadius: 6 }}>
        {/* 도어 라인 */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: '#0a0a10' }} />
        {/* 디스플레이 */}
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 60, height: 22, background: '#000', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ color: '#ff7a3a', fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>▲ 19</motion.span>
        </div>
        {/* 버튼 패널 */}
        <div style={{ position: 'absolute', top: 50, right: 10, width: 28, height: 120, background: '#0a0a10', borderRadius: 6, padding: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['▲', '●', '▼'].map((s, i) => (
            <motion.div key={i}
              animate={i === 1 ? { boxShadow: ['0 0 4px rgba(255,200,80,0.5)', '0 0 14px rgba(255,200,80,1)', '0 0 4px rgba(255,200,80,0.5)'] } : {}}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 20, height: 20, background: i === 1 ? '#3a2a14' : '#1a1a22', borderRadius: '50%', color: i === 1 ? '#ffcc66' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
              {s}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MeetingDoor() {
  return (
    <div style={{ position: 'relative', width: 200, height: 240 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#3a2418 0%,#1f1208 100%)', border: '4px solid #1a0e08', borderRadius: '6px 6px 0 0' }}>
        {/* 작은 창 */}
        <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', width: 60, height: 80, background: 'rgba(255,220,160,0.6)', borderRadius: 4, border: '2px solid #1a0e08', overflow: 'hidden' }}>
          {/* 안쪽 그림자 */}
          <motion.div animate={{ x: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: 20, left: 10, width: 20, height: 30, background: 'rgba(20,20,20,0.55)', borderRadius: '50%', filter: 'blur(2px)' }} />
          <motion.div animate={{ x: [6, -6, 6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: 24, right: 8, width: 20, height: 30, background: 'rgba(20,20,20,0.5)', borderRadius: '50%', filter: 'blur(2px)' }} />
        </div>
        {/* 손잡이 */}
        <motion.div
          animate={{ boxShadow: ['0 0 8px rgba(200,184,138,0.4)', '0 0 22px rgba(200,184,138,0.9)', '0 0 8px rgba(200,184,138,0.4)'] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ position: 'absolute', top: '55%', right: 14, width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle, #f5e9c5 0%,#b89a55 100%)' }} />
      </div>
    </div>
  );
}

function Sunrise() {
  return (
    <div style={{ position: 'relative', width: 240, height: 200 }}>
      <motion.div
        animate={{ y: [10, -4, 10], boxShadow: ['0 0 40px rgba(255,200,140,0.5)', '0 0 80px rgba(255,200,140,0.9)', '0 0 40px rgba(255,200,140,0.5)'] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, #fff2cc 0%,#ffb86b 60%,#f97316 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, background: 'linear-gradient(180deg,#2e4a44 0%,#1a2a2a 100%)' }} />
    </div>
  );
}
