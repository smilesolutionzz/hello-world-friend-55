import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface LifePurposeTestResultProps {
  results: {
    answers: Record<string, string>;
    categoryScores: Record<string, number>;
    totalScore: number;
    purposeType: string;
    clarityLevel: string;
    recommendations: string[];
  };
  onBack: () => void;
}

const categoryInfo: Record<string, { ko: string; en: string }> = {
  fulfillment: { ko: '실존적 충만감', en: 'Existential Fulfillment' },
  values: { ko: '가치 명확성', en: 'Value Clarity' },
  goals: { ko: '목표 일관성', en: 'Goal Consistency' },
  awareness: { ko: '자기 인식', en: 'Self-Awareness' },
};

export default function LifePurposeTestResult({ results, onBack }: LifePurposeTestResultProps) {
  const { categoryScores, totalScore, purposeType, clarityLevel } = results;
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('life-purpose-analyzer', {
          body: { totalScore, purposeType, clarityLevel, categoryScores, recommendations: results.recommendations },
        });
        if (error) throw error;
        if (data?.analysis) {
          const a = data.analysis;
          setAiAnalysis([a.existentialAnalysis, a.categoryAnalysis, a.psychodynamicAnalysis, a.strengthsAnalysis, a.growthDirection, a.practiceGuide, a.reflectionQuestions, a.expertOpinion].filter(Boolean).join('\n\n'));
        }
      } catch {
        setAiAnalysis(isEnglish ? 'Analysis error. Please try again.' : 'AI 분석 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const getColor = (s: number) => s >= 75 ? 'bg-green-500' : s >= 60 ? 'bg-primary' : s >= 45 ? 'bg-yellow-500' : 'bg-orange-500';
  const getLevel = (s: number) => s >= 75 ? (isEnglish ? 'High' : '높음') : s >= 60 ? (isEnglish ? 'Good' : '양호') : s >= 45 ? (isEnglish ? 'Avg' : '보통') : (isEnglish ? 'Low' : '낮음');

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, score]) => ({
    key,
    label: isEnglish ? (categoryInfo[key]?.en || key) : (categoryInfo[key]?.ko || key),
    score,
    maxScore: 100,
    level: getLevel(score),
    color: getColor(score),
  }));

  const severityColor = (clarityLevel === '매우 높음' || clarityLevel === 'Very High') ? 'text-green-600 border-green-300' : (clarityLevel === '높음' || clarityLevel === 'High') ? 'text-primary border-primary/30' : (clarityLevel === '보통' || clarityLevel === 'Average') ? 'text-yellow-600 border-yellow-300' : 'text-orange-600 border-orange-300';

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🏔️', '📊', '💜', '⭐', '🎯', '💡', '📖', '✨'];
    const titles = isEnglish
      ? ['Existential Analysis', 'Domain Analysis', 'Psychodynamic', 'Strengths', 'Growth Direction', 'Practice Guide', 'Reflection', 'Expert Opinion']
      : ['실존적 의미 분석', '영역별 심층 해석', '심리역동 분석', '강점 및 잠재력', '성장 방향', '일상 실천 가이드', '깊은 성찰 질문', '전문가 종합 소견'];
    return paragraphs.slice(0, 8).map((p, idx) => ({
      id: `s-${idx}`,
      icon: icons[idx] || '📋',
      title: titles[idx] || `분석 ${idx + 1}`,
      content: p,
      defaultOpen: idx === 0,
    }));
  };

  const aiSections = parseAISections(aiAnalysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'LifePurpose_Result' : '삶의의미_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) {
    return <AnalysisLoadingScreen testName={isEnglish ? 'Life Purpose Exploration' : '삶의 의미 및 목적 탐색 검사'} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Life Purpose Exploration Results' : '삶의 의미 및 목적 탐색 결과'}
      subtitle={`${isEnglish ? 'Type' : '유형'}: ${purposeType}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={totalScore}
      totalLabel={isEnglish ? 'Total Score' : '종합 점수'}
      scoreUnit={isEnglish ? '/ 100' : '/ 100'}
      scoreSeverity={clarityLevel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Life Purpose' : '삶의 의미',
            subtitle: isEnglish ? '4 Domain Analysis' : '4영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(categoryScores).map(([k, v]) => [k, (v / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(categoryInfo).map(([k, v]) => [k, isEnglish ? v.en : v.ko])),
            riskLevel: totalScore >= 60 ? 'low' : totalScore >= 40 ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
}
