import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { adhdTypes } from '@/data/advancedAdhdTypes';
import { useLanguage } from '@/i18n/LanguageContext';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface AdvancedAdhdResultProps {
  results: {
    typeScores: Record<string, number>;
    timestamp: string;
  };
  onBack?: () => void;
  onRestart?: () => void;
}

const AdvancedAdhdResult = ({ results, onBack, onRestart }: AdvancedAdhdResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const { typeScores } = results;

  const dominantType = Object.entries(typeScores).reduce((a, b) =>
    typeScores[a[0]] > typeScores[b[0]] ? a : b
  )[0];

  const dominantTypeData = adhdTypes[dominantType];

  useAutoSaveTestResult({
    testType: '고급 ADHD 유형 검사',
    results: { typeScores, dominantType, timestamp: results.timestamp },
    severity: typeScores[dominantType] > 30 ? '높음' : typeScores[dominantType] > 15 ? '보통' : '양호',
    ageGroup: 'adult',
  });

  const getColor = (s: number) => s >= 30 ? 'bg-destructive' : s >= 20 ? 'bg-orange-500' : s >= 10 ? 'bg-yellow-500' : 'bg-green-500';
  const getLevel = (s: number) => s >= 30 ? (isEnglish ? 'High' : '높음') : s >= 20 ? (isEnglish ? 'Moderate' : '보통') : s >= 10 ? (isEnglish ? 'Low' : '낮음') : (isEnglish ? 'Very Low' : '매우낮음');

  const maxScore = Math.max(...Object.values(typeScores), 50);
  const domains: DomainScore[] = Object.entries(typeScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([key, score]) => ({
      key,
      label: adhdTypes[key]?.name || key,
      score,
      maxScore,
      level: getLevel(score),
      color: getColor(score),
    }));

  const severity = typeScores[dominantType] > 30 ? '높음' : typeScores[dominantType] > 15 ? '보통' : '양호';
  const severityColor = severity === '높음' ? 'text-destructive border-destructive/30' : severity === '보통' ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  const analysisText = `${isEnglish ? 'Dominant Type' : '주요 유형'}: ${dominantTypeData?.name || dominantType}\n${dominantTypeData?.description || ''}\n\n` +
    Object.entries(typeScores).sort(([, a], [, b]) => b - a).map(([k, v]) =>
      `${adhdTypes[k]?.name || k}: ${v}점`
    ).join('\n');

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Advanced_ADHD_Result' : '고급ADHD_유형_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Advanced ADHD Type Analysis' : '고급 ADHD 유형 분석 결과'}
      subtitle={`${isEnglish ? 'Type' : '주요 유형'}: ${dominantTypeData?.name || dominantType}`}
      onBack={onBack || (() => navigate(-1))}
      onDownload={handleDownload}
      totalScore={typeScores[dominantType]}
      totalLabel={isEnglish ? 'Dominant Score' : '주요 유형 점수'}
      scoreSeverity={severity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'ADHD Types' : 'ADHD 유형',
            subtitle: isEnglish ? 'Multi-type Analysis' : '다중 유형 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(typeScores).slice(0, 6).map(([k, v]) => [k, (v / maxScore) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(adhdTypes).map(([k, v]) => [k, v.name])),
            riskLevel: severity === '높음' ? 'high' : severity === '보통' ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default AdvancedAdhdResult;
