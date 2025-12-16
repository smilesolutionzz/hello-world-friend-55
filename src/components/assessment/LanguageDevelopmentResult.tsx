import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Download, FileText, Crown, Baby, TrendingUp, 
  Copy, Loader2, BookOpen, MessageCircle, Brain, Sparkles,
  CheckCircle2, AlertTriangle, Info
} from "lucide-react";
import { languageDevelopmentScoring } from "@/data/languageDevelopmentQuestions";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { RelatedTestRecommendations } from './RelatedTestRecommendations';
import { motion } from "framer-motion";

interface LanguageDevelopmentResultProps {
  results: Record<string, number>;
  answers: Record<string, string>;
  onBack: () => void;
}

const LanguageDevelopmentResult = ({ results, answers, onBack }: LanguageDevelopmentResultProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { toast } = useToast();

  const getScoreInterpretation = (score: number, category: 'receptive' | 'expressive' | 'total') => {
    const scoring = languageDevelopmentScoring[category];
    
    if (score >= scoring.excellent.min) return { 
      level: 'excellent', ...scoring.excellent, 
      color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', 
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-500',
      icon: CheckCircle2
    };
    if (score >= scoring.good.min) return { 
      level: 'good', ...scoring.good, 
      color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', 
      borderColor: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-500',
      icon: CheckCircle2
    };
    if (score >= scoring.average.min) return { 
      level: 'average', ...scoring.average, 
      color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30', 
      borderColor: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-500',
      icon: Info
    };
    return { 
      level: 'needsAttention', ...scoring.needsAttention, 
      color: 'text-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-950/30', 
      borderColor: 'border-rose-200 dark:border-rose-800',
      badge: 'bg-rose-500',
      icon: AlertTriangle
    };
  };

  const receptiveInterpretation = getScoreInterpretation(results.receptive, 'receptive');
  const expressiveInterpretation = getScoreInterpretation(results.expressive, 'expressive');
  const totalInterpretation = getScoreInterpretation(results.total, 'total');

  const barData = [
    { name: '수용언어', score: results.receptive_percentage, fill: '#f472b6' },
    { name: '표현언어', score: results.expressive_percentage, fill: '#a78bfa' }
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

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        
        {/* 헤더 - 모바일 최적화 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 -mx-4 px-4 py-3 mb-4 md:relative md:bg-transparent md:border-0 md:mb-6"
        >
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-9 px-2 md:px-4">
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-sm">뒤로</span>
            </Button>
            
            <div className="flex items-center gap-1.5 md:gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 px-2 md:px-3">
                <Copy className="w-4 h-4 md:mr-1.5" />
                <span className="hidden md:inline">복사</span>
              </Button>
              <Button variant="default" size="sm" onClick={handleDownloadTXT} disabled={isDownloading} className="h-9 px-2 md:px-3">
                <FileText className={`w-4 h-4 md:mr-1.5 ${isDownloading ? 'animate-pulse' : ''}`} />
                <span className="hidden md:inline">TXT</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-3 md:mt-4 md:text-center">
            <div className="flex items-center gap-2 md:justify-center">
              <Baby className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
              <h1 className="text-lg md:text-2xl font-bold text-foreground">언어발달 검사 결과</h1>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">AIH 영유아 언어발달 자가체크</p>
          </div>
        </motion.div>

        {/* 섹션 1: 전체 결과 요약 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className={`${totalInterpretation.bgColor} ${totalInterpretation.borderColor} border-2 overflow-hidden`}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${totalInterpretation.badge} text-white shrink-0`}>
                  <StatusIcon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">전체 언어발달 수준</p>
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <span className="text-2xl md:text-4xl font-bold text-foreground">{results.total}</span>
                    <span className="text-sm md:text-base text-muted-foreground">/ 45점</span>
                    <Badge className={`${totalInterpretation.badge} text-white ml-auto md:ml-2`}>
                      {results.total_percentage}%
                    </Badge>
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
          <h2 className="text-sm md:text-base font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            영역별 상세 결과
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* 수용언어 */}
            <Card className={`${receptiveInterpretation.bgColor} ${receptiveInterpretation.borderColor} border`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <BookOpen className="w-4 h-4 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">수용언어</h3>
                    <p className="text-[10px] text-muted-foreground">언어 이해력</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-foreground">{results.receptive}</span>
                    <span className="text-sm text-muted-foreground"> / 23점</span>
                  </div>
                  <Badge className={`${receptiveInterpretation.badge} text-white text-xs`}>
                    {results.receptive_percentage}%
                  </Badge>
                </div>
                <p className={`text-xs mt-2 ${receptiveInterpretation.color} font-medium`}>
                  {receptiveInterpretation.description}
                </p>
              </CardContent>
            </Card>

            {/* 표현언어 */}
            <Card className={`${expressiveInterpretation.bgColor} ${expressiveInterpretation.borderColor} border`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">표현언어</h3>
                    <p className="text-[10px] text-muted-foreground">언어 표현력</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-foreground">{results.expressive}</span>
                    <span className="text-sm text-muted-foreground"> / 22점</span>
                  </div>
                  <Badge className={`${expressiveInterpretation.badge} text-white text-xs`}>
                    {results.expressive_percentage}%
                  </Badge>
                </div>
                <p className={`text-xs mt-2 ${expressiveInterpretation.color} font-medium`}>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                언어 영역별 발달률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} />
                  <YAxis type="category" dataKey="name" fontSize={12} width={60} />
                  <Tooltip formatter={(value: number) => [`${value}%`, '발달률']} />
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

        {/* 섹션 4: AI 분석 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI 전문가 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">AI가 분석 중입니다...</span>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                    {aiAnalysis || generateFallbackInterpretation()}
                  </p>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                발달 촉진 권장사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-pink-50 dark:bg-pink-950/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-pink-500" />
                    <h4 className="text-sm font-semibold text-pink-700 dark:text-pink-400">수용언어 발달을 위해</h4>
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-0.5">•</span>
                      책을 읽어주며 그림 설명하기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-0.5">•</span>
                      일상에서 많은 대화하기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-0.5">•</span>
                      다양한 어휘로 말해주기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-0.5">•</span>
                      아이의 관심사에 맞춘 놀이
                    </li>
                  </ul>
                </div>

                <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-4 h-4 text-violet-500" />
                    <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-400">표현언어 발달을 위해</h4>
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 mt-0.5">•</span>
                      아이의 말에 충분한 반응 보이기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 mt-0.5">•</span>
                      노래와 율동 함께 하기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 mt-0.5">•</span>
                      아이가 말할 기회 많이 주기
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 mt-0.5">•</span>
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
          
          <Card className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 md:p-6 text-center">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-xs md:text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
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
