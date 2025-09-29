import React from "react"
import { Typography, VisualContainer, VisualCard, VisualButton } from "./visual-hierarchy"
import { VisualGrid, VisualSection, VisualHeader, VisualFlow } from "./enhanced-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { Heart, Star, Users, TrendingUp, Zap, Target } from "lucide-react"

export function EnhancedDesignDemo() {
  return (
    <div className="min-h-screen bg-modern">
      {/* Enhanced Header with Visual Hierarchy */}
      <VisualHeader sticky visualWeight="bold" glassMorphism>
        <Typography weight="big" emphasis="primary" className="font-display">
          HilightPro
        </Typography>
        
        <div className="flex items-center gap-lg">
          <Button variant="ghost" size="sm">소개</Button>
          <Button variant="ghost" size="sm">기능</Button>
          <Button variant="hero" size="default" visualEffect="glow">
            무료 체험
          </Button>
        </div>
      </VisualHeader>

      {/* Hero Section with Maximum Visual Weight */}
      <VisualSection hierarchy="hero" visualWeight="dominant" background="gradient" spacing="spacious">
        <VisualFlow direction="vertical" visualRhythm="dramatic" emphasis="center">
          <Typography 
            weight="giant" 
            emphasis="primary" 
            balance="symmetric"
            className="text-center max-w-4xl mx-auto"
          >
            AI 기반 심리 분석으로
            <br />
            <span className="text-gradient-modern">당신의 마음을 읽습니다</span>
          </Typography>
          
          <Typography 
            weight="medium" 
            emphasis="tertiary" 
            balance="symmetric"
            className="text-center max-w-2xl mx-auto mt-lg"
          >
            시각적 무게감과 균형을 고려한 디자인으로 더욱 직관적이고 아름다운 사용자 경험을 제공합니다
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-lg items-center justify-center mt-2xl">
            <Button variant="hero" size="xl" visualEffect="float">
              <Zap className="mr-2" />
              지금 시작하기
            </Button>
            <Button variant="elevated" size="lg" weight="semibold">
              <Users className="mr-2" />
              전문가 상담
            </Button>
          </div>
        </VisualFlow>
      </VisualSection>

      {/* Features Section with Asymmetric Balance */}
      <VisualSection hierarchy="primary" spacing="spacious" visualWeight="strong">
        <VisualFlow direction="vertical" visualRhythm="dynamic" emphasis="center">
          <Typography weight="huge" emphasis="primary" balance="center" className="mb-2xl">
            시각적 무게감이 적용된 기능들
          </Typography>
          
          {/* Asymmetric Grid Layout */}
          <VisualGrid balance="asymmetric" visualFlow="center-focus" spacing="comfortable">
            {/* Primary Feature - Heavy Visual Weight */}
            <VisualCard visualWeight="heavy" interactive floating className="md:col-span-2 lg:col-span-3">
              <CardHeader className="space-y-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-visual-primary flex items-center justify-center animate-glow">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <Typography weight="large" emphasis="primary">
                  AI 감정 분석
                </Typography>
                <Typography weight="normal" emphasis="tertiary">
                  고도화된 AI 알고리즘으로 음성, 표정, 텍스트를 종합 분석하여 정확한 감정 상태를 파악합니다. 시각적 무게감을 높여 중요도를 강조했습니다.
                </Typography>
              </CardHeader>
            </VisualCard>
            
            {/* Secondary Features - Medium Visual Weight */}
            <VisualCard visualWeight="medium" interactive className="space-y-md">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-visual-secondary flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <Typography weight="big" emphasis="secondary">개인 맞춤 분석</Typography>
                <Typography weight="small" emphasis="tertiary">개인의 특성에 맞는 분석 제공</Typography>
              </CardHeader>
            </VisualCard>
          </VisualGrid>
          
          {/* Symmetric Grid for Secondary Features */}
          <VisualGrid balance="symmetric" visualFlow="distributed" spacing="comfortable" className="mt-3xl">
            <VisualCard visualWeight="light" interactive floating>
              <CardContent className="p-lg space-y-md">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-visual-tertiary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <Typography weight="medium" emphasis="secondary">실시간 모니터링</Typography>
                <Typography weight="tiny" emphasis="subtle">지속적인 상태 추적</Typography>
              </CardContent>
            </VisualCard>
            
            <VisualCard visualWeight="light" interactive floating>
              <CardContent className="p-lg space-y-md">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-visual-tertiary flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <Typography weight="medium" emphasis="secondary">목표 설정</Typography>
                <Typography weight="tiny" emphasis="subtle">개인 목표 달성 지원</Typography>
              </CardContent>
            </VisualCard>
            
            <VisualCard visualWeight="subtle" interactive>
              <CardContent className="p-lg space-y-md">
                <Badge variant="secondary" className="w-fit">
                  <Typography weight="micro" emphasis="minimal">새로운 기능</Typography>
                </Badge>
                <Typography weight="small" emphasis="tertiary">더 많은 기능들이 곧 추가됩니다</Typography>
              </CardContent>
            </VisualCard>
          </VisualGrid>
        </VisualFlow>
      </VisualSection>

      {/* Statistics Section with Visual Balance */}
      <VisualSection hierarchy="secondary" background="glass" spacing="comfortable">
        <VisualContainer hierarchy="primary" balance="symmetric">
          <Typography weight="large" emphasis="primary" balance="center" className="mb-xl">
            신뢰할 수 있는 결과
          </Typography>
          
          <VisualGrid balance="symmetric" spacing="spacious">
            <div className="text-center space-y-sm">
              <Typography weight="huge" emphasis="primary" className="text-primary-strong">
                98%
              </Typography>
              <Typography weight="small" emphasis="secondary">정확도</Typography>
            </div>
            <div className="text-center space-y-sm">
              <Typography weight="huge" emphasis="primary" className="text-primary-strong">
                50K+
              </Typography>
              <Typography weight="small" emphasis="secondary">사용자</Typography>
            </div>
            <div className="text-center space-y-sm">
              <Typography weight="huge" emphasis="primary" className="text-primary-strong">
                24/7
              </Typography>
              <Typography weight="small" emphasis="secondary">지원</Typography>
            </div>
          </VisualGrid>
        </VisualContainer>
      </VisualSection>

      {/* CTA Section with Dramatic Visual Weight */}
      <VisualSection hierarchy="primary" background="gradient" spacing="dramatic" visualWeight="dominant">
        <VisualContainer hierarchy="primary" balance="centered">
          <Typography weight="huge" emphasis="primary" balance="center" className="mb-lg">
            지금 바로 시작하세요
          </Typography>
          <Typography weight="normal" emphasis="tertiary" balance="center" className="mb-2xl max-w-2xl">
            시각적 무게감과 균형이 완벽하게 조화된 새로운 디자인 시스템을 경험해보세요
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-lg items-center justify-center">
            <Button variant="hero" size="xl" visualEffect="glow">
              무료 체험 시작
            </Button>
            <Button variant="glass" size="lg">
              더 알아보기
            </Button>
          </div>
        </VisualContainer>
      </VisualSection>
    </div>
  )
}

export default EnhancedDesignDemo