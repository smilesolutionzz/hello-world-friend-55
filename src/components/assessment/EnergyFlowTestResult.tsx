import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface EnergyFlowTestResultProps {
  results: {
    answers: Record<string, string>;
    totalScore: number;
    energyType: string;
    peakTime: string;
    recoveryStyle: string;
    burnoutRisk: string;
  };
  onBack: () => void;
}

export default function EnergyFlowTestResult({ results, onBack }: EnergyFlowTestResultProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const { totalScore, energyType, peakTime, recoveryStyle, burnoutRisk, answers } = results;
  const maxScore = 32;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('energy-flow-analyzer', {
          body: { totalScore, energyType, peakTime, recoveryStyle, burnoutRisk, answers },
        });
        if (error) throw error;
        if (data?.analysis) {
          const a = data.analysis;
          setAiAnalysis([a.summary, a.energyTypeAnalysis, a.timeManagement, a.recoveryEnhancement, a.burnoutPrevention, a.weeklyPlan].filter(Boolean).join('\n\n'));
        }
      } catch {
        setAiAnalysis('AI 분석을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  const infoScores: Record<string, number> = {
    energyHealth: percentage,
    peakEfficiency: energyType === '활력충만형' ? 90 : energyType === '균형안정형' ? 70 : energyType === '회복필요형' ? 45 : 25,
    recoveryCapacity: recoveryStyle.includes('자연') || recoveryStyle.includes('휴식') ? 80 : 60,
    burnoutResistance: burnoutRisk === '낮음' ? 90 : burnoutRisk === '보통' ? 65 : burnoutRisk === '주의' ? 40 : 20,
  };

  const domainLabels: Record<string, string> = {
    energyHealth: '에너지 건강도',
    peakEfficiency: '최적 효율성',
    recoveryCapacity: '회복 능력',
    burnoutResistance: '번아웃 저항력',
  };

  const getColor = (s: number) => s >= 70 ? 'bg-green-500' : s >= 45 ? 'bg-yellow-500' : 'bg-orange-500';
  const getLevel = (s: number) => s >= 70 ? '우수' : s >= 45 ? '보통' : '주의';
  const severityColor = burnoutRisk === '낮음' ? 'text-green-600 border-green-300' : burnoutRisk === '보통' ? 'text-primary border-primary/30' : burnoutRisk === '주의' ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const domains: DomainScore[] = Object.entries(infoScores).map(([key, score]) => ({
    key,
    label: domainLabels[key] || key,
    score,
    maxScore: 100,
    level: getLevel(score),
    color: getColor(score),
  }));

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🧠', '⚡', '🕐', '💚', '🛡️', '🎯'];
    const titles = ['종합 해석', '에너지 유형 분석', '시간대별 관리 전략', '회복력 강화', '번아웃 예방', '주간 에너지 플랜'];
    return paragraphs.slice(0, 6).map((p, idx) => ({
      id: `s-${idx}`, icon: icons[idx] || '📋', title: titles[idx] || `분석 ${idx + 1}`, content: p, defaultOpen: idx === 0,
    }));
  };

  const aiSections = parseAISections(aiAnalysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'EnergyFlow_Results' : '에너지흐름_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) {
    return <AnalysisLoadingScreen testName={isEnglish ? "Energy Flow Test" : "에너지 흐름 검사"} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? "Daily Energy Flow Test Results" : "일상 에너지 흐름 검사 결과"}
      subtitle={`${isEnglish ? 'Energy Type' : '에너지 유형'}: ${energyType} · 최적 시간: ${peakTime}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={`${percentage}%`}
      totalLabel={isEnglish ? 'Energy Health' : '에너지 건강도'}
      scoreSeverity={energyType}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Energy Flow' : '에너지 흐름',
            subtitle: isEnglish ? '4-Domain Analysis' : '4개 영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(infoScores).map(([k, v]) => [k, (v / 100) * 7])),
            maxScore: 7,
            categoryTranslations: domainLabels,
            riskLevel: burnoutRisk === '낮음' ? 'low' : burnoutRisk === '보통' ? 'low' : burnoutRisk === '주의' ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
}
