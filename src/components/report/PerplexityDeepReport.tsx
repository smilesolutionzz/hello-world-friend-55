import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  Zap
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

const PerplexityDeepReport: React.FC<PerplexityDeepReportProps> = ({
  assessments,
  userInput
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

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
        title: "🔍 Perplexity AI 분석 시작",
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
    const element = document.getElementById('perplexity-report-content');
    if (!element) return;

    const opt = {
      margin: 15,
      filename: `심층분석_리포트_${userInput.name || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();

    toast({
      title: "📥 PDF 다운로드",
      description: "리포트가 다운로드됩니다.",
    });
  };

  if (reportData) {
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
                    Perplexity AI 심층 분석 리포트
                  </CardTitle>
                  <p className="text-sm text-cyan-300 mt-1">
                    실시간 웹 검색 + 최신 연구 기반 분석
                  </p>
                </div>
              </div>
              <Button 
                onClick={downloadPDF}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 리포트 내용 */}
        <div id="perplexity-report-content" className="space-y-4 bg-white text-gray-900 p-8 rounded-xl">
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              종합 발달 심리 분석 리포트
            </h1>
            <p className="text-gray-600">
              대상: {userInput.name || '미입력'} | 생성일: {new Date().toLocaleDateString('ko-KR')}
            </p>
            <Badge className="mt-2 bg-cyan-100 text-cyan-800">
              Perplexity AI 기반 심층 분석
            </Badge>
          </div>

          {/* 각 섹션 렌더링 */}
          {Object.entries(reportData.sections || {}).map(([title, content], idx) => (
            <div key={idx} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-cyan-600">{sectionIcons[title] || <CheckCircle2 className="w-5 h-5" />}</span>
                {idx + 1}. {title}
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {String(content)}
              </div>
            </div>
          ))}

          {/* 인용 출처 */}
          {reportData.citations?.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📚 참고 출처</h3>
              <ul className="space-y-2">
                {reportData.citations.map((citation: string, idx: number) => (
                  <li key={idx} className="text-sm text-blue-600 hover:underline">
                    <a href={citation} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {citation}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
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
              무료 Perplexity AI 심층 분석
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
            <p className="text-xs text-purple-300/80 mt-1">토큰 차감 없음</p>
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
              Perplexity AI 분석 중... ({progress}%)
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
