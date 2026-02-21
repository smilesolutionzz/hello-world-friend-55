import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Download, CheckCircle, Users, MessageCircle, ShieldCheck, ArrowLeft, FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';

interface RelationshipStyleResultProps {
  result: {
    type: string;
    scores: Record<string, number>;
    result: {
      title: string;
      description: string;
      characteristics: string[];
      advice: string;
      color: string;
      icon: any;
    };
    answers: Record<number, string>;
  };
  onBack?: () => void;
}

const RelationshipStyleResult = ({ result, onBack }: RelationshipStyleResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const IconComponent = result.result.icon;
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const { isEnglish } = useLanguage();

  // 자동 저장
  useAutoSaveTestResult({
    testType: '관계 스타일 검사',
    results: {
      type: result.type,
      scores: result.scores,
      title: result.result.title,
      characteristics: result.result.characteristics,
    },
    severity: result.type === 'secure' || result.type === 'assertive' ? '양호' : '보통',
    ageGroup: 'adult',
  });

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadResultAsPDF(
        'relationship-style-result',
        `관계스타일진단_${new Date().toISOString().split('T')[0]}`,
        () => {
          toast({
            title: "PDF 다운로드 완료",
            description: "검사 결과가 PDF로 저장되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "PDF 다운로드 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '관계 스타일 진단 결과',
          text: `나의 관계 스타일: ${result.result.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "링크가 복사되었습니다",
        description: "다른 사람들과 공유해보세요!",
      });
    }
  };

  const getScorePercentage = (type: string) => {
    const totalQuestions = Object.keys(result.answers).length;
    return Math.round((result.scores[type] / totalQuestions) * 100);
  };

  const getImprovementsByType = (type: string) => {
    const improvementMap: Record<string, any[]> = {
      // Relationship Style improvements
      secure: [
        {
          title: "리더십 스킬 개발하기",
          description: "팀에서 갈등 중재자 역할을 맡아 건설적인 해결책을 제시해보세요. 당신의 안정적인 소통 능력이 큰 도움이 될 것입니다.",
          difficulty: "쉬움"
        },
        {
          title: "감정 지능 향상시키기",
          description: "이미 좋은 소통 능력을 가지고 있으니, 상대방의 미묘한 감정 변화를 더 세밀하게 파악하는 연습을 해보세요.",
          difficulty: "보통"
        },
        {
          title: "다양한 성격 유형 이해하기",
          description: "회피형이나 불안형 사람들의 관점을 깊이 이해하고, 그들에게 맞는 소통 방식을 개발해보세요.",
          difficulty: "어려움"
        }
      ],
      anxious: [
        {
          title: "자기 진정 기법 익히기",
          description: "불안할 때 사용할 수 있는 호흡법이나 마음챙김 기법을 배워보세요. 5-4-3-2-1 기법(5가지 보이는 것, 4가지 들리는 것 등)이 특히 효과적입니다.",
          difficulty: "쉬움"
        },
        {
          title: "개인적 관심사 개발하기",
          description: "관계 외에도 자신만의 취미나 목표를 가져보세요. 개인적 성취감이 관계에서의 불안감을 줄여줄 것입니다.",
          difficulty: "보통"
        },
        {
          title: "확신 요구 줄이기 연습",
          description: "상대방에게 확신을 요구하고 싶은 충동이 들 때, 하루 정도 기다려보는 연습을 해보세요. 시간이 지나면 불안이 자연스럽게 줄어들 것입니다.",
          difficulty: "어려움"
        }
      ],
      avoidant: [
        {
          title: "작은 감정 표현부터 시작하기",
          description: "오늘 기분이 어땠는지 한 줄로라도 표현해보세요. '피곤했다', '기분 좋았다' 같은 간단한 것부터 시작하면 됩니다.",
          difficulty: "쉬움"
        },
        {
          title: "정기적인 관계 체크인 만들기",
          description: "주 1회 정도 가까운 사람과 서로의 근황이나 감정을 나누는 시간을 가져보세요. 처음엔 어색하지만 점차 자연스러워질 것입니다.",
          difficulty: "보통"
        },
        {
          title: "취약성 공유하기",
          description: "자신의 어려움이나 걱정을 신뢰하는 사람과 나눠보세요. 완벽하지 않은 모습도 사랑받을 수 있다는 것을 경험해보세요.",
          difficulty: "어려움"
        }
      ],
      dismissive: [
        {
          title: "상대방 관점 탐색하기",
          description: "의견이 다를 때 '왜 그렇게 생각하시나요?'라고 진심으로 물어보세요. 판단하지 말고 순수한 호기심으로 접근해보세요.",
          difficulty: "쉬움"
        },
        {
          title: "양보의 작은 성공 경험하기",
          description: "사소한 것부터 상대방 의견에 따라가보세요. 음식 선택, 영화 선택 등에서 시작해 양보가 나쁘지 않다는 것을 경험해보세요.",
          difficulty: "보통"
        },
        {
          title: "감정 공감 능력 기르기",
          description: "상대방이 감정적으로 반응할 때 '논리적이지 않다'고 판단하지 말고, 그 감정 뒤에 숨은 욕구나 필요를 이해하려 노력해보세요.",
          difficulty: "어려움"
        }
      ],
      // Communication Style improvements
      assertive: [
        {
          title: "다양한 소통 스타일 이해하기",
          description: "수동적이거나 공격적인 사람들과 소통할 때, 그들의 방식을 이해하고 적절히 조율하는 방법을 연습해보세요.",
          difficulty: "쉬움"
        },
        {
          title: "문화적 소통 차이 학습하기",
          description: "다른 문화권 사람들과의 소통에서 직접적 표현이 오해를 불러일으킬 수 있으니, 상황에 맞는 소통 방식을 개발해보세요.",
          difficulty: "보통"
        },
        {
          title: "팀 소통 촉진자 역할하기",
          description: "회의나 토론에서 모든 사람이 의견을 표현할 수 있도록 돕는 촉진자 역할을 맡아보세요. 리더십 역량이 한층 향상될 것입니다.",
          difficulty: "어려움"
        }
      ],
      passive: [
        {
          title: "일일 의견 표현 목표 세우기",
          description: "하루에 한 번은 작은 의견이라도 표현해보세요. '저는 이 메뉴가 좋을 것 같아요' 같은 간단한 것부터 시작하세요.",
          difficulty: "쉬움"
        },
        {
          title: "거절 연습하기",
          description: "부담스러운 요청을 받았을 때 '생각해보고 말씀드릴게요'라고 시간을 벌고, 진심으로 원하는지 고민한 후 답변하는 연습을 해보세요.",
          difficulty: "보통"
        },
        {
          title: "자기 주장 기법 배우기",
          description: "'저는 ~라고 생각합니다', '제 입장에서는 ~입니다'와 같은 I-message 기법을 사용해 부드럽지만 명확하게 의견을 표현해보세요.",
          difficulty: "어려움"
        }
      ],
      aggressive: [
        {
          title: "일시정지 기법 사용하기",
          description: "강하게 반응하고 싶을 때 '잠깐, 생각해볼게요'라고 말하고 10초간 숨을 고르는 연습을 해보세요. 이 작은 변화가 큰 차이를 만들 것입니다.",
          difficulty: "쉬움"
        },
        {
          title: "상대방 감정 확인하기",
          description: "의견을 제시하기 전에 '이런 상황에서 어떤 기분이신지 궁금해요'라고 상대방 감정을 먼저 확인하는 습관을 만들어보세요.",
          difficulty: "보통"
        },
        {
          title: "협력적 문제해결 연습하기",
          description: "'내가 맞다'가 아닌 '우리가 함께 해결할 수 있는 방법이 뭘까?'라는 관점으로 접근하는 연습을 해보세요. Win-Win 사고를 기르는 것이 핵심입니다.",
          difficulty: "어려움"
        }
      ],
      passive_aggressive: [
        {
          title: "감정 즉시 표현하기",
          description: "불편함을 느끼는 순간, 하루를 넘기지 말고 '지금 좀 불편한 감정이 드는데요'라고 바로 표현해보세요. 연습할수록 쉬워집니다.",
          difficulty: "쉬움"
        },
        {
          title: "직접적 피드백 주기",
          description: "상대방의 행동이 마음에 들지 않을 때, 다른 사람에게 말하거나 돌려서 표현하지 말고, 당사자에게 직접 정중하게 말해보세요.",
          difficulty: "보통"
        },
        {
          title: "갈등 회피 패턴 바꾸기",
          description: "어려운 대화를 피하고 싶은 마음이 들 때, 오히려 '이 대화가 어렵지만 중요하다고 생각해요'라고 말하며 정면으로 마주하는 연습을 해보세요.",
          difficulty: "어려움"
        }
      ]
    };

    return improvementMap[type] || [];
  };

  const relatedTests = [
    {
      title: "애착 유형 검사",
      description: "어린 시절 형성된 애착 패턴 분석",
      path: "/assessment?test=attachment",
      duration: "5분"
    },
    {
      title: "자존감 측정",
      description: "건강한 관계의 기초인 자존감 체크",
      path: "/assessment?test=selfesteem",
      duration: "4분"
    },
    {
      title: "성격 5요인 검사",
      description: "관계에서 나타나는 성격 특성 파악",
      path: "/assessment?test=bigfive",
      duration: "5분"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div id="relationship-style-result" className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-pink-500/10">
              <IconComponent className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold">{isEnglish ? "Relationship Style Results" : "관계 스타일 진단 결과"}</h1>
          </div>
          <p className="text-muted-foreground">
            {isEnglish ? "Check your relationship patterns and areas for improvement" : "당신의 인간관계 패턴과 개선 방향을 확인해보세요"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 주요 결과 */}
            <Card className="border-pink-200/50">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <IconComponent className={`w-12 h-12 ${result.result.color}`} />
                  <CardTitle className={`text-2xl ${result.result.color}`}>
                    {result.result.title}
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-lg">
                  {result.result.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      주요 특징
                    </h4>
                    <div className="grid gap-2">
                      {result.result.characteristics.map((char, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{char}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                    <h4 className="font-semibold mb-2 text-pink-700 dark:text-pink-300">
                      💡 전문가 조언
                    </h4>
                    <p className="text-sm text-pink-600 dark:text-pink-200 leading-relaxed mb-3">
                      {result.result.advice}
                    </p>
                    
                    {/* Enhanced advice based on type */}
                    <div className="text-xs text-pink-500 dark:text-pink-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                      <strong>관계 전문가 추가 조언:</strong><br/>
                      {result.type === 'secure' || result.type === 'assertive' 
                        ? "당신의 건강한 소통 능력은 다른 사람들에게도 긍정적인 영향을 미칩니다. 멘토링이나 코칭 역할을 통해 더 많은 사람들과 좋은 관계를 형성해보세요. 또한 스트레스가 높은 상황에서도 이런 균형을 유지하는 연습을 해보시길 권합니다."
                        : result.type === 'anxious' || result.type === 'passive'
                        ? "관계에서 느끼는 불안감은 사랑하고 있다는 증거이기도 합니다. 이 에너지를 자기계발이나 개인적 성취로도 돌려보세요. 매일 10분씩 명상이나 일기 쓰기를 통해 내면의 안정감을 기르는 것을 추천합니다."
                        : result.type === 'avoidant' || result.type === 'aggressive'  
                        ? "독립적이고 주도적인 성향은 리더십의 자질입니다. 다만 혼자서 모든 것을 해결하려 하지 마시고, 팀워크의 힘을 경험해보세요. 주 1회 정도는 다른 사람의 의견을 적극적으로 구하고 수용하는 연습을 해보시길 바랍니다."
                        : "각자의 소통 스타일을 이해하고 존중하는 것이 건강한 관계의 첫걸음입니다. 상대방의 반응을 관찰하며 어떤 방식이 가장 효과적인지 학습해보세요."
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 점수 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  관계 스타일 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.scores).map(([type, score]) => {
                    const percentage = getScorePercentage(type);
                    
                    // Dynamic type mapping for both relationship and communication styles
                    const relationshipTypes = {
                      secure: { name: "안정형", color: "bg-green-500" },
                      anxious: { name: "불안형", color: "bg-orange-500" },
                      avoidant: { name: "회피형", color: "bg-blue-500" },
                      dismissive: { name: "무시형", color: "bg-purple-500" }
                    };
                    
                    const communicationTypes = {
                      assertive: { name: "단정적", color: "bg-green-500" },
                      passive: { name: "수동적", color: "bg-blue-500" },
                      aggressive: { name: "공격적", color: "bg-red-500" },
                      passive_aggressive: { name: "소극적 공격", color: "bg-orange-500" }
                    };
                    
                    const types = { ...relationshipTypes, ...communicationTypes };
                    const currentType = types[type as keyof typeof types];
                    
                    if (!currentType) return null;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{currentType.name}</span>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${currentType.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 개선 방법 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  관계 개선 방법
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getImprovementsByType(result.type).map((improvement, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{improvement.title}</h4>
                        <Badge variant={
                          improvement.difficulty === "쉬움" ? "default" :
                          improvement.difficulty === "보통" ? "secondary" : "destructive"
                        }>
                          {improvement.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{improvement.description}</p>
                    </div>
                  ))}
                  
                  {/* Additional detailed insights */}
                  <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                      🌟 심화 분석 
                    </h4>
                    <p className="text-sm text-purple-600 dark:text-purple-200 leading-relaxed">
                      {result.type === 'secure' || result.type === 'assertive' 
                        ? "당신은 이미 건강한 소통 기반을 가지고 있습니다. 이제는 다른 사람들을 도와주고 이끄는 역할에 도전해보세요. 팀에서 갈등 중재자나 소통 촉진자 역할을 맡으면 더 큰 성장을 경험할 수 있을 것입니다."
                        : result.type === 'anxious' || result.type === 'passive'
                        ? "불안하거나 소극적인 모습은 단점이 아니라 섬세함과 배려심의 다른 표현입니다. 이런 특성을 유지하면서도 자신의 목소리를 내는 방법을 찾아가세요. 작은 성공 경험들이 쌓이면 자신감도 함께 성장할 것입니다."
                        : result.type === 'avoidant' || result.type === 'aggressive'
                        ? "독립성과 결단력은 당신의 큰 장점입니다. 이제는 이런 강점을 유지하면서도 다른 사람들과의 연결고리를 만들어가는 것이 중요합니다. 관계는 약함이 아니라 더 큰 힘의 원천이 될 수 있습니다."
                        : "모든 소통 스타일에는 각각의 장점이 있습니다. 중요한 것은 상황에 맞게 유연하게 대응하는 것입니다. 다양한 소통 방식을 연습하며 자신만의 균형점을 찾아가세요."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* 액션 버튼 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    onClick={handleShare}
                    variant="outline" 
                    className="w-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    결과 공유하기
                  </Button>
                  <Button 
                    onClick={() => navigate('/ai-counselor?mode=relationship')}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    AI 관계 상담받기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 추천 검사 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">추천 검사</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedTests.map((test, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(test.path)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{test.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {test.duration}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{test.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 전문가 상담 */}
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">전문가 상담</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  관계 전문 상담사와 1:1 상담을 받아보세요
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/expert-hiring')}
                  className="w-full"
                >
                  상담사 찾기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center space-x-4 flex flex-wrap justify-center gap-2">
          <Button 
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
          >
            {isDownloadingPDF ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            PDF 저장
          </Button>
          {onBack ? (
            <Button 
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              다시 테스트하기
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              홈으로 돌아가기
            </Button>
          )}
          <Button 
            onClick={() => navigate('/assessment')}
          >
            다른 테스트 하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export { RelationshipStyleResult };