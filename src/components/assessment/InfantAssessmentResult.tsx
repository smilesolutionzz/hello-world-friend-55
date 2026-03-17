import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
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

const categoryNames: Record<string, string> = {
  grossMotor: '대근육 발달',
  fineMotor: '소근육 발달',
  language: '언어 발달',
  social: '사회성 발달',
  cognitive: '인지 발달',
};

const InfantAssessmentResult = ({ results, onBack }: InfantAssessmentResultProps) => {
  const { total, average, ageGroup, categoryScores } = results;
  const navigate = useNavigate();
  const { toast } = useToast();

  const avg = total / Object.keys(categoryScores).length;
  const evalLevel = avg >= 2.5 ? '우수' : avg >= 2.0 ? '양호' : avg >= 1.5 ? '보통' : '관찰 필요';

  useAutoSaveTestResult({
    testType: '영유아 발달검사',
    results: { total, average, categoryScores },
    analysis: `발달 수준: ${evalLevel}, 평균 점수: ${average.toFixed(1)}점`,
    ageGroup,
  });

  const getColor = (s: number) => s >= 2.5 ? 'bg-green-500' : s >= 2.0 ? 'bg-yellow-500' : s >= 1.5 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 2.5 ? '우수' : s >= 2.0 ? '양호' : s >= 1.5 ? '보통' : '관찰필요';
  const severityColor = evalLevel === '우수' ? 'text-green-600 border-green-300' : evalLevel === '양호' ? 'text-primary border-primary/30' : evalLevel === '보통' ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, score]) => ({
    key,
    label: categoryNames[key] || key,
    score: parseFloat(score.toFixed(1)),
    maxScore: 3,
    level: getLevel(score),
    color: getColor(score),
  }));

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '영유아_발달검사_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  const analysisText = `발달 수준: ${evalLevel}\n평균 점수: ${avg.toFixed(1)}점 / 3.0점\n연령대: ${ageGroup}\n\n` +
    Object.entries(categoryScores).map(([k, v]) =>
      `${categoryNames[k] || k}: ${v.toFixed(1)}점 - ${v >= 2.5 ? '우수한 발달' : v >= 2.0 ? '양호한 발달' : v >= 1.5 ? '평균 수준' : '추가 지원 필요'}`
    ).join('\n');

  return (
    <ClinicalReportLayout
      testName="영유아 발달 자기 체크리스트 결과"
      subtitle={`연령대: ${ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={avg.toFixed(1)}
      totalLabel="평균 점수"
      scoreUnit="/ 3.0"
      scoreSeverity={evalLevel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '영유아 발달검사',
            subtitle: '5개 발달 영역 분석',
            date: new Date().toLocaleDateString('ko-KR'),
            scores: Object.fromEntries(Object.entries(categoryScores).map(([k, v]) => [k, (v / 3) * 7])),
            maxScore: 7,
            categoryTranslations: categoryNames,
            riskLevel: evalLevel === '우수' || evalLevel === '양호' ? 'low' : evalLevel === '보통' ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default InfantAssessmentResult;
