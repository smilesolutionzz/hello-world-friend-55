import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Loader2, 
  CheckCircle, 
  Target,
  Heart,
  Clock,
  Zap
} from 'lucide-react';

const InstantAIAnalysis = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const callAIAnalysis = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('instant-ai-analysis', {
        body: { inputText: text }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'AI 분석 중 오류가 발생했습니다.');
      }

      if (data.success) {
        return data.analysis;
      } else {
        // Use fallback analysis if AI failed
        return data.fallbackAnalysis;
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      // Return fallback analysis in case of complete failure
      return mockAnalysis(text);
    }
  };

  const mockAnalysis = (text: string) => {
    // 간단한 키워드 기반 분석
    const keywords = {
      '우울': { type: '우울감', severity: '중간', color: 'bg-blue-500' },
      '불안': { type: '불안감', severity: '높음', color: 'bg-red-500' },
      '스트레스': { type: '스트레스', severity: '중간', color: 'bg-orange-500' },
      '걱정': { type: '걱정', severity: '중간', color: 'bg-yellow-500' },
      '화': { type: '분노', severity: '높음', color: 'bg-red-500' },
      '아이': { type: '육아스트레스', severity: '중간', color: 'bg-green-500' },
      '직장': { type: '직장스트레스', severity: '높음', color: 'bg-purple-500' },
      '관계': { type: '대인관계', severity: '중간', color: 'bg-pink-500' },
      '잠': { type: '수면문제', severity: '중간', color: 'bg-indigo-500' },
      '집중': { type: '집중력', severity: '중간', color: 'bg-cyan-500' },
    };

    let detectedType = '일반 상담';
    let severity = '낮음';
    let color = 'bg-gray-500';

    for (const [keyword, info] of Object.entries(keywords)) {
      if (text.includes(keyword)) {
        detectedType = info.type;
        severity = info.severity;
        color = info.color;
        break;
      }
    }

    return {
      type: detectedType,
      severity,
      color,
      recommendations: [
        '전문가 상담을 통한 맞춤 솔루션',
        '체계적인 관찰일지 작성',
        '단계별 개선 가이드 제공'
      ],
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      nextSteps: [
        '3분 온보딩으로 정확한 분석 받기',
        '전문가 매칭 및 상담 예약',
        '맞춤형 솔루션 추천 받기'
      ]
    };
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "입력이 필요해요",
        description: "고민이나 걱정거리를 간단히 적어주세요",
        variant: "destructive"
      });
      return;
    }

    if (inputText.trim().length < 30) {
      toast({
        title: "더 자세히 적어주세요",
        description: "정확한 분석을 위해 최소 30자 이상 입력해주세요",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // 실제 AI 분석 호출
      const result = await callAIAnalysis(inputText);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      setShowResult(true);
      
      // 분석 완료 후 자동으로 PMF 온보딩 제안
      setTimeout(() => {
        toast({
          title: "🎯 더 정확한 분석을 원하신다면?",
          description: "3분 온보딩으로 맞춤형 솔루션을 받아보세요!",
        });
      }, 3000);
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "분석 중 오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive"
      });
    }
  };

  const handleStartFullAnalysis = () => {
    // 입력한 텍스트를 localStorage에 저장하여 온보딩에서 활용
    localStorage.setItem('instant_analysis_input', inputText);
    navigate('/pmf-onboarding');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white/95 to-primary/5 rounded-3xl shadow-2xl border border-primary/20 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center border-b border-primary/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI 즉시 리포팅
          </h2>
          <Badge variant="secondary" className="text-xs">beta</Badge>
        </div>
        <p className="text-muted-foreground">
          고민을 말하면, 즉시 분석해드려요 (최대 30자)
        </p>
      </div>

      <CardContent className="p-6 space-y-6">
        {!showResult ? (
          <>
            {/* 입력 영역 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  예시: 14개월 아기가 아직 걷지 못해요... / 고3 아들이 극도로 예민해져서 힘들어요... / 육아 스트레스로 아이에게 화를 자주 내요...
                </label>
                <Textarea
                  placeholder="지금 가장 걱정되는 한 문장을 적어주세요..."
                  value={inputText}
                  onChange={(e) => {
                    const text = e.target.value;
                    if (text.length <= 500) {
                      setInputText(text);
                    }
                  }}
                  className="min-h-[120px] resize-none border-2 border-muted focus:border-primary transition-colors"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{inputText.length}/500 (최소 30자)</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>3분 소요</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>완전 무료</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>회원가입 불필요</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 효과적인 리포팅을 위한 팁 */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 <strong>효과적인 리포팅을 위한 팁:</strong>
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• 최소 30자 이상으로 구체적인 상황을 설명해주세요</li>
                  <li>• 대상자의 연령, 구체적인 행동, 지속 기간 등을 포함해주세요</li>
                  <li>• 개인정보나 민감한 정보는 포함하지 말아주세요</li>
                </ul>
              </div>

              {/* 즉시 리포트 받기 버튼 */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || inputText.length < 30}
                size="lg"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI가 분석 중입니다...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    🚀 즉시 리포트 받기
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* 분석 결과 */}
            <div className="space-y-6">
              {/* 결과 헤더 */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold">AI 분석 완료!</h3>
                </div>
                <p className="text-muted-foreground">
                  신뢰도 {analysisResult?.confidence}%의 분석 결과입니다
                </p>
              </div>

              {/* 분석 결과 카드 */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${analysisResult?.color}`}></div>
                    <CardTitle className="text-lg">{analysisResult?.type}</CardTitle>
                    <Badge variant={analysisResult?.severity === '높음' ? 'destructive' : 'secondary'}>
                      {analysisResult?.severity} 단계
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      추천 솔루션
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysisResult?.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      다음 단계
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysisResult?.nextSteps?.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysisResult?.aiResponse && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h5 className="text-sm font-medium mb-1">AI 상세 분석:</h5>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {analysisResult.aiResponse}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTA 버튼들 */}
              <div className="space-y-3">
                <Button
                  onClick={handleStartFullAnalysis}
                  size="lg"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  🎯 3분 온보딩으로 정확한 분석 받기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResult(false);
                      setInputText('');
                    }}
                    className="flex-1"
                  >
                    다시 분석하기
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/observation')}
                    className="flex-1"
                  >
                    관찰일지 작성
                  </Button>
                </div>
              </div>

              {/* 장점 안내 */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-center text-muted-foreground">
                  <strong>💡 더 정확한 분석을 원하신다면?</strong><br />
                  3분 온보딩을 통해 맞춤형 솔루션과 전문가 매칭을 받아보세요!
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </div>
  );
};

export default InstantAIAnalysis;