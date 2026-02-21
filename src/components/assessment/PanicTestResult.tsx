import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Heart, ArrowLeft, ExternalLink, Save, Share2, Download, Crown, Wallet, Lock, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useShareText } from "@/utils/shareUtils";
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useToast } from '@/hooks/use-toast';
import { PDFHeader } from '@/components/common/PDFHeader';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n';

interface PurchaseOptionsProps {
  onClose: () => void;
}

interface TestResultProps {
  total: number;
  average: number;
}

interface TestResultsProps {
  answers: number[];
  total: number;
  average: number;
  severity: string;
}

interface RedFlag {
  message: string;
  description: string;
  severity: 'warning' | 'critical';
}

interface RedFlagResult {
  flags: RedFlag[];
  overallSeverity: 'none' | 'warning' | 'critical';
}

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

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "정상": return "bg-green-100 text-green-800 border-green-200";
    case "경미": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "중등도": return "bg-orange-100 text-orange-800 border-orange-200";
    case "심각": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const PanicTestResult = ({ results, onBack, onRestart }: PanicTestResultProps) => {
  const { total, average } = results;
  const severity = getSeverityLevel(total);
  const { shareAsText } = useShareText();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const severityLabelMap: Record<string, string> = { "정상": "Normal", "경미": "Mild", "중등도": "Moderate", "심각": "Severe" };
  const sevLabel = isEnglish ? (severityLabelMap[severity] || severity) : severity;

  const getRecommendation = (sev: string) => {
    if (isEnglish) {
      switch (sev) {
        case "정상": return { icon: <CheckCircle className="w-6 h-6 text-green-600" />, title: "Good Condition", description: "You currently show very few panic disorder symptoms. Continue regular self-care to maintain this state." };
        case "경미": return { icon: <Heart className="w-6 h-6 text-yellow-600" />, title: "Mild Symptoms", description: "You may have mild anxiety symptoms. Stress management and relaxation techniques can help alleviate them." };
        case "중등도": return { icon: <AlertTriangle className="w-6 h-6 text-orange-600" />, title: "Moderate Symptoms", description: "Panic disorder symptoms are at a moderate level. We recommend consulting a professional for appropriate treatment." };
        case "심각": return { icon: <AlertTriangle className="w-6 h-6 text-red-600" />, title: "Severe Symptoms", description: "Immediate professional help is needed. We strongly recommend consulting a mental health specialist." };
        default: return { icon: <Heart className="w-6 h-6 text-gray-600" />, title: "Assessment Complete", description: "The assessment is complete." };
      }
    }
    switch (sev) {
      case "정상": return { icon: <CheckCircle className="w-6 h-6 text-green-600" />, title: "양호한 상태", description: "현재 공황장애 증상이 거의 없는 상태입니다. 정기적인 자가관리를 통해 현재 상태를 유지하시기 바랍니다." };
      case "경미": return { icon: <Heart className="w-6 h-6 text-yellow-600" />, title: "경미한 증상", description: "가벼운 불안 증상이 있을 수 있습니다. 스트레스 관리와 이완 기법을 통해 증상을 완화할 수 있습니다." };
      case "중등도": return { icon: <AlertTriangle className="w-6 h-6 text-orange-600" />, title: "중등도 증상", description: "공황장애 증상이 중등도 수준입니다. 전문가와 상담하여 적절한 치료 방법을 찾아보시는 것을 권장합니다." };
      case "심각": return { icon: <AlertTriangle className="w-6 h-6 text-red-600" />, title: "심각한 증상", description: "즉시 전문가의 도움이 필요합니다. 통합건강의학과 전문의와 상담받으시기를 적극 권장드립니다." };
      default: return { icon: <Heart className="w-6 h-6 text-gray-600" />, title: "검사 완료", description: "검사가 완료되었습니다." };
    }
  };

  const recommendation = getRecommendation(severity);

  useAutoSaveTestResult({
    testType: isEnglish ? 'Anxiety Test' : '불안감 검사',
    results: { total, average, answers: results.answers },
    analysis: recommendation.description,
    severity
  });

  const chartData = [{ name: isEnglish ? 'Total' : '총점', value: total, fullMark: 63 }];

  const handlePDFDownload = async () => {
    await downloadResultAsPDF(
      'panic-result-content',
      isEnglish ? 'Anxiety_Check_Results' : '불안감_체크_결과',
      () => { toast({ title: isEnglish ? "PDF Downloaded" : "PDF 다운로드 완료", description: isEnglish ? "Anxiety check results saved." : "불안감 체크 결과가 저장되었습니다." }); },
      (error) => { toast({ title: isEnglish ? "Download Failed" : "다운로드 실패", description: error.message, variant: "destructive" }); }
    );
  };

  const scoreRanges = isEnglish
    ? [
        { label: 'Normal (0-15)', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', sub: 'text-green-600', desc: 'Good condition' },
        { label: 'Mild (16-30)', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', sub: 'text-yellow-600', desc: 'Mild anxiety' },
        { label: 'Moderate (31-45)', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', sub: 'text-orange-600', desc: 'Consult recommended' },
        { label: 'Severe (46-63)', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', sub: 'text-red-600', desc: 'Immediate treatment' },
      ]
    : [
        { label: '정상 (0-15점)', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', sub: 'text-green-600', desc: '양호한 상태' },
        { label: '경미 (16-30점)', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', sub: 'text-yellow-600', desc: '가벼운 불안' },
        { label: '중등도 (31-45점)', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', sub: 'text-orange-600', desc: '전문가 상담 권장' },
        { label: '심각 (46-63점)', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', sub: 'text-red-600', desc: '즉시 치료 필요' },
      ];

  return (
    <div id="panic-result-content" className="space-y-8">
      <PDFHeader testName={isEnglish ? "Anxiety Check Results" : "불안감 체크 결과"} />
      
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />{isEnglish ? 'Back' : '뒤로가기'}
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">{isEnglish ? 'Anxiety Check Results (Reference)' : '불안감 체크 결과 (참고용)'}</h1>
        <Button variant="outline" onClick={handlePDFDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />{isEnglish ? 'PDF' : 'PDF 다운로드'}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">{isEnglish ? '📊 Reference Results' : '📊 체크 결과 (참고용)'}</span><br />
          {isEnglish ? '⚠️ These results are for reference only and are NOT a medical diagnosis. If you have persistent difficulties, please consult a specialist.' : '⚠️ 이 결과는 참고용이며 의학적 진단이 절대 아닙니다. 지속적 어려움이 있으시면 반드시 전문의와 상담하세요.'}
        </p>
      </div>

      <Card className="p-8 no-break">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">{isEnglish ? 'Results Summary' : '검사 결과 요약'}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{isEnglish ? 'Total Score' : '총점'}</span>
                <span className="text-2xl font-bold text-brand-gradient">{total}{isEnglish ? '' : '점'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{isEnglish ? 'Percentile' : '규준집단 대비'}</span>
                <span className="text-2xl font-bold text-brand-gradient">{((total/63)*100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{isEnglish ? 'Severity' : '심각도'}</span>
                <Badge className={getSeverityColor(severity)}>{sevLabel}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{isEnglish ? 'Date' : '검사일'}</span>
                <span className="text-lg">{new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR')}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{isEnglish ? 'Score Distribution' : '점수 분포'}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 63]} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 no-break page-break">
        <h3 className="text-xl font-semibold mb-4">{isEnglish ? '📊 Score Classification' : '📊 공황장애 점수 분류 기준'}</h3>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {scoreRanges.map((r, i) => (
            <div key={i} className={`p-4 ${r.bg} rounded-lg border ${r.border}`}>
              <p className={`font-semibold ${r.text}`}>{r.label}</p>
              <p className={`text-sm ${r.sub} mt-1`}>{r.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8 no-break">
        <div className="flex items-start gap-4">
          {recommendation.icon}
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">{recommendation.title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{recommendation.description}</p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Button className="btn-brand h-16" onClick={() => window.open('/expert-hiring', '_self')}>
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">{isEnglish ? 'Find an Expert' : '전문가 고용하기'}</div>
            <div className="text-sm opacity-90">{isEnglish ? 'Consult now' : '즉시 상담 가능'}</div>
          </div>
        </Button>
        <Button onClick={onRestart} variant="outline" className="h-16">
          <div className="text-left">
            <div className="font-semibold">{isEnglish ? 'Retake Test' : '다시 검사하기'}</div>
            <div className="text-sm text-muted-foreground">{isEnglish ? 'Start a new test' : '새로운 검사 시작'}</div>
          </div>
        </Button>
      </div>

      <NextStepSuggestion className="mb-6" />
      <ExpertConsultationNotice />

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">{isEnglish ? 'Note' : '참고사항'}</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          {isEnglish
            ? 'This check is a self-assessment tool and cannot replace a medical diagnosis. Please consult a specialist for accurate diagnosis and treatment.'
            : '이 체크는 자가진단 도구로, 의학적 진단을 대체할 수 없습니다. 정확한 진단과 치료를 위해서는 반드시 전문의와 상담하시기 바랍니다.'}
        </p>
      </Card>
    </div>
  );
};

export default PanicTestResult;
