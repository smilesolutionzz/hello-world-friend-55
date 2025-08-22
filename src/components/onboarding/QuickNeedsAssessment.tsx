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
  Zap
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
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200',
      tests: [
        {
          id: 'basic',
          name: '3분 스트레스 체크',
          tokenCost: '1토큰',
          duration: '3분',
          route: '/assessment',
          badge: '빠른시작',
          badgeColor: 'bg-blue-500'
        },
        {
          id: 'work-stress',
          name: '직장 스트레스 검사',
          tokenCost: '5토큰',
          duration: '15분',
          route: '/premium-assessment?type=work-stress',
          badge: '직장인 추천',
          badgeColor: 'bg-purple-500'
        },
        {
          id: 'ai-chat',
          name: 'AI 스트레스 상담',
          tokenCost: '5토큰',
          duration: '30분',
          route: '/ai-counselor',
          badge: '즉시상담',
          badgeColor: 'bg-green-500'
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
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-50 border-red-200',
      tests: [
        {
          id: 'depression-screening',
          name: '우울증 선별검사',
          tokenCost: '2토큰',
          duration: '10분',
          route: '/assessment?type=depression',
          badge: '전문검사',
          badgeColor: 'bg-red-500'
        },
        {
          id: 'mood-analysis',
          name: '감정상태 종합분석',
          tokenCost: '8토큰',
          duration: '25분',
          route: '/premium-assessment?type=mood',
          badge: '심화분석',
          badgeColor: 'bg-purple-500'
        },
        {
          id: 'expert-consultation',
          name: '전문가 30분 상담',
          tokenCost: '30토큰',
          duration: '30분',
          route: '/experts',
          badge: '전문상담',
          badgeColor: 'bg-gold-500'
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
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-orange-50 border-orange-200',
      tests: [
        {
          id: 'panic-test',
          name: '불안장애 검사',
          tokenCost: '2토큰',
          duration: '8분',
          route: '/assessment?type=panic',
          badge: '필수검사',
          badgeColor: 'bg-orange-500'
        },
        {
          id: 'anxiety-comprehensive',
          name: '불안증 종합분석',
          tokenCost: '8토큰',
          duration: '20분',
          route: '/premium-assessment?type=anxiety',
          badge: '정밀분석',
          badgeColor: 'bg-purple-500'
        },
        {
          id: 'crisis-support',
          name: 'AI 즉시 지원',
          tokenCost: '5토큰',
          duration: '즉시',
          route: '/ai-counselor?mode=crisis',
          badge: '응급지원',
          badgeColor: 'bg-red-600'
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
      icon: <Target className="w-6 h-6" />,
      color: 'bg-purple-50 border-purple-200',
      tests: [
        {
          id: 'adhd-test',
          name: 'ADHD 자가진단',
          tokenCost: '3토큰',
          duration: '12분',
          route: '/assessment?type=adhd',
          badge: '집중력',
          badgeColor: 'bg-purple-500'
        },
        {
          id: 'attention-analysis',
          name: '주의력 종합평가',
          tokenCost: '8토큰',
          duration: '30분',
          route: '/premium-assessment?type=attention',
          badge: '정밀진단',
          badgeColor: 'bg-indigo-500'
        },
        {
          id: 'behavior-log',
          name: '행동관찰 일지',
          tokenCost: '3토큰',
          duration: '지속적',
          route: '/observation',
          badge: '장기관리',
          badgeColor: 'bg-green-500'
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
      icon: <Baby className="w-6 h-6" />,
      color: 'bg-green-50 border-green-200',
      tests: [
        {
          id: 'language-development',
          name: '언어발달 검사',
          tokenCost: '3토큰',
          duration: '15분',
          route: '/assessment?type=language',
          badge: '발달평가',
          badgeColor: 'bg-green-500'
        },
        {
          id: 'child-comprehensive',
          name: '아동 종합발달검사',
          tokenCost: '8토큰',
          duration: '25분',
          route: '/premium-assessment?type=child',
          badge: '전문평가',
          badgeColor: 'bg-blue-500'
        },
        {
          id: 'family-package',
          name: '가족케어 패키지',
          tokenCost: '20토큰',
          duration: '종합',
          route: '/family',
          badge: '가족관리',
          badgeColor: 'bg-pink-500'
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
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-violet-50 border-violet-200',
      tests: [
        {
          id: 'premium-full',
          name: '프리미엄 종합검사',
          tokenCost: '8토큰',
          duration: '30분',
          route: '/premium-assessment',
          badge: '최고급',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-blue-500'
        },
        {
          id: 'personality-analysis',
          name: '성격유형 분석',
          tokenCost: '5토큰',
          duration: '20분',
          route: '/premium-assessment?type=personality',
          badge: '성격분석',
          badgeColor: 'bg-violet-500'
        },
        {
          id: 'expert-60min',
          name: '전문가 60분 상담',
          tokenCost: '50토큰',
          duration: '60분',
          route: '/experts?type=video',
          badge: '프리미엄',
          badgeColor: 'bg-gold-600'
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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-6">
          <Button 
            onClick={() => setSelectedConcern('')}
            variant="ghost"
            className="mb-4"
          >
            ← 다른 영역 선택
          </Button>
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            {selectedRecommendation.icon}
            {selectedRecommendation.title} 맞춤 패키지
          </h2>
          <p className="text-muted-foreground">{selectedRecommendation.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 추천 테스트들 */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold mb-4">추천 테스트 과정</h3>
            {selectedRecommendation.tests.map((test, index) => (
              <Card key={test.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.duration}</p>
                      </div>
                    </div>
                    <Badge className={`${test.badgeColor} text-white`}>
                      {test.badge}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{test.tokenCost}</span>
                    <Button 
                      size="sm"
                      onClick={() => navigate(test.route)}
                      className="flex items-center gap-1"
                    >
                      시작하기
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 기대효과 */}
          <div className="space-y-4">
            <Card className={selectedRecommendation.color}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5" />
                  이런 효과를 기대할 수 있어요
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedRecommendation.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  추천 순서
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-2">처음이시라면:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>기본 검사로 시작</li>
                  <li>결과에 따라 심화 검사</li>
                  <li>필요시 전문가 상담</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">어떤 도움이 필요하신가요?</h1>
        <p className="text-muted-foreground mb-4">
          가장 관심 있는 영역을 선택하시면 맞춤형 테스트 패키지를 추천해드립니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickRecommendations.map((recommendation) => (
          <Card 
            key={recommendation.concern}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${recommendation.color}`}
            onClick={() => setSelectedConcern(recommendation.concern)}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/80 rounded-full flex items-center justify-center">
                {recommendation.icon}
              </div>
              <CardTitle className="text-xl">{recommendation.title}</CardTitle>
              <CardDescription className="text-center">
                {recommendation.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium">
                  {recommendation.tests.length}개 맞춤 테스트
                </p>
                <div className="flex items-center justify-center gap-1">
                  {recommendation.tests.map((_, index) => (
                    <div key={index} className="w-2 h-2 bg-primary/60 rounded-full" />
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full"
                variant="outline"
              >
                자세히 보기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">어떤 걸 선택해야 할지 모르겠다면?</h3>
            <p className="text-muted-foreground mb-4">
              3분 기본 검사로 시작해서 개인 맞춤 추천을 받아보세요
            </p>
            <Button 
              onClick={() => navigate('/assessment')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              3분 기본 검사 시작
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}