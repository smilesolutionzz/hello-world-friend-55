import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface AdhdTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  };
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const AdhdTestResult = ({ results, onBack }: AdhdTestResultProps) => {
  const safeTotal = results.total || 0;
  const safeAverage = results.average || 0;
  const safeAnswers = results.answers?.filter(a => a !== null && !isNaN(a)) || [];
  const { ageGroup, severity } = results;

  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish, localePath } = useLanguage();

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useAutoSaveTestResult({
    testType: 'ADHD 검사',
    results: { total: safeTotal, average: safeAverage, answers: safeAnswers },
    analysis: aiAnalysis,
    severity,
    ageGroup,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) requestAIAnalysis(user.id);
    };
    checkUser();
  }, []);

  const requestAIAnalysis = async (userId: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('premium-adhd-analyzer', {
        body: { answers: safeAnswers, ageGroup, severity, total: safeTotal, average: safeAverage, userId }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.message || 'AI 분석 오류');
      setAiAnalysis(data.analysis || '');
    } catch (error: any) {
      console.error('ADHD AI 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Scores
  const inattentionScore = safeAnswers.slice(0, 9).reduce((sum, s) => sum + (s || 0), 0);
  const hyperactivityScore = safeAnswers.slice(9, 18).reduce((sum, s) => sum + (s || 0), 0);
  const maxDomainScore = 27;

  const getColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 75) return 'bg-destructive';
    if (pct >= 50) return 'bg-orange-500';
    if (pct >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLevel = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 83) return isEnglish ? 'Severe' : '심각한 수준';
    if (pct >= 67) return isEnglish ? 'Moderate' : '중등도 수준';
    if (pct >= 50) return isEnglish ? 'Borderline' : '경계선 수준';
    return isEnglish ? 'Normal' : '정상 범위';
  };

  const domains: DomainScore[] = [
    {
      key: 'inattention',
      label: isEnglish ? 'Inattention' : '주의력 결핍',
      score: inattentionScore,
      maxScore: maxDomainScore,
      level: getLevel(inattentionScore, maxDomainScore),
      color: getColor(inattentionScore, maxDomainScore),
    },
    {
      key: 'hyperactivity',
      label: isEnglish ? 'Hyperactivity' : '과잉행동/충동성',
      score: hyperactivityScore,
      maxScore: maxDomainScore,
      level: getLevel(hyperactivityScore, maxDomainScore),
      color: getColor(hyperactivityScore, maxDomainScore),
    },
  ];

  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
    let match;
    let idx = 0;
    while ((match = regex.exec(text)) !== null) {
      const title = match[1].replace(/^[^\w가-힣]*/, '').trim();
      const content = match[2].replace(/\*\*/g, '').trim();
      if (content.length > 10) {
        const emojiMatch = match[1].match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        sections.push({ id: `s-${idx}`, icon: emojiMatch?.[0] || '📋', title, content, defaultOpen: idx === 0 });
        idx++;
      }
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(aiAnalysis);
  const severityText = severity || (isEnglish ? 'Checking' : '확인 중');
  const severityMap: Record<string, string> = isEnglish
    ? { '심각한 수준': 'Severe', '중등도 수준': 'Moderate', '경계선 수준': 'Borderline', '정상 범위': 'Normal' }
    : {};
  const displaySeverity = (isEnglish && severityMap[severityText]) ? severityMap[severityText] : severityText;
  const severityColor = severity === '심각한 수준' || severity === 'Severe' ? 'text-destructive border-destructive/30'
    : severity === '중등도 수준' || severity === 'Moderate' ? 'text-orange-600 border-orange-300'
    : severity === '경계선 수준' || severity === 'Borderline' ? 'text-yellow-600 border-yellow-300'
    : 'text-green-600 border-green-300';

  const handleDownload = async () => {
    await downloadResultAsPDF(
      'clinical-report-content',
      isEnglish ? 'ADHD_Self_Check_Results' : 'ADHD_자가체크_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = isEnglish 
      ? `ADHD Self-Check Results\nTotal: ${safeTotal} pts\nLevel: ${displaySeverity}`
      : `ADHD 자가체크 결과\n총점: ${safeTotal}점\n상태: ${severity}`;
    if (navigator.share) {
      await navigator.share({ title: isEnglish ? 'ADHD Self-Check Results' : 'ADHD 자가체크 결과', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: isEnglish ? 'Results copied' : '결과가 복사되었습니다' });
    }
  };

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={isEnglish ? "ADHD Analysis" : "ADHD 전문 분석"} estimatedSeconds={30} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'ADHD Self-Check Results' : 'ADHD 자가체크 결과'}
      subtitle={isEnglish ? `Age group: ${ageGroup}` : `연령대: ${ageGroup}`}
      onBack={onBack}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={safeTotal}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={isEnglish ? 'pts' : '점'}
      scoreSeverity={displaySeverity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
      isAnalyzing={isAnalyzing}
    >
      {/* Visual Result Card */}
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'ADHD Check' : 'ADHD 자가체크',
            subtitle: isEnglish ? 'Attention & Hyperactivity' : '주의력 · 과잉행동 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: {
              inattention: inattentionScore / maxDomainScore * 7,
              hyperactivity: hyperactivityScore / maxDomainScore * 7,
            },
            maxScore: 7,
            categoryTranslations: {
              inattention: isEnglish ? 'Inattention' : '주의력결핍',
              hyperactivity: isEnglish ? 'Hyperactivity' : '과잉행동',
            },
            aiSummary: aiAnalysis,
            riskLevel: severity === '심각한 수준' || severity === 'Severe' || severity === '중등도 수준' || severity === 'Moderate' ? 'high' : severity === '경계선 수준' || severity === 'Borderline' ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default AdhdTestResult;
