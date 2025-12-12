import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Clock, Users, Infinity, Gift, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewPricingPlans = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">단 한 번의 결제로 평생 이용</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          월 구독 부담 없이, <span className="font-semibold text-primary">92,000원</span>으로 모든 기능을 평생 이용하세요
        </p>
        
        {/* Lifetime Special Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-xl p-6 border-2 border-primary/30">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">평생이용권 특별 할인</span>
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <p className="text-lg font-medium mb-2">
            <span className="line-through text-muted-foreground text-base mr-2">₩299,000</span>
            <span className="text-3xl font-bold text-primary">₩92,000</span>
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-green-600">69% 할인</span> • 
            추가 결제 없음 • 평생 업데이트 포함
          </p>
        </div>
        
        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 dark:text-orange-100">
              🎉 <span className="text-primary font-bold">론칭 기념 특가</span> - 선착순 <span className="font-bold text-red-600">500명</span> 한정!
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>현재 <span className="font-bold text-primary">387명</span>이 신청했습니다</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Trial Card */}
        <Card className="relative">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-green-600" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-xl">무료 체험</CardTitle>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  무료
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">₩0</span>
                </div>
                <p className="text-sm text-muted-foreground">결제 정보 필요 없음</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                '무료 10토큰 제공',
                '심리검사 2-3회 체험',
                '기본 관찰일지 5회',
                'AI 기본 분석',
                '커뮤니티 접근'
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <p className="text-xs text-muted-foreground font-medium">제한사항:</p>
              {[
                '고급 AI 분석 제한',
                'PDF 다운로드 제한',
                '전문가 매칭 제한'
              ].map((limitation, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <X className="w-3 h-3" />
                  <span>{limitation}</span>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => navigate('/free-trial')}
              variant="outline"
              size="lg"
              className="w-full"
            >
              무료로 시작하기
            </Button>
          </CardContent>
        </Card>

        {/* Lifetime Card */}
        <Card className="relative border-2 border-transparent bg-gradient-to-b from-purple-500/10 to-pink-500/10 ring-2 ring-primary shadow-xl">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg px-4 py-1">
              <Crown className="w-3 h-3 mr-1" />
              베스트
            </Badge>
          </div>
          
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Infinity className="w-7 h-7 text-white" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-xl">평생이용권</CardTitle>
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse">
                  🔥 69% 할인
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">₩92,000</span>
                </div>
                <p className="text-sm font-medium text-primary">평생 1회 결제</p>
                <p className="text-xs text-muted-foreground line-through">정가 ₩299,000</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                '모든 심리테스트 무제한',
                '관찰일지 무제한 작성',
                'AI 고급 분석 무제한',
                '상세 PDF 리포트 다운로드',
                '전문 해석 및 맞춤 솔루션',
                '24시간 AI 채팅 상담',
                '전문가 1:1 상담 연결',
                '가족 계정 관리',
                '위기상황 즉시 알림',
                '✨ 평생 무료 업데이트'
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => navigate('/subscription', { state: { plan: 'lifetime' } })}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              평생이용권 구매하기
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              ✓ 추가 결제 없음 • 7일 환불 보장
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Guarantee Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800 text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-lg text-green-800 dark:text-green-200">
            100% 만족 보장
          </h3>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">
          구매 후 7일 이내 불만족 시 전액 환불 • 평생 무료 업데이트 • 평생 고객 지원
        </p>
      </div>
      
      {/* FAQ 섹션 */}
      <div className="bg-muted/30 rounded-lg p-6 max-w-4xl mx-auto">
        <h3 className="font-bold text-lg mb-4 text-center">자주 묻는 질문</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Q. 평생이용권이란?</p>
            <p className="text-muted-foreground">92,000원 1회 결제로 모든 기능을 평생 이용합니다. 추가 결제 없이 향후 업데이트도 포함됩니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 무료 체험 후 자동 결제되나요?</p>
            <p className="text-muted-foreground">아니요, 자동 결제되지 않습니다. 직접 구매 시에만 결제됩니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 이 가격은 언제까지인가요?</p>
            <p className="text-muted-foreground">론칭 기념 특가로 선착순 500명 한정입니다. 조기 마감될 수 있습니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 환불이 가능한가요?</p>
            <p className="text-muted-foreground">구매 후 7일 이내 전액 환불 가능합니다. 100% 환불 보장합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPricingPlans;