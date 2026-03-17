import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface SensoryIntegrationTestResultProps {
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
  tactile: { indices: [0, 1, 6, 7], ko: '촉각 처리', en: 'Tactile' },
  vestibular: { indices: [2, 8, 11], ko: '전정감각/균형', en: 'Vestibular' },
  proprioceptive: { indices: [9, 10, 15], ko: '고유수용감각', en: 'Proprioceptive' },
  auditory: { indices: [0, 12], ko: '청각 처리', en: 'Auditory' },
  visual: { indices: [3, 17], ko: '시각 처리', en: 'Visual' },
  motorPlanning: { indices: [14, 15, 16], ko: '운동 계획', en: 'Motor Planning' },
  regulation: { indices: [4, 5, 11, 13, 17, 18, 19], ko: '감각 조절', en: 'Sensory Regulation' },
};

const SensoryIntegrationTestResult = ({ results, onBack }: SensoryIntegrationTestResultProps) => {
  const { isEnglish } = useLanguage();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const domainScores = Object.entries(domainDefs).map(([key, { indices, ko, en }]) => {
    const score = indices.map(i => results.answers[i] || 0).reduce((s, v) => s + v, 0);
    const max = indices.length * 4;
    const pct = Math.round((score / max) * 100);
    return { key, label: isEnglish ? en : ko, pct };
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: { testType: 'sensory-integration', results, answers: results.answers }
        });
        if (error) throw error;
        setAnalysis(data.analysis || '');
      } catch {
        setAnalysis(isEnglish ? 'Professional consultation recommended.' : '전문가 상담을 권장합니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  // Higher % = more concern (inverted scale)
  const getColor = (pct: number) => pct >= 75 ? 'bg-destructive' : pct >= 50 ? 'bg-orange-500' : pct >= 25 ? 'bg-yellow-500' : 'bg-green-500';
  const getLevel = (pct: number) => pct >= 75 ? (isEnglish ? 'Severe' : '심각') : pct >= 50 ? (isEnglish ? 'Moderate' : '중등도') : pct >= 25 ? (isEnglish ? 'Mild' : '경미') : (isEnglish ? 'Normal' : '정상');

  const domains: DomainScore[] = domainScores.map(d => ({
    key: d.key, label: d.label, score: d.pct, maxScore: 100, level: getLevel(d.pct), color: getColor(d.pct),
  }));

  const severityColor = results.severity === '심각' ? 'text-destructive border-destructive/30' : results.severity === '중등도' ? 'text-orange-600 border-orange-300' : results.severity === '경미' ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paras = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🧠', '📊', '🎯', '⚠️', '💡', '📋', '✨'];
    const titles = isEnglish
      ? ['Overview', 'Domain Analysis', 'Risk Areas', 'Strengths', 'Recommendations', 'Practice Guide', 'Expert Opinion']
      : ['종합 분석', '영역별 해석', '위험 영역', '강점 영역', '발달 지원', '실천 가이드', '전문가 소견'];
    return paras.slice(0, 7).map((p, idx) => ({
      id: `s-${idx}`, icon: icons[idx] || '📋', title: titles[idx] || `분석 ${idx + 1}`,
      content: p, defaultOpen: idx === 0,
    }));
  };

  const aiSections = parseAISections(analysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'SensoryIntegration_Results' : '감각통합_검사_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName={isEnglish ? 'Sensory Integration Analysis' : '감각통합 분석'} />;

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Sensory Integration Test Results' : '감각통합장애 검사 결과'}
      subtitle={`${isEnglish ? 'Age' : '연령대'}: ${results.ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={results.total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={`/ ${results.answers.length * 4}`}
      scoreSeverity={results.severity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Sensory Integration' : '감각통합',
            subtitle: isEnglish ? '7-domain analysis' : '7영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(domainScores.map(d => [d.key, (d.pct / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domainScores.map(d => [d.key, d.label])),
            riskLevel: results.total >= 60 ? 'high' : results.total >= 30 ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default SensoryIntegrationTestResult;
