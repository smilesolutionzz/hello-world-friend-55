import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface ParentingStyleResultProps {
  results: any;
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const categoryNamesKo: Record<string, string> = {
  warmth_acceptance: '온정수용',
  behavioral_control: '행동통제',
  psychological_control: '심리통제',
  autonomy_support: '자율성지지',
  communication_support: '의사소통지지',
};

const categoryNamesEn: Record<string, string> = {
  warmth_acceptance: 'Warmth & Acceptance',
  behavioral_control: 'Behavioral Control',
  psychological_control: 'Psychological Control',
  autonomy_support: 'Autonomy Support',
  communication_support: 'Communication Support',
};

const ParentingStyleResult = ({ results, onBack }: ParentingStyleResultProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const categoryNames = isEnglish ? categoryNamesEn : categoryNamesKo;

  useAutoSaveTestResult({
    testType: isEnglish ? 'Parenting Style Test' : '양육 스타일 검사',
    results: { scores: results.scores, dominantStyle: results.dominantStyle, childAge: results.childAge },
    severity: isEnglish ? 'Average' : '보통',
    ageGroup: 'adult',
  });

  useEffect(() => {
    const run = async () => {
      try {
        setIsAnalyzing(true);
        const { data, error } = await supabase.functions.invoke('parenting-style-analyzer', {
          body: { results: results.scores, assessmentType: 'parentingStyle', childAge: results.childAge, childGender: results.childGender },
        });
        if (error) throw error;
        setAnalysis(data?.analysis || getDefault());
      } catch {
        setAnalysis(getDefault());
      } finally {
        setIsAnalyzing(false);
      }
    };
    run();
  }, []);

  const getDefault = () => {
    const primary = Object.entries(results.scores).sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
    const name = categoryNames[primary] || primary;
    return isEnglish
      ? `Parenting Style Analysis Results.\n\nDominant Style: ${name}\n\nBalancing different parenting styles is important.`
      : `양육 스타일 분석 결과입니다.\n\n주된 양육 스타일: ${name}\n\n각 양육 스타일의 균형을 맞추는 것이 중요합니다.`;
  };

  const getColor = (s: number) => s >= 3.5 ? 'bg-green-500' : s >= 2.5 ? 'bg-yellow-500' : 'bg-orange-500';
  const getLevel = (s: number) => s >= 3.5 ? (isEnglish ? 'High' : '높음') : s >= 2.5 ? (isEnglish ? 'Average' : '보통') : (isEnglish ? 'Low' : '낮음');

  const domains: DomainScore[] = Object.entries(results.scores).map(([key, score]) => ({
    key,
    label: categoryNames[key] || key,
    score: parseFloat(Number(score).toFixed(1)),
    maxScore: 4,
    level: getLevel(Number(score)),
    color: getColor(Number(score)),
  }));

  const scores = Object.values(results.scores as Record<string, number>).map(Number).filter(n => !isNaN(n));
  const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['💜', '📊', '💡', '🎯', '🌱', '💪', '📋'];
    return paragraphs.slice(0, 7).map((p, idx) => {
      const firstLine = p.split('\n')[0].replace(/[#*]/g, '').trim();
      const rest = p.split('\n').slice(1).join('\n').trim() || p;
      return { id: `s-${idx}`, icon: icons[idx] || '📋', title: firstLine.length > 5 && firstLine.length < 50 ? firstLine : (isEnglish ? `Analysis ${idx + 1}` : `분석 ${idx + 1}`), content: rest, defaultOpen: idx === 0 };
    });
  };

  const aiSections = parseAISections(analysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'ParentingStyle_Results' : '양육스타일_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={isEnglish ? "Parenting Style Test" : "양육 스타일 검사"} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? "Parenting Style Assessment Results" : "부모양육태도 검사 결과"}
      subtitle={isEnglish ? "Scientific Parenting Style Analysis" : "과학적 양육태도 심층분석"}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={avg.toFixed(1)}
      totalLabel={isEnglish ? "Average Score" : "평균 점수"}
      scoreUnit="/ 4.0"
      scoreSeverity={getLevel(avg)}
      severityColor={avg >= 3.5 ? 'text-green-600 border-green-300' : avg >= 2.5 ? 'text-yellow-600 border-yellow-300' : 'text-orange-600 border-orange-300'}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Parenting Style' : '양육 스타일',
            subtitle: isEnglish ? '5 Domain Analysis' : '5개 영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(results.scores).map(([k, v]) => [k, (Number(v) / 4) * 7])),
            maxScore: 7,
            categoryTranslations: categoryNames,
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default ParentingStyleResult;
