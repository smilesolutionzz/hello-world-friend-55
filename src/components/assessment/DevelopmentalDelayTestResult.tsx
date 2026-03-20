import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { cleanMarkdown } from '@/utils/cleanMarkdown';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface DevelopmentalDelayTestResultProps {
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

const domainConfig: Record<string, { indices: number[]; name: string }> = {
  language: { indices: [0, 3, 6, 12], name: '언어발달' },
  motor: { indices: [2, 9, 10, 15], name: '운동발달' },
  cognitive: { indices: [5, 13, 16, 17], name: '인지발달' },
  social: { indices: [1, 7, 14, 18], name: '사회성발달' },
  adaptive: { indices: [4, 8, 11, 19], name: '적응행동' },
  attention: { indices: [5, 13, 14], name: '주의집중' },
  emotional: { indices: [1, 8, 18], name: '정서발달' },
};

const DevelopmentalDelayTestResult = ({ results, onBack, onRestart }: DevelopmentalDelayTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const analyzeDomains = () => {
    return Object.entries(domainConfig).map(([key, { indices, name }]) => {
      const domainAnswers = indices.map(i => results.answers[i] || 0);
      const total = domainAnswers.reduce((s, v) => s + v, 0);
      const maxPossible = indices.length * 4;
      const pct = Math.round((total / maxPossible) * 100);
      return { key, name, score: pct, maxScore: 100 };
    });
  };

  const domainData = analyzeDomains();

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: { testType: 'developmental-delay', results: { ...results, developmentalDomains: domainData }, answers: results.answers },
        });
        if (error) throw error;
        setAnalysis(data.analysis);
      } catch {
        setAnalysis('결과 분석을 위해 전문가 상담을 권장합니다.');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const getColor = (pct: number) => pct >= 75 ? 'bg-destructive' : pct >= 50 ? 'bg-orange-500' : pct >= 25 ? 'bg-yellow-500' : 'bg-green-500';
  const getLevel = (pct: number) => pct >= 75 ? isEnglish ? 'Severe' : '심각' : pct >= 50 ? isEnglish ? 'Moderate' : '중등도' : pct >= 25 ? '경미' : isEnglish ? 'Normal' : '정상';
  const severityColor = results.severity === (isEnglish ? 'Normal' : '정상') ? 'text-green-600 border-green-300' : results.severity === '경미' ? 'text-yellow-600 border-yellow-300' : results.severity === (isEnglish ? 'Moderate' : '중등도') ? 'text-orange-600 border-orange-300' : 'text-destructive border-destructive/30';

  const domains: DomainScore[] = domainData.map(d => ({
    key: d.key,
    label: d.name,
    score: d.score,
    maxScore: 100,
    level: getLevel(d.score),
    color: getColor(d.score),
  }));

  const buildDomainSections = (): ReportSection[] => {
    const domainIcons: Record<string, string> = {
      language: '🗣️', motor: '🏃', cognitive: '🧠', social: '👥',
      adaptive: '🔧', attention: '🎯', emotional: '💕',
    };

    const getInsight = (name: string, score: number): string => {
      if (score >= 75) return `${name} 영역에서 심각한 수준의 지연이 관찰됩니다. 전문가의 즉각적인 개입과 체계적인 치료 프로그램이 필요합니다. 조기에 집중적인 치료를 시작할수록 개선 효과가 크므로, 가능한 빨리 전문 기관에서 정밀 평가를 받으시길 권장합니다.`;
      if (score >= 50) return `${name} 영역에서 중등도의 지연이 나타납니다. 일상생활에서 어려움을 겪을 수 있는 수준으로, 전문가 상담을 통해 맞춤형 개입 계획을 세우는 것이 좋습니다. 가정에서의 지속적인 연습과 전문 치료를 병행하면 의미 있는 개선을 기대할 수 있습니다.`;
      if (score >= 25) return `${name} 영역에서 경미한 지연이 관찰됩니다. 또래 대비 약간의 차이가 있으나, 가정에서의 적절한 자극과 활동을 통해 충분히 따라잡을 수 있는 수준입니다. 정기적인 모니터링을 권장합니다.`;
      return `${name} 영역은 정상 범위에 해당합니다. 현재 발달 수준이 양호하며, 지속적인 관심과 적절한 자극을 통해 건강한 발달을 유지해 주세요.`;
    };

    // AI 분석이 있으면 그것을 도메인별로 매핑 시도
    if (analysis && analysis.length > 50) {
      const cleaned = cleanMarkdown(analysis);
      const paragraphs = cleaned.split('\n\n').filter(p => p.trim().length > 20);

      // AI 텍스트가 도메인 수 이상이면 매핑
      if (paragraphs.length >= domainData.length) {
        return domainData.map((d, idx) => ({
          id: `s-${idx}`,
          icon: domainIcons[d.key] || '📋',
          title: `${d.name} (${d.score}% · ${getLevel(d.score)})`,
          content: paragraphs[idx] || getInsight(d.name, d.score),
          defaultOpen: idx === 0,
        }));
      }
    }

    // 폴백: 도메인 점수 기반 자동 생성
    return domainData.map((d, idx) => ({
      id: `s-${idx}`,
      icon: domainIcons[d.key] || '📋',
      title: `${d.name} (${d.score}% · ${getLevel(d.score)})`,
      content: getInsight(d.name, d.score),
      defaultOpen: idx === 0,
    }));
  };

  const aiSections = buildDomainSections();
  const overallDelay = Math.round(domainData.reduce((s, d) => s + d.score, 0) / domainData.length);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', 'AIH_발달지연_검사결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) {
    return <AnalysisLoadingScreen testName="발달지연 검사" />;
  }

  return (
    <ClinicalReportLayout
      testName="AIH 발달지연 검사 결과"
      subtitle={`연령대: ${results.ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={`${overallDelay}%`}
      totalLabel="종합 발달 지연도"
      scoreSeverity={results.severity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
      isAnalyzing={isLoading}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '발달지연 검사',
            subtitle: '7개 발달 영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(domainData.map(d => [d.key, (d.score / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domainData.map(d => [d.key, d.name])),
            riskLevel: results.severity === (isEnglish ? 'Normal' : '정상') ? 'low' : results.severity === '경미' ? 'low' : results.severity === (isEnglish ? 'Moderate' : '중등도') ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default DevelopmentalDelayTestResult;
