import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

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

const categoryNamesKo: Record<string, string> = {
  depression: '우울감', dep: '우울감', anxiety: '불안감', anx: '불안감',
  personality: '성격', workplace: '직장적응', work: '직장적응',
  resilience: '회복력', res: '회복력', leadership: '리더십', lead: '리더십',
  empathy: '공감', emp: '공감', problem_solving: '문제해결', prob: '문제해결',
  communication: '소통', comm: '소통', focus: '집중력', foc: '집중력',
  creativity: '창의성', cre: '창의성', adaptability: '적응력', adap: '적응력',
  persistence: '끈기', collaboration: '협력', coll: '협력',
};

const categoryNamesEn: Record<string, string> = {
  depression: 'Depression', dep: 'Depression', anxiety: 'Anxiety', anx: 'Anxiety',
  personality: 'Personality', workplace: 'Work Adapt.', work: 'Work Adapt.',
  resilience: 'Resilience', res: 'Resilience', leadership: 'Leadership', lead: 'Leadership',
  empathy: 'Empathy', emp: 'Empathy', problem_solving: 'Problem Solving', prob: 'Problem Solving',
  communication: 'Communication', comm: 'Communication', focus: 'Focus', foc: 'Focus',
  creativity: 'Creativity', cre: 'Creativity', adaptability: 'Adaptability', adap: 'Adaptability',
  persistence: 'Persistence', collaboration: 'Collaboration', coll: 'Collaboration',
};

const getCatName = (cat: string, isEnglish: boolean) => {
  const names = isEnglish ? categoryNamesEn : categoryNamesKo;
  const lower = cat.toLowerCase();
  for (const [key, value] of Object.entries(names)) {
    if (lower.includes(key)) return value;
  }
  return cat;
};

const AdultAssessmentResult = ({ results, onBack }: AdultAssessmentResultProps) => {
  const { total, average, ageGroup, categoryScores } = results;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const avg = total / Object.keys(categoryScores).length;
  const evalLevel = avg <= 0.5
    ? (isEnglish ? 'Good' : '양호')
    : avg <= 1.0 ? (isEnglish ? 'Mild' : '경미한 증상')
    : avg <= 2.0 ? (isEnglish ? 'Moderate' : '중등도 증상')
    : (isEnglish ? 'Severe' : '심각한 증상');

  useAutoSaveTestResult({
    testType: isEnglish ? 'Adult Psychology Test' : '성인 심리검사',
    results: { total, average, categoryScores },
    analysis: `${isEnglish ? 'Total' : '총점'}: ${total}${isEnglish ? 'pts' : '점'}, ${isEnglish ? 'Average' : '평균'}: ${average.toFixed(1)}${isEnglish ? 'pts' : '점'}`,
    ageGroup,
  });

  const getColor = (s: number) => s <= 0.5 ? 'bg-green-500' : s <= 1.0 ? 'bg-yellow-500' : s <= 2.0 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (s: number) => s <= 0.5 ? (isEnglish ? 'Good' : '양호') : s <= 1.0 ? (isEnglish ? 'Mild' : '경미') : s <= 2.0 ? (isEnglish ? 'Moderate' : '중등도') : (isEnglish ? 'Severe' : '심각');
  
  const goodLabel = isEnglish ? 'Good' : '양호';
  const mildLabel = isEnglish ? 'Mild' : '경미한 증상';
  const moderateLabel = isEnglish ? 'Moderate' : '중등도 증상';
  
  const severityColor = evalLevel === goodLabel ? 'text-green-600 border-green-300' : evalLevel === mildLabel ? 'text-yellow-600 border-yellow-300' : evalLevel === moderateLabel ? 'text-orange-600 border-orange-300' : 'text-destructive border-destructive/30';

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, score]) => ({
    key,
    label: getCatName(key, isEnglish),
    score: parseFloat(score.toFixed(1)),
    maxScore: 3,
    level: getLevel(score),
    color: getColor(score),
  }));

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Adult_Psychology_Result' : '성인_심리검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const analysisText = `${isEnglish ? 'Overall' : '종합 평가'}: ${evalLevel}\n${isEnglish ? 'Total' : '총점'}: ${total}${isEnglish ? 'pts' : '점'}\n${isEnglish ? 'Average' : '평균'}: ${avg.toFixed(1)}${isEnglish ? 'pts' : '점'} / 3.0${isEnglish ? 'pts' : '점'}\n${isEnglish ? 'Age Group' : '연령대'}: ${ageGroup}\n\n` +
    Object.entries(categoryScores).map(([k, v]) =>
      `${getCatName(k, isEnglish)}: ${v.toFixed(1)}${isEnglish ? 'pts' : '점'} - ${getLevel(v)}`
    ).join('\n');

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Adult Clinical Psychology Assessment' : '성인 임상심리평가 결과'}
      subtitle={`${isEnglish ? 'Age Group' : '연령대'}: ${ageGroup} (${isEnglish ? 'Reference' : '참고용'})`}
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
            testName: isEnglish ? 'Adult Psychology' : '성인 심리검사',
            subtitle: isEnglish ? 'Domain Analysis' : '영역별 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(categoryScores).map(([k, v]) => [k, (v / 3) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(categoryScores).map(([k]) => [k, getCatName(k, isEnglish)])),
            riskLevel: evalLevel === goodLabel ? 'low' : evalLevel === mildLabel ? 'low' : evalLevel === moderateLabel ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default AdultAssessmentResult;
