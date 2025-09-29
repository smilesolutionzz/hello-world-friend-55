import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from "@/components/common/SEOHead";
import { PageContainer } from "@/components/ui/page-container";
import { Typography, VisualContainer, VisualCard, VisualButton } from "@/components/ui/visual-hierarchy";
import { VisualGrid, VisualSection, VisualHeader, VisualFlow } from "@/components/ui/enhanced-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Heart, 
  Star, 
  Users, 
  TrendingUp, 
  Zap, 
  Target, 
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  MessageCircle
} from "lucide-react";

const EnhancedDesignShowcase = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="HilightPro - AI 기반 심리 분석 플랫폼" 
        description="시각적 무게감과 균형을 고려한 혁신적인 UI/UX 디자인으로 제공되는 AI 기반 심리 분석 서비스"
        keywords="AI 심리분석, UI UX 디자인, 시각적 무게감, 감정분석, 개인맞춤분석"
      />

      <PageContainer className="p-0">
        <div className="min-h-screen bg-modern overflow-hidden">
          {/* Enhanced Header with Visual Hierarchy */}
          <VisualHeader sticky visualWeight="bold" glassMorphism>
            <div className="flex items-center gap-md">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <Typography weight="big" emphasis="primary" className="font-display">
                HilightPro
              </Typography>
            </div>
            
            <div className="hidden md:flex items-center gap-lg">
              <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')}>
                무료 테스트
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/experts')}>
                전문가
              </Button>
              <Button variant="hero" size="default" visualEffect="glow" onClick={() => navigate('/auth')}>
                시작하기
              </Button>
            </div>
          </VisualHeader>

          {/* Hero Section with Maximum Visual Weight */}
          <VisualSection hierarchy="hero" visualWeight="dominant" background="gradient" spacing="spacious">
            <VisualFlow direction="vertical" visualRhythm="dramatic" emphasis="center">
              <div className="text-center space-y-lg max-w-5xl mx-auto">
                <Badge variant="secondary" className="mb-lg animate-visual-emphasis">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <Typography weight="tiny" emphasis="secondary">
                    시각적 무게감 기반 디자인 시스템 적용
                  </Typography>
                </Badge>
                
                <Typography 
                  weight="giant" 
                  emphasis="primary" 
                  balance="symmetric"
                  className="text-center animate-fade-in"
                >
                  AI가 읽어내는
                  <br />
                  <span className="text-gradient-modern relative">
                    당신의 진짜 마음
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-glow"></div>
                  </span>
                </Typography>
                
                <Typography 
                  weight="medium" 
                  emphasis="tertiary" 
                  balance="symmetric"
                  className="text-center max-w-3xl mx-auto animate-fade-in"
                  style={{ animationDelay: '0.2s' }}
                >
                  시각적 무게감과 균형을 고려한 직관적 디자인으로
                  <br />
                  더욱 정확하고 깊이 있는 심리 분석을 경험하세요
                </Typography>
                
                <div className="flex flex-col sm:flex-row gap-lg items-center justify-center mt-2xl">
                  <Button 
                    variant="hero" 
                    size="xl" 
                    visualEffect="float"
                    onClick={() => navigate('/free-trial')}
                    className="animate-fade-in"
                    style={{ animationDelay: '0.4s' }}
                  >
                    <Zap className="mr-2" />
                    무료 체험 시작
                    <ArrowRight className="ml-2" />
                  </Button>
                  <Button 
                    variant="elevated" 
                    size="lg" 
                    weight="semibold"
                    onClick={() => navigate('/experts')}
                    className="animate-fade-in"
                    style={{ animationDelay: '0.5s' }}
                  >
                    <Users className="mr-2" />
                    전문가 상담
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-xl mt-2xl text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center gap-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <Typography weight="small" emphasis="subtle">무료 체험</Typography>
                  </div>
                  <div className="flex items-center gap-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <Typography weight="small" emphasis="subtle">즉시 결과</Typography>
                  </div>
                  <div className="flex items-center gap-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <Typography weight="small" emphasis="subtle">개인정보 보호</Typography>
                  </div>
                </div>
              </div>
            </VisualFlow>
          </VisualSection>

          {/* Features Section with Asymmetric Balance */}
          <VisualSection hierarchy="primary" spacing="spacious" visualWeight="strong" background="transparent">
            <VisualFlow direction="vertical" visualRhythm="dynamic" emphasis="center">
              <div className="text-center mb-3xl">
                <Typography weight="huge" emphasis="primary" balance="center" className="mb-lg">
                  시각적 무게감이 적용된 핵심 기능
                </Typography>
                <Typography weight="normal" emphasis="tertiary" balance="center" className="max-w-2xl mx-auto">
                  각 기능의 중요도에 따라 시각적 무게감을 차별화하여 직관적인 사용자 경험을 제공합니다
                </Typography>
              </div>
              
              {/* Asymmetric Grid Layout - Golden Ratio */}
              <VisualGrid balance="golden" visualFlow="center-focus" spacing="comfortable">
                {/* Primary Feature - Heavy Visual Weight */}
                <VisualCard visualWeight="heavy" interactive floating className="h-full">
                  <CardHeader className="space-y-lg p-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-visual-primary flex items-center justify-center shadow-2xl animate-glow">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-md">
                      <Typography weight="large" emphasis="primary">
                        AI 감정 분석
                      </Typography>
                      <Typography weight="normal" emphasis="tertiary" className="leading-relaxed">
                        고도화된 AI 알고리즘으로 음성, 표정, 텍스트를 종합 분석하여 정확한 감정 상태를 파악합니다. 시각적 무게감을 높여 핵심 기능임을 강조했습니다.
                      </Typography>
                    </div>
                    <Button variant="primary" size="lg" className="w-full mt-lg" onClick={() => navigate('/voice-emotion-analysis')}>
                      체험해보기
                      <Play className="ml-2 w-4 h-4" />
                    </Button>
                  </CardHeader>
                </VisualCard>
                
                {/* Secondary Features - Medium Visual Weight */}
                <div className="space-y-lg">
                  <VisualCard visualWeight="medium" interactive floating>
                    <CardHeader className="p-lg">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-visual-secondary flex items-center justify-center shadow-lg">
                        <Star className="w-7 h-7 text-white" />
                      </div>
                      <div className="space-y-sm">
                        <Typography weight="big" emphasis="secondary">개인 맞춤 분석</Typography>
                        <Typography weight="small" emphasis="tertiary">
                          개인의 특성과 상황을 고려한 맞춤형 분석으로 더욱 정확한 결과를 제공합니다.
                        </Typography>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/assessment')}>
                        분석 시작
                      </Button>
                    </CardHeader>
                  </VisualCard>
                  
                  <VisualCard visualWeight="medium" interactive floating>
                    <CardHeader className="p-lg">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-visual-secondary flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <div className="space-y-sm">
                        <Typography weight="big" emphasis="secondary">실시간 모니터링</Typography>
                        <Typography weight="small" emphasis="tertiary">
                          지속적인 상태 추적으로 변화를 실시간으로 모니터링합니다.
                        </Typography>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/growth-tracker')}>
                        추적 시작
                      </Button>
                    </CardHeader>
                  </VisualCard>
                </div>
              </VisualGrid>
              
              {/* Additional Features - Symmetric Grid */}
              <VisualGrid balance="symmetric" visualFlow="distributed" spacing="comfortable" className="mt-3xl">
                <VisualCard visualWeight="light" interactive floating>
                  <CardContent className="p-lg space-y-md text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-visual-tertiary flex items-center justify-center mx-auto shadow-md">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <Typography weight="medium" emphasis="secondary">목표 설정</Typography>
                    <Typography weight="tiny" emphasis="subtle">개인 목표 달성을 위한 체계적 지원</Typography>
                  </CardContent>
                </VisualCard>
                
                <VisualCard visualWeight="light" interactive floating>
                  <CardContent className="p-lg space-y-md text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-visual-tertiary flex items-center justify-center mx-auto shadow-md">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <Typography weight="medium" emphasis="secondary">보안 우선</Typography>
                    <Typography weight="tiny" emphasis="subtle">강화된 보안으로 개인정보 완벽 보호</Typography>
                  </CardContent>
                </VisualCard>
                
                <VisualCard visualWeight="light" interactive floating>
                  <CardContent className="p-lg space-y-md text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-visual-tertiary flex items-center justify-center mx-auto shadow-md">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <Typography weight="medium" emphasis="secondary">전문가 검증</Typography>
                    <Typography weight="tiny" emphasis="subtle">임상 전문가가 검증한 과학적 분석</Typography>
                  </CardContent>
                </VisualCard>
              </VisualGrid>
            </VisualFlow>
          </VisualSection>

          {/* Statistics Section with Visual Balance */}
          <VisualSection hierarchy="secondary" background="glass" spacing="comfortable" visualWeight="medium">
            <VisualContainer hierarchy="primary" balance="symmetric">
              <div className="text-center mb-2xl">
                <Typography weight="large" emphasis="primary" balance="center" className="mb-md">
                  신뢰할 수 있는 결과
                </Typography>
                <Typography weight="normal" emphasis="tertiary" balance="center">
                  수많은 사용자가 검증한 정확성과 신뢰성
                </Typography>
              </div>
              
              <VisualGrid balance="symmetric" spacing="spacious">
                <div className="text-center space-y-sm group cursor-pointer">
                  <Typography weight="huge" emphasis="primary" className="text-primary-strong group-hover:scale-110 transition-transform duration-300">
                    98.7%
                  </Typography>
                  <Typography weight="medium" emphasis="secondary">분석 정확도</Typography>
                  <Typography weight="tiny" emphasis="subtle">임상 데이터 기반</Typography>
                </div>
                <div className="text-center space-y-sm group cursor-pointer">
                  <Typography weight="huge" emphasis="primary" className="text-primary-strong group-hover:scale-110 transition-transform duration-300">
                    50K+
                  </Typography>
                  <Typography weight="medium" emphasis="secondary">만족한 사용자</Typography>
                  <Typography weight="tiny" emphasis="subtle">누적 사용자 수</Typography>
                </div>
                <div className="text-center space-y-sm group cursor-pointer">
                  <Typography weight="huge" emphasis="primary" className="text-primary-strong group-hover:scale-110 transition-transform duration-300">
                    24/7
                  </Typography>
                  <Typography weight="medium" emphasis="secondary">전문가 지원</Typography>
                  <Typography weight="tiny" emphasis="subtle">언제든 상담 가능</Typography>
                </div>
                <div className="text-center space-y-sm group cursor-pointer">
                  <Typography weight="huge" emphasis="primary" className="text-primary-strong group-hover:scale-110 transition-transform duration-300">
                    4.9★
                  </Typography>
                  <Typography weight="medium" emphasis="secondary">사용자 만족도</Typography>
                  <Typography weight="tiny" emphasis="subtle">5점 만점 기준</Typography>
                </div>
              </VisualGrid>
            </VisualContainer>
          </VisualSection>

          {/* CTA Section with Dramatic Visual Weight */}
          <VisualSection hierarchy="primary" background="gradient" spacing="dramatic" visualWeight="dominant">
            <VisualContainer hierarchy="primary" balance="centered">
              <div className="text-center space-y-xl">
                <Typography weight="huge" emphasis="primary" balance="center" className="mb-lg">
                  지금 바로 시작하세요
                </Typography>
                <Typography weight="normal" emphasis="tertiary" balance="center" className="max-w-2xl mx-auto">
                  시각적 무게감과 균형이 완벽하게 조화된 새로운 디자인 시스템을 경험하고,
                  AI가 제공하는 정확한 심리 분석을 받아보세요
                </Typography>
                
                <div className="flex flex-col sm:flex-row gap-lg items-center justify-center mt-2xl">
                  <Button 
                    variant="hero" 
                    size="xl" 
                    visualEffect="glow"
                    onClick={() => navigate('/free-trial')}
                  >
                    <MessageCircle className="mr-2" />
                    무료 체험 시작
                  </Button>
                  <Button 
                    variant="glass" 
                    size="lg"
                    onClick={() => navigate('/pricing')}
                  >
                    요금제 보기
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-lg mt-xl text-sm text-weight-subtle">
                  <span>✓ 신용카드 불필요</span>
                  <span>✓ 즉시 이용 가능</span>
                  <span>✓ 언제든 취소 가능</span>
                </div>
              </div>
            </VisualContainer>
          </VisualSection>
        </div>
      </PageContainer>
    </>
  );
};

export default EnhancedDesignShowcase;