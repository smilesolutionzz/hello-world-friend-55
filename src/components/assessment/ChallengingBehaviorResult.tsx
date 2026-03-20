import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface ChallengingBehaviorResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
}

const ChallengingBehaviorResult = ({ results }: ChallengingBehaviorResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [expertInterpretation, setExpertInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const categoryScores: Record<string, { score: number; max: number }> = {
    '자해행동': { score: results.answers.slice(0, 2).reduce((s, v) => s + v, 0), max: 6 },
    '공격행동': { score: results.answers.slice(2, 5).reduce((s, v) => s + v, 0), max: 9 },
    '파괴행동': { score: results.answers.slice(5, 7).reduce((s, v) => s + v, 0), max: 6 },
    '상동행동': { score: results.answers.slice(7, 10).reduce((s, v) => s + v, 0), max: 9 },
    '부적절한 사회적 행동': { score: results.answers.slice(10, 13).reduce((s, v) => s + v, 0), max: 9 },
    '거부행동': { score: results.answers.slice(13, 15).reduce((s, v) => s + v, 0), max: 6 },
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('behavior-expert-interpretation', {
          body: { assessmentType: 'challenging-behavior', results, categoryScores }
        });
        if (error) throw error;
        if (data?.interpretation) setExpertInterpretation(data.interpretation);
      } catch { /* noop */ } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const getColor = (pct: number) => pct >= 70 ? 'bg-destructive' : pct >= 40 ? 'bg-orange-500' : pct >= 20 ? 'bg-yellow-500' : 'bg-green-500';
  const getLevel = (pct: number) => pct >= 70 ? isEnglish ? 'Severe' : '심각' : pct >= 40 ? isEnglish ? 'Moderate' : '중등도' : pct >= 20 ? isEnglish ? 'Mild' : '경도' : isEnglish ? 'Normal' : '정상';

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, { score, max }]) => {
    const pct = Math.round((score / max) * 100);
    return { key, label: key, score, maxScore: max, level: getLevel(pct), color: getColor(pct) };
  });

  const severityColor = results.severity === (isEnglish ? 'Severe' : '심각') ? 'text-destructive border-destructive/30' : results.severity === (isEnglish ? 'Moderate' : '중등도') ? 'text-orange-600 border-orange-300' : results.severity === (isEnglish ? 'Mild' : '경도') ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

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

  const aiSections = parseAISections(expertInterpretation);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '도전행동_평가_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName="도전행동 평가" />;

  return (
    <ClinicalReportLayout
      testName="도전행동 평가 결과"
      subtitle="행동 영역별 심층 분석"
      onBack={() => navigate('/dashboard')}
      onDownload={handleDownload}
      totalScore={results.total}
      totalLabel="총점"
      scoreUnit="/ 45"
      scoreSeverity={results.severity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={expertInterpretation}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '도전행동 평가',
            subtitle: '6개 행동 영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(categoryScores).map(([k, { score, max }]) => [k, (score / max) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(categoryScores).map(([k]) => [k, k])),
            riskLevel: results.total >= 38 ? 'high' : results.total >= 23 ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default ChallengingBehaviorResult;
