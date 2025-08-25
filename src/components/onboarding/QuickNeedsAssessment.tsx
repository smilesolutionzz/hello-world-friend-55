import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Brain, 
  Shield, 
  Target,
  Baby,
  Crown,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  Sparkles,
  TrendingUp
} from "lucide-react";

interface QuickRecommendation {
  concern: string;
  title: string;
  description: string;
  tests: {
    id: string;
    name: string;
    tokenCost: string;
    duration: string;
    route: string;
    badge: string;
    badgeColor: string;
  }[];
  benefits: string[];
  icon: React.ReactNode;
  color: string;
}

export default function QuickNeedsAssessment() {
  const [selectedConcern, setSelectedConcern] = useState<string>('');
  const navigate = useNavigate();

  const quickRecommendations: QuickRecommendation[] = [
    {
      concern: 'stress',
      title: '스트레스 관리',
      description: '일상 스트레스, 번아웃, 피로감',
      icon: <Brain className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border-blue-200 shadow-blue-100',
      tests: [
        {
          id: 'basic',
          name: '3분 스트레스 체크',
          tokenCost: '2토큰',
          duration: '3분',
          route: '/assessment',
          badge: '빠른시작',
          badgeColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
        },
        {
          id: 'work-stress',
          name: '직장 스트레스 검사',
          tokenCost: '5토큰',
          duration: '15분',
          route: '/premium-assessment?type=work-stress',
          badge: '직장인 추천',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-violet-600'
        },
        {
          id: 'ai-chat',
          name: 'AI 스트레스 상담',
          tokenCost: '무료',
          duration: '30분',
          route: '/ai-counselor',
          badge: '즉시상담',
          badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-600'
        }
      ],
      benefits: [
        '스트레스 수준 정확한 측정',
        '개인별 맞춤 해결책 제공',
        '즉시 실행 가능한 관리법',
        '24시간 AI 상담 지원'
      ]
    },
    {
      concern: 'depression',
      title: '우울감',
      description: '기분저하, 무기력, 의욕상실',
      icon: <Heart className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-rose-50 via-pink-100 to-red-100 border-rose-200 shadow-rose-100',
      tests: [
        {
          id: 'depression-screening',
          name: '우울증 선별검사',
          tokenCost: '2토큰',
          duration: '10분',
          route: '/assessment?type=depression',
          badge: '전문검사',
          badgeColor: 'bg-gradient-to-r from-red-500 to-rose-600'
        },
        {
          id: 'mood-analysis',
          name: '감정상태 종합분석',
          tokenCost: '8토큰',
          duration: '25분',
          route: '/premium-assessment?type=mood',
          badge: '심화분석',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-600'
        },
        {
          id: 'expert-consultation',
          name: '전문가 30분 상담',
          tokenCost: '30토큰',
          duration: '30분',
          route: '/expert-list',
          badge: '전문상담',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-600'
        }
      ],
      benefits: [
        'DSM-5 기준 정확한 진단',
        '우울 정도 단계별 분석',
        '맞춤형 치료 계획 수립',
        '전문가 직접 상담 연결'
      ]
    },
    {
      concern: 'anxiety',
      title: '불안·걱정',
      description: '불안감, 공황, 사회불안',
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-100 border-orange-200 shadow-orange-100',
      tests: [
        {
          id: 'panic-test',
          name: '불안장애 검사',
          tokenCost: '2토큰',
          duration: '8분',
          route: '/assessment?type=panic',
          badge: '필수검사',
          badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-600'
        },
        {
          id: 'anxiety-comprehensive',
          name: '불안증 종합분석',
          tokenCost: '8토큰',
          duration: '20분',
          route: '/premium-assessment?type=anxiety',
          badge: '정밀분석',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-600'
        },
        {
          id: 'crisis-support',
          name: 'AI 즉시 지원',
          tokenCost: '무료',
          duration: '즉시',
          route: '/ai-counselor?mode=crisis',
          badge: '응급지원',
          badgeColor: 'bg-gradient-to-r from-red-600 to-rose-700'
        }
      ],
      benefits: [
        '불안 유형별 정확한 진단',
        '공황발작 대처 방법',
        '즉시 안정화 기법 제공',
        '24시간 위기개입 지원'
      ]
    },
    {
      concern: 'focus',
      title: '집중력 문제',
      description: 'ADHD, 주의산만, 과잉행동',
      icon: <Target className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-purple-50 via-violet-100 to-indigo-100 border-purple-200 shadow-purple-100',
      tests: [
        {
          id: 'adhd-test',
          name: 'ADHD 자가진단',
          tokenCost: '3토큰',
          duration: '12분',
          route: '/assessment?type=adhd',
          badge: '집중력',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-violet-600'
        },
        {
          id: 'attention-analysis',
          name: '주의력 종합평가',
          tokenCost: '8토큰',
          duration: '30분',
          route: '/premium-assessment?type=attention',
          badge: '정밀진단',
          badgeColor: 'bg-gradient-to-r from-indigo-500 to-purple-600'
        },
        {
          id: 'behavior-log',
          name: '행동관찰 일지',
          tokenCost: '3토큰',
          duration: '지속적',
          route: '/observation',
          badge: '장기관리',
          badgeColor: 'bg-gradient-to-r from-green-500 to-teal-600'
        }
      ],
      benefits: [
        'ADHD 정확한 선별진단',
        '집중력 향상 훈련법',
        '행동패턴 분석 및 개선',
        '가족 전체 관리 솔루션'
      ]
    },
    {
      concern: 'child',
      title: '아동 발달',
      description: '언어발달, 사회성, 학습능력',
      icon: <Baby className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100 border-green-200 shadow-green-100',
      tests: [
        {
          id: 'language-development',
          name: '언어발달 검사',
          tokenCost: '3토큰',
          duration: '15분',
          route: '/assessment?type=language',
          badge: '발달평가',
          badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-600'
        },
        {
          id: 'child-comprehensive',
          name: '아동 종합발달검사',
          tokenCost: '8토큰',
          duration: '25분',
          route: '/premium-assessment?type=child',
          badge: '전문평가',
          badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-600'
        },
        {
          id: 'family-package',
          name: '가족케어 패키지',
          tokenCost: '20토큰',
          duration: '종합',
          route: '/family',
          badge: '가족관리',
          badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-600'
        }
      ],
      benefits: [
        '발달단계별 정확한 평가',
        '조기개입 필요성 판단',
        '가정에서 할 수 있는 훈련',
        '전문기관 연계 서비스'
      ]
    },
    {
      concern: 'comprehensive',
      title: '종합 분석',
      description: '전반적인 정신건강 상태 점검',
      icon: <Crown className="w-8 h-8" />,
      color: 'bg-gradient-to-br from-violet-50 via-purple-100 to-fuchsia-100 border-violet-200 shadow-violet-100',
      tests: [
        {
          id: 'premium-full',
          name: '프리미엄 종합검사',
          tokenCost: '8토큰',
          duration: '30분',
          route: '/premium-assessment',
          badge: '최고급',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-600'
        },
        {
          id: 'personality-analysis',
          name: '성격유형 분석',
          tokenCost: '무료',
          duration: '20분',
          route: '/premium-assessment?type=personality',
          badge: '성격분석',
          badgeColor: 'bg-gradient-to-r from-violet-500 to-purple-600'
        },
        {
          id: 'expert-60min',
          name: 'AIH박사급리포팅',
          tokenCost: '50토큰',
          duration: '15페이지이상',
          route: '/expert-list?type=report',
          badge: '프리미엄',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-600'
        }
      ],
      benefits: [
        '15개 영역 종합 분석',
        '개인 맞춤 개선 계획',
        '전문가급 상세 리포트',
        '3개월 추적 관리 서비스'
      ]
    }
  ];

  const selectedRecommendation = quickRecommendations.find(r => r.concern === selectedConcern);

  if (selectedRecommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <div className="text-center mb-8">
            <Button 
              onClick={() => setSelectedConcern('')}
              variant="ghost"
              className="mb-6 hover:bg-white/60 backdrop-blur-sm"
            >
              ← 다른 영역 선택
            </Button>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent h-px"></div>
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                  {selectedRecommendation.icon}
                </div>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {selectedRecommendation.title}
                </span>
                <span className="text-foreground">맞춤 패키지</span>
              </h1>
              <p className="text-lg text-muted-foreground">{selectedRecommendation.description}에 최적화된 솔루션</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 추천 테스트들 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-2xl font-bold">추천 테스트 코스</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
              </div>
              
              {selectedRecommendation.tests.map((test, index) => (
                <Card 
                  key={test.id} 
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="relative p-6">
                      {/* 배경 그라데이션 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg shadow-lg">
                              {index + 1}
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <Star className="w-2 h-2 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{test.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{test.duration}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${test.badgeColor} text-white shadow-lg px-3 py-1`}>
                          {test.badge}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary">{test.tokenCost}</span>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <Button 
                          size="lg"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(`🚀 맞춤테스트 시작: ${test.name} -> ${test.route}`);
                            try {
                              navigate(test.route);
                              console.log(`✅ 네비게이션 성공: ${test.route}`);
                            } catch (error) {
                              console.error(`❌ 네비게이션 실패:`, error);
                            }
                          }}
                          className="group/btn bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 cursor-pointer"
                        >
                          <span className="mr-2">시작하기</span>
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 기대효과 */}
            <div className="space-y-6">
              <Card className={`${selectedRecommendation.color} border-0 shadow-xl overflow-hidden`}>
                <CardHeader className="relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
                  <CardTitle className="flex items-center gap-3 text-xl relative">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Star className="w-6 h-6" />
                    </div>
                    <span>이런 효과를 기대할 수 있어요</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedRecommendation.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span>추천 순서</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                    <p className="font-medium text-foreground mb-3">처음이시라면:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li className="flex items-center gap-2">
                        <span>기본 검사로 시작</span>
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>결과에 따라 심화 검사</span>
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>필요시 전문가 상담</span>
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">전문가 지원</h4>
                  <p className="text-sm text-muted-foreground mb-4">언제든지 전문가와 직접 상담 받으실 수 있습니다</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/expert-list');
                    }}
                    className="bg-white hover:bg-green-50 border-green-200 text-green-700"
                  >
                    전문가 상담 예약
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent h-32 rounded-full blur-3xl"></div>
            <h1 className="relative text-5xl font-bold mb-6 text-slate-800 dark:text-slate-100">
              어떤 도움이 필요하신가요?
            </h1>
          </div>
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl text-slate-700 dark:text-slate-200 mb-4 font-medium leading-relaxed">
              가장 관심 있는 영역을 선택하시면 
              <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg mx-1">맞춤형 테스트 패키지</span>
              를 추천해드립니다
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-6 py-3 rounded-full border border-yellow-200 dark:border-yellow-700 mx-auto w-fit shadow-sm">
            <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-slate-800 dark:text-slate-100 font-semibold">AIHPRO가 분석한 최적의 검사과정</span>
            <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickRecommendations.map((recommendation, index) => (
            <Card 
              key={recommendation.concern}
              className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${recommendation.color} border-0 overflow-hidden relative`}
              onClick={() => {
                console.log(`카드 클릭: ${recommendation.title}`);
                setSelectedConcern(recommendation.concern);
              }}
            >
              {/* 호버 효과 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* 카드 번호 */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              
              <CardHeader className="text-center pb-4 relative">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"></div>
                  <div className="relative w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {recommendation.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl mb-3 group-hover:scale-105 transition-transform duration-300 text-slate-800 dark:text-slate-100">
                  {recommendation.title}
                </CardTitle>
                <CardDescription className="text-center font-medium text-slate-600 dark:text-slate-300 text-base">
                  {recommendation.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center relative">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-white/50 px-3 py-1 rounded-full">
                      {recommendation.tests.length}개 맞춤 테스트
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1">
                    {recommendation.tests.map((_, testIndex) => (
                      <div 
                        key={testIndex} 
                        className="w-2 h-2 bg-primary/60 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all duration-300"
                        style={{ transitionDelay: `${testIndex * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-white/40 backdrop-blur-sm border-2 border-white/50 text-slate-800 dark:text-slate-100 hover:bg-white/60 hover:scale-105 transition-all duration-300 group-hover:shadow-lg font-semibold cursor-pointer"
                  variant="outline"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`자세히보기 클릭: ${recommendation.title}`);
                    try {
                      // Navigate to specific package page instead of showing inline
                      const packageRoutes = {
                        'stress': '/stress-package',
                        'depression': '/depression-package',
                        'anxiety': '/anxiety-package',
                        'focus': '/focus-package',
                        'child': '/child-package',
                        'comprehensive': '/comprehensive-package'
                      };
                      const route = packageRoutes[recommendation.concern as keyof typeof packageRoutes];
                      if (route) {
                        navigate(route);
                        console.log(`✅ 패키지 페이지 이동: ${route}`);
                      } else {
                        setSelectedConcern(recommendation.concern);
                        console.log(`✅ 자세히보기 성공: ${recommendation.concern}`);
                      }
                    } catch (error) {
                      console.error(`❌ 자세히보기 실패:`, error);
                    }
                  }}
                >
                  <span className="mr-2">자세히 보기</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 border-2 border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">어떤 걸 선택해야 할지 모르겠다면?</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-200 mb-6 text-lg max-w-xl mx-auto font-medium">
                3분 기본 검사로 시작해서 개인 맞춤 추천을 받아보세요
              </p>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('3분 기본 검사 시작 클릭');
                    try {
                      navigate('/assessment');
                      console.log('✅ 기본검사 네비게이션 성공');
                    } catch (error) {
                      console.error('❌ 기본검사 네비게이션 실패:', error);
                    }
                  }}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg cursor-pointer"
                >
                <Clock className="w-5 h-5 mr-2" />
                3분 기본 검사 시작
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}