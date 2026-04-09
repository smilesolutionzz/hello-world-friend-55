import { useState, useEffect, useMemo } from 'react';
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
import { analyzeResponseValidity, calcInternalConsistency, calcConfidenceInterval } from '@/utils/responseValidityAnalyzer';
import { ResponseValidityCard } from '@/components/report/ResponseValidityCard';
import { ConfidenceIntervalCard } from '@/components/report/ConfidenceIntervalCard';
import { PrognosisScenarioCard, generateDefaultScenarios } from '@/components/report/PrognosisScenarioCard';
import { ReferralLetterCard } from '@/components/report/ReferralLetterCard';
import { CrossTestMatrixCard } from '@/components/report/CrossTestMatrixCard';

interface DepressionTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
    ageGroup?: string;
  };
  onBack: () => void;
  onRestart?: () => void;
}

const normalizeSeverity = (severity: string): 'normal' | 'mild' | 'moderate' | 'severe' => {
  const s = severity.toLowerCase();
  if (s === '정상' || s === 'Normal' || s === 'normal') return 'normal';
  if (s === '가벼운 우울' || s === 'mild depression') return 'mild';
  if (s === '중등도 우울' || s === 'moderate depression') return 'moderate';
  if (s === '심한 우울' || s === 'severe depression') return 'severe';
  return 'normal';
};

