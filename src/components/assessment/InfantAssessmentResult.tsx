import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguage } from '@/i18n/LanguageContext';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface InfantAssessmentResultProps {
  results: {
    answers: Record<string, number>;
    total: number;
    average: number;
    ageGroup: string;
    categoryScores: Record<string, number>;
  };
  onBack: () => void;
}

const categoryNames: Record<string, { ko: string; en: string }> = {
  grossMotor: { ko: '대근육 발달', en: 'Gross Motor' },
  fineMotor: { ko: '소근육 발달', en: 'Fine Motor' },
  language: { ko: '언어 발달', en: 'Language' },
  social: { ko: '사회성 발달', en: 'Social Skills' },
  cognitive: { ko: '인지 발달', en: 'Cognitive' },
};

const InfantAssessmentResult = ({ results, onBack }: InfantAssessmentResultProps) => {
  const { total, average, ageGroup, categoryScores } = results;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const getCatName = (key: string) => isEnglish ? (categoryNames[key]?.en || key) : (categoryNames[key]?.ko || key);

  const avg = total / Object.keys(categoryScores).length;
  const evalLevel = avg >= 2.5 ? (isEnglish ? 'Excellent' : '우수') : avg >= 2.0 ? (isEnglish ? 'Good' : '양호') : avg >= 1.5 ? (isEnglish ? 'Average' : '보통') : (isEnglish ? 'Needs Observation' : '관찰 필요');

  useAutoSaveTestResult({
    testType: isEnglish ? 'Infant Development Test' : '영유아 발달검사',
    results: { total, average, categoryScores },
    analysis: `${isEnglish ? 'Development Level' : '발달 수준'}: ${evalLevel}, ${isEnglish ? 'Average Score' : '평균 점수'}: ${average.toFixed(1)}`,
    ageGroup,
  });

  const getColor = (s: number) => s >= 2.5 ? 'bg-green-500' : s >= 2.0 ? 'bg-yellow-500' : s >= 1.5 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 2.5 ? (isEnglish ? 'Excellent' : '우수') : s >= 2.0 ? (isEnglish ? 'Good' : '양호') : s >= 1.5 ? (isEnglish ? 'Average' : '보통') : (isEnglish ? 'Observe' : '관찰필요');
  const severityColor = evalLevel === (isEnglish ? 'Excellent' : '우수') ? 'text-green-600 border-green-300' : evalLevel === (isEnglish ? 'Good' : '양호') ? 'text-primary border-primary/30' : evalLevel === (isEnglish ? 'Average' : '보통') ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, score]) => ({
    key, label: getCatName(key), score: parseFloat(score.toFixed(1)), maxScore: 3, level: getLevel(score), color: getColor(score),
  }));

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Infant_Development_Result' : '영유아_발달검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const getDevDesc = (v: number) => {
    if (isEnglish) return v >= 2.5 ? 'Excellent development' : v >= 2.0 ? 'Good development' : v >= 1.5 ? 'Average level' : 'Additional support needed';
    return v >= 2.5 ? '우수한 발달' : v >= 2.0 ? '양호한 발달' : v >= 1.5 ? '평균 수준' : '추가 지원 필요';
  };

  const analysisText = `${isEnglish ? 'Development Level' : '발달 수준'}: ${evalLevel}\n${isEnglish ? 'Average Score' : '평균 점수'}: ${avg.toFixed(1)} / 3.0\n${isEnglish ? 'Age Group' : '연령대'}: ${ageGroup}\n\n` +
    Object.entries(categoryScores).map(([k, v]) =>
      `${getCatName(k)}: ${v.toFixed(1)} - ${getDevDesc(v)}`
    ).join('\n');

  const catTranslations = Object.fromEntries(Object.entries(categoryNames).map(([k, v]) => [k, isEnglish ? v.en : v.ko]));

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Infant Development Checklist Results' : '영유아 발달 자기 체크리스트 결과'}
      subtitle={`${isEnglish ? 'Age Group' : '연령대'}: ${ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={avg.toFixed(1)}
      totalLabel={isEnglish ? 'Average Score' : '평균 점수'}
      scoreUnit="/ 3.0"
      scoreSeverity={evalLevel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Infant Development' : '영유아 발달검사',
            subtitle: isEnglish ? '5-Domain Analysis' : '5개 발달 영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(categoryScores).map(([k, v]) => [k, (v / 3) * 7])),
            maxScore: 7,
            categoryTranslations: catTranslations,
            riskLevel: evalLevel === (isEnglish ? 'Excellent' : '우수') || evalLevel === (isEnglish ? 'Good' : '양호') ? 'low' : evalLevel === (isEnglish ? 'Average' : '보통') ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default InfantAssessmentResult;