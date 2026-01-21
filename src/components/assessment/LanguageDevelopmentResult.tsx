import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Download, FileText, Crown, Baby, TrendingUp, 
  Copy, Loader2, BookOpen, MessageCircle, Brain, Sparkles,
  CheckCircle2, AlertTriangle, Info, Share2, Mail, Wallet, Lock
} from "lucide-react";
import { languageDevelopmentScoring } from "@/data/languageDevelopmentQuestions";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { RelatedTestRecommendations } from './RelatedTestRecommendations';
import { motion } from "framer-motion";
import ResultEmailShare from '@/components/share/ResultEmailShare';
import PremiumAnalysisLoading from '@/components/analysis/PremiumAnalysisLoading';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface LanguageDevelopmentResultProps {
  results: Record<string, number>;
  answers: Record<string, string>;
  onBack: () => void;
}

const LanguageDevelopmentResult = ({ results, answers, onBack }: LanguageDevelopmentResultProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showShareSection, setShowShareSection] = useState(false);
  const { toast } = useToast();

  const getScoreInterpretation = (score: number, category: 'receptive' | 'expressive' | 'total') => {
    const scoring = languageDevelopmentScoring[category];
    
    if (score >= scoring.excellent.min) return { 
      level: 'excellent', ...scoring.excellent, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30', 
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
      badge: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      icon: CheckCircle2,
      levelName: 'excellent'
    };
    if (score >= scoring.good.min) return { 
      level: 'good', ...scoring.good, 
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30', 
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
      badge: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      icon: CheckCircle2,
      levelName: 'good'
    };
    if (score >= scoring.average.min) return { 
      level: 'average', ...scoring.average, 
      color: 'text-amber-600 dark:text-amber-400', 
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', 
      borderColor: 'border-amber-200/50 dark:border-amber-800/50',
      badge: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      icon: Info,
      levelName: 'average'
    };
    return { 
      level: 'needsAttention', ...scoring.needsAttention, 
      color: 'text-rose-600 dark:text-rose-400', 
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30', 
      borderColor: 'border-rose-200/50 dark:border-rose-800/50',
      badge: 'bg-gradient-to-r from-rose-500 to-pink-500',
      icon: AlertTriangle,
      levelName: 'warning'
    };
  };

  const receptiveInterpretation = getScoreInterpretation(results.receptive, 'receptive');
  const expressiveInterpretation = getScoreInterpretation(results.expressive, 'expressive');
  const totalInterpretation = getScoreInterpretation(results.total, 'total');

  const barData = [
    { name: '수용언어', score: results.receptive_percentage, fill: 'url(#pinkGradient)' },
    { name: '표현언어', score: results.expressive_percentage, fill: 'url(#violetGradient)' }
  ];

  useEffect(() => {
    const generateAIAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('language-development-analyzer', {
          body: { results, answers, ageGroup: '영유아' }
        });

        if (error) throw error;
        setAiAnalysis(data.analysis);
      } catch (error) {
        console.error('AI 분석 실패:', error);
        setAiAnalysis(generateFallbackInterpretation());
      } finally {
        setIsAnalyzing(false);
      }
    };

    generateAIAnalysis();
  }, [results, answers]);

  const generateFallbackInterpretation = () => {
    const interpretations = [];
    
    if (receptiveInterpretation.level === 'excellent' && expressiveInterpretation.level === 'excellent') {
      interpretations.push("수용언어와 표현언어 모두 매우 우수한 발달 수준을 보이고 있습니다.");
    } else if (receptiveInterpretation.level === 'excellent') {
      interpretations.push("수용언어 발달이 특히 뛰어납니다. 언어 이해력이 또래보다 앞서 있어요.");
    } else if (expressiveInterpretation.level === 'excellent') {
      interpretations.push("표현언어 발달이 특히 뛰어납니다. 자신의 생각을 잘 표현하는 능력이 우수해요.");
    }

    if (Math.abs(results.receptive_percentage - results.expressive_percentage) > 20) {
      if (results.receptive_percentage > results.expressive_percentage) {
        interpretations.push("수용언어가 표현언어보다 더 발달되어 있습니다. 이해는 잘 하지만 표현에 더 많은 격려와 기회를 제공해주세요.");
      } else {
        interpretations.push("표현언어가 수용언어보다 더 발달되어 있습니다. 적극적으로 소통하려는 의지가 강해요.");
      }
    } else {
      interpretations.push("수용언어와 표현언어가 균형있게 발달하고 있습니다.");
    }

    if (totalInterpretation.level === 'needsAttention') {
      interpretations.push("언어발달을 위해 더 많은 관심과 자극이 필요합니다. 전문가 상담을 고려해보세요.");
    }

    return interpretations.join('\n\n');
  };

  const generateReportText = () => {
    const date = new Date().toLocaleDateString('ko-KR');
    return `
═══════════════════════════════════════════════════
     AIH 영유아 언어발달 검사 결과 리포트
═══════════════════════════════════════════════════

검사일: ${date}

───────────────────────────────────────────────────
📊 전체 언어발달 수준
───────────────────────────────────────────────────
• 총점: ${results.total}점 / 45점 (${results.total_percentage}%)
• 해석: ${totalInterpretation.description}

───────────────────────────────────────────────────
📋 영역별 상세 결과
───────────────────────────────────────────────────

[수용언어 - 언어 이해력]
• 점수: ${results.receptive}점 / 23점 (${results.receptive_percentage}%)
• 해석: ${receptiveInterpretation.description}

[표현언어 - 언어 표현력]  
• 점수: ${results.expressive}점 / 22점 (${results.expressive_percentage}%)
• 해석: ${expressiveInterpretation.description}

───────────────────────────────────────────────────
🤖 AI 전문가 분석
───────────────────────────────────────────────────
${aiAnalysis || generateFallbackInterpretation()}

───────────────────────────────────────────────────
💡 발달 촉진 권장사항
───────────────────────────────────────────────────

[수용언어 발달을 위해]
• 책을 읽어주며 그림 설명하기
• 일상에서 많은 대화하기
• 다양한 어휘로 말해주기
• 아이의 관심사에 맞춘 놀이

[표현언어 발달을 위해]
• 아이의 말에 충분한 반응 보이기
• 노래와 율동 함께 하기
• 아이가 말할 기회 많이 주기
• 표현을 격려하고 칭찬하기

═══════════════════════════════════════════════════
※ 본 검사는 참고용 자가체크이며, 전문적인 진단을 대체하지 않습니다.
※ 언어발달에 대한 우려가 있으시면 전문가 상담을 권장합니다.
═══════════════════════════════════════════════════
                    AIH - aihpro.com
`.trim();
  };

  const handleDownloadTXT = () => {
    setIsDownloading(true);
    try {
      const text = generateReportText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AIH_언어발달검사_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ title: "다운로드 완료", description: "검사 결과가 저장되었습니다." });
    } catch (error) {
      toast({ title: "다운로드 실패", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      toast({ title: "복사 완료", description: "검사 결과가 클립보드에 복사되었습니다." });
    } catch (error) {
      toast({ title: "복사 실패", variant: "destructive" });
    }
  };

  const StatusIcon = totalInterpretation.icon;

  // 이메일 공유용 데이터
  const shareContent = {
    summary: `전체 언어발달 점수: ${results.total}점 / 45점 (${results.total_percentage}%)\n\n${totalInterpretation.description}`,
    scores: {
      '전체 점수': results.total,
      '수용언어': results.receptive,
      '표현언어': results.expressive,
    },
    interpretation: aiAnalysis || generateFallbackInterpretation(),
    recommendations: [
      '책을 읽어주며 그림 설명하기',
      '일상에서 많은 대화하기',
      '아이의 말에 충분한 반응 보이기',
      '노래와 율동 함께 하기'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        
        {/* 헤더 */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 -mx-4 px-4 py-3 mb-6 md:relative md:bg-transparent md:border-0 md:backdrop-blur-none"
        >
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="h-9 px-2 md:px-4 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-sm font-medium">뒤로</span>
            </Button>
            
            <div className="flex items-center gap-1.5 md:gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy} 
                className="h-9 px-2 md:px-3 border-slate-200 dark:border-slate-700"
              >
                <Copy className="w-4 h-4 md:mr-1.5" />
                <span className="hidden md:inline">복사</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleDownloadTXT} 
                disabled={isDownloading} 
                className="h-9 px-2 md:px-3 bg-gradient-to-r from-primary to-primary/90"
              >
                <FileText className={`w-4 h-4 md:mr-1.5 ${isDownloading ? 'animate-pulse' : ''}`} />
                <span className="hidden md:inline">{isDownloading ? '저장 중...' : 'TXT'}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowShareSection(!showShareSection)} 
                className="h-9 px-2 md:px-3 border-slate-200 dark:border-slate-700"
              >
                <Share2 className="w-4 h-4 md:mr-1.5" />
                <span className="hidden md:inline">공유</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 md:mt-6 md:text-center">
            <div className="flex items-center gap-2.5 md:justify-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20">
                <Baby className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                언어발달 검사 결과
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              AIH 영유아 언어발달 자가체크
            </p>
          </div>
        </motion.header>

        {/* 공유 섹션 */}
        {showShareSection && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <ResultEmailShare
              title="영유아 언어발달 검사 결과"
              type="test_result"
              content={shareContent}
            />
          </motion.section>
        )}

        {/* 섹션 1: 전체 결과 요약 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className={`${totalInterpretation.bgColor} ${totalInterpretation.borderColor} border shadow-sm overflow-hidden`}>
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${totalInterpretation.badge} text-white shrink-0 shadow-lg`}>
                  <StatusIcon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">전체 언어발달 수준</p>
                  <div className="flex flex-wrap items-baseline gap-2 mb-3">
                    <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{results.total}</span>
                    <span className="text-sm md:text-base text-slate-500 dark:text-slate-400">/ 45점</span>
                    <Badge className={`${totalInterpretation.badge} text-white ml-auto md:ml-2`}>
                      {results.total_percentage}%
                    </Badge>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${results.total_percentage}%` }}
                      transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                      className={`h-full ${totalInterpretation.badge} rounded-full`}
                    />
                  </div>
                  <p className={`text-sm md:text-base font-semibold ${totalInterpretation.color}`}>
                    {totalInterpretation.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 섹션 2: 영역별 점수 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Brain className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <h2 className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">
              영역별 상세 결과
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 수용언어 */}
            <Card className={`${receptiveInterpretation.bgColor} ${receptiveInterpretation.borderColor} border shadow-sm`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-pink-500/10 dark:bg-pink-500/20 rounded-lg">
                    <BookOpen className="w-4 h-4 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">수용언어</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">언어 이해력</p>
                  </div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{results.receptive}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400"> / 23점</span>
                  </div>
                  <Badge className={`${receptiveInterpretation.badge} text-white text-xs`}>
                    {results.receptive_percentage}%
                  </Badge>
                </div>
                <div className="h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.receptive_percentage}%` }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  />
                </div>
                <p className={`text-xs ${receptiveInterpretation.color} font-medium`}>
                  {receptiveInterpretation.description}
                </p>
              </CardContent>
            </Card>

            {/* 표현언어 */}
            <Card className={`${expressiveInterpretation.bgColor} ${expressiveInterpretation.borderColor} border shadow-sm`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-violet-500/10 dark:bg-violet-500/20 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">표현언어</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">언어 표현력</p>
                  </div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{results.expressive}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400"> / 22점</span>
                  </div>
                  <Badge className={`${expressiveInterpretation.badge} text-white text-xs`}>
                    {results.expressive_percentage}%
                  </Badge>
                </div>
                <div className="h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.expressive_percentage}%` }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  />
                </div>
                <p className={`text-xs ${expressiveInterpretation.color} font-medium`}>
                  {expressiveInterpretation.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* 섹션 3: 차트 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-slate-900 dark:text-white">언어 영역별 발달률</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <defs>
                    <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                    <linearGradient id="violetGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" fontSize={12} width={60} stroke="#64748b" />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '발달률']} 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      background: 'white'
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={28}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.section>

        {/* 섹션 4: AI 분석 - 프리미엄 스타일 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border-2 border-violet-200 dark:border-violet-700/50 shadow-lg overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white font-bold">🧠 AI 전문가 심층 분석</span>
                  <p className="text-sm text-violet-600 dark:text-violet-400 font-normal mt-0.5">
                    25년 경력 언어치료학 박사 수준의 상세 분석 리포트
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Brain className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-violet-300 dark:border-violet-600 border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-medium text-violet-700 dark:text-violet-300">
                      AI가 심층 분석 중입니다...
                    </p>
                    <p className="text-sm text-violet-500 dark:text-violet-400 mt-1">
                      3000자 이상의 상세한 전문가 분석을 생성하고 있습니다
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-violet-100 dark:border-violet-800/30 shadow-inner">
                  <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
                    {aiAnalysis || generateFallbackInterpretation()}
                  </p>
                  <div className="mt-4 pt-4 border-t border-violet-100 dark:border-violet-800/30 flex items-center justify-between text-xs text-violet-500 dark:text-violet-400">
                    <span>📝 분석 글자 수: {(aiAnalysis || generateFallbackInterpretation()).length}자</span>
                    <span>🤖 Powered by Advanced AI</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* 섹션 5: 발달 촉진 권장사항 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Card className="bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base md:text-lg">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Crown className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                </div>
                <span className="text-slate-900 dark:text-white font-semibold">발달 촉진 권장사항</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-xl p-4 md:p-5 border border-pink-200/30 dark:border-pink-800/30">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-pink-500/10 dark:bg-pink-500/20">
                      <BookOpen className="w-4 h-4 text-pink-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-pink-700 dark:text-pink-300">수용언어 발달을 위해</h4>
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5 shrink-0">•</span>
                      책을 읽어주며 그림 설명하기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5 shrink-0">•</span>
                      일상에서 많은 대화하기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5 shrink-0">•</span>
                      다양한 어휘로 말해주기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5 shrink-0">•</span>
                      아이의 관심사에 맞춘 놀이
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl p-4 md:p-5 border border-violet-200/30 dark:border-violet-800/30">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
                      <MessageCircle className="w-4 h-4 text-violet-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300">표현언어 발달을 위해</h4>
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                      아이의 말에 충분한 반응 보이기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                      노래와 율동 함께 하기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                      아이가 말할 기회 많이 주기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                      표현을 격려하고 칭찬하기
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 섹션 6: 전문가 상담 & 연관 검사 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <ExpertConsultationNotice />
          <RelatedTestRecommendations currentTestType="language-development" />
          
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50 shadow-sm">
            <CardContent className="p-4 md:p-5 text-center">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 w-fit mx-auto mb-2">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                언어발달에 대한 우려가 있으시거나 더 자세한 평가가 필요하시다면,
                언어치료사나 소아과 전문의와 상담받으시기를 권장합니다.
              </p>
              <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 mt-2">
                ※ 본 체크는 참고용 자가체크이며, 전문적인 진단을 대체하지 않습니다.
              </p>
            </CardContent>
          </Card>
        </motion.section>

      </div>
    </div>
  );
};

export default LanguageDevelopmentResult;
