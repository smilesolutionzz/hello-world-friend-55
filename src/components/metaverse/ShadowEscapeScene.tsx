import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

/**
 * ShadowEscapeScene — Playable 2.5D side-scroll runner.
 *
 * - Character (실루엣) walks left/right via keyboard (A/D, ←/→) or on-screen buttons.
 * - A shadow chaser slowly closes from the left; reaching the player resets position (no game-over).
 * - Each scene narration plays as an overlay, then 2-3 portal doors appear along the corridor.
 *   Walking the character INTO a portal selects that choice.
 * - Parallax background, vignette, footstep dust, heartbeat HUD.
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

const sceneMood: Record<string, { from: string; to: string; intensity: number; label: string; floor: string }> = {
  first_sound: { from: '#0a0a0f', to: '#161624', intensity: 0.35, label: '01 · 첫 신호',     floor: '#1a1a26' },
  alley:       { from: '#0b0d18', to: '#1a1430', intensity: 0.55, label: '02 · 갈림길',     floor: '#1a142a' },
  door:        { from: '#08070c', to: '#1c0c0c', intensity: 0.85, label: '03 · 임계점',     floor: '#1a0c0c' },
  reveal:      { from: '#1a1408', to: '#2a1f0a', intensity: 0.20, label: '04 · 해소',       floor: '#241a0c' },
  ending:      { from: '#0a0f1a', to: '#1a2030', intensity: 0.10, label: '에필로그',       floor: '#1a2030' },
};

const WORLD_WIDTH = 2400;        // logical horizontal length
const PLAYER_SPEED = 280;        // px/sec
const CHASER_BASE_SPEED = 60;    // px/sec
const PLAYER_START_X = 280;
const PORTAL_TRIGGER_DIST = 70;

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
  const [viewport, setViewport] = useState({ w: 800, h: 480 });

  const [playerX, setPlayerX] = useState(PLAYER_START_X);
  const [chaserX, setChaserX] = useState(40);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);

  const [tension, setTension] = useState(35);
  const [heart, setHeart] = useState(74);

  // input state via refs (no rerenders)
  const keys = useRef({ left: false, right: false });
  const rafRef = useRef<number | null>(null);
  const lastT = useRef<number>(0);
  const portalLockedRef = useRef(false);

  const mood = useMemo(() => {
    if (!currentScene) return sceneMood.first_sound;
    return sceneMood[currentScene.id] ?? sceneMood.first_sound;
  }, [currentScene]);

  // viewport measure
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setViewport({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // reset positions on scene change
  useEffect(() => {
    setPlayerX(PLAYER_START_X);
    setChaserX(40);
    setFacing('right');
    portalLockedRef.current = false;
  }, [sceneIndex, currentScene?.id]);

  // auto narration on scene mount
  useEffect(() => {
    if (gameState === 'exploring' && currentScene) {
      const t = setTimeout(() => onArrive(sceneIndex), 400);
      return () => clearTimeout(t);
    }
  }, [gameState, sceneIndex, currentScene, onArrive]);

  // heartbeat / tension rise
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

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // portal positions (computed once per scene)
  const portals = useMemo(() => {
    if (!currentScene) return [];
    const n = currentScene.choices.length;
    if (n === 0) return [];
    // distribute across the right half of the world
    const startX = 900;
    const span = WORLD_WIDTH - startX - 200;
    const step = n > 1 ? span / (n - 1) : 0;
    return currentScene.choices.map((c, i) => ({
      choice: c,
      x: startX + step * i,
    }));
  }, [currentScene]);

  // main loop
  useEffect(() => {
    const tick = (t: number) => {
      const dt = lastT.current ? Math.min(0.05, (t - lastT.current) / 1000) : 0;
      lastT.current = t;

      // movement allowed only in 'choice' (decision walk phase) or 'narrating' (let them roam slowly)
      const canMove = gameState === 'choice' || gameState === 'narrating';
      let walking = false;
      if (canMove && !portalLockedRef.current && !selectedChoice) {
        setPlayerX((x) => {
          let nx = x;
          if (keys.current.right) { nx += PLAYER_SPEED * dt; walking = true; setFacing('right'); }
          if (keys.current.left)  { nx -= PLAYER_SPEED * dt; walking = true; setFacing('left'); }
          nx = Math.max(80, Math.min(WORLD_WIDTH - 80, nx));
          return nx;
        });
      }
      setIsWalking(walking);

      // chaser closes in only during 'choice' (tension)
      if (gameState === 'choice' && !portalLockedRef.current) {
        setChaserX((cx) => {
          const speed = CHASER_BASE_SPEED + mood.intensity * 40;
          let nx = cx + speed * dt;
          // if catches up to player, push player forward and reset chaser
          if (nx > playerX - 60) {
            nx = Math.max(40, playerX - 220);
          }
          return nx;
        });
      } else if (gameState === 'narrating') {
        setChaserX((cx) => Math.max(40, cx - 20 * dt));
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastT.current = 0;
    };
  }, [gameState, mood.intensity, playerX, selectedChoice]);

  // portal collision
  useEffect(() => {
    if (gameState !== 'choice' || !currentScene || portalLockedRef.current || selectedChoice) return;
    for (const p of portals) {
      if (Math.abs(playerX - p.x) < PORTAL_TRIGGER_DIST) {
        portalLockedRef.current = true;
        onChoiceSelect(currentScene, p.choice);
        break;
      }
    }
  }, [playerX, portals, gameState, currentScene, onChoiceSelect, selectedChoice]);

  if (!currentScene) {
    return <div className="w-full h-full bg-black rounded-2xl" />;
  }

  // camera follows player horizontally
  const cameraX = Math.max(0, Math.min(WORLD_WIDTH - viewport.w, playerX - viewport.w * 0.4));
  const isReveal = currentScene.id === 'reveal' || currentScene.id === 'ending';
  const showPortals = gameState === 'choice' && !isReveal;
  const groundY = viewport.h - 90;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl select-none touch-none"
      style={{ background: `linear-gradient(180deg, ${mood.from} 0%, ${mood.to} 100%)` }}
    >
      {/* Parallax world (translated by camera) */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{ width: WORLD_WIDTH, transform: `translateX(${-cameraX}px)`, willChange: 'transform' }}
      >
        {/* far parallax — vertical pillars / corridor walls */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateX(0)' }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={`bg-${i}`}
              className="absolute bottom-0"
              style={{
                left: i * 180 + 40,
                width: 80,
                height: viewport.h * 0.6,
                background: `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 100%)`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* mid parallax — ground/floor strip */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: 0,
            height: 90,
            background: `linear-gradient(180deg, ${mood.floor} 0%, #000 100%)`,
            borderTop: '1px solid rgba(200,184,138,0.08)',
          }}
        />
        {/* floor tile marks */}
        {Array.from({ length: Math.ceil(WORLD_WIDTH / 60) }).map((_, i) => (
          <div
            key={`tile-${i}`}
            className="absolute"
            style={{
              left: i * 60,
              bottom: 88,
              width: 1,
              height: 6,
              background: 'rgba(200,184,138,0.10)',
            }}
          />
        ))}

        {/* spotlight pools every 320px */}
        {Array.from({ length: Math.ceil(WORLD_WIDTH / 320) }).map((_, i) => (
          <div
            key={`light-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: i * 320 + 100,
              bottom: 30,
              width: 220,
              height: 140,
              background:
                'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(200,184,138,0.18) 0%, transparent 70%)',
            }}
          />
        ))}

        {/* portals (choice doors) */}
        {showPortals &&
          portals.map((p, i) => (
            <motion.div
              key={p.choice.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="absolute"
              style={{ left: p.x - 60, bottom: 90, width: 120 }}
            >
              {/* doorframe */}
              <div
                className="relative mx-auto"
                style={{
                  width: 110,
                  height: 170,
                  background:
                    'linear-gradient(180deg, rgba(200,184,138,0.0) 0%, rgba(200,184,138,0.18) 60%, rgba(200,184,138,0.45) 100%)',
                  border: '1px solid rgba(200,184,138,0.4)',
                  borderBottom: 'none',
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 14,
                  boxShadow: '0 0 40px rgba(200,184,138,0.15), inset 0 0 30px rgba(200,184,138,0.12)',
                }}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="absolute inset-x-0 top-2 text-center text-[10px] font-mono tracking-widest text-[#C8B88A]"
                >
                  {String(i + 1).padStart(2, '0')}
                </motion.div>
                <div className="absolute inset-x-2 bottom-2 text-center text-[11px] text-white/85 leading-tight break-keep">
                  <span className="mr-1">{p.choice.emoji}</span>
                  {p.choice.text}
                </div>
              </div>
              {/* light pool under door */}
              <div
                className="mx-auto"
                style={{
                  width: 140,
                  height: 28,
                  marginTop: -4,
                  background:
                    'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(200,184,138,0.45) 0%, transparent 70%)',
                  filter: 'blur(2px)',
                }}
              />
              {showParentNotes && p.choice.parentNote && (
                <div className="mt-1 text-[10px] text-amber-200/70 italic text-center break-keep px-1">
                  → {p.choice.parentNote}
                </div>
              )}
            </motion.div>
          ))}

        {/* chaser shadow (only when not reveal) */}
        {!isReveal && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ left: chaserX - 80, bottom: 70 }}
            animate={{ opacity: gameState === 'choice' ? 0.95 : 0.5 }}
          >
            <div
              style={{
                width: 160,
                height: 220,
                background:
                  'radial-gradient(ellipse 55% 70% at 50% 55%, #000 0%, rgba(0,0,0,0.85) 55%, transparent 80%)',
                filter: 'blur(6px)',
              }}
            />
            <div
              className="mx-auto"
              style={{
                width: 90,
                height: 18,
                marginTop: -10,
                background:
                  'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.7) 0%, transparent 70%)',
                filter: 'blur(4px)',
              }}
            />
          </motion.div>
        )}

        {/* reveal dog */}
        {currentScene.id === 'reveal' && (
          <div
            className="absolute text-6xl"
            style={{ left: chaserX - 30, bottom: 92, filter: 'drop-shadow(0 6px 20px rgba(200,184,138,0.25))' }}
          >
            🐕
          </div>
        )}

        {/* player character (silhouette) */}
        <div
          className="absolute"
          style={{ left: playerX - 18, bottom: 86, width: 36, height: 64 }}
        >
          {/* body */}
          <motion.div
            animate={isWalking ? { y: [0, -2, 0] } : { y: 0 }}
            transition={{ duration: 0.32, repeat: isWalking ? Infinity : 0 }}
            style={{ transform: `scaleX(${facing === 'left' ? -1 : 1})` }}
            className="relative w-full h-full"
          >
            {/* head */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3.5 h-3.5 rounded-full bg-[#f6c08a]" />
            {/* torso */}
            <div className="absolute left-1/2 -translate-x-1/2 top-3.5 w-5 h-7 rounded-sm bg-[#ef4444]" />
            {/* legs (walk animation) */}
            <motion.div
              animate={isWalking ? { rotate: [-25, 25, -25] } : { rotate: 0 }}
              transition={{ duration: 0.32, repeat: isWalking ? Infinity : 0 }}
              className="absolute left-1/2 -translate-x-1/2 top-10 w-1.5 h-5 origin-top bg-[#1a1a1a]"
              style={{ transformOrigin: 'top center', marginLeft: -3 }}
            />
            <motion.div
              animate={isWalking ? { rotate: [25, -25, 25] } : { rotate: 0 }}
              transition={{ duration: 0.32, repeat: isWalking ? Infinity : 0 }}
              className="absolute left-1/2 -translate-x-1/2 top-10 w-1.5 h-5 origin-top bg-[#1a1a1a]"
              style={{ transformOrigin: 'top center', marginLeft: 1 }}
            />
          </motion.div>
          {/* shadow under feet */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -8,
              width: 40,
              height: 8,
              background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.6) 0%, transparent 70%)',
            }}
          />
          {/* dust on walk */}
          {isWalking && (
            <motion.div
              key={Math.floor(playerX / 30)}
              initial={{ opacity: 0.6, scale: 0.5, x: facing === 'right' ? -8 : 8 }}
              animate={{ opacity: 0, scale: 1.4, x: facing === 'right' ? -24 : 24 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 left-1/2 w-3 h-1 rounded-full bg-white/20"
            />
          )}
        </div>
      </div>

      {/* === Fixed overlays (HUD) === */}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* HUD top */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between text-[10px] font-mono tracking-widest text-[#C8B88A]/85 z-20">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/45 backdrop-blur border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8B88A] animate-pulse" />
          {mood.label}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/45 backdrop-blur border border-white/5">
            <Activity className="w-3 h-3" />
            <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
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

      {/* Narration (top center) */}
      {(gameState === 'narrating' || gameState === 'choice') && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-10 pointer-events-none">
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
          {gameState === 'choice' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-center text-[11px] font-mono tracking-[0.2em] text-[#C8B88A]/80 uppercase flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3 h-3" /> 문 안으로 걸어 들어가 선택
            </motion.div>
          )}
        </div>
      )}

      {/* Selected choice flash */}
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

      {/* On-screen controls (always visible, fine on desktop too) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-30 pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <button
            onPointerDown={() => (keys.current.left = true)}
            onPointerUp={() => (keys.current.left = false)}
            onPointerLeave={() => (keys.current.left = false)}
            onPointerCancel={() => (keys.current.left = false)}
            className="w-14 h-14 rounded-full bg-black/55 backdrop-blur border border-white/10 active:bg-[#C8B88A]/25 text-white flex items-center justify-center"
            aria-label="왼쪽 이동"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onPointerDown={() => (keys.current.right = true)}
            onPointerUp={() => (keys.current.right = false)}
            onPointerLeave={() => (keys.current.right = false)}
            onPointerCancel={() => (keys.current.right = false)}
            className="w-14 h-14 rounded-full bg-black/55 backdrop-blur border border-white/10 active:bg-[#C8B88A]/25 text-white flex items-center justify-center"
            aria-label="오른쪽 이동"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-[#C8B88A]/70 text-right">
          A / D · ← / → 키로도 조작
          <div className="text-white/40 mt-0.5">진행도 {Math.round((playerX / WORLD_WIDTH) * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
