import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface SelfEsteemTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    level: string;
  };
  onRestart: () => void;
}

function getDevelopmentLevel(total: number): string {
  if (total >= 60) return '정상발달';
  if (total >= 45) return '경계선';
  if (total >= 30) return '경도 지연';
  if (total >= 15) return '중등도 지연';
  return '중도 지연';
}

const levelConfigKo: Record<string, { label: string; color: string }> = {
  '정상발달': { label: '정상발달', color: 'text-green-600 border-green-300' },
  '경계선': { label: '경계선', color: 'text-blue-600 border-blue-300' },
  '경도 지연': { label: '경도 지연', color: 'text-yellow-600 border-yellow-300' },
  '중등도 지연': { label: '중등도 지연', color: 'text-orange-600 border-orange-300' },
  '중도 지연': { label: '중도 지연', color: 'text-destructive border-destructive/30' },
};

const levelConfigEn: Record<string, { label: string }> = {
  '정상발달': { label: 'Normal' },
  '경계선': { label: 'Borderline' },
  '경도 지연': { label: 'Mild Delay' },
  '중등도 지연': { label: 'Moderate Delay' },
  '중도 지연': { label: 'Severe Delay' },
};

export default function SelfEsteemTestResult({ result, onRestart }: SelfEsteemTestResultProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const developmentLevel = getDevelopmentLevel(result.total);
  const config = levelConfigKo[developmentLevel] || levelConfigKo['정상발달'];

  useAutoSaveTestResult({
    testType: '자존감 검사',
    results: { total: result.total, average: result.average, level: result.level },
    analysis: aiAnalysis,
    severity: result.level,
  });

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-emotional-development', {
          body: { total: result.total, average: result.average, level: developmentLevel, answers: result.answers }
        });
        if (error) throw error;
        setAiAnalysis(data?.analysis || '');
      } catch {
        setAiAnalysis('');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [result]);

  const areaScoresRaw = [
    { key: 'emotion', label: isEnglish ? 'Emotion Recognition' : '감정인식', score: result.average },
    { key: 'attachment', label: isEnglish ? 'Attachment' : '애착관계', score: result.average * 0.95 },
    { key: 'regulation', label: isEnglish ? 'Regulation' : '감정조절', score: result.average * 0.9 },
    { key: 'empathy', label: isEnglish ? 'Empathy' : '공감능력', score: result.average * 1.05 },
  ];

  const getColor = (s: number) => s >= 2.5 ? 'bg-green-500' : s >= 2 ? 'bg-yellow-500' : s >= 1.5 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 2.5 ? (isEnglish ? 'Good' : '양호') : s >= 2 ? (isEnglish ? 'Fair' : '보통') : (isEnglish ? 'Concern' : '관심필요');

  const domains: DomainScore[] = areaScoresRaw.map(a => ({
    key: a.key,
    label: a.label,
    score: parseFloat(a.score.toFixed(1)),
    maxScore: 3,
    level: getLevel(a.score),
    color: getColor(a.score),
  }));

  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
    let match, idx = 0;
    while ((match = regex.exec(text)) !== null) {
      const title = match[1].replace(/^[^\w가-힣]*/, '').trim();
      const content = match[2].replace(/\*\*/g, '').trim();
      if (content.length > 10) {
        const emojiMatch = match[1].match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        sections.push({ id: `s-${idx}`, icon: emojiMatch?.[0] || '📋', title, content, defaultOpen: idx === 0 });
        idx++;
      }
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(aiAnalysis);
  const displayLevel = isEnglish ? levelConfigEn[developmentLevel]?.label || developmentLevel : developmentLevel;

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'SelfEsteem_Result' : '자존감_검사_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) {
    return <AnalysisLoadingScreen testName={isEnglish ? 'Emotional Analysis' : '정서발달 분석'} estimatedSeconds={20} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Emotional Development Checklist' : '영유아 발달 체크리스트 결과'}
      subtitle={isEnglish ? 'Emotional development assessment' : '정서발달 종합 평가'}
      onBack={onRestart}
      onDownload={handleDownload}
      totalScore={result.total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit="/ 75"
      scoreSeverity={displayLevel}
      severityColor={config.color}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Emotional Development' : '정서발달 체크',
            subtitle: isEnglish ? '4-domain analysis' : '4개 영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(areaScoresRaw.map(a => [a.key, a.score / 3 * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(areaScoresRaw.map(a => [a.key, a.label])),
            riskLevel: result.total >= 45 ? 'low' : result.total >= 30 ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
}
