import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface AdultAssessmentResultProps {
  results: {
    answers: Record<string, number>;
    total: number;
    average: number;
    ageGroup: string;
    categoryScores: Record<string, number>;
  };
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const categoryNames: Record<string, string> = {
  depression: '우울감', dep: '우울감', anxiety: '불안감', anx: '불안감',
  personality: '성격', workplace: '직장적응', work: '직장적응',
  resilience: '회복력', res: '회복력', leadership: '리더십', lead: '리더십',
  empathy: '공감', emp: '공감', problem_solving: '문제해결', prob: '문제해결',
  communication: '소통', comm: '소통', focus: '집중력', foc: '집중력',
  creativity: '창의성', cre: '창의성', adaptability: '적응력', adap: '적응력',
  persistence: '끈기', collaboration: '협력', coll: '협력',
};

const getCatName = (cat: string) => {
  const lower = cat.toLowerCase();
  for (const [key, value] of Object.entries(categoryNames)) {
    if (lower.includes(key)) return value;
  }
  return cat;
};

const AdultAssessmentResult = ({ results, onBack }: AdultAssessmentResultProps) => {
  const { total, average, ageGroup, categoryScores } = results;
  const navigate = useNavigate();
  const { toast } = useToast();

  const avg = total / Object.keys(categoryScores).length;
  const evalLevel = avg <= 0.5 ? '양호' : avg <= 1.0 ? '경미한 증상' : avg <= 2.0 ? '중등도 증상' : '심각한 증상';

  useAutoSaveTestResult({
    testType: '성인 심리검사',
    results: { total, average, categoryScores },
    analysis: `총점: ${total}점, 평균: ${average.toFixed(1)}점`,
    ageGroup,
  });

  // Higher score = more problematic for adult assessment (inverted)
  const getColor = (s: number) => s <= 0.5 ? 'bg-green-500' : s <= 1.0 ? 'bg-yellow-500' : s <= 2.0 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (s: number) => s <= 0.5 ? '양호' : s <= 1.0 ? '경미' : s <= 2.0 ? '중등도' : '심각';
  const severityColor = evalLevel === '양호' ? 'text-green-600 border-green-300' : evalLevel === '경미한 증상' ? 'text-yellow-600 border-yellow-300' : evalLevel === '중등도 증상' ? 'text-orange-600 border-orange-300' : 'text-destructive border-destructive/30';

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, score]) => ({
    key,
    label: getCatName(key),
    score: parseFloat(score.toFixed(1)),
    maxScore: 3,
    level: getLevel(score),
    color: getColor(score),
  }));

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '성인_심리검사_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  const analysisText = `종합 평가: ${evalLevel}\n총점: ${total}점\n평균: ${avg.toFixed(1)}점 / 3.0점\n연령대: ${ageGroup}\n\n` +
    Object.entries(categoryScores).map(([k, v]) =>
      `${getCatName(k)}: ${v.toFixed(1)}점 - ${getLevel(v)}`
    ).join('\n');

  return (
    <ClinicalReportLayout
      testName="성인 임상심리평가 결과"
      subtitle={`연령대: ${ageGroup} (참고용)`}
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
            testName: '성인 심리검사',
            subtitle: '영역별 분석',
            date: new Date().toLocaleDateString('ko-KR'),
            scores: Object.fromEntries(Object.entries(categoryScores).map(([k, v]) => [k, (v / 3) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(categoryScores).map(([k]) => [k, getCatName(k)])),
            riskLevel: evalLevel === '양호' ? 'low' : evalLevel === '경미한 증상' ? 'low' : evalLevel === '중등도 증상' ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default AdultAssessmentResult;
