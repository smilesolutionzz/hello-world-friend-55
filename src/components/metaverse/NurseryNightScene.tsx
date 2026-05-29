import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Activity, Eye, ChevronLeft, ChevronRight, Moon, Volume2, VolumeX } from 'lucide-react';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';
import { useGameAudio } from '@/hooks/useGameAudio';

/**
 * NurseryNightScene — 부모 양육 시네마틱 (새벽 3시, 아이의 울음)
 *
 *  • 와이드 월드 패럴랙스 (컨테이너 2.2배), 카메라가 캐릭터를 중앙에 유지
 *  • 4D 효과: 실링팬 그림자, 야간등 깜빡임, 비/번개, 먼지, 카드심박 셰이크
 *  • 장면별 소품 (알람·아이침대·천장재생·아침창·일출) — 카드 열림 시 자동 위로
 *  • PC ←/→·A/D + 모바일 D-pad (길게 누르면 가속)
 *  • Ambient audio synth: 저주파 hum + 빗소리 noise + 아기 울음 톤 + 심박
 *    — 사용자 토글, 모션감소 옵션 / 음소거 시 자동 약화
 *  • EXIT_MS · SCENE_HANDOFF_MS — 부모 컴포넌트 1100ms 와 동기화
 */

const EXIT_MS = 850;
const SCENE_HANDOFF_MS = 1100;

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

type PropKind = 'clock' | 'crib' | 'ceiling' | 'morning_door' | 'sunrise';

interface SceneCfg {
  stopPct: number;
  startPct: number;
  prop: PropKind;
  propScale: number;
  bgA: string;
  bgB: string;
  haze: string;
  intensity: number;
  label: string;
  facingLeft?: boolean;
  rain?: boolean;
  lightning?: boolean;
  flicker?: boolean;
  /** ambient: 'night' 어두운 hum + 멀리서 비 / 'cry' hum+ 아기 울음 톤 / 'rumi' 심박+생각 / 'dawn' 새소리 톤 / 'warm' 따뜻한 밝은 톤 */
  ambient: 'night' | 'cry' | 'rumi' | 'dawn' | 'warm';
}

// 가정집 침실 톤 — 따뜻한 베이지/모브/우디 (도시·산 실루엣 X)
const SCENES: Record<string, SceneCfg> = {
  pn_wake:    { stopPct: 22, startPct: 8,  prop: 'clock',        propScale: 1.20, bgA: '#1a1418', bgB: '#2a2024', haze: 'rgba(255,210,170,0.16)', intensity: 0.55, label: '01 · 03:14 알람',     ambient: 'night',  flicker: true, rain: true },
  pn_room:    { stopPct: 60, startPct: 28, prop: 'crib',         propScale: 1.30, bgA: '#241820', bgB: '#3a2630', haze: 'rgba(255,180,190,0.20)', intensity: 0.80, label: '02 · 아이의 얼굴',    ambient: 'cry',    flicker: true },
  pn_again:   { stopPct: 35, startPct: 64, prop: 'ceiling',      propScale: 1.45, bgA: '#1a1620', bgB: '#2a2434', haze: 'rgba(210,190,230,0.18)', intensity: 0.70, label: '03 · 다시 누워서',    ambient: 'rumi',   facingLeft: true, rain: true },
  pn_morning: { stopPct: 78, startPct: 42, prop: 'morning_door', propScale: 1.30, bgA: '#3a2a1c', bgB: '#5a4028', haze: 'rgba(255,215,165,0.28)', intensity: 0.30, label: '04 · 07:10 아침',     ambient: 'dawn' },
  pn_end:     { stopPct: 50, startPct: 30, prop: 'sunrise',      propScale: 1.25, bgA: '#4a3624', bgB: '#6a4e30', haze: 'rgba(255,225,175,0.32)', intensity: 0.15, label: '에필로그',           ambient: 'warm' },
};

const WORLD_FACTOR = 2.2;
const ARRIVE_THRESHOLD = 48;
const STEP_PX = 28;
const HOLD_SPEED = 7;

