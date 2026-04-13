import React, { useState, useEffect } from 'react';
import SEOHead from '@/components/common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTokens } from '@/hooks/useTokens';
import { useSubscription } from '@/hooks/useSubscription';
import { sanitizeAIContent } from '@/utils/sanitizeHtml';
import html2pdf from 'html2pdf.js';
import ScratchCard from '@/components/gamification/ScratchCard';
import ReportShareModal from '@/components/report/ReportShareModal';
import ReportCurationSection from '@/components/report/ReportCurationSection';
import VisualSummaryButton from '@/components/visual-summary/VisualSummaryButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Loader2, Sparkles, Brain, Heart, TrendingUp,
  Users, Target, Activity, BarChart3, Zap, Shield, Award, BookOpen,
  LineChart, CheckCircle2, AlertCircle, ArrowRight, Database, Upload,
  ChevronDown, ChevronUp, Eye, Calendar, Crown, Copy, Share2, Mail,
  FileDown, MessageSquare, Lock, ImageIcon, ArrowLeft, Layers, Compass,
  GraduationCap, FlaskConical, Microscope, Globe
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  DomainRadarChart, TrendLineChart, StrengthWeaknessChart,
  RiskGauge, DataSourceInfographic, InteractiveRoadmap, CrossCorrelationInsight
} from '@/components/report/ReportDataVisualizations';
import ReportDataChecklist from '@/components/report/ReportDataChecklist';
import ReportProHeader from '@/components/report/ReportProHeader';
import ReportProOutput from '@/components/report/ReportProOutput';

// ── 샘플 리포트 섹션 데이터 ──
const SAMPLE_REPORT_SECTIONS_KO = [
  { title: '종합 발달 프로파일', icon: Brain, color: 'from-blue-500 to-cyan-500', theory: 'AI 인지발달 분석 · 근접발달 영역 평가', preview: '대상자의 인지, 언어, 사회정서, 운동 영역을 AIHPRO AI 엔진이 발달 단계별로 종합 분석합니다.' },
  { title: '심리·정서 심층 분석', icon: Heart, color: 'from-pink-500 to-rose-500', theory: 'AI 인지패턴 분석 · 애착유형 평가', preview: 'AI가 인지 패턴과 애착 유형을 분석하여 불안, 우울, 자존감, 스트레스 반응 패턴을 다층적으로 분석합니다.' },
  { title: '강점·약점 매트릭스', icon: TrendingUp, color: 'from-green-500 to-emerald-500', theory: 'AI 다중영역 분석 · 성격 강점 평가', preview: '다중 영역 분석과 성격 강점 평가를 기반으로 핵심 강점 영역과 지원 필요 영역을 시각화합니다.' },
  { title: '맞춤형 개입 프로그램', icon: Target, color: 'from-purple-500 to-violet-500', theory: 'AI 행동분석 · 인지행동 전략 · 놀이치료 접근', preview: '근거 기반 개입 전략에 따라 행동분석, 인지행동 전략, 놀이치료 접근 등 효과적인 개입 방안을 설계합니다.' },
  { title: '발달 로드맵 & 예후', icon: LineChart, color: 'from-orange-500 to-amber-500', theory: 'AI 생태환경 분석 · 심리사회적 발달 평가', preview: '생태환경 요인과 심리사회적 발달 단계를 통합 적용하여 발달 경로를 예측합니다.' },
  { title: '또래 비교 분석', icon: Users, color: 'from-indigo-500 to-blue-500', theory: 'AIHPRO 빅데이터 규준 · 연령별 발달 이정표', preview: 'AIHPRO 빅데이터와 연령별 발달 이정표를 기반으로 각 영역별 백분위를 산출합니다.' },
  { title: '전문가 소견서', icon: Shield, color: 'from-teal-500 to-cyan-500', theory: 'AI 임상 분석 · 전문가 수준 평가', preview: 'AI가 임상 수준의 분석 체계를 참조하여 전문가 수준의 소견서를 생성합니다.' },
  { title: '가족 지원 가이드', icon: Activity, color: 'from-fuchsia-500 to-pink-500', theory: 'AI 양육유형 분석 · 정서코칭 전략', preview: '양육 유형 분석과 정서코칭 전략에 기반한 맞춤형 양육 가이드를 제공합니다.' },
  { title: '종합 요약 및 제언', icon: BarChart3, color: 'from-violet-500 to-purple-500', theory: 'AIHPRO 통합 분석 프레임워크', preview: 'AIHPRO 통합 분석 프레임워크에 따라 전체 분석을 통합 정리합니다.' }
];

