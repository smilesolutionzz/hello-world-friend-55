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
  // 연애/성격 유형 분석 검사인지 체크 (높을수록 해당 유형 성향이 강한 것)
  const isTypeAnalysis = ['love_personality', 'personality_type', 'temperament'].includes(assessmentType);
  const isDementiaRisk = assessmentType === 'dementiaRisk';

  const getScoreInterpretation = (score: number, category: string) => {
    const cl = category.toLowerCase();
    // Burnout: higher = worse for some, lower = worse for others
    if (['emotional_exhaustion', 'depersonalization', 'work_overload', 'interpersonal_conflict', 'role_ambiguity'].includes(cl)) {
      if (score >= 5.0) return { level: isEnglish ? 'High' : '높음', color: 'bg-destructive' };
      if (score >= 3.5) return { level: isEnglish ? 'Moderate' : '보통', color: 'bg-yellow-500' };
      return { level: isEnglish ? 'Low' : '낮음', color: 'bg-green-500' };
    }
    if (['personal_accomplishment', 'work_life_balance', 'job_satisfaction', 'career_development', 'organizational_support'].includes(cl)) {
      if (score >= 5.0) return { level: isEnglish ? 'Excellent' : '우수', color: 'bg-green-500' };
      if (score >= 3.5) return { level: isEnglish ? 'Moderate' : '보통', color: 'bg-yellow-500' };
      return { level: isEnglish ? 'Low' : '낮음', color: 'bg-destructive' };
    }
    // 유형 분석 검사: 높을수록 해당 유형 성향이 강함 (긍정적)
    if (isTypeAnalysis) {
      if (score >= 5.5) return { level: isEnglish ? 'Dominant' : '우세', color: 'bg-primary' };
      if (score >= 4.5) return { level: isEnglish ? 'Strong' : '높음', color: 'bg-blue-500' };
      if (score >= 3.5) return { level: isEnglish ? 'Moderate' : '보통', color: 'bg-yellow-500' };
      return { level: isEnglish ? 'Low' : '낮음', color: 'bg-muted' };
    }
    // Default 7-point (위험도 척도)
    if (score >= 5.5) return { level: isEnglish ? 'Very High' : '매우 높음', color: 'bg-destructive' };
    if (score >= 4.5) return { level: isEnglish ? 'High' : '높음', color: 'bg-orange-500' };
    if (score >= 3.5) return { level: isEnglish ? 'Moderate' : '보통', color: 'bg-yellow-500' };
    if (score >= 2.5) return { level: isEnglish ? 'Somewhat Low' : '다소 낮음', color: 'bg-green-500' };
    return { level: isEnglish ? 'Low' : '낮음', color: 'bg-primary' };
  };

  const translateCategory = (category: string) => {
    const t: Record<string, string> = {
      // 기질/성격
      novelty_seeking: '자극추구', harm_avoidance: '위험회피', reward_dependence: '사회적 민감성',
      persistence: '인내력', self_directedness: '자율성', cooperativeness: '협조성', self_transcendence: '자기초월',
      extraversion: '외향성', agreeableness: '친화성', conscientiousness: '성실성', neuroticism: '신경성', openness: '개방성',
      // 직무스트레스
      emotional_exhaustion: '감정소진', depersonalization: '비인격화', personal_accomplishment: '성취감',
      work_life_balance: '일-삶 균형', job_satisfaction: '직무만족', work_overload: '업무과부하',
      interpersonal_conflict: '대인갈등', role_ambiguity: '역할모호성', career_development: '경력개발',
      organizational_support: '조직지원',
      // ADHD
      attention: '주의집중', hyperactivity: '과잉행동', impulsivity: '충동성',
      inattention: '부주의', working_memory: '작업기억',
      executive_dysfunction: '실행기능 결핍',
      // 자폐스펙트럼
      social_communication: '사회적 의사소통', repetitive_behaviors: '반복행동', sensory_processing: '감각처리',
      restricted_repetitive: '제한적 반복행동', communication_language: '의사소통/언어',
      adaptive_functioning: '적응기능',
      // 인지/감정
      social_energy: '사회적 에너지', decision_making: '의사결정', emotional_regulation: '감정조절',
      adaptability: '적응성', stress_tolerance: '스트레스 내성', cognitive_flexibility: '인지유연성',
      achievement_motivation: '성취동기', interpersonal_skills: '대인관계', self_confidence: '자신감',
      emotional_intelligence: '감정지능', anxiety: '불안', depression: '우울', resilience: '회복력',
      self_esteem: '자존감',
      // 금전심리
      financial_anxiety: '재정 불안', spending_habits: '소비 습관',
      spending_patterns: '소비 패턴', money_mindset: '돈 마인드셋', financial_goals: '재정 목표',
      investment_attitude: '투자 성향', money_values: '금전 가치관',
      // 연애/성격 유형
      passionate_romantic: '열정적 로맨티스트', stable_companion: '안정적 동반자',
      independent_individualist: '독립적 개인주의자', realistic_planner: '계획적 현실주의자',
      // 치매 위험도
      memory_deep: '기억력', executive_function: '실행기능',
      orientation_spatial: '시공간 지남력', language_communication: '언어/의사소통',
      daily_living: '일상생활 수행', mood_personality: '정서/행동 변화',
      // 치매 간편검사
      memory: '기억력', orientation: '지남력', language: '언어능력',
      daily_function: '일상생활 기능', mood_behavior: '정서/행동',
      // 청소년
      identity_development: '정체성 발달', self_identity: '자아 정체성',
      emotional_problems: '정서 문제', behavioral_problems: '행동 문제',
      peer_relationships: '또래 관계', peer_interaction: '또래 상호작용',
      conduct_problems: '품행 문제', somatic_complaints: '신체화 증상',
      internalizing_problems: '내면화 문제', externalizing_problems: '외면화 문제',
      social_competence: '사회적 역량', social_adaptation: '사회적 적응',
      // 양육
      emotional_warmth: '정서적 온기', autonomy_support: '자율성 지원',
      structure_routine: '구조/일관성', positive_reinforcement: '긍정적 강화',
      emotional_support: '정서적 지지', responsive_care: '반응적 돌봄',
      psychological_control: '심리적 통제', overprotection: '과보호',
      // 사회성
      social_interaction: '사회적 상호작용', emotional_understanding: '감정 이해',
      conflict_resolution: '갈등 해결', leadership: '리더십',
      empathy: '공감 능력', communication: '의사소통',
      // 언어발달
      verbal_expression: '언어적 표현', language_development: '언어 발달',
      pragmatic_language: '화용언어', contextual_language: '맥락 언어',
      // 인지검사 공통
      selective_attention: '선택적 주의', sustained_attention: '지속적 주의',
      divided_attention: '분할 주의', task_switching: '과제 전환',
      problem_solving: '문제 해결', planning: '계획 수립',
      organization: '조직화', time_management: '시간 관리',
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

  // 유형 분석 검사: 최고 점수 유형을 메인 결과로 표시
  const topDomain = domains[0]; // already sorted desc
  let overallLevel: string;
  let severityColor: string;
  let totalLabel: string;

  if (isTypeAnalysis && topDomain) {
    overallLevel = topDomain.label; // e.g. "안정적 동반자"
    severityColor = 'text-primary border-primary/30';
    totalLabel = isEnglish ? 'Top Score' : '종합 평가';
  } else if (isDementiaRisk) {
    // 치매 위험도: 점수가 높을수록 위험, 명확한 위험도 등급 표시
    if (averageScore >= 5.5) {
      overallLevel = isEnglish ? '⚠️ High Risk' : '⚠️ 높은 위험';
      severityColor = 'text-destructive border-destructive/30';
    } else if (averageScore >= 4.5) {
      overallLevel = isEnglish ? '⚠️ Moderate-High Risk' : '⚠️ 중등도-높은 위험';
      severityColor = 'text-orange-600 border-orange-300';
    } else if (averageScore >= 3.5) {
      overallLevel = isEnglish ? '⚡ Moderate Risk' : '⚡ 중등도 위험';
      severityColor = 'text-yellow-600 border-yellow-300';
    } else if (averageScore >= 2.5) {
      overallLevel = isEnglish ? '✅ Low Risk' : '✅ 낮은 위험';
      severityColor = 'text-green-600 border-green-300';
    } else {
      overallLevel = isEnglish ? '✅ Very Low Risk' : '✅ 매우 낮은 위험';
      severityColor = 'text-primary border-primary/30';
    }
    totalLabel = isEnglish ? 'Dementia Risk Score' : '치매 위험도 점수';
  } else {
    overallLevel = averageScore >= 5 ? (isEnglish ? 'Very High' : '매우 높음') : averageScore >= 4 ? (isEnglish ? 'High' : '높음') : averageScore >= 3 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Low' : '낮음');
    severityColor = averageScore >= 5 ? 'text-destructive border-destructive/30' : averageScore >= 4 ? 'text-orange-600 border-orange-300' : averageScore >= 3 ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';
    totalLabel = isEnglish ? 'Average Score' : '평균 점수';
  }

  return (
    <>
      <ClinicalReportLayout
        testName={assessmentInfo.title}
        subtitle={assessmentInfo.subtitle}
        onBack={onBack}
        onDownload={handleDownloadPDF}
        totalScore={isTypeAnalysis ? topDomain?.score?.toFixed(1) || averageScore.toFixed(1) : averageScore.toFixed(1)}
        totalLabel={totalLabel}
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
              <h4 className="text-xs font-bold text-foreground mb-1">{isEnglish ? 'Custom IEP Generation' : '맞춤형 IEP 생성'}</h4>
              <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                {isEnglish ? 'AI-powered individualized education plan based on results' : '검사 결과 기반 AI 개별교육계획 자동 생성'}
              </p>
              <Button
                size="sm"
                className="text-xs h-7 bg-primary"
                onClick={() => navigate(localePath('/iep-generator'), { 
                  state: { assessmentResults: { [assessmentInfo.title]: { results, aiAnalysis } } }
                })}
              >
                {isEnglish ? 'Generate IEP' : 'IEP 생성하기'}
              </Button>
            </div>
          </div>
        </div>
      </ClinicalReportLayout>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        testType={assessmentInfo.title}
        onFeedbackSubmitted={() => toast({ title: isEnglish ? "Review submitted" : "후기 작성 완료" })}
      />
    </>
  );
};

export default PremiumAssessmentResult;
