import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { allChapters, dimensionMeta, type StoryChapter, type StoryScene, type StoryChoice, type PsychDimension } from '@/data/storyScenarios';
import GameCounseling3DWorld from '@/components/3d/GameCounseling3DWorld';

type GameState = 'intro' | 'walking' | 'choice' | 'result';

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
  const [isWalking, setIsWalking] = useState(false);

  const currentScene = currentChapter?.scenes[currentSceneIndex] || null;

  const startGame = useCallback((chapter: StoryChapter) => {
    setCurrentChapter(chapter);
    setCurrentSceneIndex(0);
    setChoices([]);
    setIsWalking(true);
    setGameState('walking');

    // 첫 포인트까지 걸어감
    setTimeout(() => {
      setIsWalking(false);
      setGameState('choice');
    }, 2000);
  }, []);

  const makeChoice = useCallback((scene: StoryScene, choice: StoryChoice) => {
    setSelectedChoice(choice.id);
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
      } else {
        const nextIndex = currentChapter.scenes.findIndex(s => s.id === choice.nextSceneId);
        const newIndex = nextIndex >= 0 ? nextIndex : currentSceneIndex + 1;

        // 다음 포인트로 걸어감
        setGameState('walking');
        setIsWalking(true);
        setCurrentSceneIndex(newIndex);

        setTimeout(() => {
          setIsWalking(false);
          setGameState('choice');
        }, 2500);
      }
    }, 600);
  }, [currentChapter, currentSceneIndex]);

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
            직접 동화 속 세상으로 들어가서 모험을 떠나요!
          </p>
        </div>

        <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
          <h3 className="font-semibold text-sm mb-3 text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            이렇게 진행돼요
          </h3>
          <div className="space-y-2 text-xs text-purple-200/70">
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">1.</span> 캐릭터가 마법의 숲을 자동으로 탐험해요</div>
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">2.</span> 숲속 친구를 만나면 멈춰요</div>
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">3.</span> 아이가 선택지를 골라요</div>
            <div className="flex gap-2"><span className="text-emerald-400 font-bold">4.</span> 선택에 따라 다음 장소로 이동해요</div>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="font-semibold text-white">📖 모험을 선택하세요</h3>
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
                        🎮 3D 몰입형
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
    const topDimensions = Object.entries(results).sort(([, a], [, b]) => b - a).slice(0, 4);
    const top = topDimensions[0][0] as PsychDimension;
    const characterTypes: Record<string, { title: string; emoji: string; desc: string }> = {
      empathy: { title: '따뜻한 마음의 치유사', emoji: '💝', desc: '다른 사람의 마음을 잘 느끼고 돌봐주는 따뜻한 아이예요.' },
      creativity: { title: '빛나는 상상력의 마법사', emoji: '✨', desc: '독창적인 방법으로 문제를 해결하는 창의적인 아이예요.' },
      independence: { title: '용감한 모험가', emoji: '🦸', desc: '스스로 도전하고 해결하는 독립적인 아이예요.' },
      sociality: { title: '인기만점 소통왕', emoji: '👑', desc: '사람들과 잘 어울리고 소통을 즐기는 사교적인 아이예요.' },
      self_esteem: { title: '자신감 넘치는 리더', emoji: '⭐', desc: '자기 자신을 사랑하고 자신감이 넘치는 아이예요.' },
      emotional_regulation: { title: '차분한 지혜의 현자', emoji: '🧘', desc: '감정을 잘 조절하고 인내심이 강한 아이예요.' },
      anxiety: { title: '안정감 있는 평화주의자', emoji: '🕊️', desc: '편안하고 안정적인 성격의 아이예요.' },
      aggression: { title: '에너지 넘치는 행동파', emoji: '⚡', desc: '활동적이고 에너지가 넘치는 역동적인 아이예요.' },
    };
    const character = characterTypes[top] || characterTypes.empathy;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-20">
        <Card className="p-6 bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 text-center border-2 border-emerald-500/30">
          <motion.div className="text-6xl mb-3" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: 2 }}>
            {character.emoji}
          </motion.div>
          <h2 className="text-xl font-bold text-emerald-300">모험 완료! 우리 아이는...</h2>
          <h3 className="text-2xl font-extrabold mt-1 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            "{character.title}"
          </h3>
          <p className="text-sm text-emerald-200/70 mt-2">{character.desc}</p>
        </Card>

        <Card className="p-5 bg-white/5 border-white/10">
          <h3 className="font-bold mb-4 text-white">📊 심리 특성 분석</h3>
          <div className="space-y-3">
            {Object.entries(dimensionMeta).map(([dim, meta]) => {
              const score = results[dim as PsychDimension];
              return (
                <div key={dim} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-200">{meta.icon} {meta.label}</span>
                    <span className="text-xs text-purple-300/70">{score}%</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Button onClick={() => setGameState('intro')} className="w-full bg-emerald-600 hover:bg-emerald-700">
          <RotateCcw className="w-4 h-4 mr-2" /> 다시 모험하기
        </Button>
      </motion.div>
    );
  }

  // ============ 플레이 중 (3D 월드 + 선택지 UI) ============
  return (
    <div className="space-y-3">
      {/* 상단 바 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setGameState('intro')} className="text-white/70">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Progress value={progress} className="h-2 flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowParentNotes(!showParentNotes)}>
          {showParentNotes ? <EyeOff className="h-4 w-4 text-amber-400" /> : <Eye className="h-4 w-4 text-white/50" />}
        </Button>
      </div>

      {/* 3D 월드 */}
      {currentChapter && (
        <GameCounseling3DWorld
          scene={currentScene}
          sceneIndex={currentSceneIndex}
          totalScenes={currentChapter.scenes.length}
          onChoice={(choice) => currentScene && makeChoice(currentScene, choice)}
          isWalking={isWalking}
          showChoices={gameState === 'choice'}
        />
      )}

      {/* 스토리 텍스트 & 선택지 오버레이 */}
      <AnimatePresence mode="wait">
        {gameState === 'choice' && currentScene && (
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {/* 장면 설명 */}
            <Card className="p-4 bg-black/40 backdrop-blur-sm border-emerald-500/20">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{currentScene.illustration}</span>
                <div>
                  <h3 className="font-bold text-white text-base">{currentScene.title}</h3>
                  {currentScene.character && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      {currentScene.character}
                    </span>
                  )}
                  <p className="text-sm text-purple-100/80 mt-1 leading-relaxed whitespace-pre-line">
                    {currentScene.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* 선택지 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-300/70 px-1">어떻게 할까요?</p>
              {currentScene.choices.map((choice, index) => (
                <motion.div
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card
                    className={`p-3 cursor-pointer transition-all border bg-black/30 backdrop-blur-sm ${
                      selectedChoice === choice.id
                        ? 'border-emerald-500 bg-emerald-500/20 scale-[0.98]'
                        : 'border-white/10 hover:border-emerald-500/40'
                    }`}
                    onClick={() => !selectedChoice && makeChoice(currentScene, choice)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{choice.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-white">{choice.text}</p>
                        {showParentNotes && choice.parentNote && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs text-amber-400 mt-1 italic"
                          >
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
        )}
      </AnimatePresence>
    </div>
  );
}
