import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguage } from '@/i18n/LanguageContext';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface ChildAssessmentResultProps {
  results: {
    answers: Record<string, number>;
    total: number;
    average: number;
    ageGroup: string;
    gameScores: Record<string, number>;
  };
  onBack: () => void;
}

const ChildAssessmentResult = ({ results, onBack }: ChildAssessmentResultProps) => {
  const { total, average, ageGroup, gameScores } = results;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const avgScore = total / Object.keys(gameScores).length;
  const evalLevel = avgScore >= 80
    ? (isEnglish ? 'Excellent' : '우수')
    : avgScore >= 60 ? (isEnglish ? 'Good' : '양호')
    : avgScore >= 40 ? (isEnglish ? 'Average' : '보통')
    : (isEnglish ? 'Needs Observation' : '관찰 필요');

  useAutoSaveTestResult({
    testType: isEnglish ? 'Child Psychology Test' : '아동 심리검사',
    results: { total, average, gameScores },
    analysis: `${isEnglish ? 'Cognitive Level' : '인지능력 수준'}: ${evalLevel}, ${isEnglish ? 'Average Score' : '평균 점수'}: ${avgScore.toFixed(1)}`,
    ageGroup
  });

  const getColor = (pct: number) =>
    pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : pct >= 40 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (pct: number) =>
    pct >= 80 ? (isEnglish ? 'Excellent' : '우수') : pct >= 60 ? (isEnglish ? 'Good' : '양호') : pct >= 40 ? (isEnglish ? 'Average' : '보통') : (isEnglish ? 'Observe' : '관찰필요');

  const domains: DomainScore[] = Object.entries(gameScores).map(([name, score]) => ({
    key: name,
    label: name,
    score,
    maxScore: 100,
    level: getLevel(score),
    color: getColor(score),
  }));

  const severityColor = evalLevel === (isEnglish ? 'Excellent' : '우수') ? 'text-green-600 border-green-300'
    : evalLevel === (isEnglish ? 'Good' : '양호') ? 'text-primary border-primary/30'
    : evalLevel === (isEnglish ? 'Average' : '보통') ? 'text-yellow-600 border-yellow-300'
    : 'text-orange-600 border-orange-300';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? `Child_Psychology_${new Date().toISOString().split('T')[0]}` : `아동심리검사_${new Date().toISOString().split('T')[0]}`,
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Child Development Assessment Results' : '아동청소년 성향 파악 결과'}
      subtitle={`${isEnglish ? 'Age Group' : '연령대'}: ${ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={`/ ${Object.keys(gameScores).length * 100}`}
      scoreSeverity={evalLevel}
      severityColor={severityColor}
      domains={domains}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Child Development' : '아동청소년 성향 파악',
            subtitle: isEnglish ? '5-Domain Cognitive Analysis' : '5영역 인지능력 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(
              Object.entries(gameScores).map(([k, v]) => [k, (v / 100) * 7])
            ),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.keys(gameScores).map(k => [k, k])),
            riskLevel: avgScore >= 60 ? 'low' : avgScore >= 40 ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default ChildAssessmentResult;