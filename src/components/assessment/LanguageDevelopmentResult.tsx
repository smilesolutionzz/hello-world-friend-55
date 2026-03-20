import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { languageDevelopmentScoring } from '@/data/languageDevelopmentQuestions';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface LanguageDevelopmentResultProps {
  results: Record<string, number>;
  answers: Record<string, string>;
  onBack: () => void;
}

const LanguageDevelopmentResult = ({ results, answers, onBack }: LanguageDevelopmentResultProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const getLevel = (score: number, category: 'receptive' | 'expressive' | 'total') => {
    const scoring = languageDevelopmentScoring[category];
    if (score >= scoring.excellent.min) return { level: '우수', color: 'bg-green-500' };
    if (score >= scoring.good.min) return { level: '양호', color: 'bg-primary' };
    if (score >= scoring.average.min) return { level: '보통', color: 'bg-yellow-500' };
    return { level: '관찰필요', color: 'bg-destructive' };
  };

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('language-development-analyzer', {
          body: { results, answers, ageGroup: '영유아' },
        });
        if (error) throw error;
        setAiAnalysis(data.analysis || '');
      } catch {
        setAiAnalysis('언어발달 분석 결과를 불러올 수 없습니다.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    run();
  }, []);

  const totalInfo = getLevel(results.total, 'total');
  const receptiveInfo = getLevel(results.receptive, 'receptive');
  const expressiveInfo = getLevel(results.expressive, 'expressive');

  const domainEntries: Record<string, { score: number; max: number; label: string; info: ReturnType<typeof getLevel> }> = {
    receptive: { score: results.receptive || 0, max: 100, label: '수용언어', info: receptiveInfo },
    expressive: { score: results.expressive || 0, max: 100, label: '표현언어', info: expressiveInfo },
    receptive_pct: { score: results.receptive_percentage || 0, max: 100, label: '수용언어 %', info: receptiveInfo },
    expressive_pct: { score: results.expressive_percentage || 0, max: 100, label: '표현언어 %', info: expressiveInfo },
  };

  const domains: DomainScore[] = [
    { key: 'receptive', label: '수용언어', score: results.receptive_percentage || 0, maxScore: 100, level: receptiveInfo.level, color: receptiveInfo.color },
    { key: 'expressive', label: '표현언어', score: results.expressive_percentage || 0, maxScore: 100, level: expressiveInfo.level, color: expressiveInfo.color },
  ];

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['👂', '🗣️', '📊', '💡', '🌱', '📋'];
    return paragraphs.slice(0, 6).map((p, idx) => {
      const firstLine = p.split('\n')[0].replace(/[#*]/g, '').trim();
      const rest = p.split('\n').slice(1).join('\n').trim() || p;
      return { id: `s-${idx}`, icon: icons[idx] || '📋', title: firstLine.length > 5 && firstLine.length < 50 ? firstLine : `분석 ${idx + 1}`, content: rest, defaultOpen: idx === 0 };
    });
  };

  const aiSections = parseAISections(aiAnalysis);
  const severityColor = totalInfo.level === '우수' ? 'text-green-600 border-green-300' : totalInfo.level === '양호' ? 'text-primary border-primary/30' : totalInfo.level === '보통' ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '언어발달_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isAnalyzing) return <AnalysisLoadingScreen testName="언어발달 검사" />;

  return (
    <ClinicalReportLayout
      testName="언어발달 검사 결과"
      subtitle="수용언어 · 표현언어 분석"
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={results.total || 0}
      totalLabel="종합 점수"
      scoreSeverity={totalInfo.level}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '언어발달',
            subtitle: '수용·표현 분석',
            date: new Date().toLocaleDateString('ko-KR'),
            scores: { receptive: ((results.receptive_percentage || 0) / 100) * 7, expressive: ((results.expressive_percentage || 0) / 100) * 7 },
            maxScore: 7,
            categoryTranslations: { receptive: '수용언어', expressive: '표현언어' },
            riskLevel: totalInfo.level === '우수' || totalInfo.level === '양호' ? 'low' : totalInfo.level === '보통' ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default LanguageDevelopmentResult;
