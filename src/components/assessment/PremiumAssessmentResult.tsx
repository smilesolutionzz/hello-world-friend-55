import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Brain, MessageSquare, Target, FileText, Sparkles } from "lucide-react";
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeedbackModal from "@/components/FeedbackModal";
import EarlyScreeningSection from "@/components/assessment/EarlyScreeningSection";
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface PremiumAssessmentResultProps {
  assessmentType: string;
  results: Record<string, number>;
  assessmentInfo: any;
  onBack: () => void;
}

const PremiumAssessmentResult = ({ 
  assessmentType, 
  results, 
  assessmentInfo, 
  onBack 
}: PremiumAssessmentResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish, localePath } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => { generateAIAnalysis(); }, []);

  const generateAIAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const response = await supabase.functions.invoke('premium-assessment-analyzer', {
        body: { assessmentType, results, assessmentInfo, timestamp: new Date().toISOString() }
      });
      if (response.error) throw new Error(response.error.message);
      setAiAnalysis(response.data.analysis);
      await saveAssessmentResult(response.data.analysis);
    } catch (error: any) {
      const msg = error?.message || String(error);
      if (msg.includes('토큰') || msg.toLowerCase().includes('token')) {
        setTokenError(msg);
        setAiAnalysis('토큰 부족으로 AI 분석을 실행할 수 없습니다.');
      } else {
        setAiAnalysis('분석을 생성하는 중 오류가 발생했습니다.');
      }
      toast({ title: t.resultLayout.analysisError, description: msg, variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAssessmentResult = async (analysis: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.functions.invoke('save-test-result', {
        body: { testType: assessmentType, results, analysis, testInfo: assessmentInfo, ageGroup: 'adult' }
      });
    } catch (error) { console.error('Error saving:', error); }
  };

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const { injectPdfBrandingHeader, removePdfBrandingHeader } = await import('@/utils/pdfBrandingHeader');
      const el = document.getElementById('clinical-report-content');
      if (!el) return;
      injectPdfBrandingHeader(el);
      await html2pdf().set({
        margin: [15, 15, 15, 15],
        filename: `${assessmentInfo.title}_분석결과_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(el).save();
      removePdfBrandingHeader(el);
      toast({ title: "PDF 다운로드 완료" });
    } catch (error) {
      toast({ title: "PDF 생성 오류", variant: "destructive" });
    }
  };

  // ── Score interpretation ──
  const getScoreInterpretation = (score: number, category: string) => {
    const cl = category.toLowerCase();
    // Burnout: higher = worse for some, lower = worse for others
    if (['emotional_exhaustion', 'depersonalization', 'work_overload', 'interpersonal_conflict', 'role_ambiguity'].includes(cl)) {
      if (score >= 5.0) return { level: '높음', color: 'bg-destructive' };
      if (score >= 3.5) return { level: '보통', color: 'bg-yellow-500' };
      return { level: '낮음', color: 'bg-green-500' };
    }
    if (['personal_accomplishment', 'work_life_balance', 'job_satisfaction', 'career_development', 'organizational_support'].includes(cl)) {
      if (score >= 5.0) return { level: '우수', color: 'bg-green-500' };
      if (score >= 3.5) return { level: '보통', color: 'bg-yellow-500' };
      return { level: '낮음', color: 'bg-destructive' };
    }
    // Default 7-point
    if (score >= 5.5) return { level: '매우 높음', color: 'bg-destructive' };
    if (score >= 4.5) return { level: '높음', color: 'bg-orange-500' };
    if (score >= 3.5) return { level: '보통', color: 'bg-yellow-500' };
    if (score >= 2.5) return { level: '다소 낮음', color: 'bg-green-500' };
    return { level: '낮음', color: 'bg-primary' };
  };

  const translateCategory = (category: string) => {
    const t: Record<string, string> = {
      novelty_seeking: '자극추구', harm_avoidance: '위험회피', reward_dependence: '사회적 민감성',
      persistence: '인내력', self_directedness: '자율성', cooperativeness: '협조성', self_transcendence: '자기초월',
      extraversion: '외향성', agreeableness: '친화성', conscientiousness: '성실성', neuroticism: '신경성', openness: '개방성',
      emotional_exhaustion: '감정소진', depersonalization: '비인격화', personal_accomplishment: '성취감',
      work_life_balance: '일-삶 균형', job_satisfaction: '직무만족', work_overload: '업무과부하',
      interpersonal_conflict: '대인갈등', role_ambiguity: '역할모호성', career_development: '경력개발',
      organizational_support: '조직지원', attention: '주의집중', hyperactivity: '과잉행동', impulsivity: '충동성',
      inattention: '부주의', executive_function: '실행기능', working_memory: '작업기억',
      social_communication: '사회적 의사소통', repetitive_behaviors: '반복행동', sensory_processing: '감각처리',
      social_energy: '사회적 에너지', decision_making: '의사결정', emotional_regulation: '감정조절',
      adaptability: '적응성', stress_tolerance: '스트레스 내성', cognitive_flexibility: '인지유연성',
      achievement_motivation: '성취동기', interpersonal_skills: '대인관계', self_confidence: '자신감',
      emotional_intelligence: '감정지능', anxiety: '불안', depression: '우울', resilience: '회복력',
      self_esteem: '자존감', financial_anxiety: '재정 불안', spending_habits: '소비 습관',
      investment_attitude: '투자 성향', money_values: '금전 가치관', passionate_romantic: '열정적 로맨티스트',
      stable_companion: '안정적 동반자', independent_individualist: '독립적 개인주의자', realistic_planner: '계획적 현실주의자',
    };
    return t[category.toLowerCase()] || category.replace(/_/g, ' ');
  };

  const averageScore = Object.values(results).reduce((sum, s) => sum + s, 0) / Object.keys(results).length;

  // Build domains
  const domains: DomainScore[] = Object.entries(results)
    .sort(([, a], [, b]) => b - a)
    .map(([key, score]) => {
      const interp = getScoreInterpretation(score, key);
      return {
        key,
        label: translateCategory(key),
        score: parseFloat(score.toFixed(1)),
        maxScore: 7,
        level: interp.level,
        color: interp.color,
      };
    });

  // Parse AI analysis into collapsible sections
  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /(?:^|\n)(?:\*\*)?(\d+\.\s*[^\n*]+|\**[^\n*]+\**)\s*\n([\s\S]*?)(?=\n(?:\*\*)?(?:\d+\.|\**[^\n*]+\**)\s*\n|$)/g;
    // Try markdown headers
    const headerRegex = /(?:^|\n)#{1,3}\s*([^\n]+)\n([\s\S]*?)(?=\n#{1,3}\s|$)/g;
    let match;
    let idx = 0;
    while ((match = headerRegex.exec(text)) !== null) {
      const title = match[1].replace(/\*\*/g, '').replace(/^[^\w가-힣]*/, '').trim();
      const content = match[2].replace(/\*\*/g, '').trim();
      if (content.length > 20) {
        const emojiMatch = match[1].match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        sections.push({
          id: `s-${idx}`,
          icon: emojiMatch ? emojiMatch[0] : ['📌', '🔍', '✨', '💡', '🎯', '💝'][idx % 6],
          title,
          content,
          defaultOpen: idx === 0,
        });
        idx++;
      }
    }
    return sections;
  };

  const aiSections = parseAISections(aiAnalysis);

  // Loading state
  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={assessmentInfo.title} estimatedSeconds={25} />;
  }

  const overallLevel = averageScore >= 5 ? '매우 높음' : averageScore >= 4 ? '높음' : averageScore >= 3 ? '보통' : '낮음';
  const severityColor = averageScore >= 5 ? 'text-destructive border-destructive/30' : averageScore >= 4 ? 'text-orange-600 border-orange-300' : averageScore >= 3 ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  return (
    <>
      <ClinicalReportLayout
        testName={assessmentInfo.title}
        subtitle={assessmentInfo.subtitle}
        onBack={onBack}
        onDownload={handleDownloadPDF}
        totalScore={averageScore.toFixed(1)}
        totalLabel="평균 점수"
        scoreUnit="/ 7.0"
        scoreSeverity={overallLevel}
        severityColor={severityColor}
        domains={domains}
        aiAnalysis={aiAnalysis}
        aiSections={aiSections.length > 0 ? aiSections : undefined}
      >
        {/* Token error */}
        {tokenError && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/80 p-3 mb-4">
            <p className="text-xs text-yellow-800 mb-2">⚠️ {tokenError}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => navigate(localePath('/token-subscription'))} className="text-xs bg-yellow-500 text-white h-7">
                토큰 충전
              </Button>
              <Button size="sm" variant="outline" onClick={generateAIAnalysis} className="text-xs h-7">
                다시 시도
              </Button>
            </div>
          </div>
        )}

        {/* Early Screening */}
        <EarlyScreeningSection assessmentType={assessmentType} results={results} isAnalyzing={isAnalyzing} />

        {/* Visual Result Card */}
        <div className="my-4">
          <VisualResultInfographic
            data={{
              testName: assessmentInfo.title,
              subtitle: assessmentInfo.subtitle,
              date: new Date().toLocaleDateString('ko-KR'),
              scores: results,
              maxScore: 7,
              categoryTranslations: Object.fromEntries(
                Object.keys(results).map(k => [k.toLowerCase(), translateCategory(k)])
              ),
              aiSummary: aiAnalysis,
              actionItems: aiAnalysis
                ? aiAnalysis.match(/[-•]\s*(.{15,60})/g)?.slice(0, 3).map(s => s.replace(/^[-•]\s*/, ''))
                : undefined,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button onClick={() => setShowFeedbackModal(true)} variant="outline" size="sm" className="text-xs gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> 후기 남기기
          </Button>
          <Button onClick={() => navigate(localePath('/dashboard'))} variant="outline" size="sm" className="text-xs gap-1">
            <FileText className="w-3.5 h-3.5" /> 검사 기록
          </Button>
        </div>

        {/* IEP Generator CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground mb-1">맞춤형 IEP 생성</h4>
              <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                검사 결과 기반 AI 개별교육계획 자동 생성
              </p>
              <Button
                size="sm"
                className="text-xs h-7 bg-primary"
                onClick={() => navigate(localePath('/iep-generator'), { 
                  state: { assessmentResults: { [assessmentInfo.title]: { results, aiAnalysis } } }
                })}
              >
                IEP 생성하기
              </Button>
            </div>
          </div>
        </div>
      </ClinicalReportLayout>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        testType={assessmentInfo.title}
        onFeedbackSubmitted={() => toast({ title: "후기 작성 완료" })}
      />
    </>
  );
};

export default PremiumAssessmentResult;
