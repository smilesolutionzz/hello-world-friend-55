import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useLanguage } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface OtrovertResultProps {
  result: any;
  onShare: () => void;
  onRetry: () => void;
  onShareText: () => void;
}

export default function OtrovertResult({ result, onShare, onRetry, onShareText }: OtrovertResultProps) {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [graphData, setGraphData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();

  useAutoSaveTestResult({
    testType: isEnglish ? 'Otrovert Personality Test' : '오트로버트 성격검사',
    results: { personalityType: result.personalityType, score: result.score },
    severity: isEnglish ? 'Normal' : '보통',
    ageGroup: 'adult',
  });

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('otrovert-analyzer', {
          body: { answers: result.answers, personalityType: result.personalityType, score: result.score },
        });
        if (error) throw error;
        setAiAnalysis(data?.analysis || '');
        setGraphData(data?.graphData || getDefaultGraphData());
      } catch {
        setAiAnalysis('');
        setGraphData(getDefaultGraphData());
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const getDefaultGraphData = () => {
    const score = parseFloat(result.score) || 0;
    const intro = (score / 9) * 100;
    const extro = 100 - intro;
    return { extroversion: extro, introversion: intro, socialEnergy: extro * 0.9, aloneTime: intro * 0.9, groupPreference: extro * 0.85, communication: 50 + (extro - 50) * 0.7, thinkingStyle: intro * 0.8 };
  };

  const gd = graphData || getDefaultGraphData();
  const dimensionLabels: Record<string, string> = isEnglish
    ? { socialEnergy: 'Social Energy', aloneTime: 'Alone Time', groupPreference: 'Group Pref.', communication: 'Communication', thinkingStyle: 'Thinking Style' }
    : { socialEnergy: '사회적 에너지', aloneTime: '혼자 시간', groupPreference: '그룹 선호', communication: '의사소통', thinkingStyle: '사고 스타일' };

  const domains: DomainScore[] = Object.entries(dimensionLabels).map(([key, label]) => ({
    key,
    label,
    score: Math.round(gd[key] || 50),
    maxScore: 100,
    level: (gd[key] || 50) >= 70 ? (isEnglish ? 'High' : '높음') : (gd[key] || 50) >= 40 ? (isEnglish ? 'Avg' : '보통') : (isEnglish ? 'Low' : '낮음'),
    color: (gd[key] || 50) >= 70 ? 'bg-primary' : (gd[key] || 50) >= 40 ? 'bg-yellow-500' : 'bg-orange-500',
  }));

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Otrovert_Result' : '오트로버트_성격_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) {
    return <AnalysisLoadingScreen testName={isEnglish ? 'Otrovert Personality' : '오트로버트 성격검사'} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Otrovert Personality Analysis' : '오트로버트 성격 분석 결과'}
      subtitle={`${isEnglish ? 'Type' : '유형'}: ${result.personalityType}`}
      onBack={onRetry}
      onDownload={handleDownload}
      onShare={onShare}
      totalScore={result.score}
      totalLabel={isEnglish ? 'Score' : '점수'}
      scoreUnit="/ 9"
      scoreSeverity={result.personalityType}
      severityColor="text-primary border-primary/30"
      domains={domains}
      aiAnalysis={aiAnalysis}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Otrovert' : '오트로버트',
            subtitle: isEnglish ? 'Personality Dimensions' : '성격 차원 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(dimensionLabels).map(([k]) => [k, ((gd[k] || 50) / 100) * 7])),
            maxScore: 7,
            categoryTranslations: dimensionLabels,
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
}