const DepressionTestResult = ({ results, onBack }: DepressionTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const { total, average, severity, answers } = results;
  const sev = normalizeSeverity(severity);

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useAutoSaveTestResult({
    testType: isEnglish ? 'Depression Test' : '우울증 검사',
    results: { total, average, answers },
    analysis: aiAnalysis,
    severity,
    ageGroup: results.ageGroup,
  });

  useEffect(() => {
    const getAI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('depression-analyzer', {
          body: { results, answers }
        });
        if (error) throw error;
        setAiAnalysis(data?.analysis || '');
      } catch {
        setAiAnalysis('');
      } finally {
        setIsLoading(false);
      }
    };
    getAI();
  }, [results]);

  // Domain scores — split 21 questions into categories
  const emotionalScore = answers.slice(0, 7).reduce((s, a) => s + a, 0);
  const cognitiveScore = answers.slice(7, 14).reduce((s, a) => s + a, 0);
  const physicalScore = answers.slice(14, 21).reduce((s, a) => s + a, 0);
  const maxDomain = 14; // 7 questions * max 2

  const getColor = (score: number) => {
    const pct = (score / maxDomain) * 100;
    if (pct >= 70) return 'bg-destructive';
    if (pct >= 50) return 'bg-orange-500';
    if (pct >= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  const getLevel = (score: number) => {
    const pct = (score / maxDomain) * 100;
    if (pct >= 70) return isEnglish ? 'Severe Depression' : '심한 우울';
    if (pct >= 50) return isEnglish ? 'Moderate Depression' : '중등도 우울';
    if (pct >= 30) return isEnglish ? 'Mild Depression' : '가벼운 우울';
    return isEnglish ? 'Normal' : '정상';
  };

  const domains: DomainScore[] = [
    { key: 'emotional', label: isEnglish ? 'Emotional' : '정서적 증상', score: emotionalScore, maxScore: maxDomain, level: getLevel(emotionalScore), color: getColor(emotionalScore) },
    { key: 'cognitive', label: isEnglish ? 'Cognitive' : '인지적 증상', score: cognitiveScore, maxScore: maxDomain, level: getLevel(cognitiveScore), color: getColor(cognitiveScore) },
    { key: 'physical', label: isEnglish ? 'Physical' : '신체적 증상', score: physicalScore, maxScore: maxDomain, level: getLevel(physicalScore), color: getColor(physicalScore) },
  ];

  // 응답 신뢰도 & 통계 지표
  const validity = useMemo(() => analyzeResponseValidity(answers, 2), [answers]);
  const reliability = useMemo(() => calcInternalConsistency(answers, {
    emotional: [0, 1, 2, 3, 4, 5, 6],
    cognitive: [7, 8, 9, 10, 11, 12, 13],
    physical: [14, 15, 16, 17, 18, 19, 20],
  }), [answers]);
  const ci = useMemo(() => calcConfidenceInterval(total, 42, reliability), [total, reliability]);
  const scenarios = useMemo(() => generateDefaultScenarios(total, 42, false), [total]);

  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
    let match, idx = 0;
    while ((match = regex.exec(text)) !== null) {
      const title = match[1].replace(/^[^\w가-힣]*/, '').trim();
      const content = match[2].replace(/\*\*/g, '').trim();
      if (content.length > 10) {
        const emojiMatch = match[1].match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        sections.push({ id: `s-${idx}`, icon: emojiMatch?.[0] || '📋', title, content, defaultOpen: idx === 0 });
        idx++;
      }
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(aiAnalysis);
  const severityLabels: Record<string, string> = isEnglish
    ? { normal: 'Normal', mild: 'Mild Depression', moderate: 'Moderate Depression', severe: 'Severe Depression' }
    : { normal: '정상', mild: '가벼운 우울', moderate: '중등도 우울', severe: '심한 우울' };
  const severityLabel = severityLabels[sev] || severity;
  const severityColor = sev === 'severe' ? 'text-destructive border-destructive/30'
    : sev === 'moderate' ? 'text-orange-600 border-orange-300'
    : sev === 'mild' ? 'text-yellow-600 border-yellow-300'
    : 'text-green-600 border-green-300';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Depression_Result' : '우울감_체크_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) {
    return <AnalysisLoadingScreen testName={isEnglish ? 'Depression Analysis' : '우울감 분석'} estimatedSeconds={20} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Depression Check Result' : '우울감 체크 결과'}
      subtitle={isEnglish ? 'AIHPRO mood wellness assessment (reference only)' : 'AIHPRO 감정 웰니스 평가 (참고용)'}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={`/ 42${isEnglish ? 'pts' : '점'}`}
      scoreSeverity={severityLabel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Depression Check' : '우울감 체크',
            subtitle: isEnglish ? 'Emotional · Cognitive · Physical' : '정서 · 인지 · 신체 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: { emotional: emotionalScore / maxDomain * 7, cognitive: cognitiveScore / maxDomain * 7, physical: physicalScore / maxDomain * 7 },
            maxScore: 7,
            categoryTranslations: {
              emotional: isEnglish ? 'Emotional' : '정서적',
              cognitive: isEnglish ? 'Cognitive' : '인지적',
              physical: isEnglish ? 'Physical' : '신체적',
            },
            aiSummary: aiAnalysis,
            riskLevel: sev === 'severe' || sev === 'moderate' ? 'high' : sev === 'mild' ? 'moderate' : 'low',
          }}
        />
      </div>

      {/* 응답 신뢰도 분석 */}
      <ResponseValidityCard validity={validity} className="mb-4" />

      {/* 점수 신뢰구간 */}
      <ConfidenceIntervalCard
        score={total}
        maxScore={42}
        lower={ci.lower}
        upper={ci.upper}
        sem={ci.sem}
        reliability={reliability}
        label={isEnglish ? 'Depression Score (95% Confidence Interval)' : '우울감 점수 (95% 신뢰구간)'}
        className="mb-4"
      />

      {/* 예후 시나리오 */}
      <PrognosisScenarioCard
        currentScore={total}
        maxScore={42}
        scenarios={scenarios}
        scoreName={isEnglish ? 'Depression Score' : '우울감 점수'}
        className="mb-4"
      />

      {/* 교차분석 매트릭스 */}
      <CrossTestMatrixCard
        currentTestName={isEnglish ? 'Depression Check' : '우울감 체크'}
        currentScore={total}
        currentMaxScore={42}
        className="mb-4"
      />

      {/* 참고용 소견서 */}
      <ReferralLetterCard
        testName={isEnglish ? 'Depression Check' : '우울감 체크'}
        totalScore={total}
        maxScore={42}
        severity={severityLabel}
        domains={domains.map(d => ({ label: d.label, score: d.score, maxScore: d.maxScore, level: d.level }))}
        className="mb-4"
      />
    </ClinicalReportLayout>
  );
};

export default DepressionTestResult;
