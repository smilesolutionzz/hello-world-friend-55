import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

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

const domainDefs: Record<string, { indices: number[]; ko: string }> = {
  communication: { indices: [0, 3, 8, 17], ko: '의사소통' },
  cooperation: { indices: [1, 4, 11, 16], ko: '협력능력' },
  empathy: { indices: [5, 12, 18], ko: '공감능력' },
  conflict: { indices: [2, 6, 15], ko: '갈등해결' },
  leadership: { indices: [14, 18], ko: '리더십' },
  social_cues: { indices: [19, 9], ko: '사회적 단서' },
  emotional_regulation: { indices: [13, 7, 10], ko: '감정조절' },
};

const SocialDevelopmentTestResult = ({ results, onBack }: SocialDevelopmentTestResultProps) => {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const domainScores = Object.entries(domainDefs).map(([key, { indices, ko }]) => {
    const score = indices.map(i => results.answers[i] || 0).reduce((s, v) => s + v, 0);
    const max = indices.length * 4;
    const pct = Math.round((score / max) * 100);
    return { key, label: ko, score: pct, maxScore: 100 };
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: { testType: 'social-development', results, answers: results.answers }
        });
        if (error) throw error;
        setAnalysis(data.analysis || '');
      } catch {
        setAnalysis('결과 분석을 위해 전문가 상담을 권장합니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const getColor = (s: number) => s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-primary' : s >= 25 ? 'bg-yellow-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 75 ? '우수' : s >= 50 ? '양호' : s >= 25 ? '보통' : '관심필요';

  const domains: DomainScore[] = domainScores.map(d => ({
    ...d, level: getLevel(d.score), color: getColor(d.score),
  }));

  const severityColor = results.severity === '우수' ? 'text-green-600 border-green-300' : results.severity === '양호' ? 'text-primary border-primary/30' : results.severity === '보통' ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paras = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🧠', '📊', '💪', '🎯', '💡', '📋', '✨'];
    const titles = ['종합 분석', '영역별 해석', '강점 영역', '관심 영역', '발달 지원', '실천 가이드', '전문가 소견'];
    return paras.slice(0, 7).map((p, idx) => ({
      id: `s-${idx}`, icon: icons[idx] || '📋', title: titles[idx] || `분석 ${idx + 1}`,
      content: p, defaultOpen: idx === 0,
    }));
  };

  const aiSections = parseAISections(analysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '사회성발달검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName="사회성 발달 분석" />;

  return (
    <ClinicalReportLayout
      testName="사회성 발달 검사 결과"
      subtitle={`연령대: ${results.ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={results.total}
      totalLabel="총점"
      scoreUnit="/ 80"
      scoreSeverity={results.severity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '사회성 발달',
            subtitle: '7영역 분석',
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
