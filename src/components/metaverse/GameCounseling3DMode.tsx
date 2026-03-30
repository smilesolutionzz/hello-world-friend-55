import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, Eye, EyeOff, Sparkles, ArrowLeft, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { allChapters, dimensionMeta, type StoryChapter, type StoryScene, type StoryChoice, type PsychDimension } from '@/data/storyScenarios';
import GameCounseling3DWorld from '@/components/3d/GameCounseling3DWorld';
import { useGameTTS } from '@/hooks/useGameTTS';
import { useGameSFX } from '@/hooks/useGameSFX';
import GameResultReport from './GameResultReport';

type GameState = 'intro' | 'exploring' | 'narrating' | 'choice' | 'result';

interface ChoiceRecord {
  sceneId: string;
  choiceId: string;
  dimensions: Partial<Record<PsychDimension, number>>;
  parentNote?: string;
  timestamp: number;
}

export default function GameCounseling3DMode() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [choices, setChoices] = useState<ChoiceRecord[]>([]);
  const [showParentNotes, setShowParentNotes] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  const { speak, stop: stopTTS, isSpeaking, isLoading: ttsLoading } = useGameTTS();
  const { playSFX, playSceneSFX } = useGameSFX();

  const currentScene = currentChapter?.scenes[currentSceneIndex] || null;

  // Typewriter effect
  const typewrite = useCallback((text: string, onComplete?: () => void) => {
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    setDisplayedText('');
    let index = 0;
    typewriterRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        onComplete?.();
      }
    }, 40);
  }, []);

  const handleArrive = useCallback((storyIndex: number) => {
    if (gameState !== 'exploring') return;
    setGameState('narrating');
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'narrating' && currentScene) {
      // 씬 전환 효과음
      playSceneSFX(currentScene.id);

      const narrateText = currentScene.character
        ? `${currentScene.character}를 만났어요! ${currentScene.description}`
        : currentScene.description;

      typewrite(currentScene.description, () => {
        setTimeout(() => setGameState('choice'), 500);
      });

      if (ttsEnabled) speak(narrateText);
    }

    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [gameState, currentScene, ttsEnabled]);

  useEffect(() => {
    if (gameState === 'choice' && currentScene && ttsEnabled && !isSpeaking && !ttsLoading) {
      const choiceTexts = currentScene.choices.map((c, i) => `${i + 1}번, ${c.text}`).join('. ');
      const prompt = `어떻게 할까요? ${choiceTexts}`;
      const timer = setTimeout(() => speak(prompt), 800);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const startGame = useCallback((chapter: StoryChapter) => {
    setCurrentChapter(chapter);
    setCurrentSceneIndex(0);
    setChoices([]);
    setGameState('exploring');
    playSFX('whoosh');

    if (ttsEnabled) {
      speak(`${chapter.title}. 화면을 터치해서 앞으로 걸어가 보세요.`);
    }
  }, [ttsEnabled, speak, playSFX]);

  const makeChoice = useCallback((scene: StoryScene, choice: StoryChoice) => {
    setSelectedChoice(choice.id);
    stopTTS();
    playSFX('choice_select');
    if (typewriterRef.current) clearInterval(typewriterRef.current);

    const record: ChoiceRecord = {
      sceneId: scene.id,
      choiceId: choice.id,
      dimensions: choice.dimensions,
      parentNote: choice.parentNote,
      timestamp: Date.now()
    };

    if (ttsEnabled) {
      speak(`${choice.emoji} ${choice.text}을 선택했어요!`);
    }

    setTimeout(() => {
      setChoices(prev => [...prev, record]);
      setSelectedChoice(null);

      if (!currentChapter) return;
      const nextScene = currentChapter.scenes.find(s => s.id === choice.nextSceneId);

      if (nextScene?.isEnding) {
        setGameState('result');
        playSFX('success');
        if (ttsEnabled) {
          setTimeout(() => speak('모험이 끝났어요! 결과를 확인해볼까요?'), 500);
        }
      } else {
        const nextIndex = currentChapter.scenes.findIndex(s => s.id === choice.nextSceneId);
        const newIndex = nextIndex >= 0 ? nextIndex : currentSceneIndex + 1;
        setCurrentSceneIndex(newIndex);
        setGameState('exploring');
        playSFX('scene_transition');

        if (ttsEnabled) {
          setTimeout(() => speak('화면을 터치해서 앞으로 걸어가 보세요.'), 300);
        }
      }
    }, 800);
  }, [currentChapter, currentSceneIndex, ttsEnabled, speak, stopTTS]);

  const calculateResults = useCallback(() => {
    const scores: Record<PsychDimension, number> = {
      anxiety: 0, sociality: 0, empathy: 0, aggression: 0,
      creativity: 0, self_esteem: 0, emotional_regulation: 0, independence: 0
    };
    choices.forEach(c => {
      Object.entries(c.dimensions).forEach(([dim, val]) => {
        scores[dim as PsychDimension] += val as number;
      });
    });
    const maxPossible = choices.length * 2;
    const normalized: Record<PsychDimension, number> = {} as any;
    Object.entries(scores).forEach(([dim, val]) => {
      normalized[dim as PsychDimension] = Math.round(Math.max(0, Math.min(100, ((val + maxPossible) / (maxPossible * 2)) * 100)));
    });
    return normalized;
  }, [choices]);

  const progress = currentChapter
    ? (currentSceneIndex / Math.max(1, currentChapter.scenes.length - 1)) * 100
    : 0;

  // ============ 인트로 화면 ============
  if (gameState === 'intro') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center space-y-3 py-4">
          <motion.div className="text-5xl" animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            🌲
          </motion.div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            3D 마법의 숲 모험
          </h2>
          <p className="text-purple-200/80 text-sm max-w-sm mx-auto">
            터치해서 로블록스풍 동화 세계를 탐험하세요!
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Button
              variant={ttsEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={ttsEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-white/20 text-white/60'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
              {ttsEnabled ? '🎙️ AI 내레이션 ON' : '내레이션 OFF'}
            </Button>
          </div>
        </div>

        <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
          <h3 className="font-semibold text-sm mb-3 text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            이렇게 진행돼요
          </h3>
          <div className="space-y-2 text-xs text-purple-200/70">
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">1.</span> 빛나는 곳을 터치하면 캐릭터가 걸어가요.</div>
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">2.</span> NPC에게 다가가면 이야기가 시작돼요.</div>
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">3.</span> 화면 안에서 바로 답을 선택하세요.</div>
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">4.</span> 모험을 완료하면 심리 분석 결과를 받아요.</div>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="font-semibold text-white">📖 모험을 선택하세요.</h3>
          {allChapters.map((chapter) => (
            <motion.div key={chapter.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-white/10 hover:border-emerald-500/50 bg-white/5"
                onClick={() => startGame(chapter)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{chapter.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-white">{chapter.title}</h4>
                    <p className="text-sm text-purple-200/70">{chapter.subtitle}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                        🎮 3D 탐험형
                      </span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                        🎙️ 루맘 AI 음성
                      </span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                        {chapter.targetAge}
                      </span>
                    </div>
                  </div>
                  <Play className="h-6 w-6 text-emerald-400" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ============ 결과 화면 ============
  if (gameState === 'result') {
    const results = calculateResults();
    return (
      <GameResultReport
        results={results}
        choices={choices}
        chapter={currentChapter!}
        onRestart={() => { stopTTS(); setGameState('intro'); }}
        ttsEnabled={ttsEnabled}
        onSpeak={speak}
        isSpeaking={isSpeaking}
        ttsLoading={ttsLoading}
        variant="3d"
      />
    );
  }

  // ============ 플레이 중 (3D 월드 - 모든 UI가 화면 안에) ============
  return (
    <div className="space-y-2">
      {/* 상단 바 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => { stopTTS(); setGameState('intro'); }} className="text-white/70">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Progress value={progress} className="h-2 flex-1" />
        <div className="flex items-center gap-1">
          {(isSpeaking || ttsLoading) && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
              {ttsLoading ? (
                <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
              ) : (
                <div className="flex gap-0.5">
                  {[1,2,3].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full"
                      animate={{ height: ['4px', '12px', '4px'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (isSpeaking) stopTTS();
              setTtsEnabled(!ttsEnabled);
            }}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-white/30" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowParentNotes(!showParentNotes)}>
            {showParentNotes ? <EyeOff className="h-4 w-4 text-amber-400" /> : <Eye className="h-4 w-4 text-white/50" />}
          </Button>
        </div>
      </div>

      {/* 3D 월드 (선택지와 나레이션이 모두 화면 안에 오버레이) */}
      {currentChapter && (
        <GameCounseling3DWorld
          scene={currentScene}
          sceneIndex={currentSceneIndex}
          totalScenes={currentChapter.scenes.length}
          onChoice={(choice) => currentScene && makeChoice(currentScene, choice)}
          isWalking={false}
          showChoices={gameState === 'choice'}
          onArrive={handleArrive}
          narrationText={gameState === 'narrating' ? displayedText : undefined}
          gameState={gameState}
          selectedChoice={selectedChoice}
          isSpeaking={isSpeaking}
        />
      )}

      {/* 부모 노트 (선택지 바깥에 표시) */}
      {showParentNotes && gameState === 'choice' && currentScene && (
        <div className="space-y-1">
          {currentScene.choices.map((choice) => (
            choice.parentNote && (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-1.5 italic"
              >
                👁️ {choice.emoji} → {choice.parentNote}
              </motion.div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
