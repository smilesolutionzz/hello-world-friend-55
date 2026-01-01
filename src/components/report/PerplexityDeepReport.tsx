import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import {
  Sparkles,
  Brain,
  Search,
  FileText,
  Download,
  Loader2,
  ExternalLink,
  BookOpen,
  Target,
  Calendar,
  Home,
  Stethoscope,
  TrendingUp,
  Library,
  CheckCircle2,
  Zap,
  Copy,
  Share2,
  FileDown,
  Lock,
  UserPlus,
  LogIn
} from 'lucide-react';

interface PerplexityDeepReportProps {
  assessments: any[];
  userInput: {
    name: string;
    birthDate: string;
    gender: string;
    recentConcerns: string;
    developmentalNotes: string;
  };
}

const sectionIcons: Record<string, React.ReactNode> = {
  '종합 진단 요약': <FileText className="w-5 h-5" />,
  '심층 분석 결과': <Brain className="w-5 h-5" />,
  '최신 연구/논문 기반 인사이트': <BookOpen className="w-5 h-5" />,
  '맞춤형 개입 전략': <Target className="w-5 h-5" />,
  '단계별 발달 로드맵': <Calendar className="w-5 h-5" />,
  '가정 내 실천 가이드': <Home className="w-5 h-5" />,
  '전문가 상담 필요성 평가': <Stethoscope className="w-5 h-5" />,
  '예후 및 발달 예측': <TrendingUp className="w-5 h-5" />,
  '추천 자료 및 리소스': <Library className="w-5 h-5" />
};

