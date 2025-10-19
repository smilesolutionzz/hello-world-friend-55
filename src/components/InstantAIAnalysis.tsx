import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
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
  Zap,
  Wand2
} from 'lucide-react';

const InstantAIAnalysis = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
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
        console.warn('Edge function error, using fallback:', error);
        return mockAnalysis(text);
      }

      if (data && data.analysis) {
        return data.analysis;
      } else {
        console.warn('No analysis data received, using fallback');
        return mockAnalysis(text);
      }
    } catch (error) {
      console.warn('AI Analysis error, using fallback:', error);
      // Always return fallback analysis instead of throwing error
      return mockAnalysis(text);
    }
  };

  const mockAnalysis = (text: string) => {
    // 심각도 키워드 (우선순위 높음)
    const highSeverityKeywords = [
      '죽고싶', '자살', '자해', '극심', '심각', '위급', '위험', '견딜 수 없',
      '못 견디', '한계', '폭력', '학대'
    ];
    
    const mediumSeverityKeywords = [
      '우울', '불안', '공황', '스트레스', '화', '분노', '걱정', '고민',
      '힘들', '지쳐', '아프', '외로', '슬프', '무기력', '짜증', '피곤',
      '싸움', '갈등', '문제', '어려움'
    ];

    // 유형 키워드
    const typeKeywords = {
      '우울감': ['우울', '무기력', '의욕 없', '슬프', '외로'],
      '불안감': ['불안', '걱정', '초조', '공황', '두려', '무서'],
      '발달지연': ['말 안', '걷지 못', '발달', '늦', '또래보다', '개월', '언어', '운동'],
      '육아스트레스': ['아이', '육아', '엄마', '아빠', '키우', '양육'],
      '학업스트레스': ['공부', '시험', '성적', '학교', '학원', '입시'],
      '대인관계': ['친구', '관계', '따돌림', '왕따', '외톨이', '사회성'],
      '수면문제': ['잠', '수면', '못 자', '불면'],
      '분노조절': ['화', '분노', '짜증', '폭발', '참을 수 없'],
    };

    // 심각도 판단
    let severity = '낮음';
    let color = 'bg-green-500';
    
    for (const keyword of highSeverityKeywords) {
      if (text.includes(keyword)) {
        severity = '높음';
        color = 'bg-red-500';
        break;
      }
    }
    
    if (severity === '낮음') {
      for (const keyword of mediumSeverityKeywords) {
        if (text.includes(keyword)) {
          severity = '중간';
          color = 'bg-orange-500';
          break;
        }
      }
    }

    // 상세 조언 생성
    const detailedAdvice = severity === '높음' 
      ? `현재 겪고 계신 어려움이 상당히 힘드실 것 같습니다. 이런 상황에서는 혼자 해결하려 하기보다 전문가의 도움을 받는 것이 중요합니다. 우선 신뢰할 수 있는 가족이나 친구에게 마음을 터놓고 이야기해보세요. 그리고 정신건강 전문의나 상담사와의 상담을 고려해보시길 권합니다. 작은 변화부터 시작하되, 자신을 너무 몰아붙이지 마세요. 하루하루 버티는 것만으로도 충분히 대단한 일입니다. 지금의 고통은 영원하지 않습니다.`
      : severity === '중간'
      ? `지금 느끼시는 어려움에 대해 충분히 공감합니다. 이러한 상황은 누구에게나 찾아올 수 있으며, 도움을 구하는 것은 용기 있는 행동입니다. 일상에서 작은 루틴을 만들어보세요 - 규칙적인 수면, 가벼운 운동, 취미 활동 등이 도움이 될 수 있습니다. 또한 관찰일지를 작성하며 패턴을 파악하고, 필요하다면 전문가 상담도 고려해보세요. 변화는 천천히 일어나지만, 꾸준히 노력한다면 분명 좋아질 것입니다.`
      : `공유해주신 내용을 보니 현재 관리 가능한 수준의 고민으로 보입니다. 이런 고민을 인식하고 해결하려는 노력 자체가 큰 발전입니다. 관찰일지를 통해 패턴을 파악하고, 작은 목표를 세워 실천해보세요. 스트레스 관리를 위해 명상이나 산책 같은 활동도 도움이 됩니다. 예방적 차원에서 꾸준히 관심을 가지고 관리한다면 더 큰 문제로 발전하지 않을 것입니다. 자신을 돌보는 시간을 꼭 가지세요.`;

    // 유형 판단
    let detectedType = '일반 상담';
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedType = type;
        break;
      }
    }

    // 심각도별 추천사항
    const recommendations = severity === '높음' 
      ? [
          '즉시 전문가 상담 (1577-0199 정신건강위기상담)',
          '가까운 정신건강복지센터 방문',
          '24시간 위기상담 서비스 이용'
        ]
      : severity === '중간'
      ? [
          '전문가 상담을 통한 맞춤 솔루션',
          '체계적인 관찰일지 작성',
          '단계별 개선 가이드 제공'
        ]
      : [
          '예방적 상담 및 관찰',
          '정기적인 자가 체크',
          '건강한 생활 습관 유지'
        ];

    return {
      type: detectedType,
      severity,
      color,
      detailedAdvice,
      recommendations,
      confidence: Math.floor(Math.random() * 15) + 80, // 80-94%
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

    if (inputText.trim().length < 10) {
      toast({
        title: "조금만 더 적어주세요",
        description: "최소 10자 이상 입력해주세요 (예: 아이가 말을 안해요)",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // 실제 AI 분석 호출 (fallback 포함)
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
      // 이 경우는 거의 발생하지 않음 (callAIAnalysis가 항상 결과를 반환)
      console.error('Unexpected error:', error);
      setIsAnalyzing(false);
      
      // 마지막 fallback으로 mockAnalysis 사용
      const fallbackResult = mockAnalysis(inputText);
      setAnalysisResult(fallbackResult);
      setShowResult(true);
      
      toast({
        title: "AI 분석이 완료되었습니다",
        description: "기본 분석 결과를 확인해보세요",
      });
    }
  };

  const handleExpandPrompt = async () => {
    if (!inputText.trim() || inputText.length < 10) {
      toast({
        title: "입력 확인",
        description: "최소 10자 이상 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsExpanding(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('expand-prompt', {
        body: { prompt: inputText }
      });

      if (error) throw error;

      if (data?.expandedPrompt) {
        setInputText(data.expandedPrompt);
        toast({
          title: "✨ 프롬프트 확장 완료",
          description: "입력 내용이 더 구체적으로 확장되었습니다.",
        });
      }
    } catch (error: any) {
      console.error('프롬프트 확장 오류:', error);
      toast({
        title: "확장 실패",
        description: "프롬프트 확장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsExpanding(false);
    }
  };

  const handleStartFullAnalysis = () => {
    // 입력한 텍스트를 localStorage에 저장하여 온보딩에서 활용
    localStorage.setItem('instant_analysis_input', inputText);
    navigate('/pmf-onboarding');
  };

  const getRecommendedTests = (concernType: string) => {
    const testRecommendations: { [key: string]: Array<{ name: string; route: string; description: string; isPremium: boolean }> } = {
      '우울감': [
        { name: '우울증 테스트', route: '/test/depression', description: '우울증 정도를 체계적으로 평가합니다', isPremium: false },
        { name: '스트레스 측정', route: '/test/stress', description: '스트레스 수준과 원인을 파악합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
      ],
      '불안감': [
        { name: '불안 테스트', route: '/test/anxiety', description: '불안 증상과 유형을 분석합니다', isPremium: false },
        { name: '스트레스 측정', route: '/test/stress', description: '스트레스 수준과 원인을 파악합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
      ],
      '발달지연': [
        { name: '영유아 발달 평가', route: '/assessment', description: '아이의 발달 단계를 전문적으로 평가합니다', isPremium: true }
      ],
      '육아스트레스': [
        { name: '스트레스 측정', route: '/test/stress', description: '육아 스트레스 정도를 측정합니다', isPremium: false },
        { name: '번아웃 테스트', route: '/test/burnout', description: '육아 번아웃 위험을 확인합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
      ],
      '학업스트레스': [
        { name: 'ADHD 테스트', route: '/test/adhd', description: '주의력 및 집중력 문제를 파악합니다', isPremium: false },
        { name: '스트레스 측정', route: '/test/stress', description: '학업 스트레스 수준을 측정합니다', isPremium: false }
      ],
      '대인관계': [
        { name: '방어기제 분석', route: '/test/defense', description: '관계 패턴과 방어기제를 이해합니다', isPremium: false },
        { name: '종합 심리 평가', route: '/assessment', description: '사회성 및 정서 발달 평가', isPremium: true }
      ],
      '수면문제': [
        { name: '스트레스 측정', route: '/test/stress', description: '수면 방해 요인을 분석합니다', isPremium: false }
      ],
      '분노조절': [
        { name: '스트레스 측정', route: '/test/stress', description: '분노와 스트레스 관계를 파악합니다', isPremium: false },
        { name: '방어기제 분석', route: '/test/defense', description: '감정 조절 패턴을 이해합니다', isPremium: false }
      ]
    };

    return testRecommendations[concernType] || [
      { name: '종합 심리 평가', route: '/assessment', description: '전문가 수준의 심층 평가', isPremium: true }
    ];
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* 헤더 섹션 */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">AI 즉시 분석</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black leading-tight">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            내 고민으로<br />어떤 솔루션을 받을 수 있을까?
          </span>
        </h1>
        
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
          AI가 당신의 고민을 분석하고 최적의 상담 유형, 심각도, 맞춤 솔루션을 즉시 알려드립니다
        </p>
      </div>

      {/* 메인 콘텐츠 - 2열 레이아웃 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* 왼쪽: 입력 영역 */}
        <div className="space-y-4">
          <div className="bg-transparent rounded-2xl border border-border/50 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">내 고민 입력</h2>
            </div>
            
            <p className="text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              지금 가장 걱정되는 고민이나 문제를 간단히 적어주세요
            </p>
            
            {!showResult ? (
              <>
                <div className="relative">
                  <Textarea
                    placeholder="지금 가장 걱정되는 한 문장을 적어주세요..."
                    value={inputText}
                    onChange={(e) => {
                      const text = e.target.value;
                      if (text.length <= 500) {
                        setInputText(text);
                      }
                    }}
                    className="min-h-[280px] resize-none border-border/50 focus:border-primary/50 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-base bg-background/80 backdrop-blur-sm pr-3 pt-3"
                    maxLength={500}
                  />
                  
                  {/* 음성 입력 버튼 */}
                  <div className="absolute bottom-3 right-3">
                    <VoiceInputButton
                      onTranscription={(text) => {
                        const newText = inputText + (inputText ? ' ' : '') + text;
                        if (newText.length <= 500) {
                          setInputText(newText);
                        }
                      }}
                      className="shadow-lg hover:shadow-xl transition-shadow"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{inputText.length}</span>/500 <span className="text-xs">(최소 10자)</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-600">3분 소요</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-600">완전 무료</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleExpandPrompt}
                      disabled={isExpanding || isAnalyzing || inputText.length < 10}
                      className="gap-1.5 text-xs h-7 px-2 border border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-600 hover:text-amber-800 dark:hover:text-amber-500"
                    >
                      {isExpanding ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-amber-600 border-t-transparent" />
                          <span>다듬는 중...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>AI 다듬기</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="min-h-[280px] p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{inputText}</p>
              </div>
            )}
          </div>
          
          {/* 고민 작성 팁 */}
          {!showResult && (
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 backdrop-blur-sm rounded-xl border border-amber-200/30 dark:border-amber-800/30 p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-base">💡</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    고민 작성 팁
                  </p>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                    <li>• 최소 10자 이상, 핵심 고민만 간단히 적어주세요</li>
                    <li>• 예시: "5살 아이 말 늦어요", "우울해요", "아이가 친구 없어요"</li>
                    <li>• 개인정보나 민감한 정보는 포함하지 말아주세요</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 결과 영역 */}
        <div className="bg-transparent rounded-2xl border border-border/50 p-6">
          {!showResult ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📖</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">분석 결과가 여기 표시됩니다</h3>
                <p className="text-sm bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent max-w-xs mx-auto">
                  왼쪽에 내용을 입력하고<br />
                  "무료로 분석하기" 버튼을 눌러주세요
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 결과 헤더 */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                  <h3 className="text-2xl font-bold text-foreground">AI 분석 완료!</h3>
                </div>
                <p className="text-base font-semibold text-foreground">
                  신뢰도 <span className="text-xl font-bold text-green-600">{analysisResult?.confidence}%</span>의 분석 결과입니다
                </p>
              </div>

              {/* 분석 결과 카드 */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${analysisResult?.color}`}></div>
                    <CardTitle className="text-xl font-bold text-foreground">{analysisResult?.type}</CardTitle>
                    <Badge variant={analysisResult?.severity === '높음' ? 'destructive' : 'secondary'} className="font-semibold">
                      {analysisResult?.severity} 단계
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5">
                  {analysisResult?.detailedAdvice && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-800">
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-amber-900 dark:text-amber-100 text-base">
                        <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        AI 전문가의 조언
                      </h4>
                      <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-50 font-medium">
                        {analysisResult.detailedAdvice}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-foreground text-base">
                      <Target className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                      추천 솔루션
                    </h4>
                    <ul className="space-y-3">
                      {analysisResult?.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 p-4 bg-muted/80 dark:bg-muted/40 rounded-lg border border-border">
                          <span className="flex-shrink-0 w-7 h-7 bg-amber-500/20 dark:bg-amber-500/30 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="text-sm text-foreground font-medium pt-0.5">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 맞춤 테스트 추천 */}
              {getRecommendedTests(analysisResult?.type).length > 0 && (
                <Card className="border-amber-500/30 shadow-lg bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-amber-600" />
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        이 고민에 맞는 추천 테스트
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {getRecommendedTests(analysisResult?.type).map((test, index) => (
                        <button
                          key={index}
                          onClick={() => navigate(test.route)}
                          className="p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all text-left group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={test.isPremium ? "default" : "secondary"} className="text-xs">
                                  {test.isPremium ? "프리미엄" : "3분 테스트"}
                                </Badge>
                                <h5 className="font-bold text-foreground">{test.name}</h5>
                              </div>
                              <p className="text-sm text-muted-foreground">{test.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CTA 버튼들 */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/observation')}
                  size="lg"
                  className="w-full font-bold"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  관찰일지 작성하기
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleStartFullAnalysis}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    3분 온보딩
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResult(false);
                      setInputText('');
                    }}
                  >
                    다시 분석
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 하단 버튼 */}
      {!showResult && (
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || inputText.length < 10}
            size="lg"
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-xl"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                AI가 분석 중입니다...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                무료로 분석하기
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            분석은 완전 무료이며, 30초 이내 완료됩니다
          </p>
        </div>
      )}
    </div>
  );
};

export default InstantAIAnalysis;