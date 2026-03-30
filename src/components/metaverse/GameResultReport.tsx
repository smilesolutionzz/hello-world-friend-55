import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileDown, Share2, RotateCcw, Loader2, Volume2, ChevronDown, ChevronUp, Image, ArrowRight } from 'lucide-react';
import { dimensionMeta, type PsychDimension, type StoryChapter } from '@/data/storyScenarios';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { shareToKakao, isKakaoInitialized } from '@/lib/kakaoShare';
import VisualSummaryCard, { type VisualSummaryData } from '@/components/visual-summary/VisualSummaryCard';

interface ChoiceRecord {
  sceneId: string;
  choiceId: string;
  dimensions: Partial<Record<PsychDimension, number>>;
  parentNote?: string;
  timestamp: number;
}

interface GameResultReportProps {
  results: Record<PsychDimension, number>;
  choices: ChoiceRecord[];
  chapter: StoryChapter;
  onRestart: () => void;
  ttsEnabled?: boolean;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  ttsLoading?: boolean;
  variant?: '2d' | '3d';
}

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

const detailedInterpretations: Record<string, { high: string; low: string; guide: string }> = {
  empathy: {
    high: '공감 능력이 매우 뛰어난 아이입니다. 다른 사람의 감정을 민감하게 감지하고, 어려운 상황에서 도움을 주려는 경향이 강합니다. 이는 정서적 지능(EQ)이 높다는 긍정적 신호이며, 향후 대인관계에서 큰 강점이 됩니다.',
    low: '공감 능력 발달이 아직 초기 단계에 있을 수 있습니다. 이는 자연스러운 발달 과정일 수 있으며, 감정 그림책 읽기나 "친구가 어떤 기분일까?" 같은 대화를 통해 점진적으로 키울 수 있습니다.',
    guide: '감정 단어 카드 놀이, 역할극, 동물 돌보기 등을 통해 타인의 감정을 이해하는 경험을 제공해주세요.',
  },
  creativity: {
    high: '창의적 사고력이 돋보이는 아이입니다. 기존의 틀에 얽매이지 않고 새로운 해결책을 찾으려 하며, 상상력이 풍부합니다. 이런 특성은 미래 문제 해결 능력과 혁신적 사고의 기반이 됩니다.',
    low: '창의적 표현보다는 구조화된 접근을 선호할 수 있습니다. 정답이 없는 자유로운 놀이(블록 쌓기, 자유 그림 그리기, 역할극)를 통해 상상력을 자극해주세요.',
    guide: '레고, 미술 활동, 스토리 만들기 등 정답이 없는 열린 놀이를 자주 경험하게 해주세요.',
  },
  independence: {
    high: '독립심이 강한 아이입니다. 스스로 결정하고 문제를 해결하려는 의지가 뚜렷합니다. 이는 자기 주도성의 발현으로, 적절한 자율성을 보장해주면 리더십과 책임감으로 발전할 수 있습니다.',
    low: '안전하고 익숙한 환경을 선호하며, 새로운 도전에 신중한 태도를 보입니다. 작은 성공 경험을 쌓아가며 점진적으로 도전 범위를 넓혀주세요.',
    guide: '일상에서 스스로 선택할 기회(옷 고르기, 간식 선택 등)를 자주 제공해주세요.',
  },
  sociality: {
    high: '사회성이 뛰어난 아이입니다. 또래와 자연스럽게 어울리고, 협력적인 상호작용을 즐깁니다. 그룹 활동에서 조화로운 관계를 맺는 능력이 돋보입니다.',
    low: '혼자 놀이를 선호하거나 소수의 친밀한 관계에 집중하는 경향이 있습니다. 이는 내향적 특성일 수 있으며, 1:1 또래 놀이부터 시작하여 점차 사회적 경험을 넓혀주세요.',
    guide: '소규모 놀이 약속, 팀 스포츠, 보드게임 등 협력적 활동을 경험하게 해주세요.',
  },
  self_esteem: {
    high: '자존감이 건강하게 형성되어 있습니다. 자신의 능력을 신뢰하고, 실패에도 쉽게 포기하지 않는 회복력을 보입니다. 이는 정서적 안정감의 강력한 기반입니다.',
    low: '자신감 형성이 진행 중인 단계입니다. "잘했어"보다 "끝까지 해냈구나!"처럼 과정을 구체적으로 칭찬하면 내적 동기와 자존감이 크게 향상됩니다.',
    guide: '아이의 노력과 과정에 초점을 맞춘 구체적 칭찬을 습관화해주세요.',
  },
  emotional_regulation: {
    high: '감정 조절 능력이 우수합니다. 좌절 상황에서도 비교적 차분하게 대처하며, 감정 표현과 조절 사이의 균형을 잘 잡고 있습니다.',
    low: '감정의 기복이 크거나, 좌절 시 강한 반응을 보일 수 있습니다. 감정 온도계, 심호흡법 등을 놀이처럼 연습하면 조절 능력이 점차 향상됩니다.',
    guide: '감정 일기 쓰기, "지금 기분이 어때?" 대화, 호흡법 연습 등을 일상에 포함시켜주세요.',
  },
  anxiety: {
    high: '정서적으로 안정되어 있으며, 새로운 상황에서도 비교적 편안함을 느끼는 편입니다. 이는 안정 애착의 긍정적 지표입니다.',
    low: '새로운 환경이나 예측 불가능한 상황에서 불안감을 느낄 수 있습니다. 꾸준한 루틴, 미리 알려주기, 안전 기지(부모) 역할이 큰 도움이 됩니다.',
    guide: '변화 전 충분한 예고, 일관된 루틴, 그리고 "괜찮아, 엄마/아빠가 함께 있어"라는 안심의 말이 중요합니다.',
  },
  aggression: {
    high: '에너지가 넘치고 활동적인 아이입니다. 직접적인 행동으로 문제를 해결하려는 경향이 있으며, 이 에너지를 건설적으로 활용하면 큰 추진력이 됩니다.',
    low: '온화하고 조용한 방식으로 상황에 대처하는 편입니다. 갈등 상황에서 자기 표현을 할 수 있도록 "싫어요", "멈춰요" 등의 표현을 연습해주세요.',
    guide: '충분한 신체 활동(달리기, 수영, 무술)과 감정 표현 연습을 병행해주세요.',
  },
};

