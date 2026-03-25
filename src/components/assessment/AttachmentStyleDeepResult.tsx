import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { supabase } from '@/integrations/supabase/client';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface AttachmentStyleDeepResultProps {
  result: {
    categoryScores: Record<string, number>;
    averageScores: Array<{ category: string; average: number }>;
    dominantStyle: string;
    dominantScore: number;
    totalScore: number;
    averageScore: number;
    styleInfo: {
      name: string;
      emoji: string;
      description: string;
      strengths: string[];
      challenges: string[];
      tips: string[];
    };
    allStyles: Record<string, any>;
    answers: Record<number, number>;
  };
  onBack: () => void;
}

const AttachmentStyleDeepResult: React.FC<AttachmentStyleDeepResultProps> = ({ result, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('attachment-analysis', {
          body: { result }
        });
        if (error) throw error;
        setAiAnalysis(data.analysis || '');
      } catch {
        setAiAnalysis(isEnglish ? 'Error loading AI analysis. Professional consultation is recommended.' : 'AI 분석을 불러오는 중 오류가 발생했습니다. 전문가 상담을 권장합니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const getColor = (pct: number) =>
    pct >= 75 ? 'bg-destructive' : pct >= 50 ? 'bg-orange-500' : pct >= 25 ? 'bg-yellow-500' : 'bg-green-500';
  const getLevel = (pct: number) =>
    pct >= 75 ? (isEnglish ? 'High' : '높음') : pct >= 50 ? (isEnglish ? 'Medium' : '중간') : pct >= 25 ? (isEnglish ? 'Low' : '낮음') : (isEnglish ? 'Stable' : '안정');

  const domains: DomainScore[] = result.averageScores.map(({ category, average }) => {
    const styleInfo = result.allStyles[category];
    const pct = Math.round((average / 5) * 100);
    return {
      key: category,
      label: `${styleInfo?.emoji || ''} ${styleInfo?.name || category}`,
      score: Number(average.toFixed(1)),
      maxScore: 5,
      level: getLevel(pct),
      color: getColor(pct),
    };
  });

  const severityColor = result.dominantStyle === 'secure'
    ? 'text-green-600 border-green-300'
    : result.dominantStyle === 'anxious'
    ? 'text-yellow-600 border-yellow-300'
    : result.dominantStyle === 'avoidant'
    ? 'text-primary border-primary/30'
    : 'text-destructive border-destructive/30';

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paras = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🧠', '💕', '🎯', '⚠️', '💡', '📋', '✨'];
    const titles = isEnglish
      ? ['Overview', 'Attachment Pattern Analysis', 'Relationship Strengths', 'Growth Areas', 'Development Support', 'Practice Guide', 'Expert Opinion']
      : ['종합 분석', '애착 패턴 해석', '관계 강점', '성장 영역', '발달 지원', '실천 가이드', '전문가 소견'];
    return paras.slice(0, 7).map((p, idx) => ({
      id: `s-${idx}`, icon: icons[idx] || '📋', title: titles[idx] || (isEnglish ? `Analysis ${idx + 1}` : `분석 ${idx + 1}`),
      content: p, defaultOpen: idx === 0,
    }));
  };

  const aiSections = parseAISections(aiAnalysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'AttachmentStyle_DeepAnalysis' : '애착유형_심층분석_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isLoading) return <AnalysisLoadingScreen testName={isEnglish ? "Deep Attachment Analysis" : "애착 유형 심층 분석"} />;

  return (
    <ClinicalReportLayout
      testName={isEnglish ? "Deep Attachment Style Analysis Results" : "애착 유형 심층 분석 결과"}
      subtitle={`${result.styleInfo.emoji} ${isEnglish ? 'Dominant Type' : '주요 유형'}: ${result.styleInfo.name}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={result.averageScore.toFixed(1)}
      totalLabel={isEnglish ? "Average Score" : "평균 점수"}
      scoreUnit="/ 5.0"
      scoreSeverity={result.styleInfo.name}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Deep Attachment Analysis' : '애착 유형 심층 분석',
            subtitle: isEnglish ? '4 Attachment Types' : '4가지 애착 유형 분포',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(
              result.averageScores.map(({ category, average }) => [category, (average / 5) * 7])
            ),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(
              result.averageScores.map(({ category }) => [category, result.allStyles[category]?.name || category])
            ),
            riskLevel: result.dominantStyle === 'secure' ? 'low' : result.dominantStyle === 'anxious' ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default AttachmentStyleDeepResult;
