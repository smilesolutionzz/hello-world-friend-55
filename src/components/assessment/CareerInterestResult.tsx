import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface CareerInterestResultProps {
  result: {
    answers: Record<string, number>;
    scores: Record<string, number>;
    topTypes: string[];
    total: number;
    average: number;
  };
  onRestart: () => void;
}

const typeConfig: Record<string, { name: string; nameEn: string }> = {
  technical: { name: '실무형 (T)', nameEn: 'Practical (T)' },
  analytical: { name: '분석형 (A)', nameEn: 'Analytical (A)' },
  creative: { name: '창작형 (C)', nameEn: 'Creative (C)' },
  social: { name: '소통형 (S)', nameEn: 'Social (S)' },
  leadership: { name: '리더형 (L)', nameEn: 'Leader (L)' },
  organized: { name: '체계형 (O)', nameEn: 'Organized (O)' },
};

export default function CareerInterestResult({ result, onRestart }: CareerInterestResultProps) {
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const { t } = useTranslation();

  useAutoSaveTestResult({
    testType: isEnglish ? 'Career Interest Test' : '직업 성향 검사',
    results: { total: result.total, average: result.average, scores: result.scores, topTypes: result.topTypes },
    severity: isEnglish ? 'Normal' : '보통',
    ageGroup: 'adult',
  });

  const maxScore = Math.max(...Object.values(result.scores), 1);
  const getColor = (s: number) => s >= maxScore * 0.8 ? 'bg-green-500' : s >= maxScore * 0.5 ? 'bg-yellow-500' : 'bg-orange-500';
  const getLevel = (s: number) => s >= maxScore * 0.8 ? (isEnglish ? 'High' : '높음') : s >= maxScore * 0.5 ? (isEnglish ? 'Avg' : '보통') : (isEnglish ? 'Low' : '낮음');

  const domains: DomainScore[] = Object.entries(result.scores)
    .sort(([, a], [, b]) => b - a)
    .map(([key, score]) => ({
      key,
      label: isEnglish ? (typeConfig[key]?.nameEn || key) : (typeConfig[key]?.name || key),
      score, maxScore, level: getLevel(score), color: getColor(score),
    }));

  const topTypeName = isEnglish ? (typeConfig[result.topTypes[0]]?.nameEn || result.topTypes[0]) : (typeConfig[result.topTypes[0]]?.name || result.topTypes[0]);

  const analysisText = `${isEnglish ? 'Top Career Type' : '최적 직업 유형'}: ${topTypeName}\n\n` +
    Object.entries(result.scores).sort(([, a], [, b]) => b - a).map(([k, v]) =>
      `${isEnglish ? (typeConfig[k]?.nameEn || k) : (typeConfig[k]?.name || k)}: ${v}${isEnglish ? 'pts' : '점'}`
    ).join('\n');

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Career_Interest_Result' : '직업성향_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Career Interest Assessment' : '직업 성향 검사 결과'}
      subtitle={`${isEnglish ? 'Top Type' : '최적 유형'}: ${topTypeName}`}
      onBack={onRestart}
      onDownload={handleDownload}
      totalScore={result.total}
      totalLabel={isEnglish ? 'Total' : '총점'}
      scoreSeverity={topTypeName}
      severityColor="text-primary border-primary/30"
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Career Interest' : '직업 성향',
            subtitle: isEnglish ? '6 Types' : '6유형 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(result.scores).map(([k, v]) => [k, (v / maxScore) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(typeConfig).map(([k, v]) => [k, isEnglish ? v.nameEn : v.name])),
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
}