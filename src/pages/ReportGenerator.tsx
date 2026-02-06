import React, { useState, useEffect } from 'react';
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
import VisualSummaryButton from '@/components/visual-summary/VisualSummaryButton';
import { motion } from 'framer-motion';
import {
  FileText, Download, Loader2, Sparkles, Brain, Heart, TrendingUp,
  Users, Target, Activity, BarChart3, Zap, Shield, Award, BookOpen,
  LineChart, CheckCircle2, AlertCircle, ArrowRight, Database, Upload,
  ChevronDown, ChevronUp, Eye, Calendar, Crown, Copy, Share2, Mail,
  FileDown, MessageSquare, Lock, ImageIcon
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

// 샘플 리포트 섹션 데이터
const SAMPLE_REPORT_SECTIONS = [
  {
    title: '종합 발달 프로파일',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    preview: '대상자의 인지, 언어, 사회정서, 운동 영역을 포함한 전반적 발달 수준을 객관적 지표와 함께 종합 분석합니다. 표준화 검사 결과와 관찰 데이터를 교차 검증하여 신뢰도 높은 발달 프로파일을 제공합니다.'
  },
  {
    title: '심리·정서 심층 분석',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    preview: '불안, 우울, 자존감, 스트레스 반응 패턴을 다층적으로 분석합니다. AI가 상담 기록과 검사 결과를 종합하여 잠재적 정서 위험 요인을 조기 식별하고 예방적 개입 방향을 제시합니다.'
  },
  {
    title: '강점·약점 매트릭스',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    preview: '데이터 기반으로 핵심 강점 영역과 지원이 필요한 영역을 시각화합니다. 강점 활용 전략과 약점 보완을 위한 단계별 접근법을 함께 제안합니다.'
  },
  {
    title: '맞춤형 활동 프로그램',
    icon: Target,
    color: 'from-purple-500 to-violet-500',
    preview: '분석 결과에 기반한 개인 맞춤형 활동 프로그램을 설계합니다. 가정, 학교, 치료 환경 각각에서 실행 가능한 구체적 활동과 목표를 제시합니다.'
  },
  {
    title: '발달 로드맵 & 예후',
    icon: LineChart,
    color: 'from-orange-500 to-amber-500',
    preview: '현재 발달 궤적을 기반으로 3개월, 6개월, 12개월 후 예상되는 발달 경로와 필요한 중재 전략을 타임라인으로 제시합니다.'
  },
  {
    title: '또래 비교 분석',
    icon: Users,
    color: 'from-indigo-500 to-blue-500',
    preview: '동일 연령대 규준 데이터를 기반으로 각 영역별 백분위와 발달 수준을 객관적으로 비교 분석합니다.'
  },
  {
    title: '전문가 소견서',
    icon: Shield,
    color: 'from-teal-500 to-cyan-500',
    preview: 'AI가 생성한 임상 수준의 전문가 소견서로, 교육기관이나 의료기관 제출용으로 활용 가능한 형식으로 작성됩니다.'
  },
  {
    title: '가족 지원 가이드',
    icon: Activity,
    color: 'from-fuchsia-500 to-pink-500',
    preview: '보호자가 일상에서 즉시 실천할 수 있는 양육 전략, 환경 조정 방안, 위기 대응 가이드를 상세히 제공합니다.'
  },
  {
    title: '종합 요약 및 제언',
    icon: BarChart3,
    color: 'from-violet-500 to-purple-500',
    preview: '전체 분석을 핵심 3줄 요약으로 정리하고, 즉시 실행 가능한 Top 5 권장사항과 전문기관 연계 안내를 제공합니다.'
  }
];

const ReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  const [imageAnalysisResults, setImageAnalysisResults] = useState<string>('');
  const [userInput, setUserInput] = useState({
    name: '', birthDate: '', gender: '', recentConcerns: '', developmentalNotes: ''
  });
  const [showDataDetails, setShowDataDetails] = useState({
    assessments: false, observations: false, observationSessions: false, chatMessages: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tokenBalance, consumeTokens, checkTokenAvailability } = useTokens();
  const { isPremiumUser, loading: subLoading } = useSubscription();
  const [familyEmail, setFamilyEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [showSampleReport, setShowSampleReport] = useState(false);

  const isPremium = isPremiumUser();

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoggedIn(false);
        setIsLoadingData(false);
        return;
      }
      setIsLoggedIn(true);

      const [
        { data: assessments },
        { data: observations },
        { data: chatRooms },
        { data: observationSessions },
        { data: profile }
      ] = await Promise.all([
        supabase.from('assessments').select('*').or(`user_id.eq.${session.user.id},profile_id.eq.${session.user.id}`).order('created_at', { ascending: false }),
        supabase.from('observation_logs').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('chat_rooms').select('*, chat_messages(*)').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('observation_sessions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      ]);

      const totalDataCount =
        (assessments?.length || 0) +
        (observations?.length || 0) +
        (observationSessions?.length || 0) +
        (chatRooms?.reduce((acc: number, room: any) => acc + (room.chat_messages?.length || 0), 0) || 0);

      setUserData({
        assessments: assessments || [], observations: observations || [],
        observationSessions: observationSessions || [], chatRooms: chatRooms || [],
        profile: profile || {},
        totalAssessments: assessments?.length || 0,
        totalObservations: observations?.length || 0,
        totalObservationSessions: observationSessions?.length || 0,
        totalChatMessages: chatRooms?.reduce((acc: number, room: any) => acc + (room.chat_messages?.length || 0), 0) || 0,
        totalDataCount
      });
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast({ title: "데이터 로드 실패", description: "사용자 데이터를 불러오는 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsAnalyzingImages(true);
    toast({ title: "📸 이미지 분석 중", description: "AI가 외부 검사 이미지를 분석합니다..." });
    try {
      const images: string[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        images.push(dataUrl);
      }
      setUploadedImages(images);
      const { data, error } = await supabase.functions.invoke('analyze-test-images', { body: { images } });
      if (error) throw error;
      setImageAnalysisResults(data?.analysis || '');
      toast({ title: "✅ 이미지 분석 완료", description: `${images.length}개 이미지가 분석되었습니다.` });
    } catch (err) {
      toast({ title: "분석 실패", description: "이미지 분석에 실패했습니다.", variant: "destructive" });
    } finally {
      setIsAnalyzingImages(false);
    }
  };

  const generateReport = async () => {
    if (!isPremium) {
      navigate('/token-subscription');
      return;
    }
    const totalData = userData?.totalDataCount || 0;
    if (totalData < 3) {
      toast({ title: "데이터 부족", description: `종합 리포트 생성에는 최소 3개의 데이터가 필요합니다. (현재: ${totalData}개)`, variant: "destructive" });
      return;
    }
    if (!userInput.name || !userInput.birthDate || !userInput.gender) {
      toast({ title: "필수 정보 누락", description: "이름, 생년월일, 성별은 필수 입력 항목입니다.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => { setProgress(prev => Math.min(prev + 5, 90)); }, 1000);
      toast({ title: "🔬 전문가급 분석 시작", description: "실시간 웹 검색 + 최신 연구 기반 심층 분석을 진행합니다..." });

      const { data, error } = await supabase.functions.invoke('generate-expert-report', {
        body: {
          assessments: userData.assessments, observations: userData.observations,
          observationSessions: userData.observationSessions, chatRooms: userData.chatRooms,
          profile: userData.profile, externalTestImages: imageAnalysisResults,
          userInput: { name: userInput.name, birthDate: userInput.birthDate, gender: userInput.gender, recentConcerns: userInput.recentConcerns, developmentalNotes: userInput.developmentalNotes }
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;
      if (data?.error === 'LOVABLE_AI_CREDITS_INSUFFICIENT') {
        toast({ title: "💳 AI 크레딧 부족", description: data.message, variant: "destructive" });
        return;
      }

      if (data?.success && data?.report) {
        setReportData({ ...data.report, generatedAt: new Date().toISOString(),
          dataSource: { assessments: userData.totalAssessments, observations: userData.totalObservations, observationSessions: userData.totalObservationSessions, chatMessages: userData.totalChatMessages, totalDataCount: userData.totalDataCount }
        });
        toast({ title: "🎉 프리미엄 리포트 생성 완료!", description: "세계 최고 수준의 분석 리포트가 생성되었습니다." });
        setTimeout(() => setShowScratchCard(true), 1500);
      } else {
        throw new Error('리포트 데이터가 없습니다.');
      }
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const isPaymentError = errorMessage.includes('402') || errorMessage.includes('크레딧');
      toast({ title: isPaymentError ? "💳 AI 크레딧 부족" : "생성 실패", description: isPaymentError ? "AI 크레딧이 부족합니다." : "리포트 생성 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    html2pdf().set({
      margin: 15, filename: `프리미엄분석_${userInput.name || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    }).from(element).save();
    toast({ title: "📥 PDF 다운로드 시작" });
  };

  const copyToClipboard = async () => {
    if (!reportData) return;
    let text = `프리미엄 종합 분석 리포트\n대상: ${userInput.name}\n\n`;
    reportData.sections?.forEach((s: any, i: number) => { text += `${i + 1}. ${s.title}\n${s.content.replace(/<[^>]*>/g, '')}\n\n`; });
    await navigator.clipboard.writeText(text);
    toast({ title: "📋 클립보드에 복사됨" });
  };

  const shareReport = async () => {
    if (navigator.share) {
      await navigator.share({ title: '프리미엄 종합 분석 리포트', text: `${userInput.name}님의 프리미엄 분석 리포트`, url: window.location.href });
    } else { copyToClipboard(); }
  };

  const sendFamilyEmail = async () => {
    if (!familyEmail || !reportData) { toast({ title: "이메일 주소를 입력해주세요", variant: "destructive" }); return; }
    setIsSendingEmail(true);
    try {
      const summaryText = reportData.summary?.replace(/<[^>]*>/g, '') || '';
      const sectionsText = reportData.sections?.map((s: any, i: number) => `[${i + 1}] ${s.title}\n${s.content.replace(/<[^>]*>/g, '')}`).join('\n\n') || '';
      const { error } = await supabase.functions.invoke('send-concern-report', {
        body: { email: familyEmail, concernText: `${userInput.name}님의 프리미엄 분석 리포트`,
          analysis: { type: '프리미엄 종합 분석', severity: '정보', detailedAdvice: summaryText + '\n\n' + sectionsText.substring(0, 3000),
            recommendations: reportData.sections?.slice(0, 3).map((s: any) => s.title) || [], nextSteps: ['전문가 상담 예약', '정기적인 관찰 일지 작성', '발달 로드맵 따르기'], confidence: 95 } }
      });
      if (error) throw error;
      toast({ title: "✅ 이메일 전송 완료", description: `${familyEmail}로 리포트가 전송되었습니다.` });
      setFamilyEmail('');
    } catch (e: any) {
      toast({ title: "이메일 전송 실패", description: e?.message || "잠시 후 다시 시도해주세요.", variant: "destructive" });
    } finally { setIsSendingEmail(false); }
  };

  if (isLoadingData || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-purple-300 animate-spin mx-auto" />
          <p className="text-purple-200 text-lg font-semibold">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 뒤로가기 */}
        <Button onClick={() => navigate('/')} variant="outline" className="mb-6 border-purple-400/30 text-purple-200 hover:bg-purple-500/10">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> 뒤로가기
        </Button>

        {/* 프리미엄 헤더 */}
        <div className="text-center mb-12 space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 rounded-full border-2 border-amber-400/40 shadow-lg shadow-amber-500/20">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span className="text-base font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
              Premium Personal Report
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight">
            <span className="bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
              🐘 나만의 AI 종합 리포트
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-purple-100/90 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed">
            검사·관찰·상담 데이터를 <strong className="text-amber-300">9가지 전문 섹션</strong>으로 통합 분석하여
            <br className="hidden md:block" />
            <strong className="text-pink-300">임상 심리전문가 수준</strong>의 프리미엄 개인 리포트를 생성합니다
          </motion.p>

          {/* 프리미엄 상태 배지 */}
          {isLoggedIn && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              {isPremium ? (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-bold">
                  <Crown className="w-4 h-4 mr-2" /> 프리미엄 이용 중 · 무제한 생성 가능
                </Badge>
              ) : (
                <Badge variant="outline" className="border-purple-400/50 text-purple-300 px-4 py-2 text-sm">
                  <Lock className="w-4 h-4 mr-2" /> 프리미엄 구독 필요
                </Badge>
              )}
            </motion.div>
          )}
        </div>

        {/* 비로그인 또는 비구독자: 구독 유도 */}
        {(isLoggedIn === false || (isLoggedIn && !isPremium)) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mb-10">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 p-[2px]">
              <div className="relative bg-slate-900/95 rounded-2xl p-6 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
                <div className="relative text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    프리미엄 구독자 전용 서비스입니다
                  </h3>
                  <p className="text-purple-200/80 text-sm max-w-lg mx-auto">
                    30일 프리미엄 패스(₩29,900)를 구독하면 AI 종합 리포트, 심층 분석, PDF 다운로드 등 모든 기능을 <strong className="text-amber-300">무제한</strong>으로 이용할 수 있습니다.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    {isLoggedIn === false ? (
                      <>
                        <Button onClick={() => { localStorage.setItem('auth_redirect_after', '/report-generator'); navigate('/auth'); }}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg">
                          회원가입 / 로그인 <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => navigate('/token-subscription')}
                        className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg">
                        <Crown className="w-5 h-5 mr-2" /> 프리미엄 구독하기 <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    <Button onClick={() => setShowSampleReport(true)} variant="outline"
                      className="border-purple-400/50 text-purple-200 hover:bg-purple-900/50 px-8 py-3 rounded-xl">
                      <Eye className="w-5 h-5 mr-2" /> 샘플 리포트 미리보기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 샘플 리포트 미리보기 - 모든 사용자 접근 가능 */}
        <Dialog open={showSampleReport} onOpenChange={setShowSampleReport}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Crown className="w-7 h-7 text-amber-500" />
                프리미엄 리포트 샘플 미리보기
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* 커버 */}
              <div className="bg-gradient-to-br from-slate-800 via-purple-800 to-indigo-900 rounded-2xl p-8 text-center text-white space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black">AI 종합 발달·심리 분석 리포트</h2>
                <p className="text-purple-200">대상: 홍길동 (7세) · 생성일: 2025년 2월 6일</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30">검사 12건</Badge>
                  <Badge className="bg-green-500/20 text-green-200 border border-green-400/30">관찰 8건</Badge>
                  <Badge className="bg-pink-500/20 text-pink-200 border border-pink-400/30">상담 5건</Badge>
                </div>
              </div>

              {/* 9개 섹션 미리보기 */}
              {SAMPLE_REPORT_SECTIONS.map((section, idx) => {
                const IconComp = section.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="relative">
                    <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} shadow-md shrink-0`}>
                        <IconComp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">{idx + 1}. {section.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{section.preview}</p>
                        <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <p className="text-xs text-purple-600 italic">
                            ✨ 실제 리포트에서는 사용자 데이터에 기반한 구체적이고 개인화된 분석이 제공됩니다.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* 블러 오버레이 (하단 섹션) */}
                    {idx >= 4 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Lock className="w-6 h-6 text-purple-400 mx-auto" />
                          <p className="text-sm font-semibold text-purple-600">프리미엄 구독 시 전체 공개</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* 구독 CTA */}
              <div className="text-center py-6 space-y-4">
                <p className="text-slate-600 font-semibold">이 수준의 리포트를 직접 받아보세요</p>
                <Button onClick={() => { setShowSampleReport(false); navigate('/token-subscription'); }}
                  size="lg" className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg text-lg">
                  <Crown className="w-6 h-6 mr-2" /> 프리미엄 구독하고 내 리포트 받기
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 9개 섹션 미리보기 카드 (항상 표시) */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-purple-100">📊 리포트에 포함되는 9가지 전문 분석</h2>
            <p className="text-purple-300/70 text-sm mt-2">각 섹션을 클릭하면 샘플을 확인할 수 있습니다</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_REPORT_SECTIONS.map((section, idx) => {
              const IconComp = section.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  onClick={() => setShowSampleReport(true)}
                  className="cursor-pointer bg-slate-800/50 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 hover:border-purple-400/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <p className="text-sm font-semibold text-slate-200">{section.title}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <Button onClick={() => setShowSampleReport(true)} variant="outline" className="border-purple-400/30 text-purple-200 hover:bg-purple-900/30">
              <Eye className="w-4 h-4 mr-2" /> 전체 샘플 미리보기
            </Button>
          </div>
        </div>

        {/* 프리미엄 사용자: 리포트 생성 인터페이스 */}
        {isPremium && !reportData && (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* 사용자 입력 폼 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-amber-100">
                  <Sparkles className="w-7 h-7 text-yellow-400" />
                  리포트 대상자 정보 입력
                </CardTitle>
                <p className="text-sm text-amber-300/70 mt-2">💡 구체적일수록 더 정확한 분석이 가능합니다</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-purple-200 flex items-center gap-2"><Users className="w-4 h-4" /> 이름 *</label>
                    <input type="text" value={userInput.name} onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                      placeholder="예: 홍길동" className="w-full p-3 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500" maxLength={50} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-purple-200 flex items-center gap-2"><Calendar className="w-4 h-4" /> 생년월일 *</label>
                    <input type="date" value={userInput.birthDate} onChange={(e) => setUserInput({ ...userInput, birthDate: e.target.value })}
                      className="w-full p-3 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-purple-200 flex items-center gap-2"><Users className="w-4 h-4" /> 성별 *</label>
                    <select value={userInput.gender} onChange={(e) => setUserInput({ ...userInput, gender: e.target.value })}
                      className="w-full p-3 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="">선택하세요</option>
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-purple-200 flex items-center gap-2"><Heart className="w-4 h-4" /> 최근 고민이나 걱정거리</label>
                  <textarea value={userInput.recentConcerns} onChange={(e) => setUserInput({ ...userInput, recentConcerns: e.target.value })}
                    placeholder="예: 아이가 또래 친구들과 잘 어울리지 못하는 것 같아 걱정됩니다..."
                    className="w-full min-h-[100px] p-4 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" maxLength={1000} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-indigo-200 flex items-center gap-2"><Brain className="w-4 h-4" /> 관찰한 발달/심리적 특징이나 변화</label>
                  <textarea value={userInput.developmentalNotes} onChange={(e) => setUserInput({ ...userInput, developmentalNotes: e.target.value })}
                    placeholder="예: 최근 3개월간 언어 표현이 늘었지만, 감정 조절에 어려움을 보입니다..."
                    className="w-full min-h-[100px] p-4 bg-slate-800/50 border border-indigo-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" maxLength={1000} />
                </div>
              </CardContent>
            </Card>

            {/* 데이터 현황 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 border-2 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-purple-100">
                  <Database className="w-6 h-6 text-purple-400" /> 수집된 데이터 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: FileText, label: '검사 기록', count: userData?.totalAssessments || 0, color: 'blue' },
                    { icon: Eye, label: '관찰 기록', count: userData?.totalObservations || 0, color: 'green' },
                    { icon: BookOpen, label: '관찰 세션', count: userData?.totalObservationSessions || 0, color: 'purple' },
                    { icon: MessageSquare, label: '상담 메시지', count: userData?.totalChatMessages || 0, color: 'pink' },
                  ].map((item, idx) => (
                    <div key={idx} className={`bg-${item.color}-600/10 p-4 rounded-xl border border-${item.color}-400/20 text-center`}>
                      <item.icon className={`w-6 h-6 text-${item.color}-300 mx-auto mb-2`} />
                      <p className="text-2xl font-black text-white">{item.count}</p>
                      <p className="text-xs text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 외부 이미지 업로드 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 border-2 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Upload className="w-6 h-6 text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-100 mb-2">외부 기관 검사 결과 추가 (선택)</h4>
                    <p className="text-sm text-purple-300/80 mb-4">다른 기관에서 받은 검사 결과를 이미지로 업로드하면 AI가 자동으로 반영합니다</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={isAnalyzingImages}
                      className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer" />
                    {isAnalyzingImages && <div className="mt-3 flex items-center gap-2 text-purple-300"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">AI가 이미지를 분석 중...</span></div>}
                    {uploadedImages.length > 0 && !isAnalyzingImages && <div className="mt-3 flex items-center gap-2 text-emerald-300"><CheckCircle2 className="w-4 h-4" /><span className="text-sm">{uploadedImages.length}개의 이미지 분석 완료</span></div>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 생성 버튼 */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={generateReport} disabled={isGenerating} size="lg"
                className="w-full h-20 text-xl font-black bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 hover:from-amber-600 hover:via-purple-700 hover:to-pink-600 text-white rounded-2xl shadow-2xl shadow-purple-500/30 border-0">
                {isGenerating ? (
                  <><Loader2 className="w-8 h-8 animate-spin mr-3" /> AI 분석 중... ({progress}%)</>
                ) : (
                  <><Crown className="w-8 h-8 mr-3" /> 프리미엄 리포트 생성하기</>
                )}
              </Button>
            </motion.div>

            {isGenerating && (
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
            )}
          </div>
        )}

        {/* 리포트 결과 */}
        {reportData && (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* 액션 바 */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-2 border-amber-400/30">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={downloadPDF} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white gap-2">
                    <FileDown className="w-4 h-4" /> PDF 다운로드
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="border-purple-400/50 text-purple-200 hover:bg-purple-900/30 gap-2">
                    <Copy className="w-4 h-4" /> 복사
                  </Button>
                  <Button onClick={shareReport} variant="outline" className="border-purple-400/50 text-purple-200 hover:bg-purple-900/30 gap-2">
                    <Share2 className="w-4 h-4" /> 공유
                  </Button>
                  {/* 비주얼 노트 버튼 */}
                  <VisualSummaryButton
                    type="assessment"
                    content={{
                      sections: reportData.sections?.map((s: any) => ({ title: s.title, content: s.content?.replace(/<[^>]*>/g, '').substring(0, 200) })),
                      summary: reportData.summary?.replace(/<[^>]*>/g, ''),
                      userName: userInput.name,
                    }}
                    testType="종합 분석 리포트"
                    label="🎨 비주얼 노트"
                    className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white border-0"
                  />
                  <a href="https://open.kakao.com/o/sHLdK3Ch" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold gap-2">
                      <MessageSquare className="w-4 h-4" /> 카카오톡 전문가 검수
                    </Button>
                  </a>
                </div>
                {/* 이메일 전송 */}
                <div className="flex items-center gap-2 mt-4 max-w-md mx-auto">
                  <Mail className="w-5 h-5 text-purple-400 shrink-0" />
                  <input type="email" value={familyEmail} onChange={(e) => setFamilyEmail(e.target.value)}
                    placeholder="가족 이메일로 전송" className="flex-1 p-2 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white text-sm placeholder:text-slate-500" />
                  <Button onClick={sendFamilyEmail} disabled={isSendingEmail} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : '전송'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 리포트 본문 */}
            <div id="report-content" className="bg-white rounded-2xl p-6 md:p-12 shadow-2xl space-y-8">
              {/* 표지 */}
              <div className="text-center space-y-6 pb-8 border-b-4 border-slate-200">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700">PREMIUM PERSONAL REPORT</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">AI 종합 분석 리포트</h1>
                <div className="flex justify-center gap-4 flex-wrap text-sm text-slate-500">
                  <span>대상: {userInput.name || '미입력'}</span>
                  <span>생성일: {new Date().toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  <Badge variant="outline">검사 {reportData.dataSource?.assessments || 0}건</Badge>
                  <Badge variant="outline">관찰 {reportData.dataSource?.observations || 0}건</Badge>
                  <Badge variant="outline">상담 {reportData.dataSource?.chatMessages || 0}건</Badge>
                </div>
              </div>

              {/* 섹션들 */}
              {reportData.sections?.map((section: any, index: number) => {
                const colorIndex = index % sectionColors.length;
                const colors = sectionColors[colorIndex];
                const icons = [Brain, Heart, TrendingUp, Target, LineChart, Users, Shield, Activity, BarChart3];
                const IconComponent = icons[index % icons.length];
                return (
                  <div key={index} className="space-y-4">
                    <h3 className={`text-2xl font-bold flex items-center gap-3 ${colors.title}`}>
                      <div className={`p-3 rounded-xl ${colors.icon} shadow-sm`}><IconComponent className="w-6 h-6" /></div>
                      {index + 1}. {section.title}
                    </h3>
                    <div className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border} shadow-sm`}>
                      <div className="prose prose-slate max-w-none leading-relaxed prose-headings:font-bold prose-p:text-slate-700 prose-strong:text-slate-900"
                        dangerouslySetInnerHTML={{ __html: sanitizeAIContent(section.content) }} />
                    </div>
                  </div>
                );
              })}

              {/* 종합 요약 */}
              {reportData.summary && (
                <div className="space-y-6 pt-12 border-t-4 border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" /> 종합 요약 및 권장사항
                  </h2>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-xl border-2 border-slate-200">
                    <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeAIContent(reportData.summary) }} />
                  </div>
                </div>
              )}

              {/* 법적 고지 */}
              <div className="text-center pt-12 border-t-2 border-slate-200 space-y-4">
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" /><p className="text-sm font-semibold">중요 안내사항</p>
                </div>
                <p className="text-sm text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  본 리포트는 AI 기반 자동 분석 결과이며, 의학적 진단이나 전문가의 정확한 평가를 대체할 수 없습니다.
                  정확한 평가와 개입을 위해서는 반드시 전문가와의 상담을 권장드립니다.
                </p>
                <p className="text-xs text-slate-500 mt-4">Generated by 코끼리 AI | © 2025 All Rights Reserved</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ScratchCard isOpen={showScratchCard} onClose={() => setShowScratchCard(false)} />
    </div>
  );
};

export default ReportGenerator;
