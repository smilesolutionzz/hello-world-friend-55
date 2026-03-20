import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

const getDimensionInfo = (isEnglish: boolean): Record<string, { name: string; color: string }> => ({
  honesty: { name: isEnglish ? 'Honesty-Humility' : '정직-겸손', color: 'bg-primary' },
  emotionality: { name: isEnglish ? 'Emotionality' : '정서성', color: 'bg-pink-500' },
  extraversion: { name: isEnglish ? 'Extraversion' : '외향성', color: 'bg-orange-500' },
  agreeableness: { name: isEnglish ? 'Agreeableness' : '원만성', color: 'bg-green-500' },
  conscientiousness: { name: isEnglish ? 'Conscientiousness' : '성실성', color: 'bg-purple-500' },
  openness: { name: isEnglish ? 'Openness' : '개방성', color: 'bg-indigo-500' },
});

interface HexacoResultProps {
  result: { categoryScores: Record<string, number>; analysis: string; totalScore: number };
  onBack: () => void;
}

export const HexacoResult: React.FC<HexacoResultProps> = ({ result, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const { t } = useTranslation();
  const dimInfo = getDimensionInfo(isEnglish);

  useAutoSaveTestResult({
    testType: isEnglish ? 'HEXACO Personality Test' : 'HEXACO 성격검사',
    results: { categoryScores: result.categoryScores, totalScore: result.totalScore },
    analysis: result.analysis,
    severity: isEnglish ? 'Normal' : '보통',
    ageGroup: 'adult',
  });

  const getLevel = (s: number) => s >= 4 ? (isEnglish ? 'High' : '높음') : s >= 3 ? (isEnglish ? 'Avg' : '보통') : (isEnglish ? 'Low' : '낮음');
  const getColor = (s: number) => s >= 4 ? 'bg-green-500' : s >= 3 ? 'bg-yellow-500' : 'bg-orange-500';

  const domains: DomainScore[] = Object.entries(result.categoryScores).map(([key, score]) => ({
    key, label: dimInfo[key]?.name || key, score: parseFloat(score.toFixed(1)), maxScore: 5, level: getLevel(score), color: getColor(score),
  }));

  const avg = Object.values(result.categoryScores).reduce((s, v) => s + v, 0) / Object.keys(result.categoryScores).length;

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'HEXACO_Result' : 'HEXACO_성격_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'HEXACO Personality Compass' : 'HEXACO 퍼스널리티 컴퍼스'}
      subtitle={isEnglish ? '6 personality dimensions' : '6가지 성격 차원 분석'}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={avg.toFixed(1)}
      totalLabel={isEnglish ? 'Average' : '전체 평균'}
      scoreUnit="/ 5.0"
      scoreSeverity={isEnglish ? 'Balanced' : '균형적'}
      severityColor="text-primary border-primary/30"
      domains={domains}
      aiAnalysis={result.analysis}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: 'HEXACO',
            subtitle: isEnglish ? '6 Dimensions' : '6차원 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(result.categoryScores).map(([k, v]) => [k, (v / 5) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(dimInfo).map(([k, v]) => [k, v.name])),
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default HexacoResult;