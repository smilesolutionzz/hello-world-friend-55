import { useToast } from "@/hooks/use-toast";
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface PanicTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
    ageGroup?: string;
  };
  onBack: () => void;
  onRestart?: () => void;
}

const PanicTestResult = ({ results, onBack }: PanicTestResultProps) => {
  const { total, average, answers } = results;
  const severity = results.severity;
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const isChild = answers.length === 15;
  const maxScore = answers.length * 3;

  const sevLabel = severity;

  const getRecommendation = (sev: string) => {
    if (isChild) {
      if (isEnglish) {
        if (sev.includes("Normal") || sev === "정상") return "Your child shows very few anxiety symptoms. Continue providing a safe and supportive environment.";
        if (sev.includes("Mild") || sev === "경미") return "Your child may show some anxiety. Encourage open communication and reassurance.";
        if (sev.includes("Moderate") || sev === "중등도") return "Your child shows moderate anxiety levels. Consider consulting a child psychologist for guidance.";
        return "Your child shows significant anxiety. Professional evaluation by a child mental health specialist is strongly recommended.";
      }
      if (sev === "정상") return "현재 아이의 불안 수준은 정상 범위입니다. 안정적이고 따뜻한 환경을 유지해주세요.";
      if (sev === "경미") return "약간의 불안 증상이 관찰됩니다. 아이와의 대화를 통해 안심시켜주세요.";
      if (sev === "중등도") return "불안 수준이 중등도입니다. 아동 심리 전문가와 상담을 권장합니다.";
      return "불안 수준이 높습니다. 아동 정신건강 전문가의 평가를 적극 권장합니다.";
    }

    if (isEnglish) {
      if (sev.includes("Normal") || sev === "정상") return "You currently show very few anxiety symptoms. Continue regular self-care.";
      if (sev.includes("Mild") || sev === "경미") return "You may have mild anxiety symptoms. Stress management and relaxation techniques can help.";
      if (sev.includes("Moderate") || sev === "중등도") return "Anxiety symptoms are at a moderate level. We recommend consulting a professional.";
      return "Immediate professional help is needed. We strongly recommend consulting a mental health specialist.";
    }
    if (sev === "정상") return "현재 불안 증상이 거의 없는 상태입니다. 정기적인 자가관리를 유지하시기 바랍니다.";
    if (sev === "경미") return "가벼운 불안 증상이 있을 수 있습니다. 스트레스 관리와 이완 기법을 통해 증상을 완화할 수 있습니다.";
    if (sev === "중등도") return "불안 증상이 중등도 수준입니다. 전문가와 상담하여 적절한 치료 방법을 찾아보시는 것을 권장합니다.";
    return "즉시 전문가의 도움이 필요합니다. 전문의와 상담받으시기를 적극 권장드립니다.";
  };

  useAutoSaveTestResult({
    testType: isEnglish ? 'Anxiety Test' : '불안감 검사',
    results: { total, average, answers, ageGroup: results.ageGroup },
    analysis: getRecommendation(severity),
    severity,
  });

  const severityColor = severity.includes('심각') || severity.includes('Severe') ? 'text-destructive border-destructive/30' : severity.includes('중등도') || severity.includes('Moderate') ? 'text-orange-600 border-orange-300' : severity.includes('경미') || severity.includes('Mild') ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  // Domain breakdown
  const domains: DomainScore[] = isChild
    ? [
        { key: 'school', label: isEnglish ? 'School/Social Anxiety' : '학교/사회적 불안', score: answers.slice(0, 5).reduce((s, v) => s + v, 0), maxScore: 15, level: '', color: '' },
        { key: 'separation', label: isEnglish ? 'Separation/Fear Anxiety' : '분리/공포 불안', score: answers.slice(5, 10).reduce((s, v) => s + v, 0), maxScore: 15, level: '', color: '' },
        { key: 'somatic', label: isEnglish ? 'Somatic/General Anxiety' : '신체/일반 불안', score: answers.slice(10, 15).reduce((s, v) => s + v, 0), maxScore: 15, level: '', color: '' },
      ].map(d => {
        const pct = (d.score / d.maxScore) * 100;
        return { ...d, level: pct >= 70 ? (isEnglish ? 'Severe' : '심각') : pct >= 40 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Normal' : '정상'), color: pct >= 70 ? 'bg-destructive' : pct >= 40 ? 'bg-orange-500' : 'bg-green-500' };
      })
    : [
        { key: 'physical', label: isEnglish ? 'Physical Symptoms' : '신체 증상', score: answers.slice(0, 7).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
        { key: 'cognitive', label: isEnglish ? 'Cognitive Symptoms' : '인지 증상', score: answers.slice(7, 14).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
        { key: 'behavioral', label: isEnglish ? 'Behavioral Symptoms' : '행동 증상', score: answers.slice(14, 21).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
      ].map(d => {
        const pct = (d.score / d.maxScore) * 100;
        return { ...d, level: pct >= 70 ? (isEnglish ? 'Severe' : '심각') : pct >= 40 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Normal' : '정상'), color: pct >= 70 ? 'bg-destructive' : pct >= 40 ? 'bg-orange-500' : 'bg-green-500' };
      });

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Anxiety_Results' : '불안감_체크_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const testNameLabel = isChild
    ? (isEnglish ? 'Child Anxiety Check Results' : '아동 불안 체크 결과')
    : (isEnglish ? 'Adult Anxiety Check Results' : '성인 불안 체크 결과');

  const subtitleLabel = isChild
    ? (isEnglish ? 'Child Anxiety Screening' : '아동 불안 선별 검사')
    : (isEnglish ? 'Adult Anxiety/Panic Screening' : '성인 불안/공황 선별 검사');

  return (
    <ClinicalReportLayout
      testName={testNameLabel}
      subtitle={subtitleLabel}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={`/ ${maxScore}`}
      scoreSeverity={sevLabel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={getRecommendation(severity)}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isChild ? (isEnglish ? 'Child Anxiety' : '아동 불안') : (isEnglish ? 'Adult Anxiety' : '성인 불안'),
            subtitle: isEnglish ? `${domains.length}-domain analysis` : `${domains.length}영역 분석`,
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(domains.map(d => [d.key, (d.score / d.maxScore) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domains.map(d => [d.key, d.label])),
            riskLevel: (total / maxScore) >= 0.75 ? 'high' : (total / maxScore) >= 0.5 ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default PanicTestResult;
