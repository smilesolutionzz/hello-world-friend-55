import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PatternIQResult, cognitiveTypes } from '@/data/patternIQTestQuestions';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguage } from '@/i18n/LanguageContext';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface PatternIQTestResultProps {
  result: PatternIQResult;
  onBack: () => void;
  onRestart: () => void;
}

const categoryNames: Record<string, { ko: string; en: string }> = {
  logic: { ko: '논리적 추론', en: 'Logical Reasoning' },
  pattern: { ko: '패턴 인식', en: 'Pattern Recognition' },
  spatial: { ko: '공간 지각', en: 'Spatial Perception' },
  speed: { ko: '처리 속도', en: 'Processing Speed' },
};

const PatternIQTestResult = ({ result, onBack, onRestart }: PatternIQTestResultProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const cognitiveType = cognitiveTypes.find(t => t.name === result.cognitiveType) || cognitiveTypes[cognitiveTypes.length - 1];

  const getCatName = (key: string) => isEnglish ? (categoryNames[key]?.en || key) : (categoryNames[key]?.ko || key);

  const getColor = (pct: number) => pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-primary' : pct >= 25 ? 'bg-yellow-500' : 'bg-orange-500';
  const getLevel = (pct: number) => pct >= 75 ? (isEnglish ? 'Excellent' : '우수') : pct >= 50 ? (isEnglish ? 'Good' : '양호') : pct >= 25 ? (isEnglish ? 'Average' : '보통') : (isEnglish ? 'Low' : '낮음');

  const maxPerCategory = 35;
  const domains: DomainScore[] = Object.entries(result.categoryScores).map(([key, score]) => {
    const pct = Math.min(100, Math.round((score / maxPerCategory) * 100));
    return { key, label: getCatName(key), score: pct, maxScore: 100, level: getLevel(pct), color: getColor(pct) };
  });

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Pattern_IQ_Result' : '패턴인지력_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = isEnglish
      ? `Pattern IQ Test\nType: ${result.cognitiveType} (Top ${100 - result.percentile}%)\nScore: ${result.totalScore}`
      : `패턴 인지력 테스트 결과\n인지 유형: ${result.cognitiveType} (상위 ${100 - result.percentile}%)\n총점: ${result.totalScore}`;
    if (navigator.share) await navigator.share({ title: isEnglish ? 'Pattern IQ Result' : '패턴 인지력 결과', text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast({ title: t.resultLayout.copied }); }
  };

  const analysisText = `${isEnglish ? 'Cognitive Type' : '인지 유형'}: ${result.cognitiveType}\n${result.typeDescription}\n\n${isEnglish ? 'Top' : '상위'} ${100 - result.percentile}% · ${isEnglish ? 'Total' : '총점'} ${result.totalScore}\n\n` +
    Object.entries(result.categoryScores).map(([k, v]) =>
      `${getCatName(k)}: ${Math.min(100, Math.round((v / maxPerCategory) * 100))}%`
    ).join('\n');

  const catTranslations = Object.fromEntries(Object.entries(categoryNames).map(([k, v]) => [k, isEnglish ? v.en : v.ko]));

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Pattern IQ Test Results' : '패턴 인지력 테스트 결과'}
      subtitle={`${isEnglish ? 'Cognitive Type' : '인지 유형'}: ${result.cognitiveType}`}
      onBack={onBack}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={result.totalScore}
      totalLabel={isEnglish ? 'Total Score' : '총 점수'}
      scoreUnit={`${isEnglish ? 'Top' : '상위'} ${100 - result.percentile}%`}
      scoreSeverity={cognitiveType.emoji + ' ' + result.cognitiveType}
      severityColor="text-primary border-primary/30"
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Pattern IQ' : '패턴 인지력',
            subtitle: isEnglish ? '4 Cognitive Domains' : '4개 인지 영역',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(result.categoryScores).map(([k, v]) => [k, Math.min(7, (v / maxPerCategory) * 7)])),
            maxScore: 7,
            categoryTranslations: catTranslations,
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default PatternIQTestResult;