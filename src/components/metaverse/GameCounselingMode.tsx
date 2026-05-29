import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, Eye, EyeOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { allChapters, dimensionMeta, type StoryChapter, type StoryScene, type StoryChoice, type PsychDimension } from '@/data/storyScenarios';
import { useGameTTS } from '@/hooks/useGameTTS';
import { useGameAudio, type GameThemeKey } from '@/hooks/useGameAudio';
import GameResultReport from './GameResultReport';

type GameState = 'intro' | 'playing' | 'result';

interface ChoiceRecord {
  sceneId: string;
  choiceId: string;
  dimensions: Partial<Record<PsychDimension, number>>;
  parentNote?: string;
  timestamp: number;
}

export default function GameCounselingMode() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [choices, setChoices] = useState<ChoiceRecord[]>([]);
  const [showParentNotes, setShowParentNotes] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const { speak, stop: stopTTS, isSpeaking, isLoading: ttsLoading } = useGameTTS();

  // 챕터별 고유 BGM 테마 매핑
  const audioTheme: GameThemeKey = (() => {
    const id = currentChapter?.id;
    if (id === 'shadow_escape') return 'shadow_escape';
    if (id === 'midnight_office') return 'midnight_office';
    if (id === 'parent_night') return 'parent_night';
    if (/성인|adult|부모|parent/i.test(currentChapter?.targetAge || '')) return 'classic_quiet';
    return 'classic_warm';
  })();
  const audio = useGameAudio({
    theme: audioTheme,
    intensity: gameState === 'playing' ? 0.65 : 0.3,
    muted: !ttsEnabled, // 음성 OFF 시 BGM도 OFF (단일 토글)
  });
  useEffect(() => {
    audio.setMuted(!ttsEnabled);
  }, [ttsEnabled, audio]);
  useEffect(() => {
    if (gameState === 'playing') audio.playSfx('arrive');
    if (gameState === 'result') audio.playSfx('success');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneIndex, gameState]);

  const currentScene = currentChapter?.scenes.find((_, i) => {
    if (choices.length === 0) return i === 0;
    const lastChoice = choices[choices.length - 1];
    return currentChapter.scenes[i]?.id === (lastChoice ? getNextSceneId(lastChoice) : currentChapter.scenes[0].id);
  }) || currentChapter?.scenes[currentSceneIndex];

  function getNextSceneId(record: ChoiceRecord): string {
    if (!currentChapter) return '';
    for (const scene of currentChapter.scenes) {
      const choice = scene.choices.find(c => c.id === record.choiceId);
      if (choice) return choice.nextSceneId;
    }
    return '';
  }

  // 씬 변경 시 자동 내레이션
  useEffect(() => {
    if (gameState === 'playing' && currentScene && ttsEnabled) {
      const narrateText = `${currentScene.title}. ${currentScene.description}`;
      speak(narrateText);
    }
  }, [gameState, currentScene?.id, ttsEnabled]);

  const startGame = useCallback((chapter: StoryChapter) => {
    setCurrentChapter(chapter);
    setCurrentSceneIndex(0);
    setChoices([]);
    setGameState('playing');
    setSelectedChoice(null);
  }, []);

  const makeChoice = useCallback((scene: StoryScene, choice: StoryChoice) => {
    audio.playSfx('select');
    setSelectedChoice(choice.id);
    
    
    if (ttsEnabled) {
      speak(`${choice.emoji} ${choice.text}을 선택했어요!`);
    }

    const record: ChoiceRecord = {
      sceneId: scene.id,
      choiceId: choice.id,
      dimensions: choice.dimensions,
      parentNote: choice.parentNote,
      timestamp: Date.now()
    };

    setTimeout(() => {
      setChoices(prev => [...prev, record]);
      setSelectedChoice(null);
      if (!currentChapter) return;
      const nextScene = currentChapter.scenes.find(s => s.id === choice.nextSceneId);
      if (nextScene?.isEnding) {
        setGameState('result');
        if (ttsEnabled) {
          setTimeout(() => speak('모험이 끝났어요! 결과를 확인해볼까요?'), 500);
        }
      } else {
        const nextIndex = currentChapter.scenes.findIndex(s => s.id === choice.nextSceneId);
        setCurrentSceneIndex(nextIndex >= 0 ? nextIndex : currentSceneIndex + 1);
      }
    }, 600);
  }, [currentChapter, currentSceneIndex, ttsEnabled, speak]);

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
    ? (currentSceneIndex / (currentChapter.scenes.length - 1)) * 100
    : 0;

  return (
    <div className="space-y-4">
      {gameState === 'playing' && (
        <div className="flex items-center justify-between">
          <Progress value={progress} className="h-2 flex-1 mr-3" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (isSpeaking) stopTTS();
                setTtsEnabled(!ttsEnabled);
              }}
            >
              {ttsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              ) : ttsEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-white/30" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowParentNotes(!showParentNotes)}>
              {showParentNotes ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <IntroScreen key="intro" chapters={allChapters} onStart={startGame} />
        )}
        {gameState === 'playing' && currentChapter && currentScene && (
          <PlayScreen
            key={currentScene.id}
            scene={currentScene}
            onChoice={makeChoice}
            showParentNotes={showParentNotes}
            selectedChoice={selectedChoice}
            chapterTitle={currentChapter.title}
            isSpeaking={isSpeaking}
            ttsLoading={ttsLoading}
          />
        )}
        {gameState === 'result' && (
          <GameResultReport
            key="result"
            results={calculateResults()}
            choices={choices}
            chapter={currentChapter!}
            onRestart={() => { stopTTS(); setGameState('intro'); }}
            ttsEnabled={ttsEnabled}
            onSpeak={speak}
            isSpeaking={isSpeaking}
            variant="2d"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IntroScreen({ chapters, onStart }: { chapters: StoryChapter[]; onStart: (c: StoryChapter) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="text-center space-y-3 py-4">
        <motion.div className="text-5xl" animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          🎮
        </motion.div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          게임형 심리탐색
        </h2>
        <p className="text-purple-200/80 text-sm max-w-sm mx-auto">
          재미있는 모험 이야기를 통해 아이의 마음을 자연스럽게 알아가요
        </p>
      </div>

      <Card className="p-4 bg-white/5 border-white/10">
        <h3 className="font-semibold text-sm mb-3 text-white">🧸 이렇게 진행돼요</h3>
        <div className="space-y-2 text-xs text-purple-200/70">
          <div className="flex gap-2"><span className="text-purple-400 font-bold">1.</span> 아이와 함께 이야기를 읽어요</div>
          <div className="flex gap-2"><span className="text-purple-400 font-bold">2.</span> 아이가 원하는 선택지를 골라요</div>
          <div className="flex gap-2"><span className="text-purple-400 font-bold">3.</span> 선택 패턴으로 심리 특성을 분석해요</div>
          <div className="flex gap-2"><span className="text-purple-400 font-bold">4.</span> 맞춤형 양육 가이드를 받아요</div>
        </div>
      </Card>

      <Card className="p-4 bg-amber-500/10 border-amber-500/30">
        <div className="flex gap-2 items-start">
          <Eye className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-300">
            <strong>부모 모드</strong>: 게임 중 👁️ 아이콘을 누르면 각 선택지의 심리적 의미를 실시간으로 볼 수 있어요.
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-white">📖 모험을 선택하세요</h3>
        {chapters.map((chapter) => (
          <motion.div key={chapter.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-white/10 hover:border-purple-500/50 bg-white/5" onClick={() => onStart(chapter)}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{chapter.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white">{chapter.title}</h4>
                  <p className="text-sm text-purple-200/70">{chapter.subtitle}</p>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {chapter.targetAge} · 약 5분
                  </span>
                </div>
                <Play className="h-6 w-6 text-purple-400" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PlayScreen({ scene, onChoice, showParentNotes, selectedChoice, chapterTitle, isSpeaking, ttsLoading }: {
  scene: StoryScene;
  onChoice: (scene: StoryScene, choice: StoryChoice) => void;
  showParentNotes: boolean;
  selectedChoice: string | null;
  chapterTitle: string;
  isSpeaking: boolean;
  ttsLoading: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-5">
      <Card className={`p-8 bg-gradient-to-br ${scene.bgColor} text-center relative overflow-hidden`}>
        <motion.div className="text-6xl mb-4 tracking-[0.3em]" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          {scene.illustration}
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800">{scene.title}</h2>
        {scene.character && (
          <span className="text-xs bg-white/60 px-2 py-1 rounded-full mt-2 inline-block">등장인물: {scene.character}</span>
        )}
        {(isSpeaking || ttsLoading) && (
          <div className="absolute top-2 right-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              {ttsLoading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
            </motion.div>
          </div>
        )}
      </Card>

      <Card className="p-5 bg-white/5 border-white/10">
        <p className="text-base leading-relaxed whitespace-pre-line text-purple-100">{scene.description}</p>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-purple-200/70">어떻게 할까요?</p>
        {scene.choices.map((choice, index) => (
          <motion.div key={choice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card
              className={`p-4 cursor-pointer transition-all border-2 bg-white/5 ${
                selectedChoice === choice.id ? 'border-purple-500 bg-purple-500/20 scale-[0.98]' : 'border-white/10 hover:border-purple-500/40 hover:shadow-md'
              }`}
              onClick={() => !selectedChoice && onChoice(scene, choice)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{choice.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-white">{choice.text}</p>
                  {showParentNotes && choice.parentNote && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-amber-400 mt-1 italic">
                      👁️ {choice.parentNote}
                    </motion.p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
