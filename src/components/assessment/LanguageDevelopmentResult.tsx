import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Crown, Baby, TrendingUp, AlertCircle, Copy, Loader2 } from "lucide-react";
import { languageDevelopmentScoring } from "@/data/languageDevelopmentQuestions";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { RelatedTestRecommendations } from './RelatedTestRecommendations';

interface LanguageDevelopmentResultProps {
  results: Record<string, number>;
  answers: Record<string, string>;
  onBack: () => void;
}

const LanguageDevelopmentResult = ({ results, answers, onBack }: LanguageDevelopmentResultProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { toast } = useToast();
  // 점수 해석 함수
  const getScoreInterpretation = (score: number, category: 'receptive' | 'expressive' | 'total') => {
    const scoring = languageDevelopmentScoring[category];
    
    if (score >= scoring.excellent.min) return { level: 'excellent', ...scoring.excellent, color: 'text-green-600', bgColor: 'bg-green-50', badge: 'bg-green-500' };
    if (score >= scoring.good.min) return { level: 'good', ...scoring.good, color: 'text-blue-600', bgColor: 'bg-blue-50', badge: 'bg-blue-500' };
    if (score >= scoring.average.min) return { level: 'average', ...scoring.average, color: 'text-yellow-600', bgColor: 'bg-yellow-50', badge: 'bg-yellow-500' };
    return { level: 'needsAttention', ...scoring.needsAttention, color: 'text-red-600', bgColor: 'bg-red-50', badge: 'bg-red-500' };
  };

  const receptiveInterpretation = getScoreInterpretation(results.receptive, 'receptive');
  const expressiveInterpretation = getScoreInterpretation(results.expressive, 'expressive');
  const totalInterpretation = getScoreInterpretation(results.total, 'total');

  // 차트 데이터
  const radarData = [
    {
      category: '수용언어',
      score: results.receptive_percentage,
      fullMark: 100
    },
    {
      category: '표현언어', 
      score: results.expressive_percentage,
      fullMark: 100
    }
  ];

  const barData = [
    {
      name: '수용언어',
      score: results.receptive,
      percentage: results.receptive_percentage,
      maxScore: 39,
      color: '#FF6B9D'
    },
    {
      name: '표현언어',
      score: results.expressive,
      percentage: results.expressive_percentage,
      maxScore: 38,
      color: '#C084F5'
    }
  ];

  // AI 전문가 분석 실행
  useEffect(() => {
    const generateAIAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('language-development-analyzer', {
          body: {
            results,
            answers,
            ageGroup: '영유아' // 필요시 동적으로 전달
          }
        });

        if (error) {
          console.error('AI 분석 오류:', error);
          throw error;
        }

        setAiAnalysis(data.analysis);
      } catch (error) {
        console.error('AI 분석 실패:', error);
        // 실패 시 기본 해석 사용
        setAiAnalysis(generateFallbackInterpretation());
      } finally {
        setIsAnalyzing(false);
      }
    };

    generateAIAnalysis();
  }, [results, answers]);

  // 기본 해석 생성 (AI 분석 실패 시 사용)
  const generateFallbackInterpretation = () => {
    const interpretations = [];
    
    if (receptiveInterpretation.level === 'excellent' && expressiveInterpretation.level === 'excellent') {
      interpretations.push("🌟 수용언어와 표현언어 모두 매우 우수한 발달 수준을 보이고 있습니다.");
    } else if (receptiveInterpretation.level === 'excellent') {
      interpretations.push("👂 수용언어 발달이 특히 뛰어납니다. 언어 이해력이 또래보다 앞서 있어요.");
    } else if (expressiveInterpretation.level === 'excellent') {
      interpretations.push("💬 표현언어 발달이 특히 뛰어납니다. 자신의 생각을 잘 표현하는 능력이 우수해요.");
    }

    if (Math.abs(results.receptive_percentage - results.expressive_percentage) > 20) {
      if (results.receptive_percentage > results.expressive_percentage) {
        interpretations.push("📚 수용언어가 표현언어보다 더 발달되어 있습니다. 이해는 잘 하지만 표현에 더 많은 격려와 기회를 제공해주세요.");
      } else {
        interpretations.push("🗣️ 표현언어가 수용언어보다 더 발달되어 있습니다. 적극적으로 소통하려는 의지가 강해요.");
      }
    } else {
      interpretations.push("⚖️ 수용언어와 표현언어가 균형있게 발달하고 있습니다.");
    }

    if (totalInterpretation.level === 'needsAttention') {
      interpretations.push("💡 언어발달을 위해 더 많은 관심과 자극이 필요합니다. 전문가 상담을 고려해보세요.");
    }

    interpretations.push("🎯 지속적인 언어 자극과 상호작용을 통해 더욱 발달시킬 수 있습니다.");

    return interpretations.join('\n\n');
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>AIH 영유아 언어발달 검사 결과</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 40px; line-height: 1.6; }
            .source-header { text-align: center; margin-bottom: 10px; }
            .source-url { font-size: 20px; font-weight: bold; color: #6366f1; letter-spacing: 1px; }
            .header { text-align: center; margin-bottom: 30px; }
            .score-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .score-large { font-size: 24px; font-weight: bold; color: #333; }
            .interpretation { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .recommendations { margin-top: 20px; }
            .recommendations ul { padding-left: 20px; }
            .disclaimer { margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 5px; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="source-header">
            <div class="source-url">aihpro.com</div>
          </div>
          
          <div class="header">
            <h1>AIH 영유아 언어발달 검사 결과</h1>
            <p>검사일: ${new Date().toLocaleDateString('ko-KR')}</p>
          </div>
          
          <div class="score-section">
            <h2>전체 언어발달 수준</h2>
            <div class="score-large">${results.total}점 / 45점 (${results.total_percentage}%)</div>
            <p><strong>해석:</strong> ${totalInterpretation.description}</p>
          </div>
          
          <div class="score-section">
            <h3>영역별 상세 결과</h3>
            <p><strong>수용언어:</strong> ${results.receptive.toFixed(1)}점 / 23점 (${results.receptive_percentage}%) - ${receptiveInterpretation.description}</p>
            <p><strong>표현언어:</strong> ${results.expressive.toFixed(1)}점 / 22점 (${results.expressive_percentage}%) - ${expressiveInterpretation.description}</p>
          </div>
          
          <div class="interpretation">
            <h3>AI 전문가 해석</h3>
            <p>${aiAnalysis || generateFallbackInterpretation()}</p>
          </div>
          
          <div class="recommendations">
            <h3>발달 촉진 권장사항</h3>
            <div style="display: flex; gap: 20px;">
              <div style="flex: 1;">
                <h4>수용언어 발달을 위해</h4>
                <ul>
                  <li>책을 읽어주며 그림 설명하기</li>
                  <li>일상에서 많은 대화하기</li>
                  <li>다양한 어휘로 말해주기</li>
                  <li>아이의 관심사에 맞춘 놀이</li>
                </ul>
              </div>
              <div style="flex: 1;">
                <h4>표현언어 발달을 위해</h4>
                <ul>
                  <li>아이의 말에 충분한 반응 보이기</li>
                  <li>노래와 율동 함께 하기</li>
                  <li>아이가 말할 기회 많이 주기</li>
                  <li>표현을 격려하고 칭찬하기</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="disclaimer">
            ※ 본 검사는 참고용 자가체크이며, 전문적인 진단을 대체하지 않습니다.
          </div>
        </body>
        </html>
      `;

      const { data, error } = await supabase.functions.invoke('generate-premium-pdf', {
        body: { htmlContent }
      });

      if (error) throw error;

      // 새 창에서 PDF 열기
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.print();
      }

      toast({
        title: "PDF 생성 완료",
        description: "언어발달 검사 결과 PDF가 생성되었습니다.",
      });
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    const shareText = `🌟 AIH 영유아 언어발달 검사 결과 🌟

📊 전체 점수: ${results.total}점 / 77점 (${results.total_percentage}%)
📈 해석: ${totalInterpretation.description}

📋 영역별 결과:
👂 수용언어: ${results.receptive.toFixed(1)}점 / 23점 (${results.receptive_percentage}%)
💬 표현언어: ${results.expressive.toFixed(1)}점 / 22점 (${results.expressive_percentage}%)

🤖 AI 전문가 해석:
${aiAnalysis || generateFallbackInterpretation()}

💡 발달 촉진 권장사항:
수용언어: 책 읽어주기, 일상 대화, 다양한 어휘 사용
표현언어: 충분한 반응, 노래와 율동, 말할 기회 제공

검사일: ${new Date().toLocaleDateString('ko-KR')}
※ 본 검사는 참고용이며, 전문적인 진단을 대체하지 않습니다.`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "복사 완료",
        description: "검사 결과가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-peach-bloom/10 to-lavender-mist/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-peach-bloom/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-lavender-mist/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
              <Baby className="w-6 h-6 text-peach-bloom" />
              <h1 className="text-2xl font-bold text-brand-gradient">
                언어발달 검사 결과
              </h1>
              <Baby className="w-6 h-6 text-peach-bloom" />
            </div>
            <p className="text-sm text-muted-foreground">
              AIH 영유아 언어발달 자가체크 완료
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "생성중..." : "PDF"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Copy className="w-4 h-4 mr-2" />
              복사
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className={`${totalInterpretation.bgColor} border-2`}>
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">전체 언어발달 수준</h2>
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="mb-4">
                <div className="text-4xl font-bold mb-2 text-foreground">
                  {results.total}점 / 45점
                </div>
                <Badge className={`${totalInterpretation.badge} text-white text-lg px-4 py-2`}>
                  {totalInterpretation.description}
                </Badge>
              </div>
              
              <div className="text-lg font-medium">
                전체 발달률: {results.total_percentage}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Scores */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 수용언어 */}
            <Card className={`${receptiveInterpretation.bgColor} border`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-peach-bloom" />
                  수용언어 (언어 이해력)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">
                    {results.receptive}점 / 23점
                  </div>
                  <div className="text-lg text-peach-bloom font-semibold">
                    {results.receptive_percentage}%
                  </div>
                </div>
                <Badge className={`${receptiveInterpretation.badge} text-white w-full justify-center py-2`}>
                  {receptiveInterpretation.description}
                </Badge>
              </CardContent>
            </Card>

            {/* 표현언어 */}
            <Card className={`${expressiveInterpretation.bgColor} border`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-warm-lavender" />
                  표현언어 (언어 표현력)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">
                    {results.expressive}점 / 22점
                  </div>
                  <div className="text-lg text-warm-lavender font-semibold">
                    {results.expressive_percentage}%
                  </div>
                </div>
                <Badge className={`${expressiveInterpretation.badge} text-white w-full justify-center py-2`}>
                  {expressiveInterpretation.description}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>언어 영역별 점수</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value}점 (${barData.find(d => d.name === name)?.percentage}%)`,
                        name
                      ]}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#FF6B9D"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>언어발달 균형도</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="발달률"
                      dataKey="score"
                      stroke="#FF6B9D"
                      fill="#FF6B9D"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                AI 전문가 해석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-3 p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-lg font-medium">AI 전문가가 검사 결과를 분석하고 있습니다...</span>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {aiAnalysis || generateFallbackInterpretation()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle>발달 촉진 권장사항</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-peach-bloom mb-3">수용언어 발달을 위해</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• 책을 읽어주며 그림 설명하기</li>
                    <li>• 일상에서 많은 대화하기</li>
                    <li>• 다양한 어휘로 말해주기</li>
                    <li>• 아이의 관심사에 맞춘 놀이</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-lavender mb-3">표현언어 발달을 위해</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• 아이의 말에 충분한 반응 보이기</li>
                    <li>• 노래와 율동 함께 하기</li>
                    <li>• 아이가 말할 기회 많이 주기</li>
                    <li>• 표현을 격려하고 칭찬하기</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expert Consultation */}
        <div className="max-w-6xl mx-auto">
          <ExpertConsultationNotice />
          
          {/* 연관 검사 추천 */}
          <div className="mt-6">
            <RelatedTestRecommendations currentTestType="language-development" />
          </div>
          
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mt-6">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold text-blue-900 mb-2">전문가 상담 안내</h4>
              <p className="text-blue-800 text-sm leading-relaxed mb-4">
                언어발달에 대한 우려가 있으시거나 더 자세한 평가가 필요하시다면, 
                언어치료사나 소아과 전문의와 상담받으시기를 권장합니다.
              </p>
              <div className="text-xs text-blue-700">
                ※ 본 체크는 참고용 자가체크이며, 전문적인 진단을 대체하지 않습니다.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LanguageDevelopmentResult;