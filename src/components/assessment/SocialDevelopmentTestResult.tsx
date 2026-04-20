import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import { buildScoreBasedFallback } from '@/utils/scoreBasedFallback';

interface SocialDevelopmentTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  };
  onBack: () => void;
  onRestart: () => void;
}

const domainDefs: Record<string, { indices: number[]; ko: string; en: string }> = {
  communication: { indices: [0, 3, 8, 17], ko: '의사소통', en: 'Communication' },
  cooperation: { indices: [1, 4, 11, 16], ko: '협력능력', en: 'Cooperation' },
  empathy: { indices: [5, 12, 18], ko: '공감능력', en: 'Empathy' },
  conflict: { indices: [2, 6, 15], ko: '갈등해결', en: 'Conflict Resolution' },
  leadership: { indices: [14, 18], ko: '리더십', en: 'Leadership' },
  social_cues: { indices: [19, 9], ko: '사회적 단서', en: 'Social Cues' },
  emotional_regulation: { indices: [13, 7, 10], ko: '감정조절', en: 'Emotional Regulation' },
};

const SocialDevelopmentTestResult = ({ results, onBack }: SocialDevelopmentTestResultProps) => {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const domainScores = Object.entries(domainDefs).map(([key, { indices, ko, en }]) => {
    const score = indices.map(i => results.answers[i] || 0).reduce((s, v) => s + v, 0);
    const max = indices.length * 4;
    const pct = Math.round((score / max) * 100);
    return { key, label: isEnglish ? en : ko, score: pct, maxScore: 100 };
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: { testType: 'social-development', results, answers: results.answers }
        });
        const fallback = buildScoreBasedFallback({
          testLabel: isEnglish ? 'Social Development Assessment' : '사회성 발달 검사',
          total: results.total, average: results.average, severity: results.severity, ageGroup: results.ageGroup,
          domains: domainScores.map(d => ({ label: d.label, score: d.score, maxScore: 100, percentage: d.score })),
          isEnglish,
        });
        if (error) throw error;
        setAnalysis(data?.analysis || fallback);
      } catch {
        setAnalysis(buildScoreBasedFallback({
          testLabel: isEnglish ? 'Social Development Assessment' : '사회성 발달 검사',
          total: results.total, average: results.average, severity: results.severity, ageGroup: results.ageGroup,
          domains: domainScores.map(d => ({ label: d.label, score: d.score, maxScore: 100, percentage: d.score })),
          isEnglish,
        }));
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const getColor = (s: number) => s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-primary' : s >= 25 ? 'bg-yellow-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 75 ? (isEnglish ? 'Excellent' : '우수') : s >= 50 ? (isEnglish ? 'Good' : '양호') : s >= 25 ? (isEnglish ? 'Average' : '보통') : (isEnglish ? 'Needs Attention' : '관심필요');

  const domains: DomainScore[] = domainScores.map(d => ({
    ...d, level: getLevel(d.score), color: getColor(d.score),
  }));

  const severityMap: Record<string, string> = { '우수': 'Excellent', '양호': 'Good', '보통': 'Average', '관심필요': 'Needs Attention' };
  const displaySeverity = isEnglish ? (severityMap[results.severity] || results.severity) : results.severity;
  const severityColor = results.severity === '우수' ? 'text-green-600 border-green-300' : results.severity === '양호' ? 'text-primary border-primary/30' : results.severity === '보통' ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paras = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🧠', '📊', '💪', '🎯', '💡', '📋', '✨'];
    const titles = isEnglish
      ? ['Overview', 'Domain Analysis', 'Strengths', 'Areas of Interest', 'Development Support', 'Practice Guide', 'Expert Opinion']
      : ['종합 분석', '영역별 해석', '강점 영역', '관심 영역', '발달 지원', '실천 가이드', '전문가 소견'];
    return paras.slice(0, 7).map((p, idx) => ({
      id: `s-${idx}`, icon: icons[idx] || '📋', title: titles[idx] || (isEnglish ? `Analysis ${idx + 1}` : `분석 ${idx + 1}`),
      content: p, defaultOpen: idx === 0,
    }));
  };

  const aiSections = parseAISections(analysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'SocialDevelopment_Results' : '사회성발달검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName={isEnglish ? "Social Development Analysis" : "사회성 발달 분석"} />;

  return (
    <ClinicalReportLayout
      testName={isEnglish ? "Social Development Test Results" : "사회성 발달 검사 결과"}
      subtitle={`${isEnglish ? 'Age Group' : '연령대'}: ${results.ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={results.total}
      totalLabel={isEnglish ? "Total Score" : "총점"}
      scoreUnit="/ 80"
      scoreSeverity={displaySeverity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Social Development' : '사회성 발달',
            subtitle: isEnglish ? '7-Domain Analysis' : '7영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(domainScores.map(d => [d.key, (d.score / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domainScores.map(d => [d.key, d.label])),
            riskLevel: results.total >= 60 ? 'low' : results.total >= 40 ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default SocialDevelopmentTestResult;
