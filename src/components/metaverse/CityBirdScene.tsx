import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Activity, Eye, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Compass, Volume2, VolumeX,
} from 'lucide-react';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';
import { useGameAudio } from '@/hooks/useGameAudio';

/**
 * CityBirdScene — "도시를 나는 새" 자유비행 챕터
 *
 *  • 와이드 하늘 월드 (컨테이너 2.6배), 카메라가 새를 중앙에 유지
 *  • 새 캐릭터는 X·Y 모두 자유 이동 (←/→/↑/↓ 또는 D-pad 4방향)
 *  • 8개 랜드마크를 3중 패럴랙스(원경 산맥 → 중경 빌딩 → 근경 마천루)에 배치
 *  • 장면별로 다른 랜드마크가 활성화되어 빛기둥과 함께 도착 지점 표시
 *  • FX(구름·먼지·바람결·번개)는 cfg.intensity 단계로 부드럽게 변화
 *  • 카드 접힘과 새의 퇴장/입장은 EXIT_MS 프레임으로 동기화
 */

const EXIT_MS = 850;

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

type LandmarkKind =
  | 'rooftop' | 'river' | 'tower' | 'palace'
  | 'market' | 'park' | 'skyline' | 'horizon';

interface SceneCfg {
  stopPctX: number;
  stopPctY: number; // 0=top, 100=bottom
  startPctX: number;
  startPctY: number;
  landmark: LandmarkKind;
  bgA: string;
  bgB: string;
  haze: string;
  intensity: number;
  label: string;
  /** 'dawn' | 'sky' | 'sunset' | 'night' */
  mood: 'dawn' | 'sky' | 'sunset' | 'night';
  /** 가벼운 번개·바람 강화 */
  storm?: boolean;
}

// 새벽 → 한낮 → 노을 → 밤 시각의 흐름
const SCENES: Record<string, SceneCfg> = {
  cb_takeoff: { stopPctX: 18, stopPctY: 45, startPctX: 8,  startPctY: 70, landmark: 'rooftop',
    bgA: '#fde3c2', bgB: '#f5a978', haze: 'rgba(255,210,160,0.30)', intensity: 0.35,
    label: '01 · 옥상 06:12',  mood: 'dawn' },
  cb_river:   { stopPctX: 36, stopPctY: 62, startPctX: 22, startPctY: 50, landmark: 'river',
    bgA: '#c7e6f5', bgB: '#7ec0e0', haze: 'rgba(210,235,255,0.32)', intensity: 0.40,
    label: '02 · 한강',         mood: 'sky' },
  cb_tower:   { stopPctX: 52, stopPctY: 38, startPctX: 40, startPctY: 55, landmark: 'tower',
    bgA: '#aed5ee', bgB: '#5a9cc8', haze: 'rgba(220,230,245,0.28)', intensity: 0.55,
    label: '03 · 남산',         mood: 'sky' },
  cb_palace:  { stopPctX: 64, stopPctY: 58, startPctX: 56, startPctY: 45, landmark: 'palace',
    bgA: '#f3d8a0', bgB: '#d4986a', haze: 'rgba(255,210,160,0.30)', intensity: 0.45,
    label: '04 · 광화문',       mood: 'sky' },
  cb_market:  { stopPctX: 50, stopPctY: 70, startPctX: 68, startPctY: 50, landmark: 'market',
    bgA: '#ffd9a8', bgB: '#f59060', haze: 'rgba(255,200,150,0.35)', intensity: 0.55,
    label: '05 · 광장시장',     mood: 'sunset' },
  cb_park:    { stopPctX: 38, stopPctY: 52, startPctX: 54, startPctY: 65, landmark: 'park',
    bgA: '#f4c39a', bgB: '#d97a78', haze: 'rgba(255,180,150,0.30)', intensity: 0.40,
    label: '06 · 서울숲',       mood: 'sunset' },
  cb_night:   { stopPctX: 72, stopPctY: 42, startPctX: 42, startPctY: 55, landmark: 'skyline',
    bgA: '#1a2238', bgB: '#0a0e1c', haze: 'rgba(140,170,230,0.25)', intensity: 0.70,
    label: '07 · 20:47 도심',  mood: 'night',  storm: true },
  cb_end:     { stopPctX: 50, stopPctY: 50, startPctX: 50, startPctY: 60, landmark: 'horizon',
    bgA: '#fec98a', bgB: '#f48070', haze: 'rgba(255,210,170,0.40)', intensity: 0.20,
    label: '에필로그 · 마음의 지도', mood: 'sunset' },
};

