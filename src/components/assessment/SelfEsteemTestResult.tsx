import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
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

function getSelfEsteemLevel(average: number): string {
  if (average >= 4.5) return '매우 높음';
  if (average >= 3.5) return '높음';
  if (average >= 2.5) return '보통';
  if (average >= 1.5) return '낮음';
  return '매우 낮음';
}

const levelConfigKo: Record<string, { label: string; color: string }> = {
  '매우 높음': { label: '매우 높음', color: 'text-green-600 border-green-300' },
  '높음': { label: '높음', color: 'text-blue-600 border-blue-300' },
  '보통': { label: '보통', color: 'text-yellow-600 border-yellow-300' },
  '낮음': { label: '낮음', color: 'text-orange-600 border-orange-300' },
  '매우 낮음': { label: '매우 낮음', color: 'text-destructive border-destructive/30' },
};

const levelConfigEn: Record<string, { label: string }> = {
  '매우 높음': { label: 'Very High' },
  '높음': { label: 'High' },
  '보통': { label: 'Average' },
  '낮음': { label: 'Low' },
  '매우 낮음': { label: 'Very Low' },
};

export default function SelfEsteemTestResult({ result, onRestart }: SelfEsteemTestResultProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const selfEsteemLevel = getSelfEsteemLevel(result.average);
  const config = levelConfigKo[selfEsteemLevel] || levelConfigKo['보통'];

  useAutoSaveTestResult({
    testType: isEnglish ? 'Self-Esteem Test' : '자존감 검사',
    results: { total: result.total, average: result.average, level: result.level },
    analysis: aiAnalysis,
    severity: result.level,
  });

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('instant-ai-analysis', {
          body: { 
            testId: 'selfesteem', 
            answers: result.answers, 
            total: result.total, 
            average: result.average, 
            level: selfEsteemLevel,
            testTitle: isEnglish ? 'Child Self-Worth Assessment' : '자녀 자아가치 검사'
          }
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
    { key: 'selfworth', label: isEnglish ? 'Self-Worth' : '자기가치감', score: result.average },
    { key: 'confidence', label: isEnglish ? 'Confidence' : '자신감', score: result.average * 0.95 },
    { key: 'selfacceptance', label: isEnglish ? 'Self-Acceptance' : '자기수용', score: result.average * 0.9 },
    { key: 'socialesteem', label: isEnglish ? 'Social Esteem' : '사회적 자존감', score: result.average * 1.05 },
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
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
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