export default function NurseryNightScene({
  currentScene, gameState, onArrive, sceneIndex,
  onChoiceSelect, displayedText, selectedChoice, showParentNotes,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [viewW, setViewW] = useState(0);
  const [posPx, setPosPx] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [tension, setTension] = useState(35);
  const [heart, setHeart] = useState(74);
  const [shake, setShake] = useState(0);
  const [audioOn, setAudioOn] = useState(false);
  const heldDir = useRef<0 | 1 | -1>(0);
  const heldRaf = useRef<number | null>(null);
  const arrivedFired = useRef(false);

  const cfg = useMemo<SceneCfg>(
    () => (currentScene ? SCENES[currentScene.id] ?? SCENES.pn_wake : SCENES.pn_wake),
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

  useEffect(() => {
    arrivedFired.current = false;
    setArrived(false);
    if (worldW > 0) setPosPx((worldW * cfg.startPct) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, currentScene?.id, worldW]);

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

  useEffect(() => {
    if (gameState === 'narrating' || gameState === 'choice') {
      const base = 35 + Math.round(cfg.intensity * 55);
      setTension(base);
      setHeart(72 + Math.round(cfg.intensity * 55));
      const id = setInterval(() => {
        setTension((v) => Math.min(99, v + Math.random() * 1.3));
        setHeart((v) => Math.min(155, v + (Math.random() > 0.55 ? 1 : 0)));
        if (!prefersReducedMotion && cfg.intensity > 0.55) {
          const trigger = 0.95 - cfg.intensity * 0.35;
          if (Math.random() > trigger) {
            setShake(1);
            setTimeout(() => setShake(0), 160);
          }
        }
      }, 380);
      return () => clearInterval(id);
    }
  }, [gameState, cfg.intensity, sceneIndex, prefersReducedMotion]);

  /* ============== 게임 오디오 (하이브리드 BGM + SFX) ============== */
  const audio = useGameAudio({
    theme: 'parent_night',
    intensity: cfg.intensity,
    reduceMotion: prefersReducedMotion,
    muted: !audioOn,
  });
  useEffect(() => {
    audio.setMuted(!audioOn);
  }, [audioOn, audio]);
  useEffect(() => {
    if (gameState === 'exploring' || gameState === 'narrating') audio.playSfx('arrive');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex]);

  // 선택 시 select SFX
  const handleChoice = useCallback((scene: StoryScene, choice: StoryChoice) => {
    audio.playSfx('select');
    onChoiceSelect(scene, choice);
  }, [audio, onChoiceSelect]);

  const canMove = !selectedChoice && gameState !== 'result' && worldW > 0;

  const clampPos = useCallback(
    (n: number) => Math.max(50, Math.min(worldW - 50, n)),
    [worldW]
  );

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

  const isEnding = currentScene.id === 'pn_end';

  const camX = Math.max(0, Math.min(worldW - viewW, posPx - viewW / 2));
  const charScreenX = posPx - camX;
  const propWorldX = targetPx;
  const propScreenX = propWorldX - camX;
  const goingRight = targetPx >= posPx;
  const exiting = !!selectedChoice;
  const walking = heldDir.current !== 0 || exiting;

  const fxScale = prefersReducedMotion ? 0 : Math.max(0.25, cfg.intensity);
  const exitSec = EXIT_MS / 1000;
  const propBottom = arrived && gameState === 'choice' && !selectedChoice ? 172 : 100;
  const propActiveScale = arrived ? (gameState === 'choice' && !selectedChoice ? 1.04 : 1.08) : 1;

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl select-none"
      style={{ background: `linear-gradient(180deg, ${cfg.bgA} 0%, ${cfg.bgB} 100%)` }}
      animate={shake && !prefersReducedMotion ? { x: [0, -3, 3, -2, 0] } : { x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* === Parallax 가정집 침실 벽 (도배지 + 액자 + 야간등) === */}
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{ width: worldW || '100%', transform: `translateX(${-camX * 0.22}px)` }}
      >
        <HomeInterior color={cfg.haze} mood={cfg.ambient} />
      </div>

      {/* 중간 광원/달빛 */}
      <div
        className="absolute top-0 left-0 right-0 h-[55%] pointer-events-none"
        style={{
          width: worldW || '100%',
          transform: `translateX(${-camX * 0.55}px)`,
          background: `radial-gradient(ellipse 30% 65% at ${cfg.stopPct}% 28%, ${cfg.haze} 0%, transparent 70%)`,
        }}
      />

      {/* 실링팬 그림자 (이중 회전) — 야간 장면만 */}
      {(cfg.ambient === 'night' || cfg.ambient === 'rumi') && fxScale > 0 && (
        <CeilingFanShadow fxScale={fxScale} />
      )}

      {cfg.rain && fxScale > 0 && <RainLayer fxScale={fxScale} />}
      {fxScale > 0 && <DustParticles seed={currentScene.id} fxScale={fxScale} />}

      {/* 야간등 깜빡임 */}
      {cfg.flicker && fxScale > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: cfg.ambient === 'cry' ? 'rgba(255,200,210,0.06)' : 'rgba(180,200,255,0.04)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.6 * fxScale, 0, 0.3 * fxScale, 0] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.82, 0.84, 0.86, 0.88, 1] }}
        />
      )}

      {cfg.lightning && fxScale > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(220,235,255,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.7 * fxScale, 0, 0.3 * fxScale, 0] }}
          transition={{ duration: 11, repeat: Infinity, times: [0, 0.7, 0.71, 0.73, 0.74, 1] }}
        />
      )}

      {/* 바닥 (러그+마룻바닥) */}
      <div
        className="absolute left-0 bottom-0"
        style={{
          width: worldW || '100%', height: 110,
          transform: `translateX(${-camX}px)`,
          background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, #050308 100%)`,
          borderTop: '1px solid rgba(200,184,138,0.14)',
        }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0"
            style={{ left: `${(i / 18) * 100}%`, width: 1, background: 'rgba(200,184,138,0.06)' }} />
        ))}
        {/* 러그 (도착 지점 기준 따뜻한 색) */}
        <div className="absolute bottom-0 h-3"
          style={{
            left: `${cfg.stopPct - 8}%`, width: '16%',
            background: 'linear-gradient(90deg, transparent, rgba(200,140,120,0.25), transparent)',
          }} />
      </div>

      {/* 가이드 빛기둥 */}
      {!arrived && !selectedChoice && viewW > 0 && <GoldenPillar leftPx={propScreenX} />}

      {/* 소품 */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: propScreenX, bottom: propBottom,
          transform: `translateX(-50%) scale(${cfg.propScale * propActiveScale})`,
          transformOrigin: 'bottom center',
          transition: 'transform 600ms cubic-bezier(0.2,0.7,0.2,1), bottom 500ms cubic-bezier(0.2,0.7,0.2,1)',
        }}
      >
        <SceneProp kind={cfg.prop} intensity={cfg.intensity} />
      </div>

      {/* 스포트라이트 */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{ left: exiting ? viewW + 220 : charScreenX }}
        transition={{ duration: exiting ? exitSec : 0.18, ease: exiting ? 'easeIn' : 'linear' }}
        style={{
          bottom: 84, width: 360, height: 66, marginLeft: -180,
          background: 'radial-gradient(ellipse 50% 50% at 50% 100%, rgba(255,210,180,0.30) 0%, transparent 70%)',
          filter: 'blur(3px)',
        }}
      />

      {/* 캐릭터 (부모) */}
      <motion.div
        className="absolute z-10"
        animate={{ left: exiting ? viewW + 220 : charScreenX }}
        transition={{ duration: exiting ? exitSec : 0.22, ease: exiting ? 'easeIn' : 'linear' }}
        style={{ bottom: 96 }}
      >
        <ParentCharacter
          walking={walking}
          facingLeft={!!cfg.facingLeft && !exiting ? true : !goingRight && walking}
          tired={cfg.ambient === 'night' || cfg.ambient === 'cry' || cfg.ambient === 'rumi'}
        />
      </motion.div>

      {/* Vignette + 스캔라인 */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 32%, rgba(0,0,0,0.82) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          opacity: prefersReducedMotion ? 0.015 : 0.035 + 0.045 * fxScale,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.55) 0 1px, transparent 1px 3px)",
        }} />

      {/* HUD */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between text-[10px] font-mono tracking-widest text-[#C8B88A]/90 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/10">
          <Moon className="w-2.5 h-2.5" />
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
          <button
            onClick={() => setAudioOn((v) => !v)}
            className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/10 active:scale-95 transition"
            aria-label={audioOn ? '환경음 끄기' : '환경음 켜기'}
          >
            {audioOn ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* 미니맵 */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-2 py-1 rounded-full bg-black/55 backdrop-blur border border-white/10 flex items-center gap-1.5">
          <div className="relative w-32 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="absolute top-0 bottom-0 bg-[#C8B88A]/80"
              style={{ left: 0, width: `${(posPx / Math.max(1, worldW)) * 100}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C8B88A] ring-1 ring-black/40"
              style={{ left: `calc(${cfg.stopPct}% - 3px)` }} />
          </div>
          <span className="text-[9px] font-mono text-[#C8B88A]/80 tabular-nums">
            {String(sceneIndex + 1).padStart(2, '0')}/05
          </span>
        </div>
      </div>

      {/* 가이드 토스트 */}
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

      {/* Narration */}
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

      {/* D-pad */}
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

      {/* Choice cards */}
      <AnimatePresence mode="wait">
        {arrived && gameState === 'choice' && !isEnding && !selectedChoice && (
          <motion.div key={`c-${currentScene.id}`}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0, scaleY: 0.6, height: 0 }}
            transition={{ duration: exitSec, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'bottom center', overflow: 'hidden' }}
            className="absolute bottom-3 left-2 right-2 z-30">
            <div className="mb-1.5 text-center text-[10px] font-mono tracking-[0.2em] text-[#C8B88A]/80 uppercase flex items-center justify-center gap-1.5">
              <Eye className="w-3 h-3" /> 오늘 밤 나의 반응
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

      {/* 선택 플래시 */}
      <AnimatePresence>
        {selectedChoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#C8B88A]/12 pointer-events-none z-30" />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ====================== Ambient Audio (WebAudio synth) ====================== */
function useAmbientSynth({
  enabled, mode, intensity,
}: { enabled: boolean; mode: SceneCfg['ambient']; intensity: number }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!enabled) {
      nodesRef.current?.stop();
      nodesRef.current = null;
      return;
    }
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    if (!ctxRef.current) ctxRef.current = new AC();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.6);
    master.connect(ctx.destination);

    // --- low hum (모든 모드의 베이스) ---
    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = mode === 'warm' || mode === 'dawn' ? 120 : 70;
    const humGain = ctx.createGain();
    humGain.gain.value = mode === 'warm' ? 0.04 : 0.12 + intensity * 0.06;
    hum.connect(humGain).connect(master);
    hum.start();

    // --- noise (비/공기) ---
    const bufSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) ch[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = mode === 'cry' ? 900 : mode === 'dawn' ? 2200 : 1400;
    bp.Q.value = 0.7;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = mode === 'warm' ? 0.015 : mode === 'cry' ? 0.025 : 0.035 + intensity * 0.025;
    noise.connect(bp).connect(noiseGain).connect(master);
    noise.start();

    // --- 모드별 추가 레이어 ---
    let cryTimer: number | null = null;
    let heartTimer: number | null = null;
    const extras: OscillatorNode[] = [];

    if (mode === 'cry') {
      // 멀리서 들리는 아기 울음 톤 (사인 + 비브라토)
      const tick = () => {
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(420, t);
        o.frequency.linearRampToValueAtTime(680, t + 0.25);
        o.frequency.linearRampToValueAtTime(380, t + 0.9);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.15);
        g.gain.linearRampToValueAtTime(0, t + 1.0);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 1600;
        o.connect(lp).connect(g).connect(master);
        o.start(t); o.stop(t + 1.05);
        cryTimer = window.setTimeout(tick, 1600 + Math.random() * 1200);
      };
      cryTimer = window.setTimeout(tick, 600);
    }

    if (mode === 'rumi') {
      // 심박 + 시계 째깍 (저주파 클릭)
      const beat = () => {
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = 55;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.connect(g).connect(master);
        o.start(t); o.stop(t + 0.3);
        heartTimer = window.setTimeout(beat, 850);
      };
      heartTimer = window.setTimeout(beat, 400);
    }

    if (mode === 'dawn' || mode === 'warm') {
      // 따뜻한 패드 (3음 코드)
      [262, 330, 392].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.02;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.15 + i * 0.05;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.008;
        lfo.connect(lfoGain).connect(g.gain);
        o.connect(g).connect(master);
        o.start(); lfo.start();
        extras.push(o, lfo);
      });
    }

    nodesRef.current = {
      stop: () => {
        try { master.gain.cancelScheduledValues(ctx.currentTime); } catch {}
        try { master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); } catch {}
        setTimeout(() => {
          try { hum.stop(); } catch {}
          try { noise.stop(); } catch {}
          extras.forEach((n) => { try { n.stop(); } catch {} });
          try { master.disconnect(); } catch {}
        }, 450);
        if (cryTimer) clearTimeout(cryTimer);
        if (heartTimer) clearTimeout(heartTimer);
      },
    };

    return () => {
      nodesRef.current?.stop();
      nodesRef.current = null;
    };
  }, [enabled, mode, intensity]);

  useEffect(() => () => {
    try { ctxRef.current?.close(); } catch {}
    ctxRef.current = null;
  }, []);
}

/* ====================== 보조 비주얼 ====================== */
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

function HomeInterior({ color, mood }: { color: string; mood: SceneCfg['ambient'] }) {
  // 따뜻한 가정집 벽 — 도배지, 몰딩, 액자, 벽시계, 봉제인형 선반, 커튼 창
  const warm = mood === 'dawn' || mood === 'warm';
  const wallTop = warm ? '#3a2a1c' : '#2a1f25';
  const wallMid = warm ? '#5a4028' : '#3a2c34';
  const wainscot = warm ? '#6a4e30' : '#4a3a44';
  const accent = warm ? 'rgba(255,220,170,0.22)' : 'rgba(255,200,200,0.16)';
  return (
    <svg viewBox="0 0 1600 400" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="wallG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={wallTop} />
          <stop offset="55%" stopColor={wallMid} />
          <stop offset="100%" stopColor={wainscot} />
        </linearGradient>
        <linearGradient id="hazeN" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <pattern id="wallpaper" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* 작은 별/도트 패턴 — 아동방 도배 */}
          <circle cx="20" cy="20" r="1.2" fill="rgba(255,220,180,0.10)" />
          <circle cx="60" cy="55" r="1" fill="rgba(255,220,180,0.08)" />
          <path d="M40 38 l1.5 3 l3 .4 l-2.2 2.1 .6 3.1 -2.9-1.5 -2.9 1.5 .6-3.1 -2.2-2.1 3-.4z"
            fill="rgba(255,220,180,0.07)" />
        </pattern>
      </defs>

      {/* 벽지 (그라데이션 + 패턴) */}
      <rect width="1600" height="400" fill="url(#wallG)" />
      <rect width="1600" height="320" fill="url(#wallpaper)" />
      <rect width="1600" height="400" fill="url(#hazeN)" />

      {/* 천장 몰딩 */}
      <rect x="0" y="22" width="1600" height="6" fill="rgba(0,0,0,0.35)" />
      <rect x="0" y="28" width="1600" height="2" fill="rgba(255,230,200,0.10)" />

      {/* 허리 몰딩 (wainscot 라인) */}
      <rect x="0" y="300" width="1600" height="4" fill="rgba(0,0,0,0.45)" />
      <rect x="0" y="304" width="1600" height="2" fill="rgba(255,230,200,0.08)" />

      {/* 액자 3종 (가족사진 / 아이 그림 / 작은 거울) */}
      {[
        { x: 130,  y: 80,  w: 90,  h: 110, hue: 'rgba(220,180,140,0.55)', inner: 'rgba(255,230,200,0.18)' },
        { x: 340,  y: 110, w: 110, h: 80,  hue: 'rgba(200,150,110,0.55)', inner: 'rgba(255,220,180,0.14)' },
        { x: 560,  y: 90,  w: 70,  h: 70,  hue: 'rgba(230,200,160,0.55)', inner: 'rgba(255,240,220,0.20)' },
        { x: 900,  y: 100, w: 100, h: 130, hue: 'rgba(210,170,130,0.55)', inner: 'rgba(255,225,190,0.16)' },
        { x: 1140, y: 90,  w: 80,  h: 100, hue: 'rgba(220,180,140,0.55)', inner: 'rgba(255,230,200,0.18)' },
        { x: 1340, y: 120, w: 120, h: 80,  hue: 'rgba(200,150,110,0.55)', inner: 'rgba(255,220,180,0.14)' },
      ].map((f, i) => (
        <g key={i}>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={f.hue} />
          <rect x={f.x + 4} y={f.y + 4} width={f.w - 8} height={f.h - 8} fill={f.inner} />
          {/* 액자 안 추상 실루엣 */}
          <circle cx={f.x + f.w / 2} cy={f.y + f.h * 0.45} r={Math.min(f.w, f.h) * 0.16} fill="rgba(60,40,40,0.35)" />
          <rect x={f.x + f.w * 0.25} y={f.y + f.h * 0.6} width={f.w * 0.5} height={f.h * 0.25} fill="rgba(60,40,40,0.30)" />
        </g>
      ))}

      {/* 벽시계 (라운드) */}
      <g>
        <circle cx="730" cy="135" r="34" fill="rgba(40,28,24,0.7)" />
        <circle cx="730" cy="135" r="30" fill="rgba(245,230,200,0.85)" />
        <line x1="730" y1="135" x2="730" y2="115" stroke="#1a1a22" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="730" y1="135" x2="746" y2="135" stroke="#1a1a22" strokeWidth="2" strokeLinecap="round" />
        <circle cx="730" cy="135" r="2.5" fill="#1a1a22" />
      </g>

      {/* 작은 야간등 (콘센트) */}
      <g>
        <rect x="455" y="270" width="22" height="28" rx="4" fill="rgba(255,200,140,0.55)" />
        <ellipse cx="466" cy="288" rx="60" ry="22" fill={accent} opacity="0.7" />
      </g>
      <g>
        <rect x="1215" y="270" width="22" height="28" rx="4" fill="rgba(255,200,140,0.55)" />
        <ellipse cx="1226" cy="288" rx="60" ry="22" fill={accent} opacity="0.7" />
      </g>

      {/* 커튼 창 (도시 X — 단순 따뜻한 빛 한 장) */}
      <g>
        <rect x="1000" y="60" width="140" height="180" fill="rgba(20,16,22,0.55)" />
        <rect x="1006" y="66" width="128" height="168" fill={warm ? 'rgba(255,210,160,0.45)' : 'rgba(180,200,230,0.18)'} />
        {/* 커튼 양쪽 */}
        <path d="M990 50 Q1000 150 990 250 L1018 250 Q1010 150 1018 50 Z" fill="rgba(120,80,90,0.6)" />
        <path d="M1150 50 Q1140 150 1150 250 L1122 250 Q1130 150 1122 50 Z" fill="rgba(120,80,90,0.6)" />
        {/* 커튼봉 */}
        <rect x="985" y="48" width="170" height="5" rx="2" fill="rgba(60,40,30,0.85)" />
      </g>

      {/* 봉제인형 선반 */}
      <g>
        <rect x="200" y="240" width="220" height="6" fill="rgba(80,55,40,0.85)" />
        <circle cx="230" cy="230" r="11" fill="rgba(220,180,150,0.75)" />
        <circle cx="226" cy="228" r="2" fill="#2a1a14" />
        <circle cx="234" cy="228" r="2" fill="#2a1a14" />
        <rect x="260" y="218" width="22" height="22" rx="4" fill="rgba(200,140,160,0.7)" />
        <circle cx="305" cy="230" r="10" fill="rgba(180,210,170,0.7)" />
        <rect x="340" y="222" width="14" height="20" rx="3" fill="rgba(220,200,150,0.7)" />
        <circle cx="385" cy="230" r="9" fill="rgba(200,170,210,0.7)" />
      </g>

      {/* 책장 (실루엣) */}
      <g>
        <rect x="1280" y="200" width="160" height="100" fill="rgba(50,32,24,0.85)" />
        <rect x="1284" y="206" width="152" height="2" fill="rgba(0,0,0,0.5)" />
        <rect x="1284" y="248" width="152" height="2" fill="rgba(0,0,0,0.5)" />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={1288 + i * 11} y={210} width={9} height={36}
            fill={`rgba(${120 + (i * 23) % 100},${80 + (i * 17) % 80},${60 + (i * 11) % 70},0.85)`} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={`b-${i}`} x={1288 + i * 11} y={252} width={9} height={36}
            fill={`rgba(${100 + (i * 19) % 100},${70 + (i * 13) % 80},${50 + (i * 23) % 70},0.85)`} />
        ))}
      </g>

      {/* 모빌 (천장에 매단 작은 형체) */}
      <g opacity="0.85">
        <line x1="700" y1="22" x2="700" y2="62" stroke="rgba(180,160,140,0.6)" strokeWidth="1" />
        <circle cx="690" cy="68" r="5" fill="rgba(255,200,180,0.85)" />
        <circle cx="710" cy="74" r="4" fill="rgba(200,220,255,0.85)" />
        <path d="M695 66 l5 -4 l5 4 l-5 4z" fill="rgba(255,230,180,0.85)" />
      </g>
    </svg>
  );
}

function CeilingFanShadow({ fxScale }: { fxScale: number }) {
  return (
    <motion.div
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none mix-blend-multiply"
      style={{ width: 520, height: 520, opacity: 0.15 * fxScale }}
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'conic-gradient(from 0deg, rgba(0,0,0,0.4) 0deg, transparent 30deg, rgba(0,0,0,0.4) 90deg, transparent 120deg, rgba(0,0,0,0.4) 180deg, transparent 210deg, rgba(0,0,0,0.4) 270deg, transparent 300deg)',
        borderRadius: '50%', filter: 'blur(28px)',
      }} />
    </motion.div>
  );
}

function RainLayer({ fxScale = 1 }: { fxScale?: number }) {
  const count = Math.max(8, Math.round(46 * fxScale));
  const drops = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 1.6,
      dur: (0.7 + Math.random() * 0.6) / Math.max(0.5, fxScale),
    })),
    [count, fxScale]
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.55 + 0.4 * fxScale }}>
      {drops.map((d) => (
        <motion.div key={d.id} className="absolute top-[-10%]"
          style={{ left: `${d.left}%`, width: 1, height: 14, background: 'linear-gradient(180deg, rgba(180,210,255,0) 0%, rgba(180,210,255,0.8) 100%)' }}
          animate={{ y: ['0%', '900%'] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'linear' }} />
      ))}
    </div>
  );
}

function DustParticles({ seed, fxScale = 1 }: { seed: string; fxScale?: number }) {
  const count = Math.max(4, Math.round(16 * fxScale));
  const items = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      id: `${seed}-${i}`, left: Math.random() * 100, top: 20 + Math.random() * 60,
      dur: 6 + Math.random() * 6, delay: Math.random() * 3, size: 1 + Math.random() * 2,
    })),
    [seed, count]
  );
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.45 + 0.5 * fxScale }}>
      {items.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full bg-white/40"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{ y: [-6, 6, -6], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/* ============== 부모 캐릭터 (졸린 자세) ============== */
function ParentCharacter({ walking, facingLeft, tired }: { walking: boolean; facingLeft: boolean; tired: boolean }) {
  return (
    <div style={{ transform: `translateX(-50%) ${facingLeft ? 'scaleX(-1)' : ''}`, transformOrigin: 'bottom center' }}>
      <motion.div
        animate={walking ? { y: [0, -4, 0, -3, 0] } : { y: tired ? [0, -1.2, 0] : 0 }}
        transition={{ duration: walking ? 0.5 : 3.2, repeat: Infinity }}
        style={{ width: 96, height: 230, position: 'relative' }}>
        {/* 머리 */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 46, height: 50, borderRadius: '50%',
          background: 'linear-gradient(180deg,#f1d6b8 0%,#d8b294 100%)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        }}>
          {/* 다크서클 */}
          {tired && (
            <>
              <div style={{ position: 'absolute', top: 26, left: 10, width: 8, height: 4, background: 'rgba(80,40,60,0.45)', borderRadius: 4, filter: 'blur(1px)' }} />
              <div style={{ position: 'absolute', top: 26, right: 10, width: 8, height: 4, background: 'rgba(80,40,60,0.45)', borderRadius: 4, filter: 'blur(1px)' }} />
            </>
          )}
        </div>
        {/* 헝클어진 머리 */}
        <div style={{
          position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
          width: 52, height: 28, borderTopLeftRadius: 26, borderTopRightRadius: 26,
          background: '#2a2228',
        }} />
        {/* 잠옷 (티셔츠) */}
        <div style={{
          position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
          width: 74, height: 90, borderRadius: '18px 18px 8px 8px',
          background: 'linear-gradient(180deg,#9aa8c8 0%,#5a6480 100%)',
          boxShadow: 'inset 0 -8px 14px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.4)',
        }}>
          {/* 가슴팍 작은 별 */}
          <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', color: '#fff8e0', fontSize: 10 }}>★</div>
        </div>
        {/* 팔 */}
        <motion.div
          animate={walking ? { rotate: [10, -20, 10] } : { rotate: tired ? [0, -3, 0] : 0 }}
          transition={{ duration: walking ? 0.5 : 4, repeat: Infinity }}
          style={{
            position: 'absolute', top: 60, left: 4, width: 14, height: 64,
            borderRadius: 8, background: 'linear-gradient(180deg,#aebac8 0%,#6a7488 100%)',
            transformOrigin: 'top center',
          }} />
        <motion.div
          animate={walking ? { rotate: [-10, 20, -10] } : { rotate: tired ? [0, 3, 0] : 0 }}
          transition={{ duration: walking ? 0.5 : 4, repeat: Infinity, delay: 0.4 }}
          style={{
            position: 'absolute', top: 60, right: 4, width: 14, height: 64,
            borderRadius: 8, background: 'linear-gradient(180deg,#aebac8 0%,#6a7488 100%)',
            transformOrigin: 'top center',
          }} />
        {/* 잠옷 바지 */}
        <motion.div
          animate={walking ? { rotate: [-18, 18, -18] } : { rotate: 0 }}
          transition={{ duration: 0.5, repeat: walking ? Infinity : 0 }}
          style={{
            position: 'absolute', top: 134, left: 24, width: 18, height: 74,
            borderRadius: 8, background: 'linear-gradient(180deg,#3a3a4a 0%,#1a1a26 100%)',
            transformOrigin: 'top center',
          }} />
        <motion.div
          animate={walking ? { rotate: [18, -18, 18] } : { rotate: 0 }}
          transition={{ duration: 0.5, repeat: walking ? Infinity : 0 }}
          style={{
            position: 'absolute', top: 134, right: 24, width: 18, height: 74,
            borderRadius: 8, background: 'linear-gradient(180deg,#3a3a4a 0%,#1a1a26 100%)',
            transformOrigin: 'top center',
          }} />
        {/* 슬리퍼 */}
        <div style={{ position: 'absolute', bottom: 0, left: 18, width: 28, height: 8, background: '#7a5a3a', borderRadius: 8 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 18, width: 28, height: 8, background: '#7a5a3a', borderRadius: 8 }} />
      </motion.div>
    </div>
  );
}

/* ============== 장면별 소품 ============== */
function SceneProp({ kind, intensity }: { kind: PropKind; intensity: number }) {
  switch (kind) {
    case 'clock': return <AlarmClock intensity={intensity} />;
    case 'crib': return <BabyCrib intensity={intensity} />;
    case 'ceiling': return <CeilingThoughts intensity={intensity} />;
    case 'morning_door': return <MorningDoor />;
    case 'sunrise': return <WarmSunrise />;
    default: return null;
  }
}

function AlarmClock({ intensity }: { intensity: number }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 180 }}>
      {/* 침대 옆 협탁 */}
      <div style={{ position: 'absolute', bottom: 0, left: -30, right: -30, height: 24, background: '#1a1418', borderRadius: 4 }} />
      {/* 알람 시계 (디지털) */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        width: 130, height: 70, background: '#0a0a10', borderRadius: 8,
        border: '2px solid #2a2230', boxShadow: '0 0 24px rgba(255,80,80,0.35)',
      }}>
        <motion.div
          animate={{ opacity: [1, 0.85, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 8, background: '#1a0a0a', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ff3a3a', fontFamily: 'monospace', fontSize: 28, fontWeight: 700,
            letterSpacing: 4, textShadow: '0 0 12px rgba(255,60,60,0.7)',
          }}>
          03:14
        </motion.div>
      </div>
      {/* 침대 모서리 (이불) */}
      <div style={{
        position: 'absolute', bottom: 0, left: -90, width: 80, height: 50,
        background: 'linear-gradient(180deg,#3a4060 0%,#1a1e30 100%)',
        borderRadius: '14px 4px 0 0',
      }} />
      {/* 흩어진 베개 */}
      <div style={{
        position: 'absolute', bottom: 22, left: -76, width: 50, height: 22,
        background: '#e8e0d8', borderRadius: 8, transform: 'rotate(-8deg)',
      }} />
      {/* 천천히 도는 빛 (알람 글로우) */}
      <div style={{
        position: 'absolute', inset: -18, background: 'radial-gradient(ellipse at 50% 60%, rgba(255,80,80,0.25) 0%, transparent 65%)',
        filter: 'blur(8px)', zIndex: -1,
      }} />
    </div>
  );
}

function BabyCrib({ intensity }: { intensity: number }) {
  return (
    <div style={{ position: 'relative', width: 240, height: 200 }}>
      {/* 침대 바닥 그림자 */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 12, background: 'rgba(0,0,0,0.4)', borderRadius: 6, filter: 'blur(4px)' }} />
      {/* 크립 베이스 */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 220, height: 130, background: 'linear-gradient(180deg,#5a4030 0%,#2a1c14 100%)',
        borderRadius: 8, border: '2px solid #3a2820',
      }}>
        {/* 살창 */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 8, bottom: 8, width: 4,
            left: 12 + i * 25, background: '#3a2820', borderRadius: 2,
          }} />
        ))}
        {/* 이불 + 아기 실루엣 */}
        <div style={{
          position: 'absolute', bottom: 8, left: 12, right: 12, height: 50,
          background: 'linear-gradient(180deg,#f8dde0 0%,#d8a8b0 100%)',
          borderRadius: '24px 24px 4px 4px',
        }} />
        {/* 아기 머리 */}
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(180deg,#fde0c8 0%,#e0b898 100%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}>
          {/* 눈물 */}
          <motion.div
            animate={{ opacity: [0, 1, 0], y: [0, 8, 12] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ position: 'absolute', top: 14, left: 8, width: 3, height: 5, background: 'rgba(140,200,255,0.85)', borderRadius: 2 }} />
        </motion.div>
      </div>
      {/* 울음 음표/하트 (방사) */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div key={i}
          animate={{ y: [-2, -34], opacity: [0, 0.9, 0], scale: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.55 }}
          style={{
            position: 'absolute', top: 20, left: `${30 + i * 25}%`,
            color: '#ffb8c8', fontSize: 16, textShadow: '0 0 10px rgba(255,150,180,0.6)',
          }}>
          ♪
        </motion.div>
      ))}
      {/* 무드등 글로우 */}
      <div style={{
        position: 'absolute', inset: -16, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,180,200,0.32) 0%, transparent 70%)',
        filter: 'blur(10px)', zIndex: -1,
      }} />
    </div>
  );
}

function CeilingThoughts({ intensity }: { intensity: number }) {
  return (
    <div style={{ position: 'relative', width: 260, height: 220 }}>
      {/* 침대 (위에서 살짝 보이는) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
        background: 'linear-gradient(180deg,#3a4060 0%,#1a1e30 100%)',
        borderRadius: '14px 14px 0 0',
      }} />
      {/* 베개 */}
      <div style={{
        position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
        width: 90, height: 30, background: '#e8e0d8', borderRadius: 14,
      }} />
      {/* 생각 풍선 (자기비난 루프) */}
      <motion.div
        animate={{ y: [0, -4, 0], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 200, padding: '10px 14px',
          background: 'rgba(255,255,255,0.92)', color: '#1a1a22',
          borderRadius: 18, fontSize: 11, fontWeight: 600, textAlign: 'center',
          boxShadow: '0 4px 18px rgba(140,170,220,0.4)',
        }}>
        "내가 잘 하고 있는 걸까?"
        <div style={{
          position: 'absolute', bottom: -8, left: '40%', width: 14, height: 14,
          background: 'rgba(255,255,255,0.92)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -16, left: '32%', width: 8, height: 8,
          background: 'rgba(255,255,255,0.92)', borderRadius: '50%',
        }} />
      </motion.div>
      {/* 회전 화살표 (루프 표시) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
          width: 60, height: 60, borderRadius: '50%',
          border: '2px dashed rgba(200,184,138,0.5)',
        }} />
    </div>
  );
}

function MorningDoor() {
  return (
    <div style={{ position: 'relative', width: 200, height: 240 }}>
      {/* 문틀 */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 140, height: 220, background: 'linear-gradient(180deg,#6a4a30 0%,#3a2818 100%)',
        borderRadius: '8px 8px 0 0', border: '3px solid #3a2818',
      }}>
        {/* 문 (살짝 열린) */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -25 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 6, background: 'linear-gradient(180deg,#8a6a4a 0%,#4a3220 100%)',
            borderRadius: 6, transformOrigin: 'left center',
            boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
          }}>
          <div style={{
            position: 'absolute', top: '50%', right: 8, width: 6, height: 6,
            background: '#f0d78c', borderRadius: '50%',
          }} />
        </motion.div>
        {/* 햇살 새어들어옴 */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: 'absolute', top: 30, right: -40, width: 80, height: 160,
            background: 'linear-gradient(225deg, rgba(255,220,160,0.85) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }} />
        {/* 아이 실루엣 (작은) */}
        <motion.div
          initial={{ y: 6 }}
          animate={{ y: [6, -2, 6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: 10, right: -20, width: 36, height: 60,
            background: 'linear-gradient(180deg,#fde0c8 0%,#3a2818 80%)',
            borderRadius: '18px 18px 4px 4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
          {/* 작은 머리 */}
          <div style={{
            position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
            width: 22, height: 22, borderRadius: '50%',
            background: 'linear-gradient(180deg,#fde0c8 0%,#e0b898 100%)',
          }} />
        </motion.div>
      </div>
    </div>
  );
}

function WarmSunrise() {
  return (
    <div style={{ position: 'relative', width: 240, height: 200 }}>
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200,
          background: 'radial-gradient(circle at 50% 70%, rgba(255,220,170,0.95) 0%, rgba(255,180,120,0.55) 35%, transparent 70%)',
          filter: 'blur(4px)',
        }} />
      {/* 지평선 */}
      <div style={{
        position: 'absolute', bottom: 0, left: -20, right: -20, height: 4,
        background: 'linear-gradient(90deg, transparent, rgba(255,210,160,0.9), transparent)',
      }} />
      {/* 따뜻한 메시지 */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: 2, opacity: 0.85,
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}>
        ◇  새로운 하루  ◇
      </div>
    </div>
  );
}