export default function GameResultReport({
  results, choices, chapter, onRestart,
  ttsEnabled, onSpeak, isSpeaking, ttsLoading,
  variant = '3d',
}: GameResultReportProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const topDimensions = Object.entries(results).sort(([, a], [, b]) => b - a).slice(0, 4);
  const bottomDimensions = Object.entries(results).sort(([, a], [, b]) => a - b).slice(0, 2);
  const top = topDimensions[0][0] as PsychDimension;
  const character = characterTypes[top] || characterTypes.empathy;

  const gradientFrom = variant === '3d' ? 'from-emerald-900/40' : 'from-purple-900/40';
  const gradientTo = variant === '3d' ? 'to-cyan-900/40' : 'to-pink-900/40';
  const accentBorder = variant === '3d' ? 'border-emerald-500/30' : 'border-purple-500/30';
  const accentText = variant === '3d' ? 'text-emerald-300' : 'text-purple-300';
  const barGradient = variant === '3d' ? 'from-emerald-500 to-cyan-500' : 'from-purple-500 to-pink-500';
  const titleGradient = variant === '3d' ? 'from-emerald-400 to-cyan-400' : 'from-purple-400 to-pink-400';

  // AI 상세 해석 생성
  useEffect(() => {
    generateAIAnalysis();
  }, []);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const choiceDetails = choices.map((record, i) => {
        const scene = chapter.scenes.find(s => s.id === record.sceneId);
        const choice = scene?.choices.find(c => c.id === record.choiceId);
        return `${i + 1}. 상황: ${scene?.title} → 선택: ${choice?.text} (해석: ${record.parentNote || '없음'})`;
      }).join('\n');

      const scoreDetails = Object.entries(results)
        .map(([dim, score]) => `${dimensionMeta[dim as PsychDimension]?.label || dim}: ${score}%`)
        .join(', ');

      const { data, error } = await supabase.functions.invoke('generate-visual-summary', {
        body: {
          type: 'counseling',
          content: `## 금쪽상담소 게임 상담 결과 분석 요청

### 스토리: ${chapter.title}
### 대상 연령: ${chapter.targetAge}

### 아이의 선택 기록:
${choiceDetails}

### 심리 특성 점수:
${scoreDetails}

### 대표 캐릭터 유형: ${character.title} - ${character.desc}

위 데이터를 바탕으로 아동 심리 전문가 관점에서 다음을 포함한 상세 분석 리포트를 작성해주세요:
1. 종합 심리 프로파일 (아이의 전반적 심리 특성)
2. 각 선택에 대한 심리학적 해석 (왜 이런 선택을 했는지)
3. 강점 영역과 성장 가능 영역
4. 구체적인 양육 가이드 (일상에서 실천 가능한 5가지 방법)
5. 전문가 추천 활동 (놀이/학습/상호작용)

한국어로 작성하고, 부모가 이해하기 쉽게 따뜻한 톤으로 작성해주세요. 최소 1500자 이상으로 상세하게 작성해주세요.`,
          therapistType: 'child_psychologist'
        }
      });

      if (data?.summary?.sections) {
        const analysisText = data.summary.sections
          .map((s: any) => `### ${s.icon || ''} ${s.title}\n${s.content}`)
          .join('\n\n');
        setAiAnalysis(analysisText);
      } else if (data?.summary?.coreMessage) {
        setAiAnalysis(data.summary.coreMessage);
      }
    } catch (err) {
      console.error('[GameResultReport] AI analysis error:', err);
      // Fallback to local detailed interpretation
      generateLocalAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateLocalAnalysis = () => {
    const sections: string[] = [];

    sections.push(`### 🧒 종합 심리 프로파일\n우리 아이는 "${character.title}" 유형으로, ${character.desc} 게임 속 선택 패턴을 분석한 결과, 총 ${choices.length}개의 상황에서 일관된 심리적 경향성이 관찰되었습니다.`);

    const strongDims = topDimensions.slice(0, 3);
    sections.push(`### 💪 강점 영역\n${strongDims.map(([dim, score]) => {
      const meta = dimensionMeta[dim as PsychDimension];
      const interp = detailedInterpretations[dim];
      return `**${meta?.icon} ${meta?.label} (${score}%)**: ${interp?.high || ''}`;
    }).join('\n\n')}`);

    sections.push(`### 🌱 성장 가능 영역\n${bottomDimensions.map(([dim, score]) => {
      const meta = dimensionMeta[dim as PsychDimension];
      const interp = detailedInterpretations[dim];
      return `**${meta?.icon} ${meta?.label} (${score}%)**: ${interp?.low || ''}`;
    }).join('\n\n')}`);

    sections.push(`### 👁️ 선택별 심리 해석\n${choices.map((record, i) => {
      const scene = chapter.scenes.find(s => s.id === record.sceneId);
      const choice = scene?.choices.find(c => c.id === record.choiceId);
      return `**${i + 1}. ${scene?.title}** → "${choice?.text}"\n${record.parentNote ? `💡 해석: ${record.parentNote}` : ''}`;
    }).join('\n\n')}`);

    sections.push(`### 🏠 양육 가이드\n${strongDims.map(([dim]) => {
      const interp = detailedInterpretations[dim];
      return `✅ ${interp?.guide || ''}`;
    }).join('\n')}\n\n${bottomDimensions.map(([dim]) => {
      const interp = detailedInterpretations[dim];
      return `💡 ${interp?.guide || ''}`;
    }).join('\n')}`);

    setAiAnalysis(sections.join('\n\n'));
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadResultAsPDF(
        'game-result-report',
        `금쪽상담소_${character.title}_${new Date().toISOString().slice(0, 10)}`,
        () => toast({ title: 'PDF 다운로드 완료', description: '게임 상담 리포트가 저장되었습니다.' }),
        (error) => toast({ title: 'PDF 다운로드 실패', description: error.message, variant: 'destructive' })
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (isKakaoInitialized()) {
      shareToKakao({
        title: `🎮 금쪽상담소: 우리 아이는 "${character.title}"`,
        description: `${character.desc} 게임으로 알아보는 우리 아이 심리 특성!`,
        buttonText: '나도 해보기',
        url: 'https://aihpro.app/metaverse-voice',
      });
    } else {
      navigator.clipboard.writeText(`🎮 금쪽상담소 결과: 우리 아이는 "${character.title}" - ${character.desc}\n\nhttps://aihpro.app/metaverse-voice`);
      toast({ title: '링크 복사 완료', description: '공유 링크가 클립보드에 복사되었습니다.' });
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderAnalysis = () => {
    if (!aiAnalysis) return null;

    const sections = aiAnalysis.split(/### /).filter(Boolean);
    return sections.map((section, idx) => {
      const lines = section.trim().split('\n');
      const title = lines[0];
      const content = lines.slice(1).join('\n').trim();
      const isExpanded = expandedSections[`s-${idx}`] !== false; // default open

      return (
        <div key={idx} className="border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection(`s-${idx}`)}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-sm font-semibold text-white">{title}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>
          {isExpanded && (
            <div className="p-3 pt-1 space-y-2">
              {content.split('\n\n').filter(Boolean).map((para, pIdx) => (
                <p key={pIdx} className="text-[13px] leading-[1.8] text-white/80">
                  {para.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-20">
      {/* PDF 영역 시작 */}
      <div id="game-result-report">
        {/* 캐릭터 카드 */}
        <Card className={`p-6 bg-gradient-to-br ${gradientFrom} ${gradientTo} text-center border-2 ${accentBorder}`}>
          <motion.div className="text-6xl mb-3" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: 2 }}>
            {character.emoji}
          </motion.div>
          <h2 className={`text-xl font-bold ${accentText}`}>모험 완료! 우리 아이는...</h2>
          <h3 className={`text-2xl font-extrabold mt-1 bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
            "{character.title}"
          </h3>
          <p className="text-sm text-white/60 mt-2">{character.desc}</p>
          <p className="text-[10px] text-white/40 mt-2">
            {chapter.title} | {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {ttsEnabled && onSpeak && (
            <Button
              variant="ghost"
              size="sm"
              className={`mt-3 ${accentText}`}
              onClick={() => onSpeak(`우리 아이는 ${character.title}이에요! ${character.desc}`)}
              disabled={isSpeaking || ttsLoading}
            >
              {isSpeaking ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Volume2 className="w-4 h-4 mr-1" />}
              결과 듣기
            </Button>
          )}
        </Card>

        {/* 심리 특성 차트 */}
        <Card className="p-5 bg-white/5 border-white/10 mt-4">
          <h3 className="font-bold mb-4 text-white">📊 심리 특성 분석</h3>
          <div className="space-y-3">
            {Object.entries(dimensionMeta).map(([dim, meta]) => {
              const score = results[dim as PsychDimension];
              return (
                <div key={dim} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">{meta.icon} {meta.label}</span>
                    <span className="text-xs text-white/50">{score}%</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30">
                    <span>{meta.lowLabel}</span>
                    <span>{meta.highLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 선택 기록 */}
        <Card className="p-5 bg-white/5 border-white/10 mt-4">
          <h3 className="font-bold mb-3 text-white">👁️ 선택 기록</h3>
          <div className="space-y-2">
            {choices.map((record, i) => {
              const scene = chapter.scenes.find(s => s.id === record.sceneId);
              const choice = scene?.choices.find(c => c.id === record.choiceId);
              return (
                <div key={i} className="flex gap-2 items-start text-xs">
                  <span className={`${accentText} font-bold shrink-0`}>{i + 1}.</span>
                  <div>
                    <span className="font-medium text-white">{scene?.title}</span>
                    <span className="text-white/60"> → {choice?.text}</span>
                    {record.parentNote && (
                      <p className="text-amber-400 italic mt-0.5">💡 {record.parentNote}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI 상세 분석 */}
        <Card className="p-5 bg-white/5 border-white/10 mt-4">
          <h3 className="font-bold mb-3 text-white">🧠 AI 전문가 심층 분석</h3>
          {isAnalyzing ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm text-white/60">아이의 선택 패턴을 분석하고 있어요...</p>
              <p className="text-xs text-white/40">약 10-15초 소요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {renderAnalysis()}
            </div>
          )}
        </Card>

        {/* 양육 가이드 (로컬) */}
        <Card className="p-5 bg-green-500/10 border-green-500/30 mt-4">
          <h3 className="font-bold mb-3 text-green-300">🌱 핵심 양육 가이드</h3>
          <div className="space-y-2 text-sm text-green-200">
            {topDimensions.slice(0, 2).map(([dim]) => {
              const interp = detailedInterpretations[dim];
              return (
                <div key={dim} className="flex gap-2">
                  <span className="shrink-0">✅</span>
                  <span>{interp?.guide || '개별 특성에 맞는 지도가 필요해요.'}</span>
                </div>
              );
            })}
            {bottomDimensions.map(([dim]) => {
              const interp = detailedInterpretations[dim];
              return interp?.guide ? (
                <div key={dim} className="flex gap-2">
                  <span className="shrink-0">💡</span>
                  <span>{interp.guide}</span>
                </div>
              ) : null;
            })}
          </div>
        </Card>

        <p className="text-[9px] text-center text-white/30 mt-3 px-4">
          © AIHPRO.COM | 이 결과는 놀이 기반 관찰 자료이며, 전문적인 심리 진단을 대체하지 않습니다.
        </p>
      </div>
      {/* PDF 영역 끝 */}

      {/* 액션 버튼 */}
      <div className="space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading || isAnalyzing}
            variant="outline"
            className="gap-2 border-white/20 text-white hover:bg-white/10"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            PDF 저장
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="gap-2 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
          >
            <Share2 className="w-4 h-4" />
            공유하기
          </Button>
        </div>

        <Button onClick={onRestart} variant="outline" className="w-full gap-2 border-white/20 text-white hover:bg-white/10">
          <RotateCcw className="h-4 w-4" /> 다시 모험하기
        </Button>
        <Button onClick={() => window.location.href = '/premium-assessment'} className={`w-full gap-2 bg-gradient-to-r ${titleGradient} text-white`}>
          🔬 전문 심리검사 받아보기
        </Button>
      </div>
    </motion.div>
  );
}
