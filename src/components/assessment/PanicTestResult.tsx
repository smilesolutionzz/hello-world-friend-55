import { useToast } from "@/hooks/use-toast";
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface PanicTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onBack: () => void;
  onRestart?: () => void;
}

const getSeverityLevel = (total: number) => {
  if (total <= 15) return "정상";
  if (total <= 30) return "경미";
  if (total <= 45) return "중등도";
  return "심각";
};

const PanicTestResult = ({ results, onBack }: PanicTestResultProps) => {
  const { total, average } = results;
  const severity = getSeverityLevel(total);
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const severityLabelMap: Record<string, string> = { "정상": "Normal", "경미": "Mild", "중등도": "Moderate", "심각": "Severe" };
  const sevLabel = isEnglish ? (severityLabelMap[severity] || severity) : severity;

  const getRecommendation = (sev: string) => {
    if (isEnglish) {
      switch (sev) {
        case "정상": return "You currently show very few panic disorder symptoms. Continue regular self-care.";
        case "경미": return "You may have mild anxiety symptoms. Stress management and relaxation techniques can help.";
        case "중등도": return "Panic disorder symptoms are at a moderate level. We recommend consulting a professional.";
        case "심각": return "Immediate professional help is needed. We strongly recommend consulting a mental health specialist.";
        default: return "Assessment complete.";
      }
    }
    switch (sev) {
      case "정상": return "현재 공황장애 증상이 거의 없는 상태입니다. 정기적인 자가관리를 통해 현재 상태를 유지하시기 바랍니다.";
      case "경미": return "가벼운 불안 증상이 있을 수 있습니다. 스트레스 관리와 이완 기법을 통해 증상을 완화할 수 있습니다.";
      case "중등도": return "공황장애 증상이 중등도 수준입니다. 전문가와 상담하여 적절한 치료 방법을 찾아보시는 것을 권장합니다.";
      case "심각": return "즉시 전문가의 도움이 필요합니다. 전문의와 상담받으시기를 적극 권장드립니다.";
      default: return "검사가 완료되었습니다.";
    }
  };

  useAutoSaveTestResult({
    testType: isEnglish ? 'Anxiety Test' : '불안감 검사',
    results: { total, average, answers: results.answers },
    analysis: getRecommendation(severity),
    severity,
  });

  const severityColor = severity === '심각' ? 'text-destructive border-destructive/30' : severity === '중등도' ? 'text-orange-600 border-orange-300' : severity === '경미' ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  // Simple domain-like breakdown by question groups
  const domains: DomainScore[] = [
    { key: 'physical', label: isEnglish ? 'Physical Symptoms' : '신체 증상', score: results.answers.slice(0, 7).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
    { key: 'cognitive', label: isEnglish ? 'Cognitive Symptoms' : '인지 증상', score: results.answers.slice(7, 14).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
    { key: 'behavioral', label: isEnglish ? 'Behavioral Symptoms' : '행동 증상', score: results.answers.slice(14, 21).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
  ].map(d => {
    const pct = (d.score / d.maxScore) * 100;
    return { ...d, level: pct >= 70 ? (isEnglish ? 'Severe' : '심각') : pct >= 40 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Normal' : '정상'), color: pct >= 70 ? 'bg-destructive' : pct >= 40 ? 'bg-orange-500' : 'bg-green-500' };
  });

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Anxiety_Results' : '불안감_체크_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Anxiety Check Results' : '불안감 체크 결과'}
      subtitle={isEnglish ? 'Panic Disorder Screening' : '공황장애 선별 검사'}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit="/ 63"
      scoreSeverity={sevLabel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={getRecommendation(severity)}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Anxiety Check' : '불안감 체크',
            subtitle: isEnglish ? '3-domain analysis' : '3영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(domains.map(d => [d.key, (d.score / d.maxScore) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domains.map(d => [d.key, d.label])),
            riskLevel: total >= 46 ? 'high' : total >= 31 ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default PanicTestResult;
