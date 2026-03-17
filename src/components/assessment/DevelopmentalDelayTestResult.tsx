import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { cleanMarkdown } from '@/utils/cleanMarkdown';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

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
  const getLevel = (pct: number) => pct >= 75 ? '심각' : pct >= 50 ? '중등도' : pct >= 25 ? '경미' : '정상';
  const severityColor = results.severity === '정상' ? 'text-green-600 border-green-300' : results.severity === '경미' ? 'text-yellow-600 border-yellow-300' : results.severity === '중등도' ? 'text-orange-600 border-orange-300' : 'text-destructive border-destructive/30';

  const domains: DomainScore[] = domainData.map(d => ({
    key: d.key,
    label: d.name,
    score: d.score,
    maxScore: 100,
    level: getLevel(d.score),
    color: getColor(d.score),
  }));

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const cleaned = cleanMarkdown(text);
    const paragraphs = cleaned.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🧠', '📊', '💡', '🎯', '🌱', '💪', '📋'];
    return paragraphs.slice(0, 7).map((p, idx) => {
      const firstLine = p.split('\n')[0].trim();
      const rest = p.split('\n').slice(1).join('\n').trim() || p;
      return { id: `s-${idx}`, icon: icons[idx] || '📋', title: firstLine.length > 5 && firstLine.length < 50 ? firstLine : `분석 ${idx + 1}`, content: rest, defaultOpen: idx === 0 };
    });
  };

  const aiSections = parseAISections(analysis);
  const overallDelay = Math.round(domainData.reduce((s, d) => s + d.score, 0) / domainData.length);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', 'AIH_발달지연_검사결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
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
            date: new Date().toLocaleDateString('ko-KR'),
            scores: Object.fromEntries(domainData.map(d => [d.key, (d.score / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domainData.map(d => [d.key, d.name])),
            riskLevel: results.severity === '정상' ? 'low' : results.severity === '경미' ? 'low' : results.severity === '중등도' ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default DevelopmentalDelayTestResult;