const SAMPLE_REPORT_SECTIONS_EN = [
  { title: 'Comprehensive Development Profile', icon: Brain, color: 'from-blue-500 to-cyan-500', theory: 'AI Cognitive Development Analysis · Proximal Development Assessment', preview: 'Comprehensive analysis of cognitive, language, social-emotional, and motor domains using AIHPRO AI engine.' },
  { title: 'Psychological & Emotional Deep Analysis', icon: Heart, color: 'from-pink-500 to-rose-500', theory: 'AI Cognitive Pattern Analysis · Attachment Assessment', preview: 'Multi-layered analysis of anxiety, depression, self-esteem, and stress response patterns using AI cognitive pattern analysis.' },
  { title: 'Strengths & Weaknesses Matrix', icon: TrendingUp, color: 'from-green-500 to-emerald-500', theory: 'AI Multi-Domain Analysis · Character Strengths Assessment', preview: 'Visualization of key strengths and areas needing support based on multi-domain analysis and character strengths evaluation.' },
  { title: 'Tailored Intervention Program', icon: Target, color: 'from-purple-500 to-violet-500', theory: 'AI Behavioral Analysis · Cognitive-Behavioral Strategy · Play Therapy', preview: 'Evidence-based intervention strategies including behavioral analysis, cognitive-behavioral approaches, and play therapy.' },
  { title: 'Development Roadmap & Prognosis', icon: LineChart, color: 'from-orange-500 to-amber-500', theory: 'AI Ecological Analysis · Psychosocial Development Assessment', preview: 'Developmental trajectory prediction integrating ecological factors and psychosocial development stages.' },
  { title: 'Peer Comparison Analysis', icon: Users, color: 'from-indigo-500 to-blue-500', theory: 'AIHPRO Big Data Norms · Age-Based Milestones', preview: 'Percentile calculations for each domain based on AIHPRO big data and age-based developmental milestones.' },
  { title: 'Expert Clinical Opinion', icon: Shield, color: 'from-teal-500 to-cyan-500', theory: 'AI Clinical Analysis · Expert-Level Assessment', preview: 'Clinical-level expert opinion generated using AI-powered clinical analysis systems.' },
  { title: 'Family Support Guide', icon: Activity, color: 'from-fuchsia-500 to-pink-500', theory: 'AI Parenting Style Analysis · Emotion Coaching Strategy', preview: 'Parenting strategies based on AI parenting style analysis and emotion coaching methodologies.' },
  { title: 'Summary & Recommendations', icon: BarChart3, color: 'from-violet-500 to-purple-500', theory: 'AIHPRO Integrated Analysis Framework', preview: 'Integrated summary following AIHPRO analysis framework with comprehensive cross-verification.' }
];

// ── 애니메이션 카운터 ──
const AnimatedCounter = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration * 30));
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 30);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
};

