import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface StressTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onRestart?: () => void;
  onBack?: () => void;
}

const StressTestResult = ({ result, onRestart, onBack }: StressTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish, localePath } = useLanguage();

  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useAutoSaveTestResult({
    testType: '스트레스 검사',
    results: { total: result.total, average: result.average, answers: result.answers },
    analysis,
    severity: result.severity,
  });

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stress-analyzer', {
          body: { answers: result.answers, totalScore: result.total, average: result.average, severity: result.severity }
        });
        if (!error && data?.analysis) setAnalysis(data.analysis);
        else setAnalysis(generateFallback());
      } catch {
        setAnalysis(generateFallback());
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAI();
  }, [result]);

  const generateFallback = () => {
    const risk = result.total > 32 ? 'high' : result.total > 16 ? 'medium' : 'low';
    if (isEnglish) {
      return risk === 'high' ? `Score: ${result.total}/48 — **High stress**. Professional help recommended.`
        : risk === 'medium' ? `Score: ${result.total}/48 — **Moderate stress**. Regular management needed.`
        : `Score: ${result.total}/48 — **Healthy level**. Keep it up!`;
    }
    return risk === 'high' ? `총점: ${result.total}/48 — **높은 스트레스**. 전문가 상담을 권장합니다.`
      : risk === 'medium' ? `총점: ${result.total}/48 — **중간 수준의 스트레스**. 꾸준한 관리가 필요합니다.`
      : `총점: ${result.total}/48 — **건강한 수준**. 현재 상태를 유지하세요!`;
  };

  // Domain scores from answers
  const radarData = [
    { key: 'emotional', label: isEnglish ? 'Emotional' : '정서안정', score: Math.max(1, 5 - (result.answers[0] + result.answers[2]) / 2), max: 5 },
    { key: 'problem', label: isEnglish ? 'Problem Solving' : '문제해결', score: Math.max(1, 5 - (result.answers[3] + result.answers[6]) / 2), max: 5 },
    { key: 'physical', label: isEnglish ? 'Physical' : '신체건강', score: Math.max(1, 5 - (result.answers[11] + result.answers[5]) / 2), max: 5 },
    { key: 'social', label: isEnglish ? 'Social' : '사회관계', score: Math.max(1, 5 - (result.answers[10] + result.answers[8]) / 2), max: 5 },
    { key: 'future', label: isEnglish ? 'Future' : '미래전망', score: Math.max(1, 5 - (result.answers[7] + result.answers[4]) / 2), max: 5 },
    { key: 'coping', label: isEnglish ? 'Coping' : '스트레스대처', score: Math.max(1, 5 - (result.answers[1] + result.answers[9]) / 2), max: 5 },
  ];

  const getColor = (score: number) => score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : score >= 2 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (score: number) => score >= 4 ? (isEnglish ? 'Good' : '양호') : score >= 3 ? (isEnglish ? 'Fair' : '보통') : score >= 2 ? (isEnglish ? 'Caution' : '주의') : (isEnglish ? 'Risk' : '위험');

  const domains: DomainScore[] = radarData.map(d => ({
    key: d.key,
    label: d.label,
    score: parseFloat(d.score.toFixed(1)),
    maxScore: d.max,
    level: getLevel(d.score),
    color: getColor(d.score),
  }));

  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /\*\*(\d+)\.\s*(.+?)\*\*\n*([\s\S]*?)(?=\*\*\d+\.|$)/g;
    let match;
    let idx = 0;
    while ((match = regex.exec(text)) !== null) {
      const title = match[2].trim();
      const content = match[3].replace(/\*\*/g, '').trim();
      if (content.length > 5) {
        sections.push({ id: `s-${idx}`, icon: idx === 0 ? '📊' : idx === 1 ? '💡' : idx === 2 ? '🎯' : '🌱', title, content, defaultOpen: idx === 0 });
        idx++;
      }
    }
    // fallback: split by ## if numbered pattern didn't work
    if (sections.length === 0) {
      const regex2 = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
      while ((match = regex2.exec(text)) !== null) {
        const title = match[1].replace(/^[^\w가-힣]*/, '').trim();
        const content = match[2].replace(/\*\*/g, '').trim();
        if (content.length > 10) {
          const emojiMatch = match[1].match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
          sections.push({ id: `s-${idx}`, icon: emojiMatch?.[0] || '📋', title, content, defaultOpen: idx === 0 });
          idx++;
        }
      }
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(analysis);
  const stressLevel = result.total <= 16 ? (isEnglish ? 'Low' : '낮음') : result.total <= 32 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'High' : '높음');
  const severityColor = result.total > 32 ? 'text-destructive border-destructive/30' : result.total > 16 ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '스트레스_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = `${isEnglish ? 'Stress Test Result' : '스트레스 검사 결과'}\n${isEnglish ? 'Score' : '총점'}: ${result.total}\n${isEnglish ? 'Level' : '수준'}: ${stressLevel}`;
    if (navigator.share) await navigator.share({ title: isEnglish ? 'Stress Result' : '스트레스 결과', text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast({ title: isEnglish ? 'Copied' : '결과가 복사되었습니다' }); }
  };

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={isEnglish ? 'Stress Analysis' : '스트레스 분석'} estimatedSeconds={20} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Stress Analysis Result' : '스트레스 분석 결과'}
      subtitle={isEnglish ? '12-item stress assessment' : '12문항 스트레스 평가'}
      onBack={onBack || (() => navigate(localePath('/assessment')))}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={result.total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={`/ 48${isEnglish ? 'pts' : '점'}`}
      scoreSeverity={stressLevel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Stress Test' : '스트레스 검사',
            subtitle: isEnglish ? 'Comprehensive Stress Analysis' : '종합 스트레스 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(radarData.map(d => [d.key, d.score])),
            maxScore: 5,
            categoryTranslations: Object.fromEntries(radarData.map(d => [d.key, d.label])),
            aiSummary: analysis,
            riskLevel: result.total > 32 ? 'high' : result.total > 16 ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default StressTestResult;
