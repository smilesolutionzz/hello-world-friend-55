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

interface LearningDisabilityTestResultProps {
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
  reading: { indices: [0, 1, 16], name: '읽기 능력' },
  writing: { indices: [2, 8, 17], name: '쓰기 능력' },
  math: { indices: [3, 18], name: '수학 능력' },
  attention: { indices: [6, 7, 12], name: '주의집중' },
  memory: { indices: [5, 11, 15], name: '기억력' },
  processing: { indices: [4, 10, 13, 17], name: '정보처리' },
  executive: { indices: [9, 14, 16, 19], name: '실행기능' },
};

const LearningDisabilityTestResult = ({ results, onBack, onRestart }: LearningDisabilityTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const analyzeDomains = () => {
    return Object.entries(domainConfig).map(([key, { indices, name }]) => {
      const total = indices.map(i => results.answers[i] || 0).reduce((s, v) => s + v, 0);
      const maxPossible = indices.length * 4;
      const pct = Math.round((total / maxPossible) * 100);
      return { key, name, score: pct, maxScore: 100 };
    });
  };

  const domainData = analyzeDomains();

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: { testType: 'learning-disability', results: { ...results, learningDomains: domainData }, answers: results.answers },
        });
        if (error) throw error;
        setAnalysis(data.analysis);
      } catch {
        setAnalysis('전문가 상담을 권장합니다.');
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
    key: d.key, label: d.name, score: d.score, maxScore: 100, level: getLevel(d.score), color: getColor(d.score),
  }));

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const cleaned = cleanMarkdown(text);
    const paragraphs = cleaned.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['📖', '✏️', '🔢', '🎯', '🧠', '⚙️', '📋'];
    return paragraphs.slice(0, 7).map((p, idx) => {
      const firstLine = p.split('\n')[0].trim();
      const rest = p.split('\n').slice(1).join('\n').trim() || p;
      return { id: `s-${idx}`, icon: icons[idx] || '📋', title: firstLine.length > 5 && firstLine.length < 50 ? firstLine : `분석 ${idx + 1}`, content: rest, defaultOpen: idx === 0 };
    });
  };

  const aiSections = parseAISections(analysis);
  const overallDelay = Math.round(domainData.reduce((s, d) => s + d.score, 0) / domainData.length);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', 'AIH_학습장애_검사결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName="학습장애 검사" />;

  return (
    <ClinicalReportLayout
      testName="AIH 학습장애 검사 결과"
      subtitle={`연령대: ${results.ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={`${overallDelay}%`}
      totalLabel="종합 학습 곤란도"
      scoreSeverity={results.severity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '학습장애 검사',
            subtitle: '7개 학습 영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(domainData.map(d => [d.key, (d.score / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domainData.map(d => [d.key, d.name])),
            riskLevel: results.severity === (isEnglish ? 'Normal' : '정상') ? 'low' : results.severity === '경미' ? 'low' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default LearningDisabilityTestResult;