const WORLD_FACTOR = 2.6;
const SKY_FACTOR_Y = 1.5;
const ARRIVE_THRESHOLD = 56;
const STEP_PX = 30;
const HOLD_SPEED = 8;
const TOTAL_SCENES = 8;

export default function CityBirdScene({
  currentScene, gameState, onArrive, sceneIndex,
  onChoiceSelect, displayedText, selectedChoice, showParentNotes,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [viewW, setViewW] = useState(0);
  const [viewH, setViewH] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [tension, setTension] = useState(30);
  const [heart, setHeart] = useState(72);
  const [audioOn, setAudioOn] = useState(false);
  const heldX = useRef<0 | 1 | -1>(0);
  const heldY = useRef<0 | 1 | -1>(0);
  const heldRaf = useRef<number | null>(null);
  const arrivedFired = useRef(false);

  const cfg = useMemo<SceneCfg>(
    () => (currentScene ? SCENES[currentScene.id] ?? SCENES.cb_takeoff : SCENES.cb_takeoff),
    [currentScene]
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => { setViewW(el.clientWidth); setViewH(el.clientHeight); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const worldW = viewW * WORLD_FACTOR;
  const worldH = viewH * SKY_FACTOR_Y;
  const targetX = useMemo(() => (worldW * cfg.stopPctX) / 100, [worldW, cfg.stopPctX]);
  const targetY = useMemo(() => (worldH * cfg.stopPctY) / 100, [worldH, cfg.stopPctY]);

  useEffect(() => {
    arrivedFired.current = false;
    setArrived(false);
    if (worldW > 0) setPosX((worldW * cfg.startPctX) / 100);
    if (worldH > 0) setPosY((worldH * cfg.startPctY) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, currentScene?.id, worldW, worldH]);

  useEffect(() => {
    if (selectedChoice || worldW === 0) return;
    const dx = posX - targetX;
    const dy = posY - targetY;
    const dist = Math.hypot(dx, dy);
    if (dist <= ARRIVE_THRESHOLD) {
      if (!arrived) setArrived(true);
      if (gameState === 'exploring' && !arrivedFired.current) {
        arrivedFired.current = true;
        onArrive(sceneIndex);
      }
    } else if (arrived) setArrived(false);
  }, [posX, posY, targetX, targetY, worldW, gameState, sceneIndex, onArrive, selectedChoice, arrived]);

  useEffect(() => {
    if (gameState === 'narrating' || gameState === 'choice') {
      const base = 28 + Math.round(cfg.intensity * 50);
      setTension(base);
      setHeart(70 + Math.round(cfg.intensity * 45));
      const id = setInterval(() => {
        setTension((v) => Math.min(99, v + Math.random() * 1.1));
        setHeart((v) => Math.min(150, v + (Math.random() > 0.6 ? 1 : 0)));
      }, 420);
      return () => clearInterval(id);
    }
  }, [gameState, cfg.intensity, sceneIndex]);

  /* ============== 오디오 (하이브리드) — classic_quiet 톤을 기본으로 ============== */
  const audio = useGameAudio({
    theme: 'city_bird',
    intensity: cfg.intensity,
    reduceMotion: prefersReducedMotion,
    muted: !audioOn,
  });
  useEffect(() => { audio.setMuted(!audioOn); }, [audioOn, audio]);
  useEffect(() => {
    if (gameState === 'exploring' || gameState === 'narrating') audio.playSfx('arrive');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex]);

  const handleChoice = useCallback((scene: StoryScene, choice: StoryChoice) => {
    audio.playSfx('select');
    onChoiceSelect(scene, choice);
  }, [audio, onChoiceSelect]);

  const canMove = !selectedChoice && gameState !== 'result' && worldW > 0;

  const clampX = useCallback((n: number) => Math.max(40, Math.min(worldW - 40, n)), [worldW]);
  const clampY = useCallback((n: number) => Math.max(40, Math.min(worldH - 40, n)), [worldH]);

  useEffect(() => {
    if (!canMove) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { e.preventDefault(); setPosX((v) => clampX(v - STEP_PX)); }
      else if (k === 'arrowright' || k === 'd') { e.preventDefault(); setPosX((v) => clampX(v + STEP_PX)); }
      else if (k === 'arrowup' || k === 'w') { e.preventDefault(); setPosY((v) => clampY(v - STEP_PX)); }
      else if (k === 'arrowdown' || k === 's') { e.preventDefault(); setPosY((v) => clampY(v + STEP_PX)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canMove, clampX, clampY]);

  const startHold = useCallback((dx: 0 | 1 | -1, dy: 0 | 1 | -1) => {
    if (!canMove) return;
    heldX.current = dx; heldY.current = dy;
    const loop = () => {
      if (!heldX.current && !heldY.current) return;
      setPosX((v) => clampX(v + heldX.current * HOLD_SPEED));
      setPosY((v) => clampY(v + heldY.current * HOLD_SPEED));
      heldRaf.current = requestAnimationFrame(loop);
    };
    loop();
  }, [canMove, clampX, clampY]);
  const endHold = useCallback(() => {
    heldX.current = 0; heldY.current = 0;
    if (heldRaf.current) cancelAnimationFrame(heldRaf.current);
    heldRaf.current = null;
  }, []);
  useEffect(() => () => endHold(), [endHold]);

  if (!currentScene) {
    return <div ref={containerRef} className="w-full h-full bg-black rounded-2xl" />;
  }

  const isEnding = currentScene.id === 'cb_end';

  // 카메라: X는 캐릭터 중심, Y도 살짝 따라감(70% 보간)
  const camX = Math.max(0, Math.min(worldW - viewW, posX - viewW / 2));
  const camY = Math.max(0, Math.min(worldH - viewH, posY - viewH / 2));
  const birdScreenX = posX - camX;
  const birdScreenY = posY - camY;
  const landmarkScreenX = targetX - camX;
  const landmarkScreenY = targetY - camY;

  const goingRight = targetX >= posX;
  const exiting = !!selectedChoice;
  const flapping = (heldX.current !== 0 || heldY.current !== 0) || exiting;

  const fxScale = prefersReducedMotion ? 0 : Math.max(0.2, cfg.intensity);
  const exitSec = EXIT_MS / 1000;

  // 카드 열림 시 랜드마크가 카드에 가리지 않도록 살짝 위로 올림
  const landmarkLift = arrived && gameState === 'choice' && !selectedChoice ? -70 : 0;

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl select-none"
      style={{ background: `linear-gradient(180deg, ${cfg.bgA} 0%, ${cfg.bgB} 100%)` }}
    >
      {/* ===== Sky gradient overlay + 태양/달 ===== */}
      <SunMoon mood={cfg.mood} />

      {/* ===== Parallax: 원경 산 (가장 천천히) ===== */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translate(${-camX * 0.12}px, ${-camY * 0.06}px)` }}
      >
        <FarMountains worldW={worldW || viewW} haze={cfg.haze} mood={cfg.mood} />
      </div>

      {/* 중경 클라우드 레이어 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translate(${-camX * 0.3}px, ${-camY * 0.15}px)` }}
      >
        <CloudLayer worldW={worldW || viewW} count={6} opacity={0.7} mood={cfg.mood} seedOffset={0} />
      </div>

      {/* 중근경 도시 스카이라인 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translate(${-camX * 0.55}px, ${-camY * 0.3}px)` }}
      >
        <CityBuildings worldW={worldW || viewW} mood={cfg.mood} />
      </div>

      {/* 근경 클라우드 (빠른 패럴랙스) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translate(${-camX * 0.85}px, ${-camY * 0.5}px)` }}
      >
        <CloudLayer worldW={worldW || viewW} count={4} opacity={0.85} mood={cfg.mood} seedOffset={7} large />
      </div>

      {/* 바람결 라인 */}
      {fxScale > 0 && <WindStreaks fxScale={fxScale} mood={cfg.mood} />}

      {/* 번개 (밤·storm) */}
      {cfg.storm && fxScale > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(220,235,255,0.45)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.6 * fxScale, 0, 0.25 * fxScale, 0] }}
          transition={{ duration: 12, repeat: Infinity, times: [0, 0.72, 0.73, 0.75, 0.76, 1] }}
        />
      )}

      {/* ===== 랜드마크 (현재 장면의 도착 지점) ===== */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: landmarkScreenX, top: landmarkScreenY + landmarkLift,
          transform: 'translate(-50%, -50%)',
          transition: 'top 520ms cubic-bezier(0.2,0.7,0.2,1)',
        }}
      >
        <Landmark kind={cfg.landmark} active={arrived} />
      </div>

      {/* 가이드 빛기둥 */}
      {!arrived && !selectedChoice && viewW > 0 && (
        <GoldenBeacon screenX={landmarkScreenX} screenY={landmarkScreenY} />
      )}

      {/* ===== 새 캐릭터 ===== */}
      <motion.div
        className="absolute z-10"
        animate={{
          left: exiting ? viewW + 240 : birdScreenX,
          top: birdScreenY,
        }}
        transition={{
          duration: exiting ? exitSec : 0.22,
          ease: exiting ? 'easeIn' : 'linear',
        }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <BirdCharacter flapping={flapping} facingLeft={!goingRight} mood={cfg.mood} />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 36%, rgba(0,0,0,0.55) 100%)' }} />

      {/* HUD */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between text-[10px] font-mono tracking-widest text-[#C8B88A] z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/15">
          <Compass className="w-2.5 h-2.5" />
          {cfg.label}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/15">
            <Activity className="w-2.5 h-2.5" />
            <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full"
                style={{ background: tension > 75 ? 'linear-gradient(90deg,#C8B88A,#ef4444)' : 'linear-gradient(90deg,#C8B88A,#10b981)' }}
                animate={{ width: `${tension}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span className="tabular-nums">{Math.round(tension)}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/15">
            <motion.span animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: Math.max(0.4, 60 / heart), repeat: Infinity }}
              className="inline-block w-1 h-1 rounded-full bg-rose-400" />
            <span className="tabular-nums">{heart}</span>
          </div>
          <button
            onClick={() => setAudioOn((v) => !v)}
            className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur border border-white/15 active:scale-95 transition"
            aria-label={audioOn ? '환경음 끄기' : '환경음 켜기'}
          >
            {audioOn ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* 미니맵 */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-2 py-1 rounded-full bg-black/55 backdrop-blur border border-white/15 flex items-center gap-1.5">
          <div className="relative w-32 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="absolute top-0 bottom-0 bg-[#C8B88A]/85"
              style={{ left: 0, width: `${(posX / Math.max(1, worldW)) * 100}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C8B88A] ring-1 ring-black/40"
              style={{ left: `calc(${cfg.stopPctX}% - 3px)` }} />
          </div>
          <span className="text-[9px] font-mono text-[#C8B88A] tabular-nums">
            {String(sceneIndex + 1).padStart(2, '0')}/{String(TOTAL_SCENES).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 가이드 토스트 */}
      {!arrived && !selectedChoice && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-[58px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-[#C8B88A]/45 text-[10px] text-[#C8B88A] tracking-wider flex items-center gap-1.5">
            <span className="animate-pulse">●</span>
            금색 신호까지 자유롭게 비행
            {goingRight ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </div>
        </motion.div>
      )}

      {/* Narration */}
      {arrived && (gameState === 'narrating' || gameState === 'choice') && (
        <div className="absolute top-[58px] left-2 right-2 z-20 pointer-events-none">
          <motion.div key={currentScene.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-[480px] rounded-lg bg-black/65 backdrop-blur-md border border-white/15 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-[#C8B88A] uppercase shrink-0">
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

      {/* D-pad 4방향 */}
      {canMove && (
        <>
          <div className="absolute bottom-[180px] left-2 z-20 pointer-events-none">
            <div className="relative w-[120px] h-[120px]">
              <button onPointerDown={(e) => { e.preventDefault(); startHold(0, -1); }}
                onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                aria-label="위로"
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-auto w-11 h-11 rounded-full bg-black/65 backdrop-blur border border-white/20 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg">
                <ChevronUp className="w-6 h-6" />
              </button>
              <button onPointerDown={(e) => { e.preventDefault(); startHold(0, 1); }}
                onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                aria-label="아래로"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-auto w-11 h-11 rounded-full bg-black/65 backdrop-blur border border-white/20 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg">
                <ChevronDown className="w-6 h-6" />
              </button>
              <button onPointerDown={(e) => { e.preventDefault(); startHold(-1, 0); }}
                onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                aria-label="왼쪽으로"
                className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-auto w-11 h-11 rounded-full bg-black/65 backdrop-blur border border-white/20 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onPointerDown={(e) => { e.preventDefault(); startHold(1, 0); }}
                onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
                aria-label="오른쪽으로"
                className="absolute top-1/2 -translate-y-1/2 right-0 pointer-events-auto w-11 h-11 rounded-full bg-black/65 backdrop-blur border border-white/20 flex items-center justify-center text-[#C8B88A] active:scale-90 active:bg-[#C8B88A]/20 transition-transform shadow-lg">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Choice cards */}
      <AnimatePresence mode="wait">
        {arrived && gameState === 'choice' && !isEnding && !selectedChoice && (
          <motion.div key={`c-${currentScene.id}`}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0, scaleY: 0.6, height: 0 }}
            transition={{ duration: exitSec, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'bottom center', overflow: 'hidden' }}
            className="absolute bottom-3 right-2 left-[140px] z-30">
            <div className="mb-1.5 text-center text-[10px] font-mono tracking-[0.2em] text-[#C8B88A] uppercase flex items-center justify-center gap-1.5">
              <Eye className="w-3 h-3" /> 이 풍경 위에서의 나
            </div>
            <div className="flex flex-col gap-1.5">
              {currentScene.choices.map((c, i) => (
                <motion.button key={c.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  onClick={() => handleChoice(currentScene, c)}
                  className="w-full text-left rounded-xl px-3 py-2.5 backdrop-blur-md border transition-colors bg-black/65 border-white/15 hover:bg-black/80 hover:border-[#C8B88A]/55 text-white/95">
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-black/50 border border-white/15 flex items-center justify-center text-base">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono tracking-widest text-[#C8B88A]">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[13px] leading-snug break-keep">{c.text}</div>
                      {showParentNotes && c.parentNote && (
                        <div className="mt-0.5 text-[10px] text-amber-200/85 italic break-keep">
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
            className="absolute inset-0 bg-[#C8B88A]/15 pointer-events-none z-30" />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ====================== 그래픽 구성요소 ====================== */

function SunMoon({ mood }: { mood: SceneCfg['mood'] }) {
  if (mood === 'night') {
    return (
      <div className="absolute pointer-events-none" style={{ top: '10%', right: '12%' }}>
        <div style={{
          width: 70, height: 70, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #fdfaf0 0%, #c9c3a8 70%, transparent 100%)',
          boxShadow: '0 0 60px rgba(220,220,200,0.5)',
        }} />
      </div>
    );
  }
  const c = mood === 'dawn' ? 'rgba(255,210,150,0.95)'
        : mood === 'sunset' ? 'rgba(255,160,90,0.95)'
        : 'rgba(255,235,180,0.85)';
  return (
    <div className="absolute pointer-events-none" style={{ top: '12%', right: '14%' }}>
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          width: 90, height: 90, borderRadius: '50%',
          background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
          filter: 'blur(2px)',
        }} />
    </div>
  );
}

function FarMountains({ worldW, haze, mood }: { worldW: number; haze: string; mood: SceneCfg['mood'] }) {
  const tint = mood === 'night' ? '#1a2030' : mood === 'sunset' ? '#7d4a3a' : mood === 'dawn' ? '#c08a78' : '#88a8c0';
  return (
    <svg width={worldW} height="100%" viewBox={`0 0 ${worldW} 600`} preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="mtg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="0.55" />
          <stop offset="100%" stopColor={tint} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* 멀리 보이는 산맥 (간단한 폴리곤) */}
      <polygon
        fill="url(#mtg)"
        points={`0,520 ${worldW * 0.08},420 ${worldW * 0.18},460 ${worldW * 0.28},380 ${worldW * 0.38},430 ${worldW * 0.5},370 ${worldW * 0.6},420 ${worldW * 0.72},360 ${worldW * 0.82},410 ${worldW * 0.92},390 ${worldW},440 ${worldW},600 0,600`}
      />
      <rect x={0} y={0} width={worldW} height={600} fill={haze} />
    </svg>
  );
}

function CityBuildings({ worldW, mood }: { worldW: number; mood: SceneCfg['mood'] }) {
  const dark = mood === 'night' ? '#0c1224' : mood === 'sunset' ? '#3a2230' : mood === 'dawn' ? '#5a4a4a' : '#36506a';
  const lit = mood === 'night';
  // 결정론적 빌딩 배치
  const buildings = useMemo(() => {
    const arr: { x: number; w: number; h: number; windows: number }[] = [];
    let x = 0;
    let s = 1;
    while (x < worldW) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      const w = 36 + Math.floor(r * 70);
      const h = 90 + Math.floor(((s >> 3) % 1000) / 1000 * 240);
      arr.push({ x, w, h, windows: Math.floor(h / 22) });
      x += w + 6 + Math.floor(r * 16);
    }
    return arr;
  }, [worldW]);

  return (
    <svg width={worldW} height="100%" viewBox={`0 0 ${worldW} 600`} preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0 }}>
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={600 - b.h} width={b.w} height={b.h} fill={dark} />
          {/* 창문 */}
          {Array.from({ length: b.windows }).map((_, wi) => {
            const seed = (b.x * 31 + wi * 17) % 100;
            const on = lit ? seed > 35 : false;
            return (
              <rect key={wi}
                x={b.x + 6} y={600 - b.h + 10 + wi * 18}
                width={b.w - 12} height={6}
                fill={on ? '#ffd87a' : (mood === 'night' ? '#1a2236' : 'rgba(255,255,255,0.18)')}
                opacity={on ? 0.85 : 0.5} />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

function CloudLayer({
  worldW, count, opacity, mood, seedOffset = 0, large = false,
}: { worldW: number; count: number; opacity: number; mood: SceneCfg['mood']; seedOffset?: number; large?: boolean }) {
  const tint = mood === 'night' ? 'rgba(180,200,230,0.35)' : mood === 'sunset' ? 'rgba(255,220,200,0.85)' : 'rgba(255,255,255,0.9)';
  const clouds = useMemo(() => {
    const arr: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < count; i++) {
      const s = ((i + seedOffset + 1) * 9301 + 49297) % 233280;
      const r1 = s / 233280;
      const r2 = ((s >> 4) % 1000) / 1000;
      arr.push({
        x: (worldW / count) * i + r1 * 80,
        y: 40 + r2 * 220,
        w: (large ? 200 : 130) + r1 * 100,
        h: (large ? 50 : 38) + r2 * 22,
      });
    }
    return arr;
  }, [worldW, count, seedOffset, large]);

  return (
    <svg width={worldW} height="100%" style={{ position: 'absolute', inset: 0 }}>
      {clouds.map((c, i) => (
        <g key={i} opacity={opacity}>
          <ellipse cx={c.x} cy={c.y} rx={c.w / 2} ry={c.h / 2} fill={tint} />
          <ellipse cx={c.x + c.w * 0.18} cy={c.y - c.h * 0.2} rx={c.w * 0.34} ry={c.h * 0.55} fill={tint} />
          <ellipse cx={c.x - c.w * 0.2} cy={c.y + c.h * 0.1} rx={c.w * 0.3} ry={c.h * 0.5} fill={tint} />
        </g>
      ))}
    </svg>
  );
}

function WindStreaks({ fxScale, mood }: { fxScale: number; mood: SceneCfg['mood'] }) {
  const color = mood === 'night' ? 'rgba(180,200,230,0.35)' : 'rgba(255,255,255,0.55)';
  const count = Math.round(8 * fxScale) + 4;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i}
          initial={{ x: '-12%', opacity: 0 }}
          animate={{ x: '112%', opacity: [0, 0.85, 0] }}
          transition={{ duration: 1.6 + Math.random() * 1.2, repeat: Infinity, delay: i * 0.18, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: `${(i * 17 + 6) % 92}%`,
            width: 60 + Math.random() * 80, height: 1.2,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            filter: 'blur(0.4px)',
          }} />
      ))}
    </div>
  );
}

function GoldenBeacon({ screenX, screenY }: { screenX: number; screenY: number }) {
  return (
    <div className="absolute pointer-events-none z-[5]" style={{ left: screenX, top: screenY, transform: 'translate(-50%, -50%)' }}>
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,184,138,0.55) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }} />
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8, height: 8, borderRadius: '50%',
          background: '#fde8a8',
          boxShadow: '0 0 24px rgba(255,220,150,0.95)',
        }} />
    </div>
  );
}

function Landmark({ kind, active }: { kind: LandmarkKind; active: boolean }) {
  const baseStyle: React.CSSProperties = {
    fontSize: 48, lineHeight: 1, filter: active ? 'drop-shadow(0 4px 18px rgba(255,220,150,0.7))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
    transition: 'transform 320ms, filter 320ms',
    transform: active ? 'scale(1.18)' : 'scale(1)',
  };
  const icon = {
    rooftop: '🏙️', river: '🌊', tower: '🗼', palace: '🏯',
    market: '🏮', park: '🌳', skyline: '🌃', horizon: '🌅',
  }[kind];
  const label = {
    rooftop: '옥상', river: '한강', tower: '남산', palace: '광화문',
    market: '광장시장', park: '서울숲', skyline: '도심 야경', horizon: '에필로그',
  }[kind];
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={baseStyle}>{icon}</div>
      <div style={{
        marginTop: 4, fontSize: 9, fontFamily: 'monospace', letterSpacing: 2,
        color: '#fff8e0', textShadow: '0 1px 4px rgba(0,0,0,0.7)', opacity: active ? 1 : 0.7,
      }}>
        {label}
      </div>
    </div>
  );
}

function BirdCharacter({ flapping, facingLeft, mood }: { flapping: boolean; facingLeft: boolean; mood: SceneCfg['mood'] }) {
  const wingDur = flapping ? 0.18 : 0.6;
  const bodyA = mood === 'night' ? '#1a2236' : '#36506a';
  const bodyB = mood === 'night' ? '#0a0e1c' : '#1a2638';
  const wing = mood === 'night' ? '#2a3450' : '#5a708a';
  const accent = '#C8B88A';
  return (
    <div style={{ position: 'relative', width: 70, height: 50, transform: facingLeft ? 'scaleX(-1)' : 'none' }}>
      {/* 몸통 */}
      <div style={{
        position: 'absolute', left: 18, top: 16, width: 38, height: 22, borderRadius: '50%',
        background: `linear-gradient(135deg, ${bodyA} 0%, ${bodyB} 100%)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }} />
      {/* 머리 */}
      <div style={{
        position: 'absolute', left: 44, top: 10, width: 22, height: 22, borderRadius: '50%',
        background: `linear-gradient(135deg, ${bodyA} 0%, ${bodyB} 100%)`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
      }}>
        {/* 눈 */}
        <div style={{ position: 'absolute', top: 7, right: 5, width: 4, height: 4, borderRadius: '50%', background: '#fff' }}>
          <div style={{ position: 'absolute', top: 1, right: 0, width: 2, height: 2, borderRadius: '50%', background: '#0a0a0a' }} />
        </div>
        {/* 부리 */}
        <div style={{ position: 'absolute', top: 11, right: -6, width: 10, height: 5, background: accent, clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
      </div>
      {/* 날개 (위/아래로 플랩) */}
      <motion.div
        animate={flapping ? { rotate: [-32, 18, -32] } : { rotate: [-6, 4, -6] }}
        transition={{ duration: wingDur, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', left: 22, top: 8, width: 36, height: 16,
          borderRadius: '60% 30% 50% 30%',
          background: `linear-gradient(180deg, ${wing} 0%, ${bodyB} 100%)`,
          transformOrigin: 'right center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }} />
      {/* 꼬리 */}
      <div style={{
        position: 'absolute', left: 6, top: 22, width: 20, height: 10,
        background: wing, clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
      }} />
      {/* 비행 그림자 (아래) */}
      <div style={{
        position: 'absolute', bottom: -18, left: 18, width: 38, height: 6, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
        filter: 'blur(2px)',
      }} />
    </div>
  );
}
