import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Heart, Shield, MessageCircle, Scale, HandHeart, Star, TrendingUp, Download, Printer, Loader2, Brain, Lightbulb, Target, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTestActions } from "@/hooks/useTestActions";
import { useWordDownload } from "@/hooks/useWordDownload";
import { Link } from "react-router-dom";
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface RelationshipDynamicsResultProps {
  results: {
    answers: Record<string, string>;
    categoryScores: Record<string, number>;
    totalScore: number;
    relationshipType: string;
    strengths: string[];
    growthAreas: string[];
  };
  onBack: () => void;
}

interface AIAnalysis {
  overallAnalysis: string;
  categoryAnalysis: string;
  psychodynamicAnalysis: string;
  strengthStrategy: string;
  growthPlan: string;
  practiceGuide: string;
  expertRecommendation: string;
  fullAnalysis: string;
}

const categoryMeta: Record<string, { icon: string; nameKo: string; nameEn: string; descKo: string; descEn: string }> = {
  trust: { icon: '🛡️', nameKo: '신뢰 형성', nameEn: 'Trust Building', descKo: '새로운 관계에서 신뢰를 구축하는 능력', descEn: 'Ability to build trust' },
  boundary: { icon: '⚖️', nameKo: '경계 설정', nameEn: 'Boundary Setting', descKo: '건강한 개인 경계 유지 능력', descEn: 'Maintaining healthy boundaries' },
  expression: { icon: '💬', nameKo: '감정 표현', nameEn: 'Emotional Expression', descKo: '감정을 적절히 소통하는 능력', descEn: 'Communicating emotions effectively' },
  conflict: { icon: '🤝', nameKo: '갈등 대처', nameEn: 'Conflict Resolution', descKo: '갈등을 건설적으로 해결하는 능력', descEn: 'Resolving conflicts constructively' },
  support: { icon: '🫶', nameKo: '지지 제공', nameEn: 'Mutual Support', descKo: '상호 도움을 주고받는 능력', descEn: 'Giving and receiving support' },
  balance: { icon: '❤️', nameKo: '독립-의존 균형', nameEn: 'Independence Balance', descKo: '자율성과 친밀감의 균형', descEn: 'Balancing autonomy and intimacy' },
};

