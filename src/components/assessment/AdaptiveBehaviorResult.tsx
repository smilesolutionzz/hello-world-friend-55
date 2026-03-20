import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface AdaptiveBehaviorResultProps {
  results: { answers: number[]; total: number; average: number; level: string };
}

const AdaptiveBehaviorResult = ({ results }: AdaptiveBehaviorResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [expertInterpretation, setExpertInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const catNames = isEnglish
    ? ['Daily Living', 'Social Skills', 'Communication', 'Self-Care', 'Community']
    : ['일상생활 기술', '사회적 기술', '의사소통 기술', '자기관리 기술', '지역사회 적응'];

  const catMaxScores = [15, 12, 9, 9, 9];
  const categoryScores: Record<string, number> = {
    [catNames[0]]: results.answers.slice(0, 5).reduce((s, v) => s + v, 0),
    [catNames[1]]: results.answers.slice(5, 9).reduce((s, v) => s + v, 0),
    [catNames[2]]: results.answers.slice(9, 12).reduce((s, v) => s + v, 0),
    [catNames[3]]: results.answers.slice(12, 15).reduce((s, v) => s + v, 0),
    [catNames[4]]: results.answers.slice(15, 18).reduce((s, v) => s + v, 0),
  };

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: { testType: 'adaptive-behavior', results: { ...results, categoryScores }, answers: results.answers },
        });
        if (error) throw error;
        setExpertInterpretation(data.analysis || '');
      } catch {
        setExpertInterpretation('전문가 분석을 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const getColor = (pct: number) => pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : pct >= 40 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (pct: number) => pct >= 80 ? (isEnglish ? 'Excellent' : '우수') : pct >= 60 ? (isEnglish ? 'Good' : '양호') : pct >= 40 ? (isEnglish ? 'Avg' : '보통') : (isEnglish ? 'Needs Support' : '지원필요');

  const domains: DomainScore[] = catNames.map((name, i) => {
    const score = categoryScores[name];
    const max = catMaxScores[i];
    const pct = Math.round((score / max) * 100);
    return { key: name, label: name, score, maxScore: max, level: getLevel(pct), color: getColor(pct) };
  });

  const severityColor = results.level === '우수' || results.level === 'Excellent' ? 'text-green-600 border-green-300' : results.level === '양호' || results.level === 'Good' ? 'text-primary border-primary/30' : 'text-orange-600 border-orange-300';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'AdaptiveBehavior_Result' : '적응행동_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName={isEnglish ? 'Adaptive Behavior' : '적응행동 검사'} />;

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Adaptive Behavior Assessment' : '적응행동 검사 결과'}
      subtitle={isEnglish ? '5 adaptive domains' : '5개 적응 영역 분석'}
      onBack={() => navigate(-1)}
      onDownload={handleDownload}
      totalScore={results.total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreSeverity={results.level}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={expertInterpretation}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Adaptive Behavior' : '적응행동',
            subtitle: isEnglish ? '5 Domains' : '5영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(catNames.map((name, i) => [name, (categoryScores[name] / catMaxScores[i]) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(catNames.map(n => [n, n])),
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default AdaptiveBehaviorResult;
