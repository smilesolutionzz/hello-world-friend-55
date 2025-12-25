import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTokens } from '@/hooks/useTokens';
import { sanitizeAIContent } from '@/utils/sanitizeHtml';
import html2pdf from 'html2pdf.js';
import PerplexityDeepReport from '@/components/report/PerplexityDeepReport';
import {
  FileText,
  Download,
  Loader2,
  Sparkles,
  Brain,
  Heart,
  TrendingUp,
  Users,
  Target,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Award,
  BookOpen,
  LineChart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  Gift,
  Crown,
  Copy,
  Share2,
  Mail,
  FileDown
} from 'lucide-react';

const ReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  const [imageAnalysisResults, setImageAnalysisResults] = useState<string>('');
  const [selectedReportType, setSelectedReportType] = useState<'detailed' | 'expert'>('detailed');
  const [userInput, setUserInput] = useState({
    name: '',
    birthDate: '',
    gender: '',
    recentConcerns: '',
    developmentalNotes: ''
  });
  const [showDataDetails, setShowDataDetails] = useState({
    assessments: false,
    observations: false,
    observationSessions: false,
    chatMessages: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tokenBalance, consumeTokens, checkTokenAvailability } = useTokens();
  const [familyEmail, setFamilyEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const REPORT_TYPES = {
    detailed: { name: '상세 리포트', tokens: 76, price: '15,000원', description: '9개 전체 섹션 + 외부 이미지 분석' },
    expert: { name: '전문가급 분석', tokens: 253, price: '50,000원', description: '웹검색 기반 최신 연구 + 전문가급 심층 분석' }
  };

  // 사용자 데이터 불러오기
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "로그인 필요",
          description: "종합 리포트를 생성하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // 1. 검사 기록 가져오기 (user_id와 profile_id 모두 확인)
      const { data: assessments, error: assessError } = await supabase
        .from('assessments')
        .select('*')
        .or(`user_id.eq.${session.user.id},profile_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      // 2. 관찰일지 가져오기
      const { data: observations, error: obsError } = await supabase
        .from('observation_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      // 3. AI 상담 기록 가져오기
      const { data: chatRooms, error: chatError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_messages(*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      // 4. 관찰 세션 데이터도 가져오기
      const { data: observationSessions, error: sessionError } = await supabase
        .from('observation_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      // 5. 프로필 정보 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // 총 데이터 개수 계산
      const totalDataCount = 
        (assessments?.length || 0) + 
        (observations?.length || 0) + 
        (observationSessions?.length || 0) +
        (chatRooms?.reduce((acc: number, room: any) => 
          acc + (room.chat_messages?.length || 0), 0) || 0);

      setUserData({
        assessments: assessments || [],
        observations: observations || [],
        observationSessions: observationSessions || [],
        chatRooms: chatRooms || [],
        profile: profile || {},
        totalAssessments: assessments?.length || 0,
        totalObservations: observations?.length || 0,
        totalObservationSessions: observationSessions?.length || 0,
        totalChatMessages: chatRooms?.reduce((acc: number, room: any) => 
          acc + (room.chat_messages?.length || 0), 0) || 0,
        totalDataCount
      });

      console.log('사용자 데이터 로드 완료:', {
        assessments: assessments?.length,
        observations: observations?.length,
        observationSessions: observationSessions?.length,
        chatRooms: chatRooms?.length,
        totalDataCount
      });

    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast({
        title: "데이터 로드 실패",
        description: "사용자 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzingImages(true);
    toast({
      title: "이미지 분석 시작",
      description: "검사 이미지를 AI가 분석하고 있습니다...",
    });

    try {
      const imageUrls: string[] = [];
      
      // Convert images to base64
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        imageUrls.push(base64);
      }

      setUploadedImages(imageUrls);

      // Analyze images using the edge function
      const { data, error } = await supabase.functions.invoke('analyze-test-images', {
        body: { images: imageUrls }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.success === false) {
        // API 크레딧 부족 또는 기타 에러
        throw new Error(data.error || '이미지 분석에 실패했습니다.');
      }

      if (data?.analysis) {
        setImageAnalysisResults(data.analysis);
        toast({
          title: "✅ 이미지 분석 완료",
          description: "검사 결과가 리포트에 자동 반영됩니다.",
        });
      }
    } catch (error: any) {
      console.error('Image analysis error:', error);
      
      // 크레딧 부족 에러 체크
      const errorMessage = error?.message || error?.toString() || '';
      const isPaymentError = errorMessage.includes('payment_required') || 
                            errorMessage.includes('Not enough credits') ||
                            errorMessage.includes('크레딧');
      
      toast({
        title: isPaymentError ? "💳 Lovable AI 크레딧 부족" : "분석 실패",
        description: isPaymentError 
          ? "Lovable AI 크레딧이 부족합니다. 워크스페이스 설정에서 크레딧을 충전해주세요."
          : "이미지 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingImages(false);
    }
  };

  const generateComprehensiveReport = async () => {
    const minDataRequired = 30;
    const totalData = userData?.totalDataCount || 0;

    if (totalData < minDataRequired) {
      toast({
        title: "데이터 부족",
        description: `종합 리포트 생성을 위해서는 최소 ${minDataRequired}개의 데이터가 필요합니다. (현재: ${totalData}개)`,
        variant: "destructive"
      });
      return;
    }

    const requiredTokens = REPORT_TYPES[selectedReportType].tokens;

    // 토큰 확인
    if (!checkTokenAvailability(requiredTokens)) {
      toast({
        title: "토큰 부족",
        description: `${REPORT_TYPES[selectedReportType].name} 생성에는 ${requiredTokens}토큰이 필요합니다. 현재 잔액: ${tokenBalance?.current_tokens || 0}토큰`,
        variant: "destructive"
      });
      return;
    }

    // 개인정보 유효성 검사
    if (!userInput.name || !userInput.birthDate || !userInput.gender) {
      toast({
        title: "필수 정보 누락",
        description: "이름, 생년월일, 성별은 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      console.log('전문가급 리포트 생성 시작:', { reportType: selectedReportType, tokens: requiredTokens });

      toast({
        title: "🔬 전문가급 분석 시작",
        description: "실시간 웹 검색 + 최신 연구 기반 심층 분석을 진행합니다...",
      });

      // 새로운 전문가급 리포트 함수 호출
      const { data, error } = await supabase.functions.invoke('generate-expert-report', {
        body: {
          assessments: userData.assessments,
          observations: userData.observations,
          observationSessions: userData.observationSessions,
          chatRooms: userData.chatRooms,
          profile: userData.profile,
          externalTestImages: imageAnalysisResults,
          userInput: {
            name: userInput.name,
            birthDate: userInput.birthDate,
            gender: userInput.gender,
            recentConcerns: userInput.recentConcerns,
            developmentalNotes: userInput.developmentalNotes
          }
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('리포트 생성 에러:', error);
        throw error;
      }

      // 크레딧 부족 에러 체크
      if (data?.error === 'LOVABLE_AI_CREDITS_INSUFFICIENT') {
        toast({
          title: "💳 Lovable AI 크레딧 부족",
          description: data.message || "Lovable AI 크레딧이 부족합니다.",
          variant: "destructive"
        });
        return;
      }

      if (data?.success && data?.report) {
        // 토큰 차감
        const consumed = await consumeTokens(requiredTokens);
        if (!consumed) {
          toast({
            title: "토큰 차감 실패",
            description: "토큰 차감 중 오류가 발생했습니다.",
            variant: "destructive"
          });
          return;
        }

        setReportData({
          ...data.report,
          reportType: selectedReportType,
          tokensUsed: requiredTokens,
          generatedAt: new Date().toISOString(),
          dataSource: {
            assessments: userData.totalAssessments,
            observations: userData.totalObservations,
            observationSessions: userData.totalObservationSessions,
            chatMessages: userData.totalChatMessages,
            totalDataCount: userData.totalDataCount
          }
        });

        toast({
          title: `🎉 ${REPORT_TYPES[selectedReportType].name} 생성 완료!`,
          description: `${requiredTokens}토큰이 차감되었습니다. 세계 최고 수준의 분석 리포트가 생성되었습니다.`,
        });
      } else {
        throw new Error('리포트 데이터가 없습니다.');
      }
    } catch (error: any) {
      console.error('리포트 생성 오류:', error);
      
      const errorMessage = error?.message || error?.toString() || '';
      const isPaymentError = errorMessage.includes('402') || 
                            errorMessage.includes('payment_required') || 
                            errorMessage.includes('크레딧');
      
      toast({
        title: isPaymentError ? "💳 Lovable AI 크레딧 부족" : "생성 실패",
        description: isPaymentError 
          ? "Lovable AI 크레딧이 부족합니다."
          : "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };


  const downloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const opt = {
      margin: 15,
      filename: `전문가급분석_${userInput.name || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
    toast({ title: "📥 PDF 다운로드 시작", description: "리포트를 PDF로 다운로드합니다." });
  };

  const downloadTXT = () => {
    if (!reportData) return;
    
    let text = `전문가급 종합 분석 리포트\n${'='.repeat(50)}\n`;
    text += `대상: ${userInput.name || '미입력'}\n생성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
    
    reportData.sections?.forEach((s: any, i: number) => {
      text += `[${i + 1}] ${s.title}\n${'-'.repeat(40)}\n`;
      text += s.content.replace(/<[^>]*>/g, '').trim() + '\n\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `전문가급분석_${userInput.name || 'user'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "📄 TXT 다운로드 완료" });
  };

  const copyToClipboard = async () => {
    if (!reportData) return;
    let text = `전문가급 종합 분석 리포트\n대상: ${userInput.name}\n\n`;
    reportData.sections?.forEach((s: any, i: number) => {
      text += `${i + 1}. ${s.title}\n${s.content.replace(/<[^>]*>/g, '')}\n\n`;
    });
    await navigator.clipboard.writeText(text);
    toast({ title: "📋 클립보드에 복사됨" });
  };

  const shareReport = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '전문가급 종합 분석 리포트',
        text: `${userInput.name}님의 전문가급 분석 리포트`,
        url: window.location.href
      });
    } else {
      copyToClipboard();
    }
  };

  const sendFamilyEmail = async () => {
    if (!familyEmail || !reportData) {
      toast({ title: "이메일 주소를 입력해주세요", variant: "destructive" });
      return;
    }
    setIsSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-concern-report', {
        body: {
          email: familyEmail,
          subject: `[AIHPRO] ${userInput.name}님의 전문가급 분석 리포트`,
          reportSummary: reportData.summary?.replace(/<[^>]*>/g, '') || '',
          userName: userInput.name
        }
      });
      if (error) throw error;
      toast({ title: "✅ 이메일 전송 완료", description: `${familyEmail}로 리포트가 전송되었습니다.` });
      setFamilyEmail('');
    } catch (e) {
      toast({ title: "이메일 전송 실패", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-purple-300 animate-spin mx-auto" />
          <p className="text-purple-200 text-lg font-semibold">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 프리미엄 헤더 */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-full border-2 border-purple-400/40 shadow-lg shadow-purple-500/30">
            <Award className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-base font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
              Premium Comprehensive Report Generator
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 bg-clip-text text-transparent drop-shadow-2xl">
              AI 종합 리포트 생성
            </span>
          </h1>

          <p className="text-purple-100/90 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            플랫폼에 저장된 <strong className="text-pink-300">모든 검사·관찰·상담 데이터</strong>를 통합 분석하여<br />
            <strong className="text-purple-300">9가지 전문 섹션</strong>으로 구성된 프리미엄 종합 리포트를 자동 생성합니다
          </p>
        </div>

        {!reportData ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* 탭 네비게이션 */}
            <Tabs defaultValue="free" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 border border-purple-500/30 p-1 rounded-xl">
                <TabsTrigger 
                  value="free" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg py-3 text-base font-semibold"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  무료 AI 분석
                </TabsTrigger>
                <TabsTrigger 
                  value="premium" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg py-3 text-base font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  전문가급 분석
                </TabsTrigger>
              </TabsList>

              {/* 무료 분석 탭 */}
              <TabsContent value="free" className="mt-6 space-y-6">
                <div className="text-center p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
                  <p className="text-cyan-200 font-medium">
                    🎁 토큰 소모 없이 <strong>무료</strong>로 AI 심층 분석 리포트를 받아보세요!
                  </p>
                </div>

                {/* 간단 입력 폼 (무료용) */}
                <Card className="bg-gradient-to-br from-slate-900/90 to-cyan-900/40 border-2 border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl text-cyan-100">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      분석 정보 입력
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-cyan-200">이름</label>
                        <input
                          type="text"
                          value={userInput.name}
                          onChange={(e) => setUserInput({...userInput, name: e.target.value})}
                          placeholder="예: 홍길동"
                          className="w-full p-3 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-cyan-200">생년월일</label>
                        <input
                          type="date"
                          value={userInput.birthDate}
                          onChange={(e) => setUserInput({...userInput, birthDate: e.target.value})}
                          className="w-full p-3 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-cyan-200">성별</label>
                        <select
                          value={userInput.gender}
                          onChange={(e) => setUserInput({...userInput, gender: e.target.value})}
                          className="w-full p-3 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="">선택하세요</option>
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-cyan-200 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        고민이나 걱정거리
                      </label>
                      <textarea
                        value={userInput.recentConcerns}
                        onChange={(e) => setUserInput({...userInput, recentConcerns: e.target.value})}
                        placeholder="예: 아이가 또래 친구들과 잘 어울리지 못하는 것 같아 걱정됩니다..."
                        className="w-full min-h-[100px] p-4 bg-slate-800/50 border border-cyan-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        maxLength={1000}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 무료 Perplexity AI 심층 분석 섹션 */}
                <PerplexityDeepReport 
                  assessments={userData?.assessments || []}
                  userInput={userInput}
                />
              </TabsContent>

              {/* 전문가급 분석 탭 */}
              <TabsContent value="premium" className="mt-6 space-y-6">
                <div className="text-center p-4 bg-purple-500/10 border border-purple-400/30 rounded-xl">
                  <p className="text-purple-200 font-medium">
                    👑 축적된 모든 데이터를 통합 분석한 <strong>전문가급 프리미엄 리포트</strong>를 생성합니다
                  </p>
                </div>

                {/* 사용자 직접 입력 섹션 */}
                <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-indigo-100">
                      <Sparkles className="w-7 h-7 text-yellow-400" />
                      리포트 대상자 정보 및 추가 입력
                    </CardTitle>
                    <p className="text-sm text-indigo-300 mt-2">
                      💡 입력한 정보는 AI가 종합 리포트 생성 시 중요한 참고자료로 활용됩니다
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 개인정보 입력 */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          이름 *
                        </label>
                        <input
                          type="text"
                          value={userInput.name}
                          onChange={(e) => setUserInput({...userInput, name: e.target.value})}
                          placeholder="예: 홍길동"
                          className="w-full p-3 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          생년월일 *
                        </label>
                        <input
                          type="date"
                          value={userInput.birthDate}
                          onChange={(e) => setUserInput({...userInput, birthDate: e.target.value})}
                          className="w-full p-3 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          성별 *
                        </label>
                        <select
                          value={userInput.gender}
                          onChange={(e) => setUserInput({...userInput, gender: e.target.value})}
                          className="w-full p-3 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">선택하세요</option>
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>
                    </div>

                    {/* 최근 고민 입력 */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        최근 가장 큰 고민이나 걱정거리
                      </label>
                      <textarea
                        value={userInput.recentConcerns}
                        onChange={(e) => setUserInput({...userInput, recentConcerns: e.target.value})}
                        placeholder="예: 아이가 또래 친구들과 잘 어울리지 못하는 것 같아 걱정됩니다. 말수가 적고 혼자 노는 시간이 많습니다..."
                        className="w-full min-h-[120px] p-4 bg-slate-800/50 border border-purple-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        maxLength={1000}
                      />
                      <p className="text-xs text-slate-400 text-right">
                        {userInput.recentConcerns.length}/1000
                      </p>
                    </div>

                    {/* 발달/심리 소견 입력 */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        관찰한 발달/심리적 특징이나 변화
                      </label>
                      <textarea
                        value={userInput.developmentalNotes}
                        onChange={(e) => setUserInput({...userInput, developmentalNotes: e.target.value})}
                        placeholder="예: 최근 3개월간 언어 표현이 늘었지만, 감정 조절에 어려움을 보입니다. 작은 일에도 쉽게 좌절하고 울음을 터뜨립니다..."
                        className="w-full min-h-[120px] p-4 bg-slate-800/50 border border-indigo-400/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        maxLength={1000}
                      />
                      <p className="text-xs text-slate-400 text-right">
                        {userInput.developmentalNotes.length}/1000
                      </p>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                      <p className="text-xs text-blue-200">
                        💬 <strong>작성 팁:</strong> 구체적이고 상세할수록 정확한 분석이 가능합니다. 
                        언제부터 어떤 상황에서 어떤 행동이나 변화가 있었는지 자세히 적어주세요.
                      </p>
                    </div>
                  </CardContent>
                </Card>

            {/* 데이터 현황 카드 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-purple-100">
                  <Database className="w-7 h-7 text-purple-400" />
                  수집된 데이터 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  {/* 검사 기록 카드 */}
                  <Collapsible 
                    open={showDataDetails.assessments} 
                    onOpenChange={(open) => setShowDataDetails({...showDataDetails, assessments: open})}
                  >
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-6 rounded-xl border border-blue-400/30">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-8 h-8 text-blue-300" />
                        <p className="text-sm font-semibold text-blue-200">검사 기록</p>
                      </div>
                      <p className="text-4xl font-black text-white">{userData?.totalAssessments || 0}</p>
                      <p className="text-xs text-blue-300 mt-2">개의 심리/발달 검사</p>
                      
                      {(userData?.totalAssessments || 0) > 0 && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full mt-3 text-blue-200 hover:text-blue-100 hover:bg-blue-600/20">
                            <Eye className="w-4 h-4 mr-2" />
                            {showDataDetails.assessments ? '접기' : '자세히 보기'}
                            {showDataDetails.assessments ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                    
                    <CollapsibleContent className="mt-2">
                      <Card className="bg-slate-900/90 border-blue-400/30">
                        <CardContent className="p-4 max-h-60 overflow-y-auto space-y-2">
                          {userData?.assessments?.map((assessment: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-800/50 rounded border border-blue-400/20">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {new Date(assessment.created_at).toLocaleDateString('ko-KR')}
                                </Badge>
                                <Badge className={
                                  assessment.risk_level === 'high' ? 'bg-red-500' :
                                  assessment.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }>
                                  {assessment.risk_level || '미분류'}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-2">{assessment.analysis || '분석 내용 없음'}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 관찰 일지 카드 */}
                  <Collapsible 
                    open={showDataDetails.observations} 
                    onOpenChange={(open) => setShowDataDetails({...showDataDetails, observations: open})}
                  >
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 p-6 rounded-xl border border-emerald-400/30">
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-8 h-8 text-emerald-300" />
                        <p className="text-sm font-semibold text-emerald-200">관찰 일지</p>
                      </div>
                      <p className="text-4xl font-black text-white">{userData?.totalObservations || 0}</p>
                      <p className="text-xs text-emerald-300 mt-2">개의 행동 관찰 기록</p>
                      
                      {(userData?.totalObservations || 0) > 0 && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full mt-3 text-emerald-200 hover:text-emerald-100 hover:bg-emerald-600/20">
                            <Eye className="w-4 h-4 mr-2" />
                            {showDataDetails.observations ? '접기' : '자세히 보기'}
                            {showDataDetails.observations ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                    
                    <CollapsibleContent className="mt-2">
                      <Card className="bg-slate-900/90 border-emerald-400/30">
                        <CardContent className="p-4 max-h-60 overflow-y-auto space-y-2">
                          {userData?.observations?.map((obs: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-800/50 rounded border border-emerald-400/20">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {new Date(obs.created_at).toLocaleDateString('ko-KR')}
                                </Badge>
                                {obs.severity && (
                                  <Badge className={
                                    obs.severity === 'high' ? 'bg-red-500' :
                                    obs.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }>
                                    {obs.severity}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-emerald-200 mb-1">{obs.title || '제목 없음'}</p>
                              <p className="text-xs text-slate-300 line-clamp-2">{obs.description || '내용 없음'}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 관찰 세션 카드 */}
                  <Collapsible 
                    open={showDataDetails.observationSessions} 
                    onOpenChange={(open) => setShowDataDetails({...showDataDetails, observationSessions: open})}
                  >
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-6 rounded-xl border border-purple-400/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="w-8 h-8 text-purple-300" />
                        <p className="text-sm font-semibold text-purple-200">관찰 세션</p>
                      </div>
                      <p className="text-4xl font-black text-white">{userData?.totalObservationSessions || 0}</p>
                      <p className="text-xs text-purple-300 mt-2">개의 관찰 세션</p>
                      
                      {(userData?.totalObservationSessions || 0) > 0 && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full mt-3 text-purple-200 hover:text-purple-100 hover:bg-purple-600/20">
                            <Eye className="w-4 h-4 mr-2" />
                            {showDataDetails.observationSessions ? '접기' : '자세히 보기'}
                            {showDataDetails.observationSessions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                    
                    <CollapsibleContent className="mt-2">
                      <Card className="bg-slate-900/90 border-purple-400/30">
                        <CardContent className="p-4 max-h-60 overflow-y-auto space-y-2">
                          {userData?.observationSessions?.map((session: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-800/50 rounded border border-purple-400/20">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {new Date(session.created_at).toLocaleDateString('ko-KR')}
                                </Badge>
                                <Badge>{session.session_type || '세션'}</Badge>
                              </div>
                              {session.duration_minutes && (
                                <p className="text-xs text-purple-300 mb-1">소요 시간: {session.duration_minutes}분</p>
                              )}
                              <p className="text-xs text-slate-300 line-clamp-2">{session.summary || '요약 없음'}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* AI 상담 카드 */}
                  <Collapsible 
                    open={showDataDetails.chatMessages} 
                    onOpenChange={(open) => setShowDataDetails({...showDataDetails, chatMessages: open})}
                  >
                    <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 p-6 rounded-xl border border-pink-400/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="w-8 h-8 text-pink-300" />
                        <p className="text-sm font-semibold text-pink-200">AI 상담</p>
                      </div>
                      <p className="text-4xl font-black text-white">{userData?.totalChatMessages || 0}</p>
                      <p className="text-xs text-pink-300 mt-2">개의 상담 메시지</p>
                      
                      {(userData?.totalChatMessages || 0) > 0 && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full mt-3 text-pink-200 hover:text-pink-100 hover:bg-pink-600/20">
                            <Eye className="w-4 h-4 mr-2" />
                            {showDataDetails.chatMessages ? '접기' : '자세히 보기'}
                            {showDataDetails.chatMessages ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                    
                    <CollapsibleContent className="mt-2">
                      <Card className="bg-slate-900/90 border-pink-400/30">
                        <CardContent className="p-4 max-h-60 overflow-y-auto space-y-3">
                          {userData?.chatRooms?.map((room: any, roomIdx: number) => (
                            <div key={roomIdx} className="space-y-2">
                              <p className="text-sm font-semibold text-pink-200 border-b border-pink-400/30 pb-1">
                                채팅방 {roomIdx + 1} ({room.chat_messages?.length || 0}개 메시지)
                              </p>
                              {room.chat_messages?.slice(0, 3).map((msg: any, msgIdx: number) => (
                                <div key={msgIdx} className="p-2 bg-slate-800/50 rounded border border-pink-400/20">
                                  <Badge variant="outline" className="text-xs mb-1">
                                    {msg.role === 'user' ? '사용자' : 'AI'}
                                  </Badge>
                                  <p className="text-xs text-slate-300 line-clamp-2">{msg.content}</p>
                                </div>
                              ))}
                              {(room.chat_messages?.length || 0) > 3 && (
                                <p className="text-xs text-pink-400 text-center">
                                  +{room.chat_messages.length - 3}개 메시지 더 있음
                                </p>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* 총 데이터 개수 및 필요 개수 표시 */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-200">총 데이터 개수</p>
                      <p className="text-2xl font-black text-white mt-1">{userData?.totalDataCount || 0}개</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-pink-200">리포트 생성 필요 개수</p>
                      <p className="text-2xl font-black text-white mt-1">최소 30개</p>
                    </div>
                  </div>
                  {(userData?.totalDataCount || 0) < 30 && (
                    <div className="mt-3 p-3 bg-orange-500/10 border border-orange-400/30 rounded">
                      <p className="text-xs text-orange-300">
                        ⚠️ 종합 리포트 생성을 위해 {30 - (userData?.totalDataCount || 0)}개의 데이터가 더 필요합니다
                      </p>
                    </div>
                  )}
                </div>

                {(userData?.totalDataCount === 0) && (
                  <div className="mt-6 p-4 bg-orange-500/10 border border-orange-400/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-200">데이터가 부족합니다</p>
                        <p className="text-xs text-orange-300 mt-1">
                          종합 리포트 생성을 위해 먼저 검사를 진행하거나, 관찰일지를 작성하거나, AI 상담을 받아보세요.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 9가지 리포트 미리보기 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-indigo-100">
                  <Sparkles className="w-7 h-7 text-yellow-400" />
                  자동 생성되는 9가지 전문 리포트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { icon: Brain, label: '발달 종합 평가', color: 'from-blue-500 to-cyan-500' },
                    { icon: Heart, label: '심리 상태 분석', color: 'from-pink-500 to-rose-500' },
                    { icon: TrendingUp, label: '강점/약점 분석', color: 'from-green-500 to-emerald-500' },
                    { icon: Target, label: '맞춤 활동 제안', color: 'from-purple-500 to-violet-500' },
                    { icon: LineChart, label: '발달 로드맵', color: 'from-orange-500 to-amber-500' },
                    { icon: Users, label: '또래 비교 분석', color: 'from-indigo-500 to-blue-500' },
                    { icon: Shield, label: '전문가 소견서', color: 'from-teal-500 to-cyan-500' },
                    { icon: Activity, label: '가족 지원 가이드', color: 'from-fuchsia-500 to-pink-500' },
                    { icon: BarChart3, label: '종합 요약 및 제언', color: 'from-violet-500 to-purple-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-purple-400/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 외부 검사 이미지 업로드 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 border-2 border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Upload className="w-6 h-6 text-purple-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-100 mb-2">외부 기관 검사 결과 추가 (선택)</h4>
                        <p className="text-sm text-purple-300/80 mb-4">
                          다른 기관에서 받은 검사 결과를 이미지로 업로드하면 AI가 자동으로 분석하여 리포트에 반영합니다
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isAnalyzingImages}
                          className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                        />
                        {isAnalyzingImages && (
                          <div className="mt-3 flex items-center gap-2 text-purple-300">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">AI가 이미지를 분석하고 있습니다...</span>
                          </div>
                        )}
                        {uploadedImages.length > 0 && !isAnalyzingImages && (
                          <div className="mt-3 flex items-center gap-2 text-emerald-300">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm">{uploadedImages.length}개의 이미지 분석 완료</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* 리포트 타입 선택 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-indigo-100">
                  <Award className="w-7 h-7 text-yellow-400" />
                  리포트 타입 선택
                </CardTitle>
                <p className="text-sm text-indigo-300 mt-2">
                  필요에 맞는 리포트 타입을 선택하세요
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {(Object.keys(REPORT_TYPES) as Array<keyof typeof REPORT_TYPES>).map((type) => {
                    const report = REPORT_TYPES[type];
                    const isSelected = selectedReportType === type;
                    const hasEnoughTokens = (tokenBalance?.current_tokens || 0) >= report.tokens;
                    
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedReportType(type)}
                        disabled={!hasEnoughTokens}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                            : 'border-slate-700/50 bg-slate-800/50 hover:border-purple-400/50'
                        } ${!hasEnoughTokens ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white">{report.name}</h3>
                          {isSelected && <CheckCircle2 className="w-6 h-6 text-purple-400" />}
                        </div>
                        <p className="text-sm text-slate-300 mb-4">{report.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-black text-purple-300">{report.tokens} 토큰</div>
                            <div className="text-xs text-slate-400">{report.price}</div>
                          </div>
                          {!hasEnoughTokens && (
                            <Badge variant="destructive" className="text-xs">토큰 부족</Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* 현재 토큰 잔액 표시 */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-blue-200">현재 토큰 잔액</span>
                  </div>
                  <span className="text-2xl font-black text-white">{tokenBalance?.current_tokens || 0} 토큰</span>
                </div>
              </CardContent>
            </Card>

            {/* 생성 버튼 */}
            <Button
              onClick={generateComprehensiveReport}
              disabled={isGenerating || (userData?.totalDataCount || 0) < 30 || !checkTokenAvailability(REPORT_TYPES[selectedReportType].tokens)}
              size="lg"
              className="w-full h-20 text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white shadow-2xl shadow-purple-500/50 border-2 border-purple-400/30 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span>AI가 종합 분석 중...</span>
                  </div>
                  <div className="w-full max-w-md h-2 bg-purple-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-7 h-7 group-hover:animate-pulse" />
                  <span>{REPORT_TYPES[selectedReportType].name} 생성하기 ({REPORT_TYPES[selectedReportType].tokens} 토큰)</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            {/* 외부 검사 이미지 업로드 */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 border-2 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Upload className="w-6 h-6 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-100 mb-2">외부 기관 검사 결과 추가 (선택)</h4>
                      <p className="text-sm text-purple-300/80 mb-4">
                        다른 기관에서 받은 검사 결과를 이미지로 업로드하면 AI가 자동으로 분석하여 리포트에 반영합니다
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="test-image-upload"
                        disabled={isAnalyzingImages}
                      />
                      <label htmlFor="test-image-upload">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isAnalyzingImages}
                          className="cursor-pointer border-purple-400/50 text-purple-200 hover:bg-purple-900/50"
                          asChild
                        >
                          <span>
                            {isAnalyzingImages ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                AI 분석 중...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                이미지 업로드
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      {uploadedImages.length > 0 && (
                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                          <p className="text-sm font-semibold text-emerald-300">
                            ✓ {uploadedImages.length}개 이미지 업로드 완료
                          </p>
                          {imageAnalysisResults && (
                            <p className="text-xs text-emerald-400/80 mt-1">
                              AI 분석 완료 - 리포트 생성 시 자동 반영됩니다
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 안내 문구 */}
            <div className="text-center space-y-2">
              <p className="text-sm text-purple-300/80">
                💎 고급 AI 분석 엔진을 통해 최대 10페이지 분량의 전문 리포트가 생성됩니다
              </p>
              <p className="text-xs text-purple-400/60">
                생성 시간: 약 30초 ~ 1분 (데이터 양에 따라 다를 수 있습니다)
              </p>
            </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* 생성된 프리미엄 리포트 */
          <div className="space-y-8">
            {/* 액션 버튼 */}
            <div className="flex flex-wrap justify-between gap-4">
              <Button onClick={() => setReportData(null)} variant="outline" className="border-purple-400/50 text-purple-200 hover:bg-purple-900/50">
                <Sparkles className="w-4 h-4 mr-2" /> 새 리포트 생성
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button onClick={downloadPDF} className="bg-emerald-600 hover:bg-emerald-700"><Download className="w-4 h-4 mr-2" />PDF</Button>
                <Button onClick={downloadTXT} variant="outline" className="border-slate-400/50"><FileDown className="w-4 h-4 mr-2" />TXT</Button>
                <Button onClick={copyToClipboard} variant="outline" className="border-slate-400/50"><Copy className="w-4 h-4 mr-2" />복사</Button>
                <Button onClick={shareReport} variant="outline" className="border-slate-400/50"><Share2 className="w-4 h-4 mr-2" />공유</Button>
              </div>
            </div>

            {/* 가족 공유 (이메일) */}
            <Card className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <Mail className="w-6 h-6 text-pink-400" />
                  <span className="text-pink-200 font-semibold">가족에게 리포트 공유</span>
                  <input
                    type="email"
                    value={familyEmail}
                    onChange={(e) => setFamilyEmail(e.target.value)}
                    placeholder="family@email.com"
                    className="flex-1 p-2 bg-slate-800/50 border border-pink-400/30 rounded-lg text-white placeholder:text-slate-500"
                  />
                  <Button onClick={sendFamilyEmail} disabled={isSendingEmail} className="bg-pink-600 hover:bg-pink-700">
                    {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4 mr-2" />이메일 전송</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PDF 생성용 콘텐츠 */}
            <div id="report-content" className="bg-white p-12 rounded-2xl shadow-2xl space-y-10">
              {/* 리포트 표지 */}
              <div className="text-center space-y-6 pb-10 border-b-4 border-purple-200">
                <div className="w-full max-w-lg mx-auto h-80 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center space-y-6 p-10">
                    <Award className="w-20 h-20 text-yellow-300 mx-auto animate-pulse" />
                    <h2 className="text-4xl font-black text-white">종합 분석 리포트</h2>
                    <p className="text-lg text-purple-200">Premium Comprehensive Report</p>
                    <Badge className="text-base px-5 py-2 bg-yellow-400 text-purple-900 border-0">
                      9가지 전문 분석 포함
                    </Badge>
                  </div>
                </div>
                <h1 className="text-5xl font-black text-slate-900 mt-8">AI 종합 분석 리포트</h1>
                <div className="space-y-3 text-slate-700">
                  <p className="text-xl"><strong>이름:</strong> {userData?.profile?.display_name || '사용자'}</p>
                  <p className="text-lg"><strong>보고서 생성일:</strong> {new Date(reportData.generatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div className="flex items-center justify-center gap-6 text-sm text-slate-600 mt-4">
                    <span>📊 검사 {reportData.dataSource.assessments}건</span>
                    <span>📝 관찰 {reportData.dataSource.observations}건</span>
                    <span>💬 상담 {reportData.dataSource.chatMessages}건</span>
                  </div>
                </div>
              </div>

              {/* 9가지 전문 리포트 */}
              <div className="space-y-12">
                <h2 className="text-4xl font-black text-center text-slate-900 pt-10 border-t-4 border-slate-200">
                  9가지 전문 분석 섹션
                </h2>

                {/* 각 섹션은 reportData의 구조에 맞게 동적으로 렌더링 */}
                {reportData.sections && reportData.sections.map((section: any, index: number) => (
                  <div key={index} className="space-y-5">
                    <h3 className={`text-3xl font-bold flex items-center gap-3 ${
                      index % 3 === 0 ? 'text-blue-700' :
                      index % 3 === 1 ? 'text-purple-700' : 'text-emerald-700'
                    }`}>
                      <div className={`p-3 rounded-xl ${
                        index % 3 === 0 ? 'bg-blue-100' :
                        index % 3 === 1 ? 'bg-purple-100' : 'bg-emerald-100'
                      }`}>
                        {index === 0 && <Brain className="w-7 h-7" />}
                        {index === 1 && <Heart className="w-7 h-7" />}
                        {index === 2 && <TrendingUp className="w-7 h-7" />}
                        {index === 3 && <Target className="w-7 h-7" />}
                        {index === 4 && <LineChart className="w-7 h-7" />}
                        {index === 5 && <Users className="w-7 h-7" />}
                        {index === 6 && <Shield className="w-7 h-7" />}
                        {index === 7 && <Activity className="w-7 h-7" />}
                        {index === 8 && <BarChart3 className="w-7 h-7" />}
                      </div>
                      {index + 1}. {section.title}
                    </h3>
                    <div className={`p-8 rounded-xl border-2 ${
                      index % 3 === 0 ? 'bg-blue-50 border-blue-200' :
                      index % 3 === 1 ? 'bg-purple-50 border-purple-200' : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <div className="prose prose-lg max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: sanitizeAIContent(section.content) }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 종합 요약 */}
              {reportData.summary && (
                <div className="space-y-6 pt-12 border-t-4 border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    종합 요약 및 권장사항
                  </h2>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-xl border-2 border-slate-200">
                    <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeAIContent(reportData.summary) }} />
                    </div>
                  </div>
                </div>
              )}

              {/* 법적 고지 */}
              <div className="text-center pt-12 border-t-2 border-slate-200 space-y-4">
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-semibold">중요 안내사항</p>
                </div>
                <p className="text-sm text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  본 리포트는 AI 기반 자동 분석 결과이며, 의학적 진단이나 전문가의 정확한 평가를 대체할 수 없습니다.
                  정확한 평가와 개입을 위해서는 반드시 전문가와의 상담을 권장드립니다.
                </p>
                <p className="text-xs text-slate-500 mt-4">
                  Generated by AI HP Pro | © 2025 All Rights Reserved
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