export default function RelationshipDynamicsResult({ results, onBack }: RelationshipDynamicsResultProps) {
  const { categoryScores, totalScore, relationshipType, strengths, growthAreas } = results;
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { saveTestResult, isSaving } = useTestActions();
  const { generateWordDocument } = useWordDownload();
  const { isEnglish } = useLanguage();

  useEffect(() => { fetchAIAnalysis(); }, []);

  const fetchAIAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const { data, error } = await supabase.functions.invoke('relationship-dynamics-analyzer', {
        body: { totalScore, relationshipType, categoryScores, strengths, growthAreas }
      });
      if (error) throw error;
      if (data?.analysis) setAiAnalysis(data.analysis);
    } catch (error: any) {
      console.error('AI analysis error:', error);
      setAnalysisError(isEnglish ? 'AI analysis error.' : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSave = async () => {
    await saveTestResult({
      testType: isEnglish ? 'Relationship Dynamics' : '관계 역동성 심층 분석',
      total: totalScore, average: totalScore, severity: relationshipType,
      answers: results.answers, scores: categoryScores,
      analysis: aiAnalysis?.fullAnalysis, recommendations: [aiAnalysis?.practiceGuide || '']
    });
  };

  const handleDownload = () => {
    if (!aiAnalysis) return;
    generateWordDocument({
      title: isEnglish ? 'Relationship Dynamics Report' : '관계 역동성 심층 분석 결과',
      date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
      sections: [
        { title: '검사 개요', content: `관계 유형: ${relationshipType}\n종합 점수: ${totalScore}점` },
        { title: '종합 심리 분석', content: aiAnalysis.overallAnalysis },
        { title: '영역별 심층 해석', content: aiAnalysis.categoryAnalysis },
        { title: '심리역동 분석', content: aiAnalysis.psychodynamicAnalysis },
        { title: '강점 기반 성장 전략', content: aiAnalysis.strengthStrategy },
        { title: '성장 영역 개선 방안', content: aiAnalysis.growthPlan },
        { title: '관계 향상 실천 가이드', content: aiAnalysis.practiceGuide },
        { title: '전문가 권고사항', content: aiAnalysis.expertRecommendation },
      ]
    });
  };

  // Loading state - full screen
  if (isLoadingAnalysis) {
    return <AnalysisLoadingScreen testName={isEnglish ? "Relationship Dynamics" : "관계 역동성 분석"} estimatedSeconds={30} />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-primary';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const getLevel = (score: number) => {
    if (score >= 75) return isEnglish ? 'Strong' : '우수';
    if (score >= 50) return isEnglish ? 'Good' : '양호';
    if (score >= 25) return isEnglish ? 'Moderate' : '보통';
    return isEnglish ? 'Needs Growth' : '성장 필요';
  };

  const domains: DomainScore[] = Object.entries(categoryScores).map(([key, score]) => ({
    key,
    label: isEnglish ? (categoryMeta[key]?.nameEn || key) : (categoryMeta[key]?.nameKo || key),
    score,
    maxScore: 100,
    level: getLevel(score),
    color: getScoreColor(score),
  }));

  const severityColor = totalScore >= 75 ? 'text-green-600 border-green-300' : totalScore >= 50 ? 'text-primary border-primary/30' : totalScore >= 25 ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const aiSections: ReportSection[] = aiAnalysis ? [
    { id: 'overall', icon: '🧠', title: isEnglish ? 'Comprehensive Analysis' : '종합 심리 분석', content: aiAnalysis.overallAnalysis, defaultOpen: true },
    { id: 'category', icon: '📊', title: isEnglish ? 'Domain Analysis' : '영역별 심층 해석', content: aiAnalysis.categoryAnalysis },
    { id: 'psychodynamic', icon: '💜', title: isEnglish ? 'Psychodynamic Analysis' : '심리역동 분석', content: aiAnalysis.psychodynamicAnalysis },
    { id: 'strength', icon: '⭐', title: isEnglish ? 'Strength Strategy' : '강점 기반 성장 전략', content: aiAnalysis.strengthStrategy },
    { id: 'growth', icon: '🌱', title: isEnglish ? 'Growth Plan' : '성장 영역 개선 방안', content: aiAnalysis.growthPlan },
    { id: 'practice', icon: '📋', title: isEnglish ? 'Practice Guide' : '관계 향상 실천 가이드', content: aiAnalysis.practiceGuide },
    { id: 'expert', icon: '👨‍⚕️', title: isEnglish ? 'Expert Recommendation' : '전문가 권고사항', content: aiAnalysis.expertRecommendation },
  ].filter(s => s.content && s.content.trim().length > 0) : [];

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Relationship Dynamics Analysis' : '관계 역동성 심층 분석'}
      subtitle={`${isEnglish ? '35 items · 6 domains · Type:' : '35문항 · 6개 영역 · 유형:'} ${relationshipType}`}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={totalScore}
      totalLabel={isEnglish ? 'Relationship Health' : '관계 건강도'}
      scoreUnit={isEnglish ? '/ 100' : '/ 100'}
      scoreSeverity={relationshipType}
      severityColor={severityColor}
      domains={domains}
      aiSections={aiSections}
      aiAnalysis={aiAnalysis?.fullAnalysis}
    >
      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl border border-green-200 bg-green-50/50 p-3">
          <h3 className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5" /> {isEnglish ? 'Strengths' : '강점 영역'}
          </h3>
          <div className="space-y-1.5">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-green-500 text-xs mt-0.5">✓</span>
                <span className="text-[11px] text-green-800 leading-tight">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3">
          <h3 className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {isEnglish ? 'Growth' : '성장 영역'}
          </h3>
          <div className="space-y-1.5">
            {growthAreas.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-amber-500 text-xs mt-0.5">!</span>
                <span className="text-[11px] text-amber-800 leading-tight">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Result Card */}
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Relationship Dynamics' : '관계 역동성 분석',
            subtitle: relationshipType,
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(
              Object.entries(categoryScores).map(([k, v]) => [k, v / 10])
            ),
            maxScore: 10,
            categoryTranslations: Object.fromEntries(
              Object.entries(categoryMeta).map(([k, v]) => [k, isEnglish ? v.nameEn : v.nameKo])
            ),
            aiSummary: aiAnalysis?.fullAnalysis,
            riskLevel: totalScore >= 75 ? 'low' : totalScore >= 50 ? 'moderate' : 'high',
            actionItems: aiAnalysis?.practiceGuide
              ? aiAnalysis.practiceGuide.split('\n').filter(l => l.trim().length > 10).slice(0, 3).map(l => l.replace(/^\d+[.)]\s*/, ''))
              : undefined,
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button onClick={handleSave} disabled={isSaving} size="sm" className="text-xs bg-primary">
          {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
          {isEnglish ? 'Save' : '결과 저장'}
        </Button>
        <Link to="/assessment" className="w-full">
          <Button variant="outline" size="sm" className="text-xs w-full">
            {isEnglish ? 'More Tests' : '다른 검사'}
          </Button>
        </Link>
      </div>
    </ClinicalReportLayout>
  );
}
