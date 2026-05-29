import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileDown, RotateCcw, Loader2, Volume2, ChevronDown, ChevronUp, Image, ArrowRight, ArrowLeft, Camera } from 'lucide-react';
import { dimensionMeta, type PsychDimension, type StoryChapter } from '@/data/storyScenarios';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import html2canvas from 'html2canvas';
import VisualSummaryCard, { type VisualSummaryData } from '@/components/visual-summary/VisualSummaryCard';
import ProgressComparison from '@/components/progress/ProgressComparison';
import { useProgressTracking } from '@/hooks/useProgressTracking';

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

const adultCharacterTypes: Record<string, { title: string; emoji: string; desc: string }> = {
  empathy: { title: '깊이 공감하는 조력자', emoji: '💝', desc: '타인의 감정을 섬세하게 읽고 곁을 지키는 성향이에요.' },
  creativity: { title: '관점을 바꾸는 사고가', emoji: '✨', desc: '익숙한 틀을 비틀어 새로운 해법을 만들어내는 성향이에요.' },
  independence: { title: '자기 결정형 개척자', emoji: '🦸', desc: '스스로 길을 정하고 끝까지 책임지는 자율적 성향이에요.' },
  sociality: { title: '관계를 잇는 커넥터', emoji: '👑', desc: '사람과 사람 사이에서 에너지를 얻고 조율하는 성향이에요.' },
  self_esteem: { title: '단단한 자기확신가', emoji: '⭐', desc: '자기 가치를 신뢰하고 흔들림 속에서도 중심을 잡는 성향이에요.' },
  emotional_regulation: { title: '평정심의 조율자', emoji: '🧘', desc: '감정의 진폭을 다스리며 합리적으로 반응하는 성향이에요.' },
  anxiety: { title: '안정 지향의 정착자', emoji: '🕊️', desc: '예측 가능한 환경에서 차분히 힘을 발휘하는 성향이에요.' },
  aggression: { title: '추진력 강한 실행가', emoji: '⚡', desc: '주저하지 않고 행동으로 돌파하는 강한 추진형 성향이에요.' },
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

const adultInterpretations: Record<string, { high: string; low: string; guide: string }> = {
  empathy: {
    high: '타인의 감정 신호를 빠르게 포착하고 배려하는 능력이 두드러집니다. 관계와 협업 장면에서 신뢰를 얻는 핵심 자산이지만, 감정 동조가 과해지면 자신이 소진될 수 있어 경계 설정이 중요합니다.',
    low: '감정보다 사실·논리 기반으로 상황을 처리하는 성향입니다. 의사결정에 강점이 있지만, 가까운 관계에서는 "내 말이 어떻게 들렸을지" 한 번 더 확인하는 습관이 도움이 됩니다.',
    guide: '하루 1번 가까운 사람의 감정을 한 문장으로 짚어 보는 "감정 라벨링" 루틴을 시도해 보세요.',
  },
  creativity: {
    high: '관점을 전환해 새로운 해법을 만들어내는 사고 유연성이 강합니다. 정해진 틀이 적은 문제에서 진가를 발휘하는 유형입니다.',
    low: '검증된 방식과 구조화된 환경에서 안정적으로 성과를 냅니다. 새로운 시도가 부담스러울 수 있으니, 작게 쪼개 실험하는 방식을 권장합니다.',
    guide: '주 1회 "다르게 해볼 수 있는 한 가지"를 메모하고 작게 실행해 보세요.',
  },
  independence: {
    high: '스스로 결정을 내리고 책임지는 자율성이 강합니다. 단, 모든 것을 혼자 짊어지지 않도록 정기적으로 도움을 요청하는 연습이 필요합니다.',
    low: '주변과의 합의·지지를 통해 안정감을 얻는 협력형 성향입니다. 의사결정에서 본인의 선호를 한 번 더 분명히 표현해 보는 연습을 추천합니다.',
    guide: '오늘 결정한 것 중 "내 기준으로 정한 것 1가지"를 매일 기록해 보세요.',
  },
  sociality: {
    high: '사람과의 상호작용에서 에너지를 얻는 외향적 성향이 뚜렷합니다. 관계 자산이 풍부한 만큼, 의도적으로 혼자만의 회복 시간을 확보하는 것이 중요합니다.',
    low: '깊고 좁은 관계, 혼자만의 시간에서 충전되는 내향적 성향입니다. 무리한 사교 대신 소수의 정기적 만남이 더 큰 만족을 줍니다.',
    guide: '본인의 사회적 배터리 패턴(언제 충전·언제 방전되는지)을 1주일간 기록해 보세요.',
  },
  self_esteem: {
    high: '자기 가치에 대한 확신이 안정적입니다. 외부 평가에 흔들리지 않는 단단한 자존감이 강점입니다.',
    low: '자기 평가가 외부 피드백에 영향을 많이 받는 시기일 수 있습니다. 작은 성취를 기록하는 "성공 일지"가 자존감 회복에 도움이 됩니다.',
    guide: '하루 끝에 "오늘 잘한 일 3가지"를 한 줄씩 적는 루틴을 권장합니다.',
  },
  emotional_regulation: {
    high: '강한 자극 앞에서도 호흡을 고르고 합리적으로 반응하는 조절력이 우수합니다. 위기 장면에서 신뢰를 얻는 자질입니다.',
    low: '감정의 진폭이 큰 시기일 수 있습니다. 감정 발생 직후 "사실 / 해석 / 감정"을 분리해 적는 메모 습관이 진폭을 좁혀 줍니다.',
    guide: '강한 감정이 올라올 때 4-7-8 호흡(4초 들이마시고 7초 멈추고 8초 내쉬기)을 3회 반복해 보세요.',
  },
  anxiety: {
    high: '예측 가능한 환경에서 안정적으로 기능합니다. 새로운 변화 앞에서도 비교적 평정심을 유지하는 편입니다.',
    low: '불확실성·과부하 상황에서 긴장이 높아지는 시기일 수 있습니다. 일정·할 일을 시각화하면 불안 강도가 낮아집니다.',
    guide: '잠들기 30분 전 "내일 가장 중요한 1가지"만 정해 두는 습관을 추천합니다.',
  },
  aggression: {
    high: '추진력과 실행 에너지가 강합니다. 결단이 빠른 만큼, 의사결정 직전 "한 박자 쉬기" 루틴이 후회 비용을 줄여 줍니다.',
    low: '갈등을 피하고 온화하게 조율하는 편입니다. 본인의 권리·경계가 침해될 때 분명히 "아니오"라고 말하는 연습이 필요합니다.',
    guide: '주 1회 "내가 양보한 장면"을 돌아보고, 다음에 어떻게 표현할지 한 문장으로 적어 보세요.',
  },
};

export default function GameResultReport({
  results, choices, chapter, onRestart,
  ttsEnabled, onSpeak, isSpeaking, ttsLoading,
  variant = '3d',
}: GameResultReportProps) {
  const navigate = useNavigate();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [visualNoteData, setVisualNoteData] = useState<VisualSummaryData | null>(null);
  const [illustrationImage, setIllustrationImage] = useState<string | null>(null);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [showVisualNote, setShowVisualNote] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const { toast } = useToast();
  const { saveProgress } = useProgressTracking();

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

  const dimensionLabels: Record<string, string> = {};
  Object.entries(dimensionMeta).forEach(([key, meta]) => {
    dimensionLabels[key] = meta.label;
  });

  // Save progress + AI analysis
  useEffect(() => {
    generateAIAnalysis();
    // Save to progress tracking
    if (!savedProgress) {
      saveProgress({
        source_type: 'game_counseling',
        source_id: chapter.id,
        source_label: chapter.title,
        dimension_scores: results as Record<string, number>,
        metadata: { choices: choices.length, characterType: top, variant }
      });
      setSavedProgress(true);
    }
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
          content: `## 금쪽상담소 게임 상담 결과 - 전문가급 심층 분석 요청

### 스토리: ${chapter.title}
### 대상 연령: ${chapter.targetAge}

### 아이의 선택 기록:
${choiceDetails}

### 심리 특성 점수:
${scoreDetails}

### 대표 캐릭터 유형: ${character.title} - ${character.desc}

위 데이터를 바탕으로 아동 심리 전문가 관점에서 다음을 포함한 **심층 분석 리포트**를 작성해주세요:

1. **종합 심리 프로파일** - 아이의 전반적 심리 특성을 발달심리학(Piaget, Erikson) 이론에 근거하여 해석
2. **선택 패턴 심리학적 해석** - 각 선택이 반영하는 내면의 욕구와 심리적 동기 분석
3. **강점 영역 심층 분석** - 강점이 미래에 어떤 역량으로 발전할 수 있는지 구체적으로 설명
4. **성장 가능 영역** - 발달 단계에서 자연스러운 부분과 개입이 필요한 부분 구분
5. **맞춤형 양육 전략** - 일상에서 즉시 실천 가능한 7가지 구체적 방법 (놀이, 대화법, 환경 조성 포함)
6. **전문가 추천 활동** - 연령별 맞춤 놀이/학습/상호작용 프로그램 제안
7. **발달 예측 및 추적 포인트** - 3개월, 6개월 후 관찰해야 할 발달 지표

한국어로 작성하고, 부모가 이해하기 쉽되 전문적 깊이를 유지하세요. 최소 2500자 이상으로 상세하게 작성하세요.`,
          therapistType: 'child_psychologist',
          deepAnalysis: true
        }
      });

      if (data?.summary?.sections) {
        const analysisText = data.summary.sections
          .map((s: any) => `### ${s.icon || ''} ${s.title}\n${s.content || s.points?.join('\n') || ''}`)
          .join('\n\n');
        setAiAnalysis(analysisText);
      } else if (data?.summary?.coreMessage) {
        setAiAnalysis(data.summary.coreMessage);
      } else {
        // AI 응답이 예상 형식이 아닌 경우 로컬 분석으로 대체
        console.warn('[GameResultReport] AI response format unexpected, using local analysis');
        generateLocalAnalysis();
      }
    } catch (err) {
      console.error('[GameResultReport] AI analysis error:', err);
      generateLocalAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 비주얼 노트 생성
  const generateVisualNote = async () => {
    setIsGeneratingNote(true);
    try {
      const scoreDetails = Object.entries(results)
        .map(([dim, score]) => `${dimensionMeta[dim as PsychDimension]?.label || dim}: ${score}%`)
        .join(', ');

      const choiceDetails = choices.map((record, i) => {
        const scene = chapter.scenes.find(s => s.id === record.sceneId);
        const choice = scene?.choices.find(c => c.id === record.choiceId);
        return `${i + 1}. ${scene?.title} → ${choice?.text}`;
      }).join('\n');

      const { data, error } = await supabase.functions.invoke('generate-visual-summary', {
        body: {
          type: 'counseling',
          content: `금쪽상담소 게임 결과 비주얼 노트 생성:
캐릭터 유형: ${character.title} (${character.emoji})
설명: ${character.desc}
스토리: ${chapter.title}
심리 점수: ${scoreDetails}
선택 기록: ${choiceDetails}

이 데이터를 바탕으로 부모가 한눈에 이해할 수 있는 비주얼 요약 노트를 만들어주세요.
- 제목은 "🎮 ${character.title}" 형태로
- 아이의 심리 특성, 강점, 성장 포인트, 양육 팁을 포함
- 따뜻하고 긍정적인 톤`,
          therapistType: 'child_psychologist'
        }
      });

      if (data?.summary) {
        setVisualNoteData(data.summary as VisualSummaryData);
        if (data.illustrationImage) {
          setIllustrationImage(data.illustrationImage);
        }
        setShowVisualNote(true);
        toast({ title: '비주얼 노트 생성 완료! ✨' });
      }
    } catch (err) {
      console.error('[GameResultReport] Visual note error:', err);
      toast({ title: '비주얼 노트 생성 실패', description: '다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setIsGeneratingNote(false);
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

  const handleSaveImage = async () => {
    const element = document.getElementById('game-result-report');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { 
        backgroundColor: '#1e293b', 
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `금쪽상담소_${character.title}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: '이미지 저장 완료', description: '갤러리에서 확인해주세요.' });
    } catch (err) {
      console.error('Image save error:', err);
      toast({ title: '이미지 저장 실패', variant: 'destructive' });
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
      {/* PDF 영역 시작 - 다크 테마 리포트 */}
      <div id="game-result-report" className="bg-slate-900 rounded-2xl p-4 space-y-4">
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

        {/* 그림자에서 도망 전용 — 성격 기질 프로파일 */}
        {chapter.id === 'shadow_escape' && (() => {
          const r = results;
          const profiles = [
            { key: 'confront', label: '직면형 기질', tag: 'CONFRONTER', score: r.self_esteem + r.independence + (100 - r.anxiety), desc: '위협 신호 앞에서 회피보다 정면 응시를 택하는 경향. 위기 상황에서 의사결정이 빠르고, 사후 자기효능감이 강화되는 패턴입니다.' },
            { key: 'regulate', label: '안정 조율형 기질', tag: 'REGULATOR', score: r.emotional_regulation + r.creativity + (100 - r.aggression), desc: '환경(가게/거리)을 활용해 스스로 안정화하는 능력이 두드러집니다. 감정의 진폭을 좁히고 합리적 대안을 만들어내는 기질.' },
            { key: 'connect', label: '연결 지지형 기질', tag: 'CONNECTOR', score: r.sociality + r.empathy + r.emotional_regulation, desc: '위협을 혼자 견디기보다 관계로 풀어내는 경향. 사회적 안전망을 통해 회복탄력성을 확보합니다.' },
            { key: 'impulse', label: '돌파 행동형 기질', tag: 'BREAKER', score: r.aggression + r.independence + (100 - r.anxiety), desc: '문을 당기고, 지름길을 택하는 능동적 돌파형. 결단력은 강하나 감정 조절 코칭이 효과를 키웁니다.' },
            { key: 'avoid', label: '경계 회피형 기질', tag: 'AVOIDER', score: r.anxiety + (100 - r.self_esteem) + (100 - r.independence), desc: '위협 신호에 민감하고 회피로 안정화하는 경향. 위험 감지 능력은 강점이며, 점진적 노출이 도움이 됩니다.' },
          ].sort((a, b) => b.score - a.score);
          const top = profiles[0];
          const second = profiles[1];
          return (
            <Card className="p-5 bg-gradient-to-br from-zinc-900 to-slate-800 border border-[#C8B88A]/30 ring-1 ring-[#C8B88A]/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] text-[#C8B88A] uppercase">
                <span className="w-1 h-1 rounded-full bg-[#C8B88A]" /> Temperament Profile · {top.tag}
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">{top.label}</h3>
              <p className="mt-2 text-[13px] text-white/70 leading-relaxed break-keep">{top.desc}</p>
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[10px] text-white/40 mb-1.5 tracking-wider">SECONDARY</div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-white/80">{second.label}</span>
                  <span className="text-[#C8B88A]/80 font-mono text-[10px]">{second.tag}</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1">
                {profiles.map((p, i) => (
                  <div key={p.key} className="text-center">
                    <div className="h-12 flex items-end justify-center">
                      <motion.div
                        className={`w-full rounded-sm ${p.key === top.key ? 'bg-[#C8B88A]' : 'bg-white/15'}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(8, (p.score / profiles[0].score) * 100)}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.12 }}
                      className="mt-1 text-[9px] text-white/50 truncate"
                    >
                      {p.label.replace(' 기질', '')}
                    </motion.div>
                  </div>
                ))}
              </div>

            </Card>
          );
        })()}

        {/* 심리 특성 차트 */}
        <Card className="p-5 bg-white/5 border-white/10 mt-4">
          <h3 className="font-bold mb-4 text-white">📊 심리 특성 분석</h3>
          <div className="space-y-3">
            {Object.entries(dimensionMeta).map(([dim, meta], i) => {
              const score = results[dim as PsychDimension];
              return (
                <motion.div
                  key={dim}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">{meta.icon} {meta.label}</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + i * 0.07 }}
                      className="text-xs text-white/50 tabular-nums"
                    >
                      {score}%
                    </motion.span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.9, delay: 0.25 + i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30">
                    <span>{meta.lowLabel}</span>
                    <span>{meta.highLabel}</span>
                  </div>
                </motion.div>
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

        {/* 변화 추적 비교 */}
        <div className="mt-4">
          <ProgressComparison
            currentScores={results as Record<string, number>}
            sourceType="game_counseling"
            sourceId={chapter.id}
            dimensionLabels={dimensionLabels}
          />
        </div>

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
          © AIHPRO.APP | 이 결과는 놀이 기반 관찰 자료이며, 전문적인 심리 진단을 대체하지 않습니다.
        </p>
      </div>
      {/* PDF 영역 끝 */}

      {/* 비주얼 노트 */}
      {showVisualNote && visualNoteData ? (
        <div className="mt-4">
          <VisualSummaryCard
            data={visualNoteData}
            illustrationImage={illustrationImage}
          />
        </div>
      ) : null}

      {/* 액션 버튼 - 어두운 배경에서 잘 보이도록 스타일 수정 */}
      <div className="space-y-2 pt-4">
        {/* 비주얼 노트 생성 버튼 */}
        <Button
          onClick={generateVisualNote}
          disabled={isGeneratingNote || isAnalyzing}
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-violet-500/20"
        >
          {isGeneratingNote ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
          📋 비주얼 노트 생성하기
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading || isAnalyzing}
            className="gap-2 bg-slate-700 hover:bg-slate-600 text-white border-0 h-11 rounded-xl"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            PDF 저장
          </Button>
          <Button
            onClick={handleSaveImage}
            className="gap-2 bg-amber-600 hover:bg-amber-500 text-white border-0 h-11 rounded-xl"
          >
            <Camera className="w-4 h-4" />
            이미지 저장
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => navigate('/metaverse-voice')}
            className="gap-2 bg-slate-800 hover:bg-slate-700 text-white border-0 h-11 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" /> 금쪽상담소
          </Button>
          <Button
            onClick={onRestart}
            className="gap-2 bg-slate-700 hover:bg-slate-600 text-white border-0 h-11 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" /> 다시 모험하기
          </Button>
        </div>
        <Button
          onClick={() => navigate('/premium-assessment')}
          className={`w-full gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold h-12 rounded-xl shadow-lg`}
        >
          🔬 전문 심리검사 받아보기
        </Button>
      </div>
    </motion.div>
  );
}
