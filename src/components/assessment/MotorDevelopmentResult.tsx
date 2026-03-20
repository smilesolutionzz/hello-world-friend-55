import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { categoryInfo } from '@/data/motorDevelopmentQuestions';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface MotorDevelopmentResultProps {
  results: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    developmentLevel: string;
    developmentDescription: string;
    categoryScores: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    ageInMonths: number;
    questionCount: number;
  };
  answers?: Record<string, number>;
  onBack: () => void;
}

const MotorDevelopmentResult: React.FC<MotorDevelopmentResultProps> = ({ results, answers, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-motor-development', {
          body: { results, answers, ageInMonths: results.ageInMonths }
        });
        if (error) throw error;
        setAiAnalysis(data.analysis || '');
      } catch {
        setAiAnalysis('');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const getColor = (v: number) => v >= 70 ? 'bg-green-500' : v >= 50 ? 'bg-yellow-500' : 'bg-destructive';
  const getLevel = (v: number) => v >= 70 ? '우수' : v >= 50 ? '양호' : v >= 30 ? '보통' : '관찰필요';

  const domains: DomainScore[] = Object.entries(results.categoryScores).map(([key, value]) => ({
    key,
    label: categoryInfo[key as keyof typeof categoryInfo]?.name || key,
    score: value,
    maxScore: 100,
    level: getLevel(value),
    color: getColor(value),
  }));

  const levelColor = results.developmentLevel === '우수' ? 'text-green-600 border-green-300' : results.developmentLevel === '양호' ? 'text-primary border-primary/30' : results.developmentLevel === '보통' ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

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
  const ageYears = Math.floor(results.ageInMonths / 12);
  const ageMonths = results.ageInMonths % 12;

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', 'AIH_운동발달_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName="운동발달 분석" />;

  return (
    <ClinicalReportLayout
      testName="운동발달 검사 결과"
      subtitle={`${ageYears}세 ${ageMonths}개월 아동 기준`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={`${results.percentage}%`}
      totalLabel="종합 발달 수준"
      scoreSeverity={results.developmentLevel}
      severityColor={levelColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      {/* Strengths & Weaknesses */}
      {(results.strengths.length > 0 || results.weaknesses.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-3">
            <h3 className="text-xs font-bold text-green-700 mb-2">💪 강점 영역</h3>
            <div className="space-y-1">
              {results.strengths.map((s, i) => (
                <p key={i} className="text-[11px] text-green-800">• {s}</p>
              ))}
              {results.strengths.length === 0 && <p className="text-[11px] text-green-700">균형 잡힌 발달</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3">
            <h3 className="text-xs font-bold text-amber-700 mb-2">🎯 지원 필요</h3>
            <div className="space-y-1">
              {results.weaknesses.map((w, i) => (
                <p key={i} className="text-[11px] text-amber-800">• {w}</p>
              ))}
              {results.weaknesses.length === 0 && <p className="text-[11px] text-amber-700">우려 영역 없음</p>}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '운동발달',
            subtitle: '영역별 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(results.categoryScores).map(([k, v]) => [k, (v / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(results.categoryScores).map(([k]) => [k, categoryInfo[k as keyof typeof categoryInfo]?.name || k])),
            riskLevel: results.percentage >= 70 ? 'low' : results.percentage >= 50 ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default MotorDevelopmentResult;
