import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface ResilienceTestResultProps {
  results: {
    answers: Record<string, string>;
    categoryScores: Record<string, number>;
    totalScore: number;
    resilienceType: string;
    resilienceLevel: string;
    recommendations: string[];
  };
  onBack: () => void;
}

const categoryNames: Record<string, { ko: string; en: string }> = {
  stress_recovery: { ko: '스트레스 회복력', en: 'Stress Recovery' },
  adaptability: { ko: '적응 유연성', en: 'Adaptability' },
  emotional_stability: { ko: '정서적 안정성', en: 'Emotional Stability' },
  social_support: { ko: '사회적 지지망', en: 'Social Support' },
  purpose_growth: { ko: '목적의식·성장', en: 'Purpose & Growth' },
};

export default function ResilienceTestResult({ results, onBack }: ResilienceTestResultProps) {
  const { categoryScores, totalScore, resilienceType, resilienceLevel } = results;
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  useEffect(() => {
    // Generate local analysis after brief delay
    setTimeout(() => {
      const parts: string[] = [];
      parts.push(`## 🧠 종합 분석\n회복탄력성 종합 점수 ${totalScore}점, ${resilienceType} 유형입니다.`);
      Object.entries(categoryScores).forEach(([k, v]) => {
        const name = categoryNames[k]?.ko || k;
        parts.push(`## 📊 ${name} (${v}점)\n${v >= 75 ? '우수한 수준입니다.' : v >= 50 ? '양호하며 발전 가능성이 있습니다.' : '집중 개발이 필요한 영역입니다.'}`);
      });
      parts.push(`## 💡 실천 가이드\n${results.recommendations.join('\n')}`);
      setAiAnalysis(parts.join('\n\n'));
      setIsLoading(false);
    }, 2000);
  }, []);

  const getColor = (s: number) => s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-primary' : s >= 25 ? 'bg-yellow-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 75 ? (isEnglish ? 'Excellent' : '우수') : s >= 50 ? (isEnglish ? 'Good' : '양호') : s >= 25 ? (isEnglish ? 'Fair' : '보통') : (isEnglish ? 'Needs Work' : '개발필요');

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, score]) => ({
    key, label: isEnglish ? (categoryNames[key]?.en || key) : (categoryNames[key]?.ko || key),
    score, maxScore: 100, level: getLevel(score), color: getColor(score),
  }));

  const severityColor = totalScore >= 70 ? 'text-green-600 border-green-300' : totalScore >= 50 ? 'text-primary border-primary/30' : totalScore >= 30 ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
    let match, idx = 0;
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

  const aiSections = parseAISections(aiAnalysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Resilience_Results' : '회복탄력성_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName={isEnglish ? 'Resilience Assessment' : '회복탄력성 분석'} />;

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Resilience Assessment Results' : '회복탄력성 검사 결과'}
      subtitle={`${isEnglish ? 'Type' : '유형'}: ${resilienceType}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={totalScore}
      totalLabel={isEnglish ? 'Resilience Score' : '회복탄력성 점수'}
      scoreUnit="/ 100"
      scoreSeverity={resilienceLevel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Resilience' : '회복탄력성',
            subtitle: isEnglish ? '5 Domain Analysis' : '5영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(categoryScores).map(([k, v]) => [k, (v / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(categoryNames).map(([k, v]) => [k, isEnglish ? v.en : v.ko])),
            riskLevel: totalScore >= 65 ? 'low' : totalScore >= 40 ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
}