// 마크다운 스타일(**bold**, *italic*, etc.)을 깔끔한 텍스트로 변환
const cleanMarkdownText = (text: string): string => {
  if (!text) return '';
  
  return text
    // **bold** 또는 __bold__ 제거
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // *italic* 또는 _italic_ 제거
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // # 헤더 마크다운 제거 (줄 시작 부분만)
    .replace(/^#{1,6}\s+/gm, '')
    // 불필요한 연속 줄바꿈 정리
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const PerplexityDeepReport: React.FC<PerplexityDeepReportProps> = ({
  assessments,
  userInput
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);
  const generateDeepReport = async () => {
    if (!userInput.recentConcerns && assessments.length === 0) {
      toast({
        title: "입력 필요",
        description: "고민을 입력하거나 검사 기록이 있어야 리포트를 생성할 수 있습니다.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 8, 90));
    }, 500);

    try {
      toast({
        title: "🔍 AIHPRO AI 분석 시작",
        description: "실시간 웹 검색 및 최신 연구 기반 분석 중...",
      });

      const { data, error } = await supabase.functions.invoke('perplexity-deep-report', {
        body: {
          assessments,
          concerns: userInput.recentConcerns,
          additionalContext: userInput.developmentalNotes,
          userInput
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data?.success) {
        setReportData(data.report);
        toast({
          title: "✅ 고도화 리포트 생성 완료!",
          description: "9가지 섹션의 심층 분석 리포트가 생성되었습니다.",
        });
      } else {
        throw new Error(data?.error || '리포트 생성 실패');
      }
    } catch (error: any) {
      console.error('Deep report error:', error);
      toast({
        title: "생성 실패",
        description: error.message || "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('aihpro-report-content');
    if (!element) return;

    const opt = {
      margin: 15,
      filename: `AIHPRO_심층분석_${userInput.name || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();

    toast({
      title: "📥 PDF 다운로드",
      description: "리포트가 PDF로 다운로드됩니다.",
    });
  };

  const downloadTXT = () => {
    if (!reportData) return;

    let textContent = `AIHPRO AI 심층 분석 리포트\n`;
    textContent += `${'='.repeat(50)}\n\n`;
    textContent += `대상: ${userInput.name || '미입력'}\n`;
    textContent += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
    textContent += `${'='.repeat(50)}\n\n`;

    Object.entries(reportData.sections || {}).forEach(([title, content], idx) => {
      textContent += `[${idx + 1}] ${title}\n`;
      textContent += `${'-'.repeat(40)}\n`;
      textContent += `${cleanMarkdownText(String(content))}\n\n`;
    });

    if (reportData.citations?.length > 0) {
      textContent += `\n${'='.repeat(50)}\n`;
      textContent += `참고 출처\n`;
      textContent += `${'-'.repeat(40)}\n`;
      reportData.citations.forEach((citation: string, idx: number) => {
        textContent += `${idx + 1}. ${citation}\n`;
      });
    }

    textContent += `\n${'='.repeat(50)}\n`;
    textContent += `※ 본 리포트는 참고용이며 의학적 진단이 아닙니다.\n`;
    textContent += `© ${new Date().getFullYear()} AIHPRO.COM. All rights reserved.\n`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIHPRO_심층분석_${userInput.name || 'user'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📄 TXT 다운로드",
      description: "리포트가 텍스트 파일로 다운로드됩니다.",
    });
  };

  const copyToClipboard = async () => {
    if (!reportData) return;

    let textContent = `AIHPRO AI 심층 분석 리포트\n\n`;
    textContent += `대상: ${userInput.name || '미입력'}\n`;
    textContent += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;

    Object.entries(reportData.sections || {}).forEach(([title, content], idx) => {
      textContent += `${idx + 1}. ${title}\n`;
      textContent += `${cleanMarkdownText(String(content))}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(textContent);
      toast({
        title: "📋 복사 완료",
        description: "리포트 내용이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const shareReport = async () => {
    if (!reportData) return;

    const shareText = `AIHPRO AI 심층 분석 리포트 - ${userInput.name || '사용자'}님의 분석 결과입니다.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AIHPRO AI 심층 분석 리포트',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const handleSignup = () => {
    localStorage.setItem('redirectAfterAuth', '/report-generator');
    navigate('/auth?mode=signup');
  };

  const handleLogin = () => {
    localStorage.setItem('redirectAfterAuth', '/report-generator');
    navigate('/auth');
  };

  if (reportData) {
    const sections = Object.entries(reportData.sections || {});
    const totalSections = sections.length;
    const visibleSections = isAuthenticated ? totalSections : Math.ceil(totalSections / 2); // 비로그인: 절반만 표시

    return (
      <div className="space-y-6">
        {/* 리포트 헤더 */}
        <Card className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-2 border-cyan-400/30">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Sparkles className="w-8 h-8 text-cyan-300" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-cyan-100">
                    AIHPRO AI 심층 분석 리포트
                  </CardTitle>
                  <p className="text-sm text-cyan-300 mt-1">
                    실시간 웹 검색 + 최신 연구 기반 분석
                  </p>
                </div>
              </div>
              
              {/* 다운로드/공유 버튼들 - 로그인 사용자만 */}
              {isAuthenticated && (
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={downloadPDF}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    onClick={downloadTXT}
                    variant="outline"
                    className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-600/20"
                    size="sm"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    TXT
                  </Button>
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline"
                    className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-600/20"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </Button>
                  <Button 
                    onClick={shareReport}
                    variant="outline"
                    className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-600/20"
                    size="sm"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    공유
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* 리포트 내용 */}
        <div className="relative">
          <div id="aihpro-report-content" className="space-y-4 bg-white text-gray-900 p-8 rounded-xl">
            <div className="text-center border-b pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                종합 발달 심리 분석 리포트
              </h1>
              <p className="text-gray-600">
                대상: {userInput.name || '미입력'} | 생성일: {new Date().toLocaleDateString('ko-KR')}
              </p>
              <Badge className="mt-2 bg-cyan-100 text-cyan-800">
                AIHPRO AI 기반 심층 분석
              </Badge>
            </div>

            {/* 각 섹션 렌더링 */}
            {sections.map(([title, content], idx) => (
              <div key={idx} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600">
                    {sectionIcons[title] || <CheckCircle2 className="w-5 h-5" />}
                  </span>
                  {idx + 1}. {title}
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed pl-10">
                  {cleanMarkdownText(String(content)).split('\n').map((paragraph, pIdx) => (
                    paragraph.trim() && (
                      <p key={pIdx} className="mb-3 text-gray-700">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>
            ))}

            {/* 인용 출처 - 로그인 사용자만 */}
            {isAuthenticated && reportData.citations?.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📚</span> 참고 출처
                </h3>
                <ul className="space-y-2 pl-2">
                  {reportData.citations.map((citation: string, idx: number) => (
                    <li key={idx} className="text-sm text-blue-600 hover:underline">
                      <a href={citation} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="break-all">{citation}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 면책 조항 */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                ※ 본 리포트는 참고용이며 의학적 진단이 아닙니다. 정확한 진단과 치료를 위해서는 전문의와 상담하시기 바랍니다.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                © {new Date().getFullYear()} AIHPRO.COM. All rights reserved.
              </p>
            </div>
          </div>

          {/* 비로그인 사용자용 블러 오버레이 */}
          {!isAuthenticated && (
            <>
              {/* 블러 오버레이 - 하단 55% 부분 */}
              <div className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none rounded-b-xl overflow-hidden">
                {/* 그라데이션 페이드 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white" />
                
                {/* 블러 효과 */}
                <div className="absolute inset-0 backdrop-blur-md" />
              </div>
              
              {/* 가입 유도 CTA */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8 pointer-events-auto">
                <div className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 p-6 md:p-8 rounded-2xl shadow-2xl shadow-purple-500/30 border-2 border-purple-400/40 max-w-lg mx-4 backdrop-blur-xl">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-full">
                      <Lock className="w-7 h-7 text-purple-300" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        나머지 {totalSections - visibleSections}개 섹션을 확인하세요
                      </h3>
                      <p className="text-purple-200 text-sm leading-relaxed">
                        무료 회원가입 후 전체 분석 결과를 저장하고<br />
                        언제든지 다시 확인할 수 있습니다
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-emerald-300">
                        <Sparkles className="w-4 h-4" />
                        <span>무료 가입</span>
                      </div>
                      <div className="w-1 h-1 bg-purple-400 rounded-full" />
                      <div className="flex items-center gap-2 text-xs text-emerald-300">
                        <span>결과 저장</span>
                      </div>
                      <div className="w-1 h-1 bg-purple-400 rounded-full" />
                      <div className="flex items-center gap-2 text-xs text-emerald-300">
                        <span>PDF 다운로드</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleSignup}
                        size="lg"
                        className="flex-1 h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        무료 회원가입
                      </Button>
                      <Button
                        onClick={handleLogin}
                        variant="outline"
                        size="lg"
                        className="flex-1 h-11 border-purple-400/50 text-purple-200 hover:bg-purple-900/50"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        로그인
                      </Button>
                    </div>

                    <p className="text-xs text-purple-300/70">
                      이미 계정이 있으신가요? 로그인하면 이 결과가 자동 저장됩니다
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* 새 리포트 생성 버튼 */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setReportData(null)}
            className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-600/20"
          >
            새 리포트 생성하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl">
            <Search className="w-8 h-8 text-cyan-300" />
          </div>
          <div>
            <CardTitle className="text-2xl text-cyan-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              무료 AIHPRO AI 심층 분석
            </CardTitle>
            <p className="text-sm text-cyan-300 mt-1">
              실시간 웹 크롤링 + 최신 연구/논문 기반 고도화 리포트
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기능 소개 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-400/20">
            <Search className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-sm font-semibold text-cyan-200">실시간 웹 검색</p>
            <p className="text-xs text-cyan-300/80 mt-1">최신 연구/논문 자동 수집</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
            <Brain className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-sm font-semibold text-blue-200">AI 심층 분석</p>
            <p className="text-xs text-blue-300/80 mt-1">9가지 전문 섹션 리포트</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
            <Zap className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-sm font-semibold text-purple-200">무료 제공</p>
            <p className="text-xs text-purple-300/80 mt-1">캐시 차감 없음</p>
          </div>
        </div>

        {/* 9가지 섹션 미리보기 */}
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
          <p className="text-sm font-semibold text-white mb-3">📋 생성되는 9가지 섹션</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(sectionIcons).map(([title, icon], idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400">{icon}</span>
                <span>{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 생성 버튼 */}
        <Button
          onClick={generateDeepReport}
          disabled={isGenerating}
          className="w-full py-6 text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AIHPRO AI 분석 중... ({progress}%)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              무료로 심층 분석 리포트 생성하기
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerplexityDeepReport;
