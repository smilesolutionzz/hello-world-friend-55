import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Download, Brain, TrendingUp, FileText, Sparkles, Calendar, Target, MessageSquare, BarChart3, Wallet, Lock, Star, ImageIcon } from "lucide-react";
import VisualResultInfographic from './VisualResultInfographic';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeedbackModal from "@/components/FeedbackModal";
import EarlyScreeningSection from "@/components/assessment/EarlyScreeningSection";
import { EnhancedChart } from "@/components/ui/enhanced-chart";
import { PDFHeader } from '@/components/common/PDFHeader';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n/LanguageContext';

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
  const { isEnglish, localePath } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    generateAIAnalysis();
    loadReviews();
  }, []);

  const generateAIAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      // 결과 데이터 구조 검증
      console.log('[PremiumAssessment] AI 분석 요청 데이터:', {
        assessmentType,
        results,
        assessmentInfo,
        resultKeys: Object.keys(results),
        resultValues: Object.values(results),
        timestamp: new Date().toISOString()
      });
      
      const response = await supabase.functions.invoke('premium-assessment-analyzer', {
        body: {
          assessmentType,
          results, // 점수 데이터 전달
          assessmentInfo,
          timestamp: new Date().toISOString()
        }
      });

      if (response.error) {
        console.error('AI Analysis Error:', response.error);
        throw new Error(response.error.message);
      }

      setAiAnalysis(response.data.analysis);
      
      // 결과를 데이터베이스에 저장
      await saveAssessmentResult(response.data.analysis);
      
    } catch (error: any) {
      console.error('Error generating AI analysis:', error);
      const msg = error?.message || String(error);
      if (msg.includes('토큰') || msg.toLowerCase().includes('token')) {
        setTokenError(msg);
        setAiAnalysis('토큰 부족으로 AI 분석을 실행할 수 없습니다. 토큰을 충전한 후 다시 시도해 주세요.');
      } else {
        setAiAnalysis('분석을 생성하는 중 오류가 발생했습니다. 기본 해석을 제공합니다.');
      }
      toast({
        title: '분석 오류',
        description: msg,
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAssessmentResult = async (analysis: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 검사 결과를 test_results 테이블에 저장
      const { error } = await supabase.functions.invoke('save-test-result', {
        body: {
          testType: assessmentType,
          results: results,
          analysis: analysis,
          testInfo: assessmentInfo,
          ageGroup: 'adult' // 프리미엄 검사는 성인 대상
        }
      });

      if (error) {
        console.error('Error saving test result:', error);
        throw error;
      }

      console.log('Assessment result saved to database');
    } catch (error) {
      console.error('Error saving assessment result:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const { data } = await supabase
        .from('user_feedback')
        .select('rating, message, emoji, created_at')
        .eq('test_type', assessmentInfo.title)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setReviews(data);
    } catch (err) {
      console.error('리뷰 로드 오류:', err);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const resultsTable = Object.entries(results)
        .map(([key, value]) => {
          const interpretation = getScoreInterpretation(value, key);
          return `<tr><td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#374151;">${translateCategory(key)}</td><td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;color:#3b82f6;font-weight:600;">${value.toFixed(1)} / 7.0 (${interpretation.level})</td></tr>`;
        }).join('');

      const convertMd = (text: string) => text
        .replace(/\*\*([^\*]+)\*\*/g, '<strong style="color:#1e40af;">$1</strong>')
        .replace(/^-\s+(.+)$/gm, '<div style="margin:5px 0;padding-left:20px;">• $1</div>')
        .replace(/\n\n/g, '</p><p style="margin:10px 0;line-height:1.6;">')
        .replace(/\n/g, '<br>');

      const reportHtml = `
        <div style="font-family:system-ui,-apple-system,sans-serif;padding:30px;max-width:800px;margin:0 auto;background:white;">
          <div style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #7c3aed;">
            <div style="font-size:28px;font-weight:bold;color:#7c3aed;">AIHPRO.COM</div>
            <div style="font-size:13px;color:#6b7280;margin-top:8px;">AIH 프리미엄 심리검사</div>
          </div>
          <h1 style="margin:0 0 10px;color:#1e40af;text-align:center;font-size:22px;">${assessmentInfo.title} 분석 결과</h1>
          <p style="color:#6b7280;margin:0 0 10px;text-align:center;font-size:14px;">${assessmentInfo.subtitle || ''}</p>
          <p style="color:#6b7280;margin:0 0 30px;text-align:center;font-size:13px;">${new Date().toLocaleString('ko-KR')}</p>
          <div style="background:#f5f3ff;padding:20px;border-radius:12px;margin-bottom:24px;text-align:center;">
            <div style="font-size:14px;color:#6b7280;">평균 점수</div>
            <div style="font-size:36px;font-weight:bold;color:#7c3aed;">${averageScore.toFixed(1)} / 7.0</div>
          </div>
          <div style="background:#f8fafc;padding:24px;border-radius:12px;margin-bottom:24px;">
            <h3 style="color:#1e40af;margin-top:0;margin-bottom:16px;">영역별 점수</h3>
            <table style="width:100%;border-collapse:collapse;">${resultsTable}</table>
          </div>
          ${aiAnalysis ? `<div style="background:white;padding:24px;border-radius:12px;border:2px solid #e2e8f0;margin-top:24px;">
            <h3 style="color:#1e40af;margin-top:0;margin-bottom:16px;">AI 전문 분석</h3>
            <div style="line-height:1.8;color:#374151;"><p style="margin:10px 0;line-height:1.6;">${convertMd(aiAnalysis)}</p></div>
          </div>` : ''}
          <div style="margin-top:40px;padding:20px;border-top:2px solid #e2e8f0;text-align:center;font-size:12px;color:#6b7280;">
            <p style="margin:5px 0;">본 리포트는 참고용이며 의학적 진단이 아닙니다.</p>
            <p style="margin-top:15px;color:#9ca3af;font-size:11px;">© AIHPRO.COM</p>
          </div>
        </div>`;

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '0';
      container.style.width = '794px';
      container.style.backgroundColor = '#ffffff';
      container.innerHTML = reportHtml;
      document.body.appendChild(container);

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin: [15, 15, 15, 15],
        filename: `${assessmentInfo.title}_분석결과_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff', windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(container.firstElementChild as HTMLElement).save();

      document.body.removeChild(container);

      toast({
        title: "PDF 다운로드 완료",
        description: "프리미엄 분석 보고서가 성공적으로 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      toast({
        title: "PDF 생성 오류",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      // 기질 영역
      'novelty_seeking': '새로운 자극과 경험을 추구하는 성향입니다. 호기심이 많고 탐험적이며 변화를 즐깁니다.',
      'harm_avoidance': '위험을 회피하고 안전을 추구하는 성향입니다. 신중하고 조심스러우며 불확실성을 불편해합니다.',
      'reward_dependence': '타인의 인정과 사회적 관계에 민감한 성향입니다. 공감능력이 높고 타인과의 유대를 중요시합니다.',
      'persistence': '어려움에도 불구하고 목표를 향해 꾸준히 노력하는 성향입니다. 끈기있고 인내심이 강합니다.',
      'self_directedness': '스스로 목표를 세우고 행동을 조절하는 능력입니다. 자율성과 책임감이 높습니다.',
      'cooperativeness': '타인과 협력하고 배려하는 성향입니다. 사회적으로 조화를 이루며 공동체 의식이 강합니다.',
      'self_transcendence': '영적이고 초월적인 가치를 추구하는 성향입니다. 직관적이고 창의적인 사고를 합니다.',
    };
    return descriptions[category.toLowerCase()] || '';
  };

  const getScoreInterpretation = (score: number, category: string) => {
    const categoryLower = category.toLowerCase();
    
    // 번아웃 검사 - 각 영역별로 다른 해석 기준 적용
    if (categoryLower === 'emotional_exhaustion') {
      // 감정소진: 높을수록 나쁨
      if (score >= 5.0) return { level: "높음", color: "bg-orange-500", description: "이 특성이 평균보다 강하게 나타나며, 행동 패턴에 영향을 줍니다" };
      if (score >= 3.5) return { level: "보통", color: "bg-yellow-500", description: "일반적인 수준으로, 적절한 균형을 보입니다" };
      if (score >= 2.0) return { level: "다소 낮음", color: "bg-green-500", description: "이 특성이 평균보다 약하게 나타납니다" };
      return { level: "낮음", color: "bg-blue-500", description: "이 특성이 거의 나타나지 않습니다" };
    }
    
    if (categoryLower === 'depersonalization') {
      // 비인격화: 높을수록 나쁨
      if (score >= 4.0) return { level: "높음", color: "bg-orange-500", description: "이 특성이 평균보다 강하게 나타나며, 행동 패턴에 영향을 줍니다" };
      if (score >= 2.5) return { level: "보통", color: "bg-yellow-500", description: "일반적인 수준으로, 적절한 균형을 보입니다" };
      if (score >= 1.5) return { level: "다소 낮음", color: "bg-green-500", description: "이 특성이 평균보다 약하게 나타납니다" };
      return { level: "낮음", color: "bg-blue-500", description: "이 특성이 거의 나타나지 않아 우수합니다" };
    }
    
    if (categoryLower === 'personal_accomplishment') {
      // 성취감: 낮을수록 나쁨 (역채점)
      if (score >= 5.0) return { level: "매우 높음", color: "bg-blue-500", description: "성취감이 매우 높아 직무 만족도가 우수합니다" };
      if (score >= 4.0) return { level: "다소 낮음", color: "bg-green-500", description: "적절한 성취감을 느끼고 있습니다" };
      if (score >= 3.0) return { level: "보통", color: "bg-yellow-500", description: "성취감이 보통 수준입니다" };
      if (score >= 2.0) return { level: "낮음", color: "bg-orange-500", description: "성취감이 부족하여 관심이 필요합니다" };
      return { level: "매우 낮음", color: "bg-red-500", description: "성취감이 매우 낮아 주의가 필요합니다" };
    }
    
    if (categoryLower === 'work_life_balance') {
      // 일-삶 균형: 낮을수록 나쁨
      if (score >= 5.0) return { level: "우수", color: "bg-blue-500", description: "일과 삶의 균형이 매우 잘 이루어지고 있습니다" };
      if (score >= 4.0) return { level: "양호", color: "bg-green-500", description: "일과 삶의 균형이 적절히 유지되고 있습니다" };
      if (score >= 3.0) return { level: "보통", color: "bg-yellow-500", description: "일반적인 수준의 균형을 보입니다" };
      if (score >= 2.0) return { level: "낮음", color: "bg-orange-500", description: "균형 개선이 필요합니다" };
      return { level: "매우 낮음", color: "bg-red-500", description: "균형이 매우 부족하여 주의가 필요합니다" };
    }
    
    // 기타 직장 스트레스 관련 요인들 (높을수록 나쁨)
    if (['work_overload', 'interpersonal_conflict', 'role_ambiguity'].includes(categoryLower)) {
      if (score >= 5.0) return { level: "높음", color: "bg-red-500", description: "관심이 필요합니다" };
      if (score >= 4.0) return { level: "보통", color: "bg-orange-500", description: "적절한 관리가 필요합니다" };
      if (score >= 3.0) return { level: "다소 낮음", color: "bg-yellow-500", description: "일반적인 수준입니다" };
      if (score >= 2.0) return { level: "낮음", color: "bg-green-500", description: "양호한 상태입니다" };
      return { level: "매우 낮음", color: "bg-blue-500", description: "우수한 상태입니다" };
    }
    
    // 긍정적 요인들 (높을수록 좋음)
    if (['job_satisfaction', 'career_development', 'organizational_support'].includes(categoryLower)) {
      if (score >= 5.5) return { level: "매우 높음", color: "bg-blue-500", description: "매우 우수한 상태입니다" };
      if (score >= 4.5) return { level: "높음", color: "bg-green-500", description: "양호한 상태입니다" };
      if (score >= 3.5) return { level: "보통", color: "bg-yellow-500", description: "일반적인 수준입니다" };
      if (score >= 2.5) return { level: "낮음", color: "bg-orange-500", description: "개선이 필요합니다" };
      return { level: "매우 낮음", color: "bg-red-500", description: "관심이 필요합니다" };
    }
    
    // 기본 7점 척도 해석 (일반적인 경우)
    if (score >= 5.5) return { level: "매우 높음", color: "bg-red-500", description: "이 특성이 매우 강하게 나타나며, 일상생활에서 두드러진 영향을 미칩니다" };
    if (score >= 4.5) return { level: "높음", color: "bg-orange-500", description: "이 특성이 평균보다 강하게 나타나며, 행동 패턴에 영향을 줍니다" };
    if (score >= 3.5) return { level: "보통", color: "bg-yellow-500", description: "일반적인 수준으로, 적절한 균형을 보입니다" };
    if (score >= 2.5) return { level: "다소 낮음", color: "bg-green-500", description: "이 특성이 평균보다 약하게 나타납니다" };
    return { level: "낮음", color: "bg-blue-500", description: "이 특성이 거의 나타나지 않습니다" };
  };

  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      // 기질 요인 (간소화된 한글명)
      'novelty_seeking': '자극추구',
      'harm_avoidance': '위험회피', 
      'reward_dependence': '사회적 민감성',
      'persistence': '인내력',
      'self_directedness': '자율성',
      'cooperativeness': '협조성',
      'self_transcendence': '자기초월',
      
      // Big Five 요인  
      'extraversion': '외향성',
      'agreeableness': '친화성',
      'conscientiousness': '성실성',
      'neuroticism': '신경성',
      'openness': '개방성',
      
      // 번아웃/직장 스트레스 요인
      'emotional_exhaustion': '감정소진',
      'depersonalization': '비인격화',
      'personal_accomplishment': '성취감',
      'work_life_balance': '일-삶 균형',
      'job_satisfaction': '직무만족',
      'work_overload': '업무과부하',
      'interpersonal_conflict': '대인갈등',
      'role_ambiguity': '역할모호성',
      'career_development': '경력개발',
      'organizational_support': '조직지원',
      
      // ADHD 관련 요인
      'attention': '주의집중',
      'hyperactivity': '과잉행동',
      'impulsivity': '충동성',
      'inattention': '부주의',
      'executive': '실행기능',
      'executive_function': '실행기능',
      'working_memory': '작업기억',
      'language': '언어능력',
      
      // 발달 관련 요인
      'language_development': '언어발달',
      'social_development': '사회성 발달',
      'motor_development': '운동발달',
      'cognitive_development': '인지발달',
      'emotional_development': '정서발달',
      
      // 자폐스펙트럼 관련 요인
      'social_communication': '사회적 의사소통',
      'repetitive_behaviors': '반복행동',
      'sensory_processing': '감각처리',
      'restricted_interests': '제한된 관심',
      
      // 양육 스타일 관련
      'authoritative': '민주적 양육',
      'authoritarian': '권위적 양육',
      'permissive': '허용적 양육',
      'neglectful': '방임적 양육',
      'warmth': '온정',
      'control': '통제',
      
      // 기타 심리학적 영역
      'social_energy': '사회적 에너지',
      'decision_making': '의사결정',
      'emotional_regulation': '감정조절',
      'adaptability': '적응성',
      'stress_tolerance': '스트레스 내성',
      'cognitive_flexibility': '인지유연성',
      'achievement_motivation': '성취동기',
      'interpersonal_skills': '대인관계',
      'self_confidence': '자신감',
      'emotional_intelligence': '감정지능',
      'anxiety': '불안',
      'depression': '우울',
      'mood_regulation': '기분조절',
      'social_anxiety': '사회불안',
      'perfectionism': '완벽주의',
      'self_esteem': '자존감',
      'resilience': '회복력',
      'coping_strategies': '대처전략',
      'communication_skills': '의사소통',
      'problem_solving': '문제해결',
      'time_management': '시간관리',
      'organization': '조직화',
      'planning': '계획수립',
      'task_completion': '과제완성',
      'focus': '집중력',
      'memory': '기억력',
      'processing_speed': '처리속도',
      'verbal_comprehension': '언어이해',
      'perceptual_reasoning': '지각추론',
      
      // 이미지에서 보이는 추가 영역들
      'detail_focus': '세부 집중',
      'logical_approach': '논리적 접근',
      'structured_living': '구조적 생활',
      
      // 연애성격분석테스트 요인
      'passionate_romantic': '열정적 로맨티스트',
      'stable_companion': '안정적 동반자',
      'independent_individualist': '독립적 개인주의자',
      'realistic_planner': '계획적 현실주의자',
      
      // 재정심리 요인
      'financial_anxiety': '재정 불안',
      'spending_habits': '소비 습관',
      'investment_attitude': '투자 성향',
      'money_values': '금전 가치관',
      'financial_planning': '재정 계획',
      'money_mindset': '금전 태도',
      'spending_patterns': '소비 패턴',
      'financial_goals': '재정 목표',
      
      // 청소년 정신건강 요인
      'identity_formation': '정체성 형성',
      'peer_relationships': '또래관계',
      'academic_stress': '학업스트레스',
      'family_relationships': '가족관계',
      'future_anxiety': '미래불안',
      'emotional_problems': '정서적 문제',
      'behavioral_problems': '행동적 문제',
      'social_adaptation': '사회적 적응',
      'identity_development': '정체성 발달',
      'internalizing_problems': '내재화 문제',
      'externalizing_problems': '외현화 문제',
      'attention_problems': '주의력 문제',
      'social_competence': '사회적 역량',
      
      // 사회성 발달 선별검사 요인
      'social_interaction': '사회적 상호작용',
      'communication': '의사소통',
      'behavioral_patterns': '행동 패턴',
      'sensory_responses': '감각 반응',
      
      // 부모양육태도 요인
      'warmth_acceptance': '온정수용',
      'behavioral_control': '행동통제',
      'psychological_control': '심리통제',
      'autonomy_support': '자율성지지',
      'communication_support': '의사소통지지',
      
      // 직업 관련 요인
      'career_interest': '진로관심',
      'work_values': '직업가치관',
      'job_skills': '직무능력',
      'leadership': '리더십',
      'teamwork': '팀워크',
      
      // 사회성 및 관계 요인
      'relationship_skills': '관계기술',
      'empathy': '공감능력',
      'assertiveness': '자기주장',
      'conflict_resolution': '갈등해결'
    };
    return translations[category.toLowerCase()] || category.replace(/_/g, ' ');
  };

  const totalScore = Object.values(results).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / Object.keys(results).length;
  
  console.log('프리미엄 검사 결과 분석:', {
    assessmentType,
    results,
    totalScore,
    averageScore,
    resultKeys: Object.keys(results),
    resultValues: Object.values(results)
  });

  // 차트 데이터 준비
  const chartData = Object.entries(results).map(([category, score]) => {
    const interpretation = getScoreInterpretation(score, category);
    return {
      name: translateCategory(category),
      value: score,
      color: interpretation.color.replace('bg-', '').replace('-500', ''),
      description: interpretation.description,
      level: interpretation.level, // 레벨 정보 추가
      maxValue: 7 // 최대값 정보 추가
    };
  });

  return (
    <div id="premium-result-content" className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 relative overflow-hidden">
      {/* PDF Header */}
      <div className="relative z-10">
        <PDFHeader testName={assessmentInfo.title} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                프리미엄 분석 결과
              </h1>
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-lg text-muted-foreground">
              {assessmentInfo.title} • AI 심층 분석 완료
            </p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Overall Score Card */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="overflow-hidden hover-glow border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{assessmentInfo.title}</CardTitle>
                  <p className="text-purple-100 mt-1">{assessmentInfo.subtitle}</p>
                </div>
                <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <div className="text-xs text-purple-100 mb-1">내 평균 점수</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{averageScore.toFixed(1)}</span>
                    <span className="text-xl text-purple-100">/ 7.0</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    시각화 차트 분석
                  </h3>
                  <EnhancedChart 
                    data={chartData}
                    title="영역별 점수 분포"
                    description="각 영역의 상대적 강도를 한눈에 확인하세요"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    영역별 상세 점수
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(results).map(([category, score]) => {
                      const interpretation = getScoreInterpretation(score, category);
                      const categoryDesc = getCategoryDescription(category);
                      return (
                        <div key={category} className="space-y-2 p-3 bg-card/50 rounded-lg border border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {translateCategory(category)}
                            </span>
                            <Badge variant="outline" className={`${interpretation.color} text-white text-xs`}>
                              {interpretation.level}
                            </Badge>
                          </div>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-xs text-muted-foreground">내 점수:</span>
                            <span className="text-xl font-bold text-primary">{score.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">/ 7.0</span>
                          </div>
                          <Progress value={(score / 7) * 100} className="h-2" />
                          {categoryDesc && (
                            <p className="text-xs text-foreground/70 leading-relaxed">{categoryDesc}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-medium">{interpretation.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    검사 정보
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">검사일:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="font-medium">문항 수:</span> {assessmentInfo.questions_count}개</p>
                    <p><span className="font-medium">소요 시간:</span> {assessmentInfo.duration}</p>
                    <p><span className="font-medium">검사 유형:</span> 프리미엄 전문 검사</p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ※ {assessmentInfo.disclaimer}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="overflow-hidden hover-glow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AIH 전문 분석 보고서</h2>
                  <p className="text-sm text-muted-foreground">AI 기반 전문가 수준 해석 + 조기 위험요소 체크</p>
                </div>
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {tokenError && (
                <div className="mb-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <p className="text-sm text-yellow-800 mb-3">⚠️ {tokenError}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => navigate(localePath('/token-subscription'))} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      {isEnglish ? 'Top Up Tokens' : '토큰 충전하기'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={generateAIAnalysis} disabled={isAnalyzing}>
                      {isEnglish ? 'Retry' : '다시 시도'}
                    </Button>
                  </div>
                </div>
              )}
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">AI가 심층 분석 중입니다...</p>
                    <p className="text-sm text-muted-foreground">조기 위험요소 체크 포함</p>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {aiAnalysis || "분석을 생성하는 중 오류가 발생했습니다."}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AIH 조기선별 섹션 */}
        <EarlyScreeningSection
          assessmentType={assessmentType}
          results={results}
          isAnalyzing={isAnalyzing}
        />

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              onClick={handleDownloadPDF}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              size="lg"
            >
              <Download className="w-4 h-4" />
              PDF 다운로드
            </Button>

            <Button
              onClick={() => setShowFeedbackModal(true)}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <MessageSquare className="w-5 h-5" />
              {isEnglish ? 'Leave Review' : '후기 남기기'}
            </Button>

            <Button
              onClick={() => { onBack(); }}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              {isEnglish ? 'Other Tests' : '다른 검사 하기'}
            </Button>

            <Button
              onClick={() => navigate(localePath('/dashboard'))}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {isEnglish ? 'Test History' : '검사 기록 보기'}
            </Button>
          </div>
        </div>

        {/* 비주얼 결과 카드 */}
        {!isAnalyzing && (
          <div className="max-w-6xl mx-auto mt-8">
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
        )}


        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => { setShowFeedbackModal(false); loadReviews(); }}
          testType={assessmentInfo.title}
          onFeedbackSubmitted={() => {
            toast({
              title: "후기 작성 완료",
              description: "소중한 후기가 다른 이용자들에게 도움이 될 것입니다!",
            });
            loadReviews();
          }}
        />

        {/* 이용자 후기 섹션 */}
        {reviews.length > 0 && (
          <div className="max-w-6xl mx-auto mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  이용자 후기
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                      <span className="text-2xl shrink-0">{review.emoji || '😊'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{review.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* IEP 생성 섹션 */}
        <div className="max-w-6xl mx-auto mt-8">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-2">{isEnglish ? 'Custom IEP Generation' : '맞춤형 개별교육계획(IEP) 생성'}</h4>
                  <p className="text-purple-800 text-sm mb-4">
                    {isEnglish 
                      ? `Based on ${assessmentInfo.title} results, AI will automatically generate a personalized education and development support plan.`
                      : `${assessmentInfo.title} 결과를 바탕으로 AI가 개별화된 교육 및 발달 지원 계획을 자동으로 생성해드립니다.`}
                  </p>
                  <Button
                    onClick={() => navigate(localePath('/iep-generator'), { 
                      state: { 
                        assessmentResults: {
                          [assessmentInfo.title]: { results, aiAnalysis }
                        } 
                      }
                    })}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isEnglish ? 'Generate Custom IEP' : '맞춤형 IEP 생성하기'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Notice */}
        <div className="max-w-6xl mx-auto mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold text-blue-900 mb-2">{isEnglish ? 'Professional Assessment Notice' : '전문 심리검사 결과 안내'}</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                {isEnglish 
                  ? 'These results are reference materials provided through AI-based in-depth analysis. For accurate diagnosis or treatment, please consult a professional. Results reflect your current state and may change over time.'
                  : '본 검사 결과는 AI 기반 심층 분석을 통해 제공되는 참고 자료입니다. 정확한 진단이나 치료가 필요한 경우 반드시 전문가와 상담하시기 바랍니다. 검사 결과는 개인의 현재 상태를 반영하며, 시간이 지남에 따라 변화할 수 있습니다.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumAssessmentResult;