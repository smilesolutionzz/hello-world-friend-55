import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { allChapters, dimensionMeta, type StoryChapter, type StoryScene, type StoryChoice, type PsychDimension } from '@/data/storyScenarios';
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

  const startGame = useCallback((chapter: StoryChapter) => {
    setCurrentChapter(chapter);
    setCurrentSceneIndex(0);
    setChoices([]);
    setGameState('playing');
    setSelectedChoice(null);
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
        setCurrentSceneIndex(nextIndex >= 0 ? nextIndex : currentSceneIndex + 1);
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
    ? (currentSceneIndex / (currentChapter.scenes.length - 1)) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Parent mode toggle & progress for playing state */}
      {gameState === 'playing' && (
        <div className="flex items-center justify-between">
          <Progress value={progress} className="h-2 flex-1 mr-3" />
          <Button variant="ghost" size="icon" onClick={() => setShowParentNotes(!showParentNotes)}>
            {showParentNotes ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
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
          />
        )}
        {gameState === 'result' && (
          <GameResultReport
            key="result"
            results={calculateResults()}
            choices={choices}
            chapter={currentChapter!}
            onRestart={() => setGameState('intro')}
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

function PlayScreen({ scene, onChoice, showParentNotes, selectedChoice, chapterTitle }: {
  scene: StoryScene;
  onChoice: (scene: StoryScene, choice: StoryChoice) => void;
  showParentNotes: boolean;
  selectedChoice: string | null;
  chapterTitle: string;
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

// ResultScreen removed - now using GameResultReport component
    const types: Record<string, { title: string; emoji: string; desc: string }> = {
      empathy: { title: '따뜻한 마음의 치유사', emoji: '💝', desc: '다른 사람의 마음을 잘 느끼고 돌봐주는 따뜻한 아이예요' },
      creativity: { title: '빛나는 상상력의 마법사', emoji: '✨', desc: '독창적인 방법으로 문제를 해결하는 창의적인 아이예요' },
      independence: { title: '용감한 모험가', emoji: '🦸', desc: '스스로 도전하고 해결하는 독립적인 아이예요' },
      sociality: { title: '인기만점 소통왕', emoji: '👑', desc: '사람들과 잘 어울리고 소통을 즐기는 사교적인 아이예요' },
      self_esteem: { title: '자신감 넘치는 리더', emoji: '⭐', desc: '자기 자신을 사랑하고 자신감이 넘치는 아이예요' },
      emotional_regulation: { title: '차분한 지혜의 현자', emoji: '🧘', desc: '감정을 잘 조절하고 인내심이 강한 아이예요' },
      anxiety: { title: '안정감 있는 평화주의자', emoji: '🕊️', desc: '편안하고 안정적인 성격의 아이예요' },
      aggression: { title: '에너지 넘치는 행동파', emoji: '⚡', desc: '활동적이고 에너지가 넘치는 역동적인 아이예요' },
    };
    return types[top] || types.empathy;
  };

  const character = getCharacterType();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 pb-20">
      <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 text-center border-2 border-purple-500/30">
        <motion.div className="text-6xl mb-3" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: 2 }}>
          {character.emoji}
        </motion.div>
        <h2 className="text-xl font-bold text-purple-300">우리 아이는...</h2>
        <h3 className="text-2xl font-extrabold mt-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          "{character.title}"
        </h3>
        <p className="text-sm text-purple-200/70 mt-2">{character.desc}</p>
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
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                </div>
                <div className="flex justify-between text-[10px] text-purple-300/50">
                  <span>{meta.lowLabel}</span>
                  <span>{meta.highLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 bg-white/5 border-white/10">
        <h3 className="font-bold mb-3 text-white">👁️ 선택 기록 & 해석</h3>
        <div className="space-y-2">
          {choices.map((record, i) => {
            const scene = chapter.scenes.find(s => s.id === record.sceneId);
            const choice = scene?.choices.find(c => c.id === record.choiceId);
            return (
              <div key={i} className="flex gap-2 items-start text-xs">
                <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
                <div>
                  <span className="font-medium text-white">{scene?.title}</span>
                  <span className="text-purple-200/70"> → {choice?.text}</span>
                  {record.parentNote && (
                    <p className="text-amber-400 italic mt-0.5">💡 {record.parentNote}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 bg-green-500/10 border-green-500/30">
        <h3 className="font-bold mb-3 text-green-300">🌱 양육 가이드</h3>
        <div className="space-y-2 text-sm text-green-200">
          {topDimensions.slice(0, 2).map(([dim]) => {
            const guides: Record<string, string> = {
              empathy: '공감 능력이 높아요! 다양한 사회적 경험을 통해 이 장점을 더 키워주세요.',
              creativity: '창의적 사고가 뛰어나요! 정답이 없는 놀이(블록, 미술, 역할극)를 많이 해주세요.',
              independence: '독립심이 강해요! 스스로 결정할 기회를 충분히 주되, 안전한 범위를 설정해주세요.',
              sociality: '사교성이 좋아요! 또래 관계를 통해 협동과 갈등 해결을 자연스럽게 배울 수 있어요.',
              self_esteem: '자신감이 높아요! 과정을 칭찬하고 작은 성공 경험을 쌓아주세요.',
              emotional_regulation: '감정 조절력이 우수해요! 감정 언어를 확장해주면 더 좋아요.',
              anxiety: '새로운 환경에서 안정감을 느껴요. 꾸준한 루틴과 예측 가능한 환경이 도움돼요.',
              aggression: '에너지가 넘쳐요! 충분한 신체 활동과 명확한 규칙이 균형을 잡아줘요.',
            };
            return (
              <div key={dim} className="flex gap-2"><span className="shrink-0">✅</span><span>{guides[dim] || '개별 특성에 맞는 지도가 필요해요.'}</span></div>
            );
          })}
          {bottomDimensions.map(([dim]) => {
            const concerns: Record<string, string> = {
              empathy: '공감 능력을 기르기 위해 감정 그림책 읽기, "친구가 어떤 기분일까?" 대화를 해보세요.',
              sociality: '또래와의 소규모 놀이 기회를 자주 만들어주세요. 1:1부터 시작하면 좋아요.',
              emotional_regulation: '감정 온도계, 호흡법 등 감정 조절 도구를 놀이처럼 연습해보세요.',
              self_esteem: '아이의 노력과 과정을 구체적으로 칭찬해주세요. "잘했어"보다 "끝까지 했구나!"가 효과적이에요.',
              anxiety: '작은 도전을 성공시키는 경험을 쌓아주세요. 불안해할 때는 억지로 하게 하기보다 함께해주세요.',
            };
            return concerns[dim] ? (
              <div key={dim} className="flex gap-2"><span className="shrink-0">💡</span><span>{concerns[dim]}</span></div>
            ) : null;
          })}
        </div>
      </Card>

      <div className="space-y-3">
        <Button onClick={onRestart} variant="outline" className="w-full gap-2 border-white/20 text-white hover:bg-white/10">
          <RotateCcw className="h-4 w-4" /> 다시 모험하기
        </Button>
        <Button onClick={() => window.location.href = '/premium-assessment'} className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          🔬 전문 심리검사 받아보기
        </Button>
      </div>

      <p className="text-[10px] text-center text-purple-300/50 px-4">
        ※ 이 결과는 놀이 기반 관찰 자료이며, 전문적인 심리 진단을 대체하지 않습니다.
      </p>
    </motion.div>
  );
}