// ── 스텝 인디케이터 ──
const StepIndicator = ({ currentStep, steps }: { currentStep: number; steps: string[] }) => (
  <div className="flex items-center gap-1 w-full max-w-md mx-auto mb-8">
    {steps.map((label, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i <= currentStep ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground'
            }`}
            animate={i === currentStep ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, repeat: i === currentStep ? Infinity : 0, repeatDelay: 1 }}
          >
            {i < currentStep ? '✓' : i + 1}
          </motion.div>
          <span className={`text-[10px] ${i <= currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{label}</span>
        </div>
        {i < steps.length - 1 && (
          <div className={`flex-1 h-0.5 rounded-full mt-[-16px] ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const ReportGeneratorPro = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; type: string}[]>([]);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  const [imageAnalysisResults, setImageAnalysisResults] = useState<string>('');
  const [reportMode, setReportMode] = useState<'with-data' | 'without-data'>('with-data');
  const [userInput, setUserInput] = useState({ name: '', birthDate: '', gender: '', recentConcerns: '', developmentalNotes: '' });
  const [showDataDetails, setShowDataDetails] = useState({ assessments: false, observations: false, observationSessions: false, chatMessages: false });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tokenBalance, consumeTokens, checkTokenAvailability } = useTokens();
  const { isPremiumUser, loading: subLoading } = useSubscription();
  const [familyEmail, setFamilyEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentReportHistoryId, setCurrentReportHistoryId] = useState<string | null>(null);
  const [showSampleReport, setShowSampleReport] = useState(false);
  const [activeReportSection, setActiveReportSection] = useState(0);
  const [selectedChecklistData, setSelectedChecklistData] = useState<Record<string, string[]>>({});
  const [checklistSelectedCount, setChecklistSelectedCount] = useState(0);
  const [checklistTotalCount, setChecklistTotalCount] = useState(0);
  const { isEnglish, localePath } = useLanguage();

  // 현재 무료 개방 중 - 모든 사용자에게 프리미엄 기능 제공
  const isPremium = true;
  const currentStep = !isPremium ? 0 : reportMode ? (userInput.name ? (reportData ? 3 : 2) : 1) : 0;

  const SAMPLE_REPORT_SECTIONS = isEnglish ? SAMPLE_REPORT_SECTIONS_EN : SAMPLE_REPORT_SECTIONS_KO;

  // i18n helper
  const t = (ko: string, en: string) => isEnglish ? en : ko;

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoggedIn(false); setIsLoadingData(false); return; }
      setIsLoggedIn(true);
      const [{ data: assessments }, { data: observations }, { data: chatRooms }, { data: observationSessions }, { data: profile }, { data: onboardingData }] = await Promise.all([
        supabase.from('assessments').select('*').or(`user_id.eq.${session.user.id},profile_id.eq.${session.user.id}`).order('created_at', { ascending: false }),
        supabase.from('observation_logs').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('chat_rooms').select('*, chat_messages(*)').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('observation_sessions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        (supabase.from('user_onboarding_data') as any).select('*').eq('user_id', session.user.id).maybeSingle(),
      ]);
      const totalDataCount = (assessments?.length || 0) + (observations?.length || 0) + (observationSessions?.length || 0) + (chatRooms?.reduce((acc: number, room: any) => acc + (room.chat_messages?.length || 0), 0) || 0);
      setUserData({ assessments: assessments || [], observations: observations || [], observationSessions: observationSessions || [], chatRooms: chatRooms || [], profile: profile || {}, onboardingData: onboardingData || null, totalAssessments: assessments?.length || 0, totalObservations: observations?.length || 0, totalObservationSessions: observationSessions?.length || 0, totalChatMessages: chatRooms?.reduce((acc: number, room: any) => acc + (room.chat_messages?.length || 0), 0) || 0, totalDataCount });
      
      // 프로필 데이터로 대상자 정보 자동 채우기
      if (profile) {
        setUserInput(prev => ({
          ...prev,
          name: prev.name || profile.display_name || '',
          birthDate: prev.birthDate || profile.birth_date || '',
        }));
      }

      // 온보딩 데이터로 추가 자동 채우기
      if (onboardingData) {
        const concernLabels = (onboardingData.concern_keywords || []).map((key: string) => {
          const map: Record<string, string> = { attention: '주의력/ADHD', emotion: '정서/불안', development: '발달 지연', language: '언어 발달', social: '사회성', learning: '학습/인지', behavior: '행동 문제', sleep: '수면/식습관', stress: '스트레스', puberty: '사춘기/반항', burnout: '육아 번아웃', curious: '전반적 관심' };
          return map[key] || key;
        });
        setUserInput(prev => ({
          ...prev,
          gender: prev.gender || (onboardingData.child_gender === 'male' ? '남' : onboardingData.child_gender === 'female' ? '여' : prev.gender),
          recentConcerns: prev.recentConcerns || concernLabels.join(', '),
        }));
      }
      
      // 데이터가 충분하면 자동으로 데이터 기반 모드, 없으면 고민 기반 모드
      if (totalDataCount >= 3) {
        setReportMode('with-data');
      } else {
        setReportMode('without-data');
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast({ title: t("데이터 로드 실패", "Failed to Load Data"), description: t("사용자 데이터를 불러오는 중 오류가 발생했습니다.", "An error occurred while loading user data."), variant: "destructive" });
    } finally { setIsLoadingData(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsAnalyzingImages(true);
    toast({ title: t("📎 파일 분석 중", "📎 Analyzing Files"), description: t("AI가 외부 검사 파일을 분석합니다...", "AI is analyzing external test files...") });
    try {
      const fileDataList: { data: string; name: string; type: string }[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => { reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(file); });
        fileDataList.push({ data: dataUrl, name: file.name, type: file.type });
      }
      setUploadedFiles(fileDataList.map(f => ({ name: f.name, type: f.type })));
      const { data, error } = await supabase.functions.invoke('analyze-test-images', { body: { files: fileDataList } });
      if (error) throw error;
      setImageAnalysisResults(data?.analysis || '');
      toast({ title: t("✅ 파일 분석 완료", "✅ File Analysis Complete"), description: t(`${fileDataList.length}개 파일이 분석되었습니다.`, `${fileDataList.length} file(s) analyzed.`) });
    } catch (err) { toast({ title: t("분석 실패", "Analysis Failed"), description: t("파일 분석에 실패했습니다.", "Failed to analyze files."), variant: "destructive" }); } finally { setIsAnalyzingImages(false); }
  };

  // 폴링: premium_report_history에서 최신 리포트 가져오기
  const pollForSavedReport = async (startTime: string, maxAttempts = 30): Promise<any | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data } = await supabase
        .from('premium_report_history')
        .select('*')
        .eq('user_id', session.user.id)
        .gt('created_at', startTime)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        console.log(`폴링 ${attempt + 1}회차에서 리포트 발견`);
        // DB에 저장된 report_data를 프론트엔드 형식으로 변환
        const reportFromDB = data.report_data as any;
        if (reportFromDB) {
          reportFromDB.preprocessedData = data.preprocessed_data;
          reportFromDB.dataSource = data.data_source_counts;
          return reportFromDB;
        }
      }
      
      // 10초 대기 후 재시도
      setProgress(prev => Math.min(prev + 2, 95));
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    return null;
  };

  const generateReport = async () => {
    if (!isPremium) { navigate(localePath('/token-subscription')); return; }
    if (reportMode === 'with-data') {
      if (checklistSelectedCount < 3) {
        toast({ title: t("데이터 부족", "Insufficient Data"), description: t(`종합 리포트 생성에는 최소 3개의 데이터가 필요합니다. (현재: ${checklistSelectedCount}개 선택)`, `At least 3 data points are required. (Currently selected: ${checklistSelectedCount})`), variant: "destructive" });
        return;
      }
    } else {
      if (!userInput.recentConcerns && !userInput.developmentalNotes) {
        toast({ title: t("정보 부족", "Insufficient Information"), description: t("고민·상태 기반 리포트를 생성하려면 '고민이나 걱정거리' 또는 '발달/심리적 특징' 중 하나 이상 입력해주세요.", "Please enter at least one of 'Concerns' or 'Developmental Notes' to generate a report."), variant: "destructive" });
        return;
      }
    }
    if (!userInput.name || !userInput.birthDate || !userInput.gender) {
      toast({ title: t("필수 정보 누락", "Required Fields Missing"), description: t("이름, 생년월일, 성별은 필수 입력 항목입니다.", "Name, date of birth, and gender are required."), variant: "destructive" });
      return;
    }
    setIsGenerating(true); setProgress(0);
    const startTime = new Date().toISOString();
    try {
      const progressInterval = setInterval(() => { setProgress(prev => Math.min(prev + 5, 90)); }, 1000);
      toast({ title: t("🔬 전문가급 분석 시작", "🔬 Expert-Level Analysis Started"), description: reportMode === 'with-data' ? t("실시간 웹 검색 + 최신 연구 기반 심층 분석을 진행합니다...", "Performing real-time web search + latest research-based deep analysis...") : t("고민·상태 정보를 기반으로 맞춤 분석을 진행합니다...", "Performing personalized analysis based on your concerns...") });
      const body: any = { reportMode, userInput: { name: userInput.name, birthDate: userInput.birthDate, gender: userInput.gender, recentConcerns: userInput.recentConcerns, developmentalNotes: userInput.developmentalNotes }, language: isEnglish ? 'en' : 'ko' };
      if (reportMode === 'with-data') { body.assessments = userData.assessments; body.observations = userData.observations; body.observationSessions = userData.observationSessions; body.chatRooms = userData.chatRooms; body.profile = userData.profile; body.selectedData = selectedChecklistData; body.selectedDataCount = checklistSelectedCount; }
      if (userData.onboardingData) { body.onboardingData = userData.onboardingData; }
      if (imageAnalysisResults) { body.externalTestImages = imageAnalysisResults; }
      
      let reportResult: any = null;
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-expert-report', { body });
        clearInterval(progressInterval);
        if (error) throw error;
        if (data?.error === 'LOVABLE_AI_CREDITS_INSUFFICIENT') { toast({ title: t("💳 AI 크레딧 부족", "💳 Insufficient AI Credits"), description: data.message, variant: "destructive" }); return; }
        if (data?.success && data?.report) {
          reportResult = data.report;
        }
      } catch (fnError: any) {
        clearInterval(progressInterval);
        console.warn('Edge function 직접 응답 실패, DB 폴링 시작:', fnError?.message);
        // Edge function이 타임아웃되었지만 서버에서는 리포트 생성이 완료되었을 수 있음
        // premium_report_history 테이블에서 폴링
        toast({ title: t("⏳ AI 분석이 진행 중입니다", "⏳ AI Analysis in Progress"), description: t("고급 분석에 시간이 걸리고 있습니다. 잠시만 기다려주세요...", "Advanced analysis is taking longer. Please wait...") });
        reportResult = await pollForSavedReport(startTime);
      }
      
      if (reportResult) {
        setProgress(100);
        setReportData({ ...reportResult, generatedAt: new Date().toISOString(), dataSource: reportResult.dataSource || { assessments: userData?.totalAssessments || 0, observations: userData?.totalObservations || 0, observationSessions: userData?.totalObservationSessions || 0, chatMessages: userData?.totalChatMessages || 0, totalDataCount: userData?.totalDataCount || 0 } });
        toast({ title: t("🎉 프리미엄 리포트 생성 완료!", "🎉 Premium Report Generated!"), description: t("세계 최고 수준의 분석 리포트가 생성되었습니다.", "Your world-class analysis report has been generated.") });
        setTimeout(() => setShowScratchCard(true), 1500);
      } else {
        throw new Error(t('리포트 생성에 실패했습니다. 다시 시도해주세요.', 'Report generation failed. Please try again.'));
      }
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const isPaymentError = errorMessage.includes('402') || errorMessage.includes('크레딧');
      toast({ title: isPaymentError ? t("💳 AI 크레딧 부족", "💳 Insufficient AI Credits") : t("생성 실패", "Generation Failed"), description: isPaymentError ? t("AI 크레딧이 부족합니다.", "Insufficient AI credits.") : t("리포트 생성 중 오류가 발생했습니다. 다시 시도해주세요.", "An error occurred. Please try again."), variant: "destructive" });
    } finally { setIsGenerating(false); setProgress(0); }
  };

  const downloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    import('@/utils/pdfBrandingHeader').then(({ injectPdfBrandingHeader, removePdfBrandingHeader }) => {
      injectPdfBrandingHeader(element);
      const style = document.createElement('style'); style.id = 'pdf-page-break-style';
      style.textContent = `#report-content .pdf-section-break { page-break-before: always !important; break-before: page !important; } #report-content .pdf-no-break { page-break-inside: avoid !important; break-inside: avoid !important; }`;
      document.head.appendChild(style);
      const sections = element.querySelectorAll('[data-report-section]');
      sections.forEach((sec, idx) => { if (idx > 0) sec.classList.add('pdf-section-break'); sec.classList.add('pdf-no-break'); });
      html2pdf().set({ margin: [15, 15, 15, 15], filename: `${isEnglish ? 'PremiumAnalysis' : '프리미엄분석'}_${userInput.name || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`, image: { type: 'jpeg' as const, quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const } } as any).from(element).save().then(() => { document.getElementById('pdf-page-break-style')?.remove(); sections.forEach((sec) => { sec.classList.remove('pdf-section-break', 'pdf-no-break'); }); removePdfBrandingHeader(element); });
    });
    toast({ title: t("📥 PDF 다운로드 시작", "📥 PDF Download Started") });
  };

  const copyToClipboard = async () => {
    if (!reportData) return;
    let text = t(`프리미엄 종합 분석 리포트\n대상: ${userInput.name}\n\n`, `Premium Comprehensive Analysis Report\nSubject: ${userInput.name}\n\n`);
    reportData.sections?.forEach((s: any, i: number) => { text += `${i + 1}. ${s.title}\n${s.content.replace(/<[^>]*>/g, '')}\n\n`; });
    await navigator.clipboard.writeText(text); toast({ title: t("📋 클립보드에 복사됨", "📋 Copied to Clipboard") });
  };

  const shareReport = async () => { if (navigator.share) { await navigator.share({ title: t('프리미엄 종합 분석 리포트', 'Premium Analysis Report'), text: t(`${userInput.name}님의 프리미엄 분석 리포트`, `Premium Analysis Report for ${userInput.name}`), url: window.location.href }); } else { copyToClipboard(); } };

  const sendFamilyEmail = async () => {
    if (!familyEmail || !reportData) { toast({ title: t("이메일 주소를 입력해주세요", "Please enter an email address"), variant: "destructive" }); return; }
    setIsSendingEmail(true);
    try {
      const summaryText = reportData.summary?.replace(/<[^>]*>/g, '') || '';
      const sections = reportData.sections?.map((s: any) => ({ title: s.title, content: s.content?.replace(/<[^>]*>/g, '').substring(0, 800) || '' })) || [];
      const recommendations = reportData.sections?.slice(0, 5).map((s: any) => s.title) || [];
      const { error } = await supabase.functions.invoke('send-share-email', { body: { email: familyEmail, type: 'report', title: t(`${userInput.name}님의 프리미엄 종합 분석 리포트`, `Premium Analysis Report for ${userInput.name}`), recipientName: '', senderName: userInput.name, content: { summary: summaryText, sections, recommendations } } });
      if (error) throw error;
      toast({ title: t("✅ 이메일 전송 완료", "✅ Email Sent"), description: t(`${familyEmail}로 리포트가 전송되었습니다.`, `Report sent to ${familyEmail}.`) }); setFamilyEmail('');
    } catch (e: any) { toast({ title: t("이메일 전송 실패", "Email Send Failed"), description: e?.message || t("잠시 후 다시 시도해주세요.", "Please try again later."), variant: "destructive" }); } finally { setIsSendingEmail(false); }
  };

  // ── 로딩 ──
  if (isLoadingData || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto">
            <FlaskConical className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <p className="text-muted-foreground text-lg font-semibold">{t('데이터를 불러오는 중...', 'Loading data...')}</p>
        </motion.div>
      </div>
    );
  }

  const sectionIcons = [Brain, Heart, TrendingUp, Target, LineChart, Users, Shield, Activity, BarChart3, FileText];
  const sectionColors = [
    { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', icon: 'bg-blue-100 text-blue-600' },
    { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-800', icon: 'bg-rose-100 text-rose-600' },
    { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800', icon: 'bg-green-100 text-green-600' },
    { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800', icon: 'bg-purple-100 text-purple-600' },
    { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-800', icon: 'bg-orange-100 text-orange-600' },
    { bg: 'bg-indigo-50', border: 'border-indigo-200', title: 'text-indigo-800', icon: 'bg-indigo-100 text-indigo-600' },
    { bg: 'bg-teal-50', border: 'border-teal-200', title: 'text-teal-800', icon: 'bg-teal-100 text-teal-600' },
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', title: 'text-fuchsia-800', icon: 'bg-fuchsia-100 text-fuchsia-600' },
    { bg: 'bg-violet-50', border: 'border-violet-200', title: 'text-violet-800', icon: 'bg-violet-100 text-violet-600' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', title: 'text-cyan-800', icon: 'bg-cyan-100 text-cyan-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ReportProHeader isLoggedIn={isLoggedIn} isPremium={isPremium} />
        {/* ── 스텝 인디케이터 ── */}
        {isPremium && !reportData && (
          <StepIndicator currentStep={currentStep} steps={isEnglish ? ['Select Mode', 'Enter Info', 'Generate Report'] : ['모드 선택', '정보 입력', '리포트 생성']} />
        )}

        {/* ── 비로그인/비구독자: 구독 유도 ── */}
        {(isLoggedIn === false || (isLoggedIn && !isPremium)) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mb-10">
            <div className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">{t('프리미엄 구독자 전용', 'Premium Subscribers Only')}</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {t('프리미엄 패스를 구독하면 AI 종합 리포트, 심층 분석, PDF 다운로드 등 모든 기능을 무제한으로 이용할 수 있습니다.',
                   'Subscribe to Premium Pass for unlimited access to AI reports, deep analysis, PDF downloads, and all features.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isLoggedIn === false ? (
                  <Button onClick={() => { localStorage.setItem('auth_redirect_after', localePath('/report-generator')); navigate(localePath('/auth')); }} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-xl">
                    {t('회원가입 / 로그인', 'Sign Up / Log In')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => navigate(localePath('/token-subscription'))} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-xl">
                    <Crown className="w-5 h-5 mr-2" /> {t('프리미엄 구독하기', 'Subscribe to Premium')}
                  </Button>
                )}
                <Button onClick={() => setShowSampleReport(true)} variant="outline" className="border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 px-8 py-3 rounded-xl">
                  <Eye className="w-5 h-5 mr-2" /> {t('샘플 미리보기', 'Sample Preview')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 샘플 리포트 다이얼로그 ── */}
        <Dialog open={showSampleReport} onOpenChange={setShowSampleReport}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Crown className="w-7 h-7 text-amber-500" /> {t('프리미엄 리포트 샘플', 'Premium Report Sample')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="bg-gradient-to-br from-slate-800 via-purple-800 to-indigo-900 rounded-2xl p-8 text-center text-white space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black">{t('AI 종합 발달·심리 분석 리포트', 'AI Comprehensive Development & Psychology Report')}</h2>
                <p className="text-purple-200">{t('대상: 홍길동 (7세) · 생성일: 2025년 2월 6일', 'Subject: John Doe (Age 7) · Generated: Feb 6, 2025')}</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30">{t('검사 12건', '12 Assessments')}</Badge>
                  <Badge className="bg-green-500/20 text-green-200 border border-green-400/30">{t('관찰 8건', '8 Observations')}</Badge>
                  <Badge className="bg-pink-500/20 text-pink-200 border border-pink-400/30">{t('상담 5건', '5 Consultations')}</Badge>
                </div>
              </div>
              {SAMPLE_REPORT_SECTIONS.map((section, idx) => {
                const IconComp = section.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="relative">
                    <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} shadow-md shrink-0`}>
                        <IconComp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">{idx + 1}. {section.title}</h3>
                        <p className="text-xs text-indigo-600 font-semibold mb-1">📖 {section.theory}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{section.preview}</p>
                      </div>
                    </div>
                    {idx >= 4 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="text-center space-y-2"><Lock className="w-6 h-6 text-purple-400 mx-auto" /><p className="text-sm font-semibold text-purple-600">{t('프리미엄 구독 시 전체 공개', 'Full access with Premium')}</p></div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 space-y-3">
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
                  <h3 className="text-lg font-bold text-emerald-800">{t('실제 전문가에게 직접 검사받고 싶으신가요?', 'Want a professional assessment from a real expert?')}</h3>
                </div>
                <p className="text-sm text-emerald-700 text-center max-w-lg mx-auto">{t('공인 자격을 갖춘 임상심리전문가가 직접 전문 검사를 실시합니다.', 'Licensed clinical psychologists conduct professional assessments.')}</p>
                <div className="text-center">
                  <a href="https://smilesolution.kr" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-8 py-3 rounded-xl">
                      <Award className="w-5 h-5 mr-2" /> {t('전문가 맞춤 검사 신청', 'Request Expert Assessment')}
                    </Button>
                  </a>
                </div>
              </div>
              <div className="text-center py-6">
                <Button onClick={() => { setShowSampleReport(false); navigate(localePath('/token-subscription')); }} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-4 rounded-xl text-lg">
                  <Crown className="w-6 h-6 mr-2" /> {t('프리미엄 구독하고 내 리포트 받기', 'Subscribe & Get My Report')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── 9개 섹션 인터랙티브 쇼케이스 ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto mb-10">
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center justify-center gap-2">
              <Microscope className="w-5 h-5 text-primary" /> {t('9가지 전문 분석 섹션', '9 Professional Analysis Sections')}
            </h2>
            <p className="text-muted-foreground text-xs mt-1">{t('각 카드를 클릭하여 상세 내용을 확인하세요', 'Click each card to view details')}</p>
          </div>

          {/* 인터랙티브 그리드 */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-3">
            {SAMPLE_REPORT_SECTIONS.map((section, idx) => {
              const IconComp = section.icon;
              const isActive = activeReportSection === idx;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveReportSection(idx)}
                  className={`relative p-3 md:p-4 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-2`}>
                    <IconComp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <p className="text-[10px] md:text-xs font-semibold text-white leading-tight">{section.title}</p>
                  {isActive && (
                    <motion.div layoutId="active-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* 선택된 섹션 상세 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReportSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4 md:p-5"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${SAMPLE_REPORT_SECTIONS[activeReportSection].color} shrink-0`}>
                  {React.createElement(SAMPLE_REPORT_SECTIONS[activeReportSection].icon, { className: "w-5 h-5 text-white" })}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{SAMPLE_REPORT_SECTIONS[activeReportSection].title}</h4>
                  <p className="text-[10px] text-primary font-semibold mb-2">{SAMPLE_REPORT_SECTIONS[activeReportSection].theory}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{SAMPLE_REPORT_SECTIONS[activeReportSection].preview}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── 프리미엄 사용자: 리포트 생성 인터페이스 ── */}
        {isPremium && !reportData && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 모드 선택 */}
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { mode: 'with-data' as const, icon: Database, title: t('데이터 기반 종합 리포트', 'Data-Based Comprehensive Report'), desc: t('기존 검사·관찰·상담 데이터를 포함한 심층 분석', 'Deep analysis including existing assessment, observation, and consultation data'), tags: isEnglish ? ['Assessments', 'Observations', 'Consultations'] : ['검사 기록', '관찰 기록', '상담 기록'], color: 'primary' },
                { mode: 'without-data' as const, icon: Heart, title: t('고민·상태 기반 리포트', 'Concern-Based Report'), desc: t('현재 고민이나 발달·심리 상태 설명만으로 분석', 'Analysis based solely on current concerns or developmental status'), tags: isEnglish ? ['Concerns', 'Current State', 'Development'] : ['고민 상담', '현재 상태', '발달 특징'], color: 'cyan' },
              ].map((opt) => (
                <motion.button key={opt.mode} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setReportMode(opt.mode)}
                  className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                    reportMode === opt.mode
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {reportMode === opt.mode && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-primary" />}
                  <opt.icon className="w-7 h-7 text-primary mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">{opt.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{opt.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.tags.map(tg => <span key={tg} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{tg}</span>)}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* 사용자 입력 폼 */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-white">{t('대상자 정보 입력', 'Subject Information')}</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t('닉네임 *', 'Nickname *')}</label>
                  <input type="text" value={userInput.name} onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                    placeholder={t('예: 하늘맘, 별이아빠', 'e.g. SkyMom, StarDad')} className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm" maxLength={50} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {t('생년월일 *', 'Date of Birth *')}</label>
                  <input type="date" value={userInput.birthDate} onChange={(e) => setUserInput({ ...userInput, birthDate: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t('성별 *', 'Gender *')}</label>
                  <select value={userInput.gender} onChange={(e) => setUserInput({ ...userInput, gender: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm [&>option]:bg-slate-800 [&>option]:text-white">
                    <option value="" className="bg-slate-800 text-white">{t('선택', 'Select')}</option>
                    <option value={isEnglish ? 'Male' : '남성'} className="bg-slate-800 text-white">{t('남성', 'Male')}</option>
                    <option value={isEnglish ? 'Female' : '여성'} className="bg-slate-800 text-white">{t('여성', 'Female')}</option>
                    <option value={isEnglish ? 'Other' : '기타'} className="bg-slate-800 text-white">{t('기타', 'Other')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {t('고민이나 걱정거리', 'Concerns or Worries')} {reportMode === 'without-data' && <span className="text-primary">*</span>}</label>
                <textarea value={userInput.recentConcerns} onChange={(e) => setUserInput({ ...userInput, recentConcerns: e.target.value })}
                  placeholder={t('예: 아이가 또래 관계에서 어려움을 겪고 있어요...', 'e.g. My child is having difficulties with peer relationships...')}
                  className="w-full min-h-[90px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm" maxLength={1000} />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    { label: t('아이가 또래 관계에서 어려움을 겪고 있어요', 'My child struggles with peer relationships') },
                    { label: t('직장 스트레스로 번아웃이 심해요', 'I\'m experiencing severe burnout from work stress') },
                    { label: t('불면증과 만성 불안이 계속돼요', 'I have persistent insomnia and chronic anxiety') },
                    { label: t('부모 역할에 자신이 없고 죄책감이 들어요', 'I lack confidence as a parent and feel guilty') },
                  ].map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => setUserInput({ ...userInput, recentConcerns: example.label })}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-white/15 text-white/50 hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> {t('발달/심리적 특징이나 메모', 'Developmental/Psychological Notes')} {reportMode === 'without-data' && <span className="text-primary">*</span>}</label>
                <textarea value={userInput.developmentalNotes} onChange={(e) => setUserInput({ ...userInput, developmentalNotes: e.target.value })}
                  placeholder={t('예: 최근 3개월간 언어 표현이 늘었지만, 감정 조절에 어려움을 보입니다...', 'e.g. Language expression has improved over the past 3 months, but emotional regulation remains challenging...')}
                  className="w-full min-h-[90px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm" maxLength={1000} />
              </div>
            </div>

            {/* 데이터 현황 - with-data 모드 */}
            {reportMode === 'with-data' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-primary" /> {t('리포트에 포함할 데이터 선택', 'Select Data for Report')}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">{t('포함할 데이터를 직접 선택하세요. 체크된 항목만 리포트에 반영됩니다.', 'Select the data to include. Only checked items will be reflected in the report.')}</p>
                <ReportDataChecklist
                  onSelectionChange={(data, count, total) => {
                    setSelectedChecklistData(data);
                    setChecklistSelectedCount(count);
                    setChecklistTotalCount(total);
                  }}
                />
              </div>
            )}

            {/* 외부 파일 업로드 - 두 모드 모두 지원 */}
            {(reportMode === 'with-data' || reportMode === 'without-data') && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm mb-1">{t('외부 기관 검사 결과 추가 (선택)', 'Add External Test Results (Optional)')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{t('다른 기관에서 받은 검사 결과를 업로드하면 AI가 자동 반영 (이미지, PDF, Word, 한글 등)', 'Upload test results from other institutions for AI integration (images, PDF, Word, HWP, etc.)')}</p>
                    <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.hwp,.hwpx,.xlsx,.xls,.txt,.rtf" onChange={handleFileUpload} disabled={isAnalyzingImages}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
                    {isAnalyzingImages && <div className="mt-3 flex items-center gap-2 text-primary"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">{t('분석 중...', 'Analyzing...')}</span></div>}
                    {uploadedFiles.length > 0 && !isAnalyzingImages && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-4 h-4" /><span className="text-sm">{t(`${uploadedFiles.length}개 파일 분석 완료`, `${uploadedFiles.length} file(s) analyzed`)}</span></div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {uploadedFiles.map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] bg-white/10 border-white/20">
                              {f.name.length > 20 ? f.name.slice(0, 17) + '...' : f.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 생성 버튼 */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button onClick={generateReport} disabled={isGenerating} size="lg"
                className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-2xl shadow-primary/20 border-0">
                {isGenerating ? (
                  <><Loader2 className="w-6 h-6 animate-spin mr-3" /> {t('AI 분석 중...', 'AI Analyzing...')} ({progress}%)</>
                ) : (
                  <><Crown className="w-6 h-6 mr-3" /> {reportMode === 'with-data' && checklistSelectedCount > 0
                    ? t(`프리미엄 리포트 생성하기 (${checklistSelectedCount}개 데이터 반영)`, `Generate Premium Report (${checklistSelectedCount} data points)`)
                    : t('프리미엄 리포트 생성하기', 'Generate Premium Report')}</>
                )}
              </Button>
            </motion.div>

            {/* 생성 진행 바 */}
            {isGenerating && (
              <div className="space-y-3">
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  {(isEnglish ? ['Data Collection', 'Theory Matching', 'Research Search', 'Report Writing'] : ['데이터 수집', '심리이론 매칭', '논문 검색', '리포트 작성']).map((label, i) => (
                    <span key={i} className={progress > (i + 1) * 22 ? 'text-primary font-semibold' : ''}>{label}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 리포트 결과 ── */}
        {reportData && (
          <ReportProOutput
            reportData={reportData}
            userInput={userInput}
          />
        )}

        {/* 전문가 대면 검사 CTA */}
        <div className="max-w-4xl mx-auto mb-10 mt-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-1">
                <h3 className="text-base font-bold text-white">{t('실제 전문가에게 전문 검사 받기', 'Get a Professional Assessment from a Real Expert')}</h3>
                <p className="text-xs text-muted-foreground">{t('공인 임상심리전문가가 직접 대면/비대면 검사를 실시합니다.', 'Licensed clinical psychologists conduct in-person/remote assessments.')}</p>
              </div>
              <a href="https://smilesolution.kr" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 rounded-xl">
                  {t('전문가 검사 신청', 'Request Expert Assessment')} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <ScratchCard isOpen={showScratchCard} onClose={() => setShowScratchCard(false)} />
      
      {/* 리포트 공유 모달 */}
      <ReportShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        reportHistoryIds={currentReportHistoryId ? [currentReportHistoryId] : []}
        reportTitle={reportData?.title || userInput.name ? `${userInput.name}의 심리 분석 리포트` : '프리미엄 분석 리포트'}
      />
    </div>
  );
};

export default ReportGeneratorPro;
