import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PatternIQResult, cognitiveTypes } from '@/data/patternIQTestQuestions';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface PatternIQTestResultProps {
  result: PatternIQResult;
  onBack: () => void;
  onRestart: () => void;
}

const categoryNames: Record<string, string> = {
  logic: '논리적 추론',
  pattern: '패턴 인식',
  spatial: '공간 지각',
  speed: '처리 속도',
};

const PatternIQTestResult = ({ result, onBack, onRestart }: PatternIQTestResultProps) => {
  const { toast } = useToast();
  const cognitiveType = cognitiveTypes.find(t => t.name === result.cognitiveType) || cognitiveTypes[cognitiveTypes.length - 1];

  const getColor = (pct: number) => pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-primary' : pct >= 25 ? 'bg-yellow-500' : 'bg-orange-500';
  const getLevel = (pct: number) => pct >= 75 ? '우수' : pct >= 50 ? '양호' : pct >= 25 ? '보통' : '낮음';

  const maxPerCategory = 35; // difficulty*10 + timeBonus max ~35
  const domains: DomainScore[] = Object.entries(result.categoryScores).map(([key, score]) => {
    const pct = Math.min(100, Math.round((score / maxPerCategory) * 100));
    return {
      key,
      label: categoryNames[key] || key,
      score: pct,
      maxScore: 100,
      level: getLevel(pct),
      color: getColor(pct),
    };
  });

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '패턴인지력_검사_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = `패턴 인지력 테스트 결과\n인지 유형: ${result.cognitiveType} (상위 ${100 - result.percentile}%)\n총점: ${result.totalScore}`;
    if (navigator.share) await navigator.share({ title: '패턴 인지력 결과', text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast({ title: '복사 완료' }); }
  };

  const analysisText = `인지 유형: ${result.cognitiveType}\n${result.typeDescription}\n\n상위 ${100 - result.percentile}% · 총점 ${result.totalScore}\n\n` +
    Object.entries(result.categoryScores).map(([k, v]) =>
      `${categoryNames[k] || k}: ${Math.min(100, Math.round((v / maxPerCategory) * 100))}%`
    ).join('\n');

  return (
    <ClinicalReportLayout
      testName="패턴 인지력 테스트 결과"
      subtitle={`인지 유형: ${result.cognitiveType}`}
      onBack={onBack}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={result.totalScore}
      totalLabel="총 점수"
      scoreUnit={`상위 ${100 - result.percentile}%`}
      scoreSeverity={cognitiveType.emoji + ' ' + result.cognitiveType}
      severityColor="text-primary border-primary/30"
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '패턴 인지력',
            subtitle: '4개 인지 영역',
            date: new Date().toLocaleDateString('ko-KR'),
            scores: Object.fromEntries(Object.entries(result.categoryScores).map(([k, v]) => [k, Math.min(7, (v / maxPerCategory) * 7)])),
            maxScore: 7,
            categoryTranslations: categoryNames,
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default PatternIQTestResult;
