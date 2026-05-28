import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Footprints, Eye } from 'lucide-react';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

/**
 * ShadowEscapeScene
 * 2D cinematic horror-light scene for the "그림자에서 도망" chapter.
 * - Auto-arrives on scene change (no exploration step)
 * - Approaching shadow, heartbeat + tension meter, footstep waves
 * - Dark glass UI, gold accent matching AIHPRO branding
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

// 씬별 분위기 프리셋
const sceneMood: Record<string, { from: string; to: string; intensity: number; label: string }> = {
  first_sound:  { from: '#0a0a0f', to: '#161624', intensity: 0.35, label: '01 · 첫 신호' },
  alley:        { from: '#0b0d18', to: '#1a1430', intensity: 0.55, label: '02 · 갈림길' },
  door:         { from: '#08070c', to: '#1c0c0c', intensity: 0.85, label: '03 · 임계점' },
  reveal:       { from: '#1a1408', to: '#2a1f0a', intensity: 0.2,  label: '04 · 해소' },
  ending:       { from: '#0a0f1a', to: '#1a2030', intensity: 0.1,  label: '에필로그' },
};

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
  const [tension, setTension] = useState(35);
  const [heart, setHeart] = useState(74);

  const mood = useMemo(() => {
    if (!currentScene) return sceneMood.first_sound;
    return sceneMood[currentScene.id] ?? sceneMood.first_sound;
  }, [currentScene]);

  // 자동 입장 (탐험 단계 스킵 → 바로 나레이션)
  useEffect(() => {
    if (gameState === 'exploring' && currentScene) {
      const t = setTimeout(() => onArrive(sceneIndex), 500);
      return () => clearTimeout(t);
    }
  }, [gameState, sceneIndex, currentScene, onArrive]);

  // 긴장 / 심박 상승
  useEffect(() => {
    if (gameState === 'narrating' || gameState === 'choice') {
      const baseTension = 35 + Math.round(mood.intensity * 50);
      const baseHeart = 72 + Math.round(mood.intensity * 50);
      setTension(baseTension);
      setHeart(baseHeart);
      const id = setInterval(() => {
        setTension((v) => Math.min(98, v + Math.random() * 1.5));
        setHeart((v) => Math.min(148, v + (Math.random() > 0.5 ? 1 : 0)));
      }, 400);
      return () => clearInterval(id);
    }
  }, [gameState, mood.intensity, sceneIndex]);

  if (!currentScene) {
    return <div className="w-full h-full bg-black" />;
  }

  const isReveal = currentScene.id === 'reveal' || currentScene.id === 'ending';

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl select-none">
      {/* 배경 그라데이션 */}
      <motion.div
        key={currentScene.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${mood.from} 0%, ${mood.to} 100%)`,
        }}
      />

      {/* 멀리서 다가오는 빛 (복도/가로등) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 30% at 50% 35%, rgba(200,184,138,0.10) 0%, transparent 70%)',
        }}
      />

      {/* 다가오는 그림자 — reveal/ending 외 */}
      {!isReveal && (
        <motion.div
          key={`shadow-${currentScene.id}`}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ bottom: '8%' }}
          initial={{ scale: 0.4, opacity: 0.15, y: 80 }}
          animate={{
            scale: 0.5 + mood.intensity * 0.9,
            opacity: 0.25 + mood.intensity * 0.55,
            y: 40 - mood.intensity * 40,
          }}
          transition={{ duration: 5, ease: 'easeIn' }}
        >
          <div
            className="w-[280px] h-[360px] md:w-[360px] md:h-[460px]"
            style={{
              background:
                'radial-gradient(ellipse 50% 60% at 50% 55%, #000 0%, rgba(0,0,0,0.85) 50%, transparent 80%)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
      )}

      {/* reveal: 잃어버린 강아지 실루엣 */}
      {currentScene.id === 'reveal' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4 }}
          className="absolute left-1/2 -translate-x-1/2 text-7xl md:text-8xl pointer-events-none"
          style={{ bottom: '12%', filter: 'drop-shadow(0 6px 20px rgba(200,184,138,0.25))' }}
        >
          🐕
        </motion.div>
      )}

      {/* 발자국 파동 (좌측) */}
      {!isReveal && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45 }}
              className="w-2 h-2 rounded-full bg-[#C8B88A]/60"
            />
          ))}
        </div>
      )}

      {/* 비네팅 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* 필름 그레인 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* 상단 HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between text-[10px] font-mono tracking-widest text-[#C8B88A]/80 z-20">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/40 backdrop-blur border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8B88A] animate-pulse" />
          {mood.label}
        </div>
        <div className="flex items-center gap-3">
          {/* 긴장 게이지 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/40 backdrop-blur border border-white/5">
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
          {/* 심박 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/40 backdrop-blur border border-white/5">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: Math.max(0.4, 60 / heart), repeat: Infinity }}
              className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400"
            />
            <span className="tabular-nums">{heart} bpm</span>
          </div>
        </div>
      </div>

      {/* 나레이션 (상단) */}
      {(gameState === 'narrating' || gameState === 'choice') && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-10">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-black/55 backdrop-blur-md border border-white/10 px-5 py-4"
          >
            <div className="text-[10px] font-semibold tracking-[0.2em] text-[#C8B88A]/80 uppercase mb-1.5">
              {currentScene.title}
            </div>
            <p className="text-white/95 text-[14px] md:text-[15px] leading-relaxed whitespace-pre-line break-keep min-h-[3em]">
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

      {/* 선택지 (하단) */}
      <AnimatePresence mode="wait">
        {gameState === 'choice' && (
          <motion.div
            key={`choices-${currentScene.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl z-20"
          >
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#C8B88A]/70 uppercase mb-2 flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Your move
            </div>
            <div className="grid gap-2">
              {currentScene.choices.map((choice, i) => {
                const isSelected = selectedChoice === choice.id;
                return (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.01, borderColor: 'rgba(200,184,138,0.6)' }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!!selectedChoice}
                    onClick={() => onChoiceSelect(currentScene, choice)}
                    className={`group w-full text-left rounded-xl border px-4 py-3 backdrop-blur-md transition-colors disabled:opacity-50 ${
                      isSelected
                        ? 'bg-[#C8B88A]/20 border-[#C8B88A]'
                        : 'bg-black/55 border-white/10 hover:bg-black/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{choice.emoji}</span>
                      <span className="flex-1 text-white/95 text-[14px] leading-snug break-keep">
                        {choice.text}
                      </span>
                      <Footprints className="w-3.5 h-3.5 text-[#C8B88A]/60 group-hover:text-[#C8B88A] shrink-0" />
                    </div>
                    {showParentNotes && choice.parentNote && (
                      <div className="mt-1.5 pl-8 text-[11px] text-amber-200/70 italic">
                        → {choice.parentNote}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
